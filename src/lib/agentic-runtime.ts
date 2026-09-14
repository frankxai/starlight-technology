import type {
  AgentRunPlan,
  AgentRunRequest,
  AgentStep,
  ExecutionEvent
} from "./agentic-engine";
import { accountModelCostEur, getStepCostEnvelope, type StepCostEnvelope } from "./model-cost";

export type StepExecutionResult = {
  stepId: string;
  agentId: string;
  model: string;
  text: string;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  costEur: number;
  costBasis: "uncached-upper-bound";
};

export type AgentRunResult = {
  runId: string;
  status: "completed" | "approval-required" | "failed";
  outputs: StepExecutionResult[];
  events: ExecutionEvent[];
  pendingApprovalStepIds: string[];
  totalCostEur: number;
};

type GatewayChatResponse = {
  model?: string;
  choices?: Array<{ message?: { content?: string | null } }>;
  usage?: { prompt_tokens?: number; completion_tokens?: number; total_tokens?: number };
};

function gatewayToken(): string | null {
  return process.env.AI_GATEWAY_API_KEY || process.env.VERCEL_OIDC_TOKEN || null;
}

function agentMission(step: AgentStep): string {
  const missions: Record<string, string> = {
    orchestrator: "Classify objectives, minimize the active swarm and coordinate handoffs.",
    researcher: "Acquire current evidence and compress it into source-backed decision material.",
    architect: "Translate workloads into robust technical systems and capability contracts.",
    buyer: "Turn approved requirements into comparable offers, RFQs and purchase-ready decisions.",
    builder: "Implement software and infrastructure changes inside an isolated, reviewable scope.",
    creator: "Produce launch, media, game and educational assets from governed creative briefs.",
    sentinel: "Challenge correctness, security, evidence, economics and authority before acceptance.",
    synthesizer: "Resolve tensions between specialist outputs and produce one acceptance-ready decision object."
  };
  const mission = missions[step.agentId];
  if (!mission) throw new Error(`Unknown agent: ${step.agentId}`);
  return mission;
}

