import { timingSafeEqual } from "node:crypto";
import { controlStoreConfigured, recordApproval, runBelongsToPrincipal } from "@/lib/control-store";

export const runtime = "nodejs";

const authorities = ["external-write", "purchase", "settlement", "deploy"] as const;
const statuses = ["approved", "rejected", "revoked"] as const;

function safeEqual(left: string, right: string): boolean {
  const a = Buffer.from(left);
  const b = Buffer.from(right);
  return a.length === b.length && timingSafeEqual(a, b);
}

function authorized(request: Request): boolean {
  const expected = process.env.STARLIGHT_AGENT_ADMIN_TOKEN;
  if (!expected) return false;
  const header = request.headers.get("authorization") ?? "";
  return header.startsWith("Bearer ") && safeEqual(header.slice(7), expected);
}

export async function POST(request: Request) {
  if (!authorized(request)) return Response.json({ error: "unauthorized" }, { status: 401 });
  if (!controlStoreConfigured()) return Response.json({ error: "control_store_not_configured" }, { status: 503 });

  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (contentLength > 16_384) return Response.json({ error: "request_too_large" }, { status: 413 });

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return Response.json({ error: "invalid_json" }, { status: 400 });
  }

  const { runId, tenantId, principalId, stepId, authority, status, reason, expiresAt } = body;
  if (
    typeof runId !== "string" || !runId.trim() ||
    typeof tenantId !== "string" || !tenantId.trim() ||
    typeof principalId !== "string" || !principalId.trim() ||
    typeof stepId !== "string" || !stepId.trim() ||
    !authorities.includes(authority as (typeof authorities)[number]) ||
    !statuses.includes(status as (typeof statuses)[number]) ||
    (reason !== undefined && typeof reason !== "string") ||
    (expiresAt !== undefined && typeof expiresAt !== "string")
  ) {
    return Response.json({ error: "invalid_approval_request" }, { status: 400 });
  }

  if (!(await runBelongsToPrincipal({ runId, tenantId, principalId }))) {
    return Response.json({ error: "run_not_found_for_principal" }, { status: 404 });
  }

  await recordApproval({
    runId,
    stepId,
    authority: authority as (typeof authorities)[number],
    principalId,
    status: status as (typeof statuses)[number],
    reason: reason as string | undefined,
    expiresAt: expiresAt as string | undefined,
    context: { source: "starlight-agent-approval-api", tenantId }
  });

  return Response.json({ ok: true, runId, stepId, authority, status }, { headers: { "Cache-Control": "no-store" } });
}
