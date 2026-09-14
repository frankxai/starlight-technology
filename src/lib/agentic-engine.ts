export const orchestrationPatterns = ["direct", "sequential", "parallel", "iterative", "cascade", "broadcast"] as const;
export type OrchestrationPattern = (typeof orchestrationPatterns)[number];

export const authorityLevels = ["observe", "research", "draft", "external-write", "purchase", "settlement", "deploy"] as const;
export type AuthorityLevel = (typeof authorityLevels)[number];
export type RiskClass = "low" | "medium" | "high" | "critical";
export type ModelClass = "fast_text" | "frontier_reasoning" | "research" | "vision" | "code_agent" | "media";

export type AgentDefinition = {
  id: string;
  name: string;
  mission: string;
  modelClass: ModelClass;
  strengths: string[];
  tools: string[];
  authorities: AuthorityLevel[];
  defaultAuthority: AuthorityLevel;
  defaultTokenBudget: number;
  maxTokenBudget: number;
};

export type AgentMandate = {
  tenantId: string;
  actorId: string;
  allowedAuthorities: AuthorityLevel[];
  maxRunCostEur: number;
  maxExternalSpendEur: number;
  allowedTools?: string[];
  deniedTools?: string[];
  expiresAt: string;
};

export type AgentRunRequest = {
  id: string;
  tenantId: string;
  objective: string;
  workload: "procurement" | "research" | "architecture" | "software" | "creative" | "operations" | "exchange";
  complexity: number;
  risk: RiskClass;
  tokenBudget: number;
  maxCostEur: number;
  requiredAuthorities: AuthorityLevel[];
  preferredPattern?: OrchestrationPattern;
  requiredCapabilities?: string[];
  contextRefs?: string[];
};

export type AgentStep = {
  id: string;
  agentId: string;
  purpose: string;
  dependsOn: string[];
  tokenBudget: number;
  authority: AuthorityLevel;
  tools: string[];
  approvalRequired: boolean;
};

export type AgentRunPlan = {
  runId: string;
  pattern: OrchestrationPattern;
  steps: AgentStep[];
  maxParallelism: number;
  totalTokenBudget: number;
  estimatedMaxCostEur: number;
  requiresHumanApproval: boolean;
  stopConditions: string[];
  memoryPolicy: { working: "ephemeral"; episodic: boolean; semantic: boolean; policy: boolean };
};

export type ExecutionEvent = {
  runId: string;
  stepId?: string;
  type: "run-planned" | "step-started" | "model-call" | "tool-call" | "approval-requested" | "approval-granted" | "step-completed" | "step-failed" | "run-completed" | "run-aborted";
  at: string;
  actor: string;
  model?: string;
  tool?: string;
  inputTokens?: number;
  outputTokens?: number;
  costEur?: number;
  metadata?: Record<string, string | number | boolean | null>;
};

const consequenceRank: Record<AuthorityLevel, number> = {
  observe: 0,
  research: 1,
  draft: 2,
  "external-write": 3,
  purchase: 4,
  settlement: 5,
  deploy: 4
};

