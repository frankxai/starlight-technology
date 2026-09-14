import { timingSafeEqual } from "node:crypto";
import { authorityLevels, createAgentRunPlan, orchestrationPatterns, type AgentRunRequest } from "@/lib/agentic-engine";
import { executeAgentRun } from "@/lib/agentic-runtime";

export const runtime = "nodejs";
export const maxDuration = 300;

const workloads = ["procurement", "research", "architecture", "software", "creative", "operations", "exchange"] as const;
const risks = ["low", "medium", "high", "critical"] as const;

function safeEqual(left: string, right: string): boolean {
  const a = Buffer.from(left);
  const b = Buffer.from(right);
  return a.length === b.length && timingSafeEqual(a, b);
}

function authorized(request: Request): boolean {
  const expected = process.env.STARLIGHT_AGENT_ADMIN_TOKEN;
  if (!expected) return false;
  const header = request.headers.get("authorization") ?? "";
  if (!header.startsWith("Bearer ")) return false;
  return safeEqual(header.slice(7), expected);
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((entry) => typeof entry === "string");
}

function parseRunRequest(value: unknown): { run: AgentRunRequest; approvedStepIds: string[] } | null {
  if (!value || typeof value !== "object") return null;
  const body = value as Record<string, unknown>;
  const candidate = body.run;
  if (!candidate || typeof candidate !== "object") return null;
  const run = candidate as Record<string, unknown>;
  if (typeof run.id !== "string" || !run.id.trim()) return null;
  if (typeof run.tenantId !== "string" || !run.tenantId.trim()) return null;
  if (typeof run.objective !== "string" || !run.objective.trim()) return null;
  if (!workloads.includes(run.workload as (typeof workloads)[number])) return null;
  if (!risks.includes(run.risk as (typeof risks)[number])) return null;
  if (typeof run.complexity !== "number" || !Number.isFinite(run.complexity)) return null;
  if (typeof run.tokenBudget !== "number" || !Number.isFinite(run.tokenBudget) || run.tokenBudget <= 0 || run.tokenBudget > 2_000_000) return null;
  if (typeof run.maxCostEur !== "number" || !Number.isFinite(run.maxCostEur) || run.maxCostEur <= 0 || run.maxCostEur > 500) return null;
  if (!isStringArray(run.requiredAuthorities)) return null;
  if (!run.requiredAuthorities.every((authority) => authorityLevels.includes(authority as (typeof authorityLevels)[number]))) return null;
  if (run.preferredPattern !== undefined && !orchestrationPatterns.includes(run.preferredPattern as (typeof orchestrationPatterns)[number])) return null;
  if (run.requiredCapabilities !== undefined && !isStringArray(run.requiredCapabilities)) return null;
  if (run.contextRefs !== undefined && !isStringArray(run.contextRefs)) return null;
  const approvedStepIds = body.approvedStepIds === undefined ? [] : body.approvedStepIds;
  if (!isStringArray(approvedStepIds)) return null;
  return { run: run as unknown as AgentRunRequest, approvedStepIds };
}

export async function POST(request: Request) {
  if (process.env.STARLIGHT_AGENT_RUNTIME_ENABLED !== "1") {
    return Response.json({ error: "agent_runtime_disabled" }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
  if (!authorized(request)) {
    return Response.json({ error: "unauthorized" }, { status: 401, headers: { "Cache-Control": "no-store" } });
  }

  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (contentLength > 65_536) return Response.json({ error: "request_too_large" }, { status: 413 });

  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return Response.json({ error: "invalid_json" }, { status: 400 });
  }

  const parsed = parseRunRequest(raw);
  if (!parsed) return Response.json({ error: "invalid_agent_run_request" }, { status: 400 });

  try {
    const plan = createAgentRunPlan(parsed.run);
    const result = await executeAgentRun(parsed.run, plan, parsed.approvedStepIds);
    return Response.json({ plan, result }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return Response.json(
      { error: "agent_run_failed", message: error instanceof Error ? error.message : "Unknown runtime failure" },
      { status: 422, headers: { "Cache-Control": "no-store" } }
    );
  }
}
