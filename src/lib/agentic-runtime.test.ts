import { afterEach, describe, expect, it } from "vitest";
import { createAgentRunPlan, type AgentRunRequest } from "./agentic-engine";
import { executeAgentRun, type StepExecutionResult } from "./agentic-runtime";

const originalRuntimeFlag = process.env.STARLIGHT_AGENT_RUNTIME_ENABLED;

afterEach(() => {
  if (originalRuntimeFlag === undefined) delete process.env.STARLIGHT_AGENT_RUNTIME_ENABLED;
  else process.env.STARLIGHT_AGENT_RUNTIME_ENABLED = originalRuntimeFlag;
});

const request: AgentRunRequest = {
  id: "resume-run",
  tenantId: "tenant-1",
  objective: "Prepare an approved supplier RFQ.",
  workload: "procurement",
  complexity: 5,
  risk: "high",
  tokenBudget: 100_000,
  maxCostEur: 10,
  requiredAuthorities: ["research", "external-write"]
};

function output(stepId: string, agentId: string): StepExecutionResult {
  return {
    stepId,
    agentId,
    model: "test/model",
    text: `completed ${stepId}`,
    inputTokens: 100,
    outputTokens: 50,
    totalTokens: 150
  };
}

describe("agent runtime resumption", () => {
  it("pauses at the next consequential step without replaying completed research", async () => {
    process.env.STARLIGHT_AGENT_RUNTIME_ENABLED = "1";
    const plan = createAgentRunPlan(request);
    const research = plan.steps[0];
    expect(research.id).toBe("research");

    const result = await executeAgentRun(request, plan, [], [output(research.id, research.agentId)]);

    expect(result.status).toBe("approval-required");
    expect(result.outputs.map((item) => item.stepId)).toEqual(["research"]);
    expect(result.pendingApprovalStepIds).toEqual(["specialist"]);
    expect(result.events.some((event) => event.type === "model-call")).toBe(false);
    expect(result.events[0]?.metadata).toEqual({ resumed: true });
  });

  it("returns completed when all planned outputs are already durable", async () => {
    process.env.STARLIGHT_AGENT_RUNTIME_ENABLED = "1";
    const readOnlyRequest: AgentRunRequest = {
      ...request,
      id: "already-complete",
      workload: "architecture",
      risk: "medium",
      requiredAuthorities: ["research", "draft"]
    };
    const plan = createAgentRunPlan(readOnlyRequest);
    const durableOutputs = plan.steps.map((step) => output(step.id, step.agentId));

    const result = await executeAgentRun(readOnlyRequest, plan, [], durableOutputs);

    expect(result.status).toBe("completed");
    expect(result.outputs).toHaveLength(plan.steps.length);
    expect(result.events.some((event) => event.type === "model-call")).toBe(false);
  });

  it("rejects malformed resume state instead of trusting it", async () => {
    process.env.STARLIGHT_AGENT_RUNTIME_ENABLED = "1";
    const plan = createAgentRunPlan(request);

    await expect(
      executeAgentRun(request, plan, [], [output("not-a-real-step", "researcher")])
    ).rejects.toThrow("unknown step");
  });
});