const agents: AgentDefinition[] = [
  {
    id: "orchestrator", name: "Orchestrator",
    mission: "Classify objectives, minimize the active swarm and coordinate handoffs.",
    modelClass: "frontier_reasoning",
    strengths: ["routing", "planning", "coordination", "conflict-resolution"],
    tools: ["memory.read", "registry.read", "run.inspect"],
    authorities: ["observe", "research", "draft"], defaultAuthority: "draft",
    defaultTokenBudget: 20_000, maxTokenBudget: 80_000
  },
  {
    id: "researcher", name: "Researcher",
    mission: "Acquire current evidence and compress it into source-backed decision material.",
    modelClass: "research",
    strengths: ["web-research", "supplier-discovery", "evidence", "market-intelligence"],
    tools: ["web.search", "supplier.search", "offer.read", "memory.read"],
    authorities: ["observe", "research"], defaultAuthority: "research",
    defaultTokenBudget: 45_000, maxTokenBudget: 250_000
  },
  {
    id: "architect", name: "Architect",
    mission: "Translate workloads into robust technical systems and capability contracts.",
    modelClass: "frontier_reasoning",
    strengths: ["architecture", "systems", "integration", "cost-modeling"],
    tools: ["catalog.read", "benchmark.read", "memory.read", "calculator"],
    authorities: ["observe", "research", "draft"], defaultAuthority: "draft",
    defaultTokenBudget: 45_000, maxTokenBudget: 180_000
  },
  {
    id: "buyer", name: "Buyer",
    mission: "Turn approved requirements into comparable offers, RFQs and purchase-ready decisions.",
    modelClass: "frontier_reasoning",
    strengths: ["procurement", "rfq", "negotiation-prep", "offer-comparison"],
    tools: ["supplier.search", "offer.read", "rfq.draft", "memory.read"],
    authorities: ["observe", "research", "draft", "external-write", "purchase"], defaultAuthority: "draft",
    defaultTokenBudget: 35_000, maxTokenBudget: 150_000
  },
  {
    id: "builder", name: "Builder",
    mission: "Implement software and infrastructure changes inside an isolated, reviewable scope.",
    modelClass: "code_agent",
    strengths: ["coding", "testing", "migration", "automation"],
    tools: ["repo.read", "repo.write", "sandbox.run", "test.run", "deploy.request"],
    authorities: ["observe", "research", "draft", "external-write", "deploy"], defaultAuthority: "draft",
    defaultTokenBudget: 80_000, maxTokenBudget: 400_000
  },
  {
    id: "creator", name: "Creator",
    mission: "Produce launch, media, game and educational assets from governed creative briefs.",
    modelClass: "media",
    strengths: ["campaigns", "story", "media", "edutainment", "asset-systems"],
    tools: ["asset.read", "media.generate", "render.request", "memory.read"],
    authorities: ["observe", "research", "draft"], defaultAuthority: "draft",
    defaultTokenBudget: 50_000, maxTokenBudget: 250_000
  },
  {
    id: "sentinel", name: "Sentinel",
    mission: "Challenge correctness, security, evidence, economics and authority before acceptance.",
    modelClass: "frontier_reasoning",
    strengths: ["quality", "security", "evals", "risk", "governance"],
    tools: ["evidence.read", "run.inspect", "policy.read", "test.read"],
    authorities: ["observe"], defaultAuthority: "observe",
    defaultTokenBudget: 30_000, maxTokenBudget: 150_000
  },
  {
    id: "synthesizer", name: "Synthesizer",
    mission: "Resolve tensions between specialist outputs and produce one acceptance-ready decision object.",
    modelClass: "frontier_reasoning",
    strengths: ["synthesis", "decision-writing", "tradeoffs", "compression"],
    tools: ["run.inspect", "evidence.read", "memory.read"],
    authorities: ["observe", "draft"], defaultAuthority: "draft",
    defaultTokenBudget: 30_000, maxTokenBudget: 120_000
  }
];

export const agentRegistry = Object.fromEntries(agents.map((agent) => [agent.id, agent])) as Record<string, AgentDefinition>;

function clampComplexity(value: number): number {
  return Number.isFinite(value) ? Math.max(1, Math.min(10, Math.round(value))) : 5;
}

function canHold(agentId: string, authority: AuthorityLevel): boolean {
  return Boolean(agentRegistry[agentId]?.authorities.includes(authority));
}

function highestConsequence(authorities: AuthorityLevel[]): AuthorityLevel {
  return authorities.reduce<AuthorityLevel>((highest, current) => consequenceRank[current] > consequenceRank[highest] ? current : highest, "observe");
}

function approvalRequired(authority: AuthorityLevel, risk: RiskClass): boolean {
  return ["external-write", "purchase", "settlement", "deploy"].includes(authority) || risk === "critical";
}

function selectPattern(request: AgentRunRequest): OrchestrationPattern {
  if (request.preferredPattern) return request.preferredPattern;
  const complexity = clampComplexity(request.complexity);
  if (request.requiredAuthorities.some((authority) => ["purchase", "settlement", "deploy"].includes(authority))) return "sequential";
  if (request.workload === "creative" && complexity >= 6) return "iterative";
  if (request.workload === "operations" && complexity >= 7) return "broadcast";
  if (complexity <= 3) return "direct";
  if (complexity <= 6) return "sequential";
  if (complexity <= 8) return "parallel";
  return "cascade";
}