function composeSystemPrompt(step: AgentStep): string {
  return [
    `You are Starlight ${step.agentId}.`,
    agentMission(step),
    `Your authority for this step is exactly: ${step.authority}.`,
    "Do not claim external actions occurred unless a tool receipt proves they occurred.",
    "Do not invent evidence, prices, suppliers, benchmarks or implementation state.",
    "Return a concise decision artifact with assumptions, evidence gaps, recommendation and explicit next action.",
    "When evidence is insufficient, stop and identify the missing evidence rather than guessing."
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

async function callGateway(
  request: AgentRunRequest,
  step: AgentStep,
  dependencies: StepExecutionResult[],
  envelope: StepCostEnvelope
): Promise<StepExecutionResult> {
  const token = gatewayToken();
  if (!token) throw new Error("AI Gateway is not configured");

  const response = await fetch("https://ai-gateway.vercel.sh/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: envelope.route.primary,
      models: envelope.route.fallbacks,
      messages: [
        { role: "system", content: composeSystemPrompt(step) },
        { role: "user", content: composeUserPrompt(request, step, dependencies) }
      ],
      max_tokens: envelope.maxOutputTokens,
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
  const model = payload.model ?? envelope.route.primary;
  const costEur = accountModelCostEur({ model, inputTokens, outputTokens, envelope });

  return {
    stepId: step.id,
    agentId: step.agentId,
    model,
    text,
    inputTokens,
    outputTokens,
    totalTokens,
    costEur,
    costBasis: envelope.costBasis
  };
}

function event(
  runId: string,
  type: ExecutionEvent["type"],
  actor: string,
  stepId?: string,
  metadata?: ExecutionEvent["metadata"],
  costEur?: number
): ExecutionEvent {
  return { runId, stepId, type, actor, at: new Date().toISOString(), metadata, costEur };
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
    if (!Number.isFinite(output.costEur) || output.costEur < 0) throw new Error(`Resume output has invalid cost: ${output.stepId}`);
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

function totalCost(outputs: StepExecutionResult[]): number {
  return outputs.reduce((sum, output) => sum + output.costEur, 0);
}

function result(
  runId: string,
  status: AgentRunResult["status"],
  outputs: StepExecutionResult[],
  events: ExecutionEvent[],
  pendingApprovalStepIds: string[] = []
): AgentRunResult {
  return { runId, status, outputs, events, pendingApprovalStepIds, totalCostEur: totalCost(outputs) };
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
  if (totalCost(outputs) > plan.estimatedMaxCostEur) throw new Error("Persisted run cost exceeds run budget");
  const resumed = resumeOutputs.length > 0;
  const events: ExecutionEvent[] = [event(plan.runId, "run-planned", "starlight-engine", undefined, { resumed })];
  const completed = new Set(resumeOutputs.map((output) => output.stepId));
  const started = new Set<string>();
  const approved = new Set(approvedStepIds);

  while (completed.size < plan.steps.length) {
    const ready = readySteps(plan, completed, started);
    if (ready.length === 0) {
      events.push(event(plan.runId, "run-aborted", "starlight-engine", undefined, { reason: "dependency-deadlock" }));
      return result(plan.runId, "failed", outputs, events);
    }

    const pendingApproval = ready.filter((step) => step.approvalRequired && !approved.has(step.id));
    if (pendingApproval.length > 0) {
      for (const step of pendingApproval) events.push(event(plan.runId, "approval-requested", "starlight-engine", step.id));
      return result(plan.runId, "approval-required", outputs, events, pendingApproval.map((step) => step.id));
    }

    const batch = ready.slice(0, Math.max(1, plan.maxParallelism));

    try {
      const envelopes = await Promise.all(batch.map((step) => getStepCostEnvelope(request, step)));
      const spentEur = totalCost(outputs);
      const batchMaxEur = envelopes.reduce((sum, envelope) => sum + envelope.maxCostEur, 0);
      if (spentEur + batchMaxEur > plan.estimatedMaxCostEur) {
        events.push(event(plan.runId, "run-aborted", "starlight-engine", undefined, {
          reason: "cost-budget-preflight",
          spentEur,
          batchMaxEur,
          budgetEur: plan.estimatedMaxCostEur
        }));
        return result(plan.runId, "failed", outputs, events);
      }

      for (const step of batch) {
        started.add(step.id);
        if (approved.has(step.id) && step.approvalRequired) events.push(event(plan.runId, "approval-granted", "human-mandate", step.id));
        events.push(event(plan.runId, "step-started", step.agentId, step.id));
      }

      const results = await Promise.all(
        batch.map(async (step, index) => {
          const dependencies = step.dependsOn
            .map((id) => outputs.find((output) => output.stepId === id))
            .filter((value): value is StepExecutionResult => Boolean(value));
          const stepResult = await callGateway(request, step, dependencies, envelopes[index]);
          events.push(event(plan.runId, "model-call", step.agentId, step.id, {
            model: stepResult.model,
            inputTokens: stepResult.inputTokens,
            outputTokens: stepResult.outputTokens,
            totalTokens: stepResult.totalTokens,
            costBasis: stepResult.costBasis
          }, stepResult.costEur));
          return stepResult;
        })
      );

      for (const stepResult of results) {
        outputs.push(stepResult);
        completed.add(stepResult.stepId);
        events.push(event(plan.runId, "step-completed", stepResult.agentId, stepResult.stepId));
      }

      if (totalCost(outputs) > plan.estimatedMaxCostEur) {
        events.push(event(plan.runId, "run-aborted", "starlight-engine", undefined, { reason: "cost-budget-exceeded-after-call" }));
        return result(plan.runId, "failed", outputs, events);
      }
    } catch (error) {
      const failed = batch.find((step) => !completed.has(step.id));
      events.push(event(plan.runId, "step-failed", failed?.agentId ?? "starlight-engine", failed?.id, {
        message: error instanceof Error ? error.message : "Unknown runtime failure"
      }));
      events.push(event(plan.runId, "run-aborted", "starlight-engine"));
      return result(plan.runId, "failed", outputs, events);
    }
  }

  events.push(event(plan.runId, "run-completed", "starlight-engine", undefined, { totalCostEur: totalCost(outputs) }));
  return result(plan.runId, "completed", outputs, events);
}
