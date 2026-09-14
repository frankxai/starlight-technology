import { describe, expect, it } from "vitest";
import { createAgentRunPlan, validateMandate, type AgentRunRequest } from "./agentic-engine";

const baseRequest: AgentRunRequest = {
  id: "run-1",
  tenantId: "org-1",
  objective: "Source a local AI workstation for a six-person creative agency.",
  workload: "procurement",
  complexity: 5,
  risk: "medium",
  tokenBudget: 120_000,
  maxCostEur: 12,
  requiredAuthorities: ["research", "draft"]
};

describe("agentic engine", () => {
  it("routes medium-complexity work through a sequential evidence-review path", () => {
    const plan = createAgentRunPlan(baseRequest);
    expect(plan.pattern).toBe("sequential");
    expect(plan.steps.map((step) => step.agentId)).toEqual(["researcher", "buyer", "sentinel", "synthesizer"]);
    expect(plan.totalTokenBudget).toBe(baseRequest.tokenBudget);
    expect(plan.maxParallelism).toBe(1);
  });

  it("uses a parallel council only for sufficiently complex non-consequential work", () => {
    const plan = createAgentRunPlan({ ...baseRequest, workload: "architecture", complexity: 8 });
    expect(plan.pattern).toBe("parallel");
    expect(plan.maxParallelism).toBe(3);
    expect(plan.steps.at(-1)?.dependsOn).toEqual(["research", "specialist", "sentinel"]);
  });

  it("marks external actions as approval gated", () => {
    const plan = createAgentRunPlan({
      ...baseRequest,
      requiredAuthorities: ["research", "external-write"],
      risk: "high"
    });
    expect(plan.requiresHumanApproval).toBe(true);
    expect(plan.steps.some((step) => step.approvalRequired)).toBe(true);
  });

  it("routes purchase authority sequentially and never implies automatic settlement", () => {
    const plan = createAgentRunPlan({
      ...baseRequest,
      requiredAuthorities: ["research", "purchase"],
      risk: "critical"
    });
    expect(plan.pattern).toBe("sequential");
    expect(plan.requiresHumanApproval).toBe(true);
    expect(plan.steps.every((step) => step.authority !== "settlement")).toBe(true);
  });

  it("rejects mandates that exceed tenant, authority or cost bounds", () => {
    const failures = validateMandate(
      { ...baseRequest, maxCostEur: 15, requiredAuthorities: ["purchase"] },
      {
        tenantId: "org-1",
        actorId: "human-1",
        allowedAuthorities: ["research", "draft"],
        maxRunCostEur: 10,
        maxExternalSpendEur: 0,
        expiresAt: "2026-10-01T00:00:00Z"
      },
      new Date("2026-09-14T20:00:00Z")
    );
    expect(failures).toContain("run cost exceeds mandate");
    expect(failures).toContain("authority not granted: purchase");
  });
});