function specialistFor(workload: AgentRunRequest["workload"]): string {
  switch (workload) {
    case "procurement": return "buyer";
    case "research": return "researcher";
    case "architecture": return "architect";
    case "software": return "builder";
    case "creative": return "creator";
    case "exchange": return "architect";
    case "operations": return "orchestrator";
  }
}

function chooseAuthority(agentId: string, requested: AuthorityLevel): AuthorityLevel {
  const agent = agentRegistry[agentId];
  if (!agent) throw new Error(`Unknown agent: ${agentId}`);
  return canHold(agentId, requested) ? requested : agent.defaultAuthority;
}

function step(id: string, agentId: string, purpose: string, dependsOn: string[], authority: AuthorityLevel, tokenBudget: number, risk: RiskClass): AgentStep {
  const agent = agentRegistry[agentId];
  if (!agent) throw new Error(`Unknown agent: ${agentId}`);
  if (!canHold(agentId, authority)) throw new Error(`${agentId} is not granted ${authority} authority`);
  return {
    id, agentId, purpose, dependsOn,
    tokenBudget: Math.min(tokenBudget, agent.maxTokenBudget),
    authority,
    tools: agent.tools,
    approvalRequired: approvalRequired(authority, risk)
  };
}

function distributeBudget(total: number, weights: number[]): number[] {
  const safeTotal = Math.max(1_000, Math.floor(total));
  const weightTotal = weights.reduce((sum, weight) => sum + weight, 0);
  const allocated = weights.map((weight) => Math.floor((safeTotal * weight) / weightTotal));
  allocated[allocated.length - 1] += safeTotal - allocated.reduce((sum, value) => sum + value, 0);
  return allocated;
}

