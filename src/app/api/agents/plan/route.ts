import { authorityLevels, createAgentRunPlan, orchestrationPatterns, type AgentRunRequest } from "@/lib/agentic-engine";

const workloads = ["procurement", "research", "architecture", "software", "creative", "operations", "exchange"] as const;
const risks = ["low", "medium", "high", "critical"] as const;

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((entry) => typeof entry === "string");
}

function parseRequest(value: unknown): AgentRunRequest | null {
  if (!value || typeof value !== "object") return null;
  const body = value as Record<string, unknown>;
  if (typeof body.id !== "string" || !body.id.trim()) return null;
  if (typeof body.tenantId !== "string" || !body.tenantId.trim()) return null;
  if (typeof body.objective !== "string" || !body.objective.trim()) return null;
  if (!workloads.includes(body.workload as (typeof workloads)[number])) return null;
  if (!risks.includes(body.risk as (typeof risks)[number])) return null;
  if (typeof body.complexity !== "number" || !Number.isFinite(body.complexity)) return null;
  if (typeof body.tokenBudget !== "number" || !Number.isFinite(body.tokenBudget) || body.tokenBudget <= 0) return null;
  if (typeof body.maxCostEur !== "number" || !Number.isFinite(body.maxCostEur) || body.maxCostEur <= 0) return null;
  if (!isStringArray(body.requiredAuthorities)) return null;
  if (!body.requiredAuthorities.every((authority) => authorityLevels.includes(authority as (typeof authorityLevels)[number]))) return null;
  if (body.preferredPattern !== undefined && !orchestrationPatterns.includes(body.preferredPattern as (typeof orchestrationPatterns)[number])) return null;
  if (body.requiredCapabilities !== undefined && !isStringArray(body.requiredCapabilities)) return null;
  if (body.contextRefs !== undefined && !isStringArray(body.contextRefs)) return null;

  return body as unknown as AgentRunRequest;
}

export async function POST(request: Request) {
  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (contentLength > 32_768) return Response.json({ error: "request_too_large" }, { status: 413 });

  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return Response.json({ error: "invalid_json" }, { status: 400 });
  }

  const input = parseRequest(raw);
  if (!input) return Response.json({ error: "invalid_agent_run_request" }, { status: 400 });

  try {
    return Response.json({ plan: createAgentRunPlan(input) }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return Response.json(
      { error: "planning_failed", message: error instanceof Error ? error.message : "Unknown planning error" },
      { status: 422, headers: { "Cache-Control": "no-store" } }
    );
  }
}
