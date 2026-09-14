import {
  agentRegistry,
  type AgentRunPlan,
  type AgentRunRequest,
  type AgentStep,
  type ExecutionEvent
} from "./agentic-engine";
import { resolveModelRoute } from "./model-routing";

export type StepExecutionResult = {
  stepId: string;
  agentId: string;
  model: string;
  text: string;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
};

export type AgentRunResult = {
  runId: string;
  status: "completed" | "approval-required" | "failed";
  outputs: StepExecutionResult[];
  events: ExecutionEvent[];
  pendingApprovalStepIds: string[];
};

type GatewayChatResponse = {
  model?: string;
  choices?: Array<{ message?: { content?: string | null } }>;
  usage?: { prompt_tokens?: number; completion_tokens?: number; total_tokens?: number };
};

function gatewayToken(): string | null {
  return process.env.AI_GATEWAY_API_KEY || process.env.VERCEL_OIDC_TOKEN || null;
}

function composeSystemPrompt(step: AgentStep): string {
  const agent = agentRegistry[step.agentId];
  if (!agent) throw new Error(`Unknown agent: ${step.agentId}`);
  return [
    `You are Starlight ${agent.name}.`,
    agent.mission,
    `Your authority for this step is exactly: ${step.authority}.`,
    "Do not claim external actions occurred unless a tool receipt proves they occurred.",
    "Do not invent evidence, prices, suppliers, benchmarks or implementation state.",
    "Return a concise decision artifact with assumptions, evidence gaps, recommendation and explicit next action.",
    "When the evidence is insufficient, stop and say what is missing instead of filling the gap from imagination."
  ].join("\n");
}

function composeUserPrompt(request: AgentRunRequest, step: AgentStep, dependencies: StepExecutionResult[]): string {
  const dependencyBlock = dependencies.length
    ? dependencies.map((result) => `## ${result.stepId} / ${result.agentId}\n${result.text}`).join("\n\n")
    : "No prior step outputs.";

  return [
    `# Run objective\n${request.objective}`,
    `# Step purpose\n${step.purpose}`,
    `# Workload\n${request.workload}`,
    `# Risk\n${request.risk}`,
    `# Step token budget\n${step.tokenBudget}`,
    `# Required capabilities\n${(request.requiredCapabilities ?? []).join(", ") || "none declared"}`,
    `# Context references\n${(request.contextRefs ?? []).join("\n") || "none declared"}`,
    `# Dependency outputs\n${dependencyBlock}`
  ].join("\n\n");
}

async function callGateway(request: AgentRunRequest, step: AgentStep, dependencies: StepExecutionResult[]): Promise<StepExecutionResult> {
  const token = gatewayToken();
  if (!token) throw new Error("AI Gateway is not configured");

  const agent = agentRegistry[step.agentId];
  if (!agent) throw new Error(`Unknown agent: ${step.agentId}`);
  const route = resolveModelRoute({ modelClass: agent.modelClass, risk: request.risk, sensitive: request.risk === "critical" });
  const maxTokens = Math.min(route.maxOutputTokens, Math.max(1_000, Math.floor(step.tokenBudget * 0.35)));

  const response = await fetch("https://ai-gateway.vercel.sh/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: route.primary,
      models: route.fallbacks,
      messages: [
        { role: "system", content: composeSystemPrompt(step) },
        { role: "user", content: composeUserPrompt(request, step, dependencies) }
      ],
      max_tokens: maxTokens,
      stream: false
    }),
    signal: AbortSignal.timeout(120_000)
  });

  if (!response.ok) {
    const message = (await response.text()).slice(0, 1_000);
    throw new Error(`AI Gateway request failed (${response.status}): ${message}`);
  }

  const payload = (await response.json()) as GatewayChatResponse;
  const text = payload.choices?.[0]?.message?.content?.trim();
  if (!text) throw new Error("AI Gateway returned no text output");

  const inputTokens = payload.usage?.prompt_tokens ?? 0;
  const outputTokens = payload.usage?.completion_tokens ?? 0;
  const totalTokens = payload.usage?.total_tokens ?? inputTokens + outputTokens;
  if (totalTokens > step.tokenBudget) throw new Error(`Step ${step.id} exceeded its token budget`);

  return { stepId: step.id, agentId: step.agentId, model: payload.model ?? route.primary, text, inputTokens, outputTokens, totalTokens };
}

function event(runId: string, type: ExecutionEvent["type"], actor: string, stepId?: string, metadata?: ExecutionEvent["metadata"]): ExecutionEvent {
  return { runId, stepId, type, actor, at: new Date().toISOString(), metadata };
}