export function createAgentRunPlan(request: AgentRunRequest): AgentRunPlan {
  if (!request.id || !request.tenantId || !request.objective.trim()) throw new Error("Run id, tenant id and objective are required");
  if (request.tokenBudget <= 0 || request.maxCostEur <= 0) throw new Error("Positive token and cost budgets are required");

  const pattern = selectPattern(request);
  const specialist = specialistFor(request.workload);
  const consequentialAuthority = highestConsequence(request.requiredAuthorities);
  const complexity = clampComplexity(request.complexity);
  let steps: AgentStep[];

  if (pattern === "direct") {
    const [budget] = distributeBudget(request.tokenBudget, [1]);
    steps = [step("execute", specialist, request.objective, [], chooseAuthority(specialist, consequentialAuthority), budget, request.risk)];
  } else if (pattern === "parallel") {
    const [researchBudget, specialistBudget, sentinelBudget, synthesisBudget] = distributeBudget(request.tokenBudget, [0.27, 0.33, 0.18, 0.22]);
    const primaryAgent = specialist === "researcher" ? "architect" : specialist;
    steps = [
      step("research", "researcher", `Collect evidence for: ${request.objective}`, [], "research", researchBudget, request.risk),
      step("specialist", primaryAgent, `Develop the specialist position for: ${request.objective}`, [], chooseAuthority(primaryAgent, consequentialAuthority), specialistBudget, request.risk),
      step("sentinel", "sentinel", "Independently identify failure modes, unsupported claims and authority risks.", [], "observe", sentinelBudget, request.risk),
      step("synthesize", "synthesizer", "Resolve evidence, specialist output and sentinel objections into one decision object.", ["research", "specialist", "sentinel"], "draft", synthesisBudget, request.risk)
    ];
  } else if (pattern === "iterative") {
    const [createBudget, reviewBudget, refineBudget] = distributeBudget(request.tokenBudget, [0.45, 0.2, 0.35]);
    steps = [
      step("create", specialist, request.objective, [], agentRegistry[specialist].defaultAuthority, createBudget, request.risk),
      step("review", "sentinel", "Review against the brief, evidence, rights, safety and economic constraints.", ["create"], "observe", reviewBudget, request.risk),
      step("refine", specialist, "Refine only the review failures while preserving accepted work.", ["create", "review"], agentRegistry[specialist].defaultAuthority, refineBudget, request.risk)
    ];
  } else if (pattern === "broadcast") {
    const [orchestrateBudget, sentinelBudget, synthesisBudget] = distributeBudget(request.tokenBudget, [0.5, 0.2, 0.3]);
    steps = [
      step("orchestrate", "orchestrator", request.objective, [], "draft", orchestrateBudget, request.risk),
      step("sentinel", "sentinel", "Verify broadcast scope, authority boundaries and failure containment.", ["orchestrate"], "observe", sentinelBudget, request.risk),
      step("synthesize", "synthesizer", "Produce the authoritative broadcast/transition receipt.", ["orchestrate", "sentinel"], "draft", synthesisBudget, request.risk)
    ];
  } else if (pattern === "cascade") {
    const [routeBudget, specialistBudget, sentinelBudget, synthesisBudget] = distributeBudget(request.tokenBudget, [0.15, 0.45, 0.18, 0.22]);
    steps = [
      step("route", "orchestrator", `Resolve the minimum sufficient execution path for: ${request.objective}`, [], "draft", routeBudget, request.risk),
      step("specialist", specialist, request.objective, ["route"], agentRegistry[specialist].defaultAuthority, specialistBudget, request.risk),
      step("sentinel", "sentinel", "Stress-test the proposed result and decide whether escalation is required.", ["specialist"], "observe", sentinelBudget, request.risk),
      step("synthesize", "synthesizer", "Accept, reject or escalate with explicit confidence and evidence gaps.", ["specialist", "sentinel"], "draft", synthesisBudget, request.risk)
    ];
  } else {
    const [researchBudget, specialistBudget, sentinelBudget, decisionBudget] = distributeBudget(request.tokenBudget, [0.22, 0.38, 0.17, 0.23]);
    steps = [
      step("research", "researcher", `Collect evidence required to execute: ${request.objective}`, [], "research", researchBudget, request.risk),
      step("specialist", specialist, request.objective, ["research"], chooseAuthority(specialist, consequentialAuthority), specialistBudget, request.risk),
      step("sentinel", "sentinel", "Verify evidence, economics, policy and acceptance conditions.", ["specialist"], "observe", sentinelBudget, request.risk),
      step("decision", "synthesizer", "Produce the acceptance-ready decision, approval packet or stop recommendation.", ["specialist", "sentinel"], "draft", decisionBudget, request.risk)
    ];
  }

  const unmetAuthorities = request.requiredAuthorities.filter((authority) => !steps.some((item) => item.authority === authority));
  if (unmetAuthorities.length > 0) throw new Error(`No selected agent is granted required authority: ${unmetAuthorities.join(", ")}`);

  return {
    runId: request.id,
    pattern,
    steps,
    maxParallelism: pattern === "parallel" ? Math.min(3, complexity) : 1,
    totalTokenBudget: steps.reduce((sum, item) => sum + item.tokenBudget, 0),
    estimatedMaxCostEur: request.maxCostEur,
    requiresHumanApproval: steps.some((item) => item.approvalRequired),
    stopConditions: [
      "token budget exhausted",
      "run cost ceiling reached",
      "required evidence unavailable",
      "tool or authority outside mandate",
      "acceptance test fails after one bounded retry",
      "consequential action lacks explicit approval"
    ],
    memoryPolicy: { working: "ephemeral", episodic: true, semantic: true, policy: true }
  };
}

export function validateMandate(request: AgentRunRequest, mandate: AgentMandate, now = new Date()): string[] {
  const failures: string[] = [];
  if (request.tenantId !== mandate.tenantId) failures.push("tenant mismatch");
  if (Date.parse(mandate.expiresAt) <= now.getTime()) failures.push("mandate expired");
  if (request.maxCostEur > mandate.maxRunCostEur) failures.push("run cost exceeds mandate");
  for (const authority of request.requiredAuthorities) {
    if (!mandate.allowedAuthorities.includes(authority)) failures.push(`authority not granted: ${authority}`);
  }
  return failures;
}

export const agenticEngineManifest = {
  id: "starlight-agentic-engine",
  version: "2026-09-14",
  status: "foundation",
  principles: [
    "minimum sufficient swarm",
    "explicit non-hierarchical authority grants",
    "deterministic budgets and approvals",
    "probabilistic reasoning behind typed contracts",
    "meter every expensive operation",
    "persist outcomes, not transcript bloat"
  ],
  orchestrationPatterns,
  authorityLevels,
  agents: agents.map(({ id, name, mission, modelClass, strengths, authorities, defaultTokenBudget, maxTokenBudget }) => ({
    id, name, mission, modelClass, strengths, authorities, defaultTokenBudget, maxTokenBudget
  }))
} as const;