function readySteps(plan: AgentRunPlan, completed: Set<string>, started: Set<string>): AgentStep[] {
  return plan.steps.filter((step) => !completed.has(step.id) && !started.has(step.id) && step.dependsOn.every((dependency) => completed.has(dependency)));
}

function validateResumeOutputs(plan: AgentRunPlan, outputs: StepExecutionResult[]): void {
  const knownSteps = new Set(plan.steps.map((step) => step.id));
  const seen = new Set<string>();
  for (const output of outputs) {
    if (!knownSteps.has(output.stepId)) throw new Error(`Resume output references unknown step: ${output.stepId}`);
    if (seen.has(output.stepId)) throw new Error(`Resume output duplicates step: ${output.stepId}`);
    seen.add(output.stepId);
  }
  for (const output of outputs) {
    const step = plan.steps.find((candidate) => candidate.id === output.stepId);
    if (!step) continue;
    for (const dependency of step.dependsOn) {
      if (!seen.has(dependency)) throw new Error(`Resume output ${output.stepId} is missing dependency ${dependency}`);
    }
  }
}

export async function executeAgentRun(
  request: AgentRunRequest,
  plan: AgentRunPlan,
  approvedStepIds: string[] = [],
  resumeOutputs: StepExecutionResult[] = []
): Promise<AgentRunResult> {
  if (process.env.STARLIGHT_AGENT_RUNTIME_ENABLED !== "1") throw new Error("Agent runtime is disabled");
  if (request.id !== plan.runId) throw new Error("Run request and plan ids do not match");
  validateResumeOutputs(plan, resumeOutputs);

  const outputs: StepExecutionResult[] = [...resumeOutputs];
  const resumed = resumeOutputs.length > 0;
  const events: ExecutionEvent[] = [event(plan.runId, "run-planned", "starlight-engine", undefined, { resumed })];
  const completed = new Set(resumeOutputs.map((output) => output.stepId));
  const started = new Set<string>();
  const approved = new Set(approvedStepIds);

  while (completed.size < plan.steps.length) {
    const ready = readySteps(plan, completed, started);
    if (ready.length === 0) {
      events.push(event(plan.runId, "run-aborted", "starlight-engine", undefined, { reason: "dependency-deadlock" }));
      return { runId: plan.runId, status: "failed", outputs, events, pendingApprovalStepIds: [] };
    }

    const pendingApproval = ready.filter((step) => step.approvalRequired && !approved.has(step.id));
    if (pendingApproval.length > 0) {
      for (const step of pendingApproval) events.push(event(plan.runId, "approval-requested", "starlight-engine", step.id));
      return { runId: plan.runId, status: "approval-required", outputs, events, pendingApprovalStepIds: pendingApproval.map((step) => step.id) };
    }

    const batch = ready.slice(0, Math.max(1, plan.maxParallelism));
    for (const step of batch) {
      started.add(step.id);
      if (approved.has(step.id) && step.approvalRequired) events.push(event(plan.runId, "approval-granted", "human-mandate", step.id));
      events.push(event(plan.runId, "step-started", step.agentId, step.id));
    }

    try {
      const results = await Promise.all(
        batch.map(async (step) => {
          const dependencies = step.dependsOn
            .map((id) => outputs.find((output) => output.stepId === id))
            .filter((value): value is StepExecutionResult => Boolean(value));
          const result = await callGateway(request, step, dependencies);
          events.push(event(plan.runId, "model-call", step.agentId, step.id, {
            model: result.model,
            inputTokens: result.inputTokens,
            outputTokens: result.outputTokens,
            totalTokens: result.totalTokens
          }));
          return result;
        })
      );

      for (const result of results) {
        outputs.push(result);
        completed.add(result.stepId);
        events.push(event(plan.runId, "step-completed", result.agentId, result.stepId));
      }
    } catch (error) {
      const failed = batch.find((step) => !completed.has(step.id));
      events.push(event(plan.runId, "step-failed", failed?.agentId ?? "starlight-engine", failed?.id, {
        message: error instanceof Error ? error.message : "Unknown runtime failure"
      }));
      events.push(event(plan.runId, "run-aborted", "starlight-engine"));
      return { runId: plan.runId, status: "failed", outputs, events, pendingApprovalStepIds: [] };
    }
  }

  events.push(event(plan.runId, "run-completed", "starlight-engine"));
  return { runId: plan.runId, status: "completed", outputs, events, pendingApprovalStepIds: [] };
}
