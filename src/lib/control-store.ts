import type { AgentMandate, AgentRunPlan, AgentRunRequest, ExecutionEvent } from "./agentic-engine";
import type { AgentRunResult, StepExecutionResult } from "./agentic-runtime";

export type StoredMandate = AgentMandate & {
  id: string;
  principalId?: string | null;
  status: "draft" | "active" | "suspended" | "revoked" | "expired";
  maxTokens: number;
};

export type StoredRunState = {
  runId: string;
  tenantId: string;
  principalId: string | null;
  mandateId: string | null;
  request: AgentRunRequest;
  objective: string;
  workload: AgentRunRequest["workload"];
  risk: AgentRunRequest["risk"];
  tokenBudget: number;
  costBudgetEur: number;
  plan: AgentRunPlan;
  status: "planned" | "running" | "approval_required" | "completed" | "failed" | "aborted";
  outputs: StepExecutionResult[];
};

type StoreConfig = { url: string; serviceRoleKey: string };

function config(): StoreConfig | null {
  const url = process.env.STARLIGHT_PLATFORM_SUPABASE_URL;
  const serviceRoleKey = process.env.STARLIGHT_PLATFORM_SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) return null;
  return { url: url.replace(/\/$/, ""), serviceRoleKey };
}

function headers(store: StoreConfig, extra?: HeadersInit): HeadersInit {
  return {
    apikey: store.serviceRoleKey,
    Authorization: `Bearer ${store.serviceRoleKey}`,
    "Content-Type": "application/json",
    ...extra
  };
}

async function rest(path: string, init: RequestInit): Promise<Response> {
  const store = config();
  if (!store) throw new Error("Starlight control store is not configured");
  const response = await fetch(`${store.url}/rest/v1/${path}`, {
    ...init,
    headers: headers(store, init.headers),
    signal: init.signal ?? AbortSignal.timeout(15_000)
  });
  if (!response.ok) {
    const body = (await response.text()).slice(0, 1_000);
    throw new Error(`Control store request failed (${response.status}): ${body}`);
  }
  return response;
}

export function controlStoreConfigured(): boolean {
  return Boolean(config());
}

export async function loadActiveMandate(args: {
  mandateId: string;
  tenantId: string;
  principalId?: string;
}): Promise<StoredMandate | null> {
  const params = new URLSearchParams({
    select: "id,tenant_id,principal_id,status,allowed_authorities,allowed_tools,denied_tools,max_run_cost_eur,max_external_spend_eur,max_tokens,expires_at",
    id: `eq.${args.mandateId}`,
    tenant_id: `eq.${args.tenantId}`,
    status: "eq.active",
    limit: "1"
  });
  if (args.principalId) params.set("principal_id", `eq.${args.principalId}`);

  const response = await rest(`agent_mandates?${params.toString()}`, { method: "GET" });
  const rows = (await response.json()) as Array<{
    id: string;
    tenant_id: string;
    principal_id: string | null;
    status: StoredMandate["status"];
    allowed_authorities: AgentMandate["allowedAuthorities"];
    allowed_tools: string[];
    denied_tools: string[];
    max_run_cost_eur: string | number;
    max_external_spend_eur: string | number;
    max_tokens: string | number;
    expires_at: string | null;
  }>;
  const row = rows[0];
  if (!row) return null;

  return {
    id: row.id,
    tenantId: row.tenant_id,
    actorId: row.principal_id ?? "service-principal",
    principalId: row.principal_id,
    status: row.status,
    allowedAuthorities: row.allowed_authorities,
    allowedTools: row.allowed_tools,
    deniedTools: row.denied_tools,
    maxRunCostEur: Number(row.max_run_cost_eur),
    maxExternalSpendEur: Number(row.max_external_spend_eur),
    maxTokens: Number(row.max_tokens),
    expiresAt: row.expires_at ?? "9999-12-31T23:59:59Z"
  };
}

export async function loadStoredRun(args: {
  runId: string;
  tenantId: string;
  principalId: string;
}): Promise<StoredRunState | null> {
  const params = new URLSearchParams({
    select: "run_id,tenant_id,principal_id,mandate_id,request,objective,workload,risk,status,token_budget,cost_budget_eur,plan,result",
    run_id: `eq.${args.runId}`,
    tenant_id: `eq.${args.tenantId}`,
    principal_id: `eq.${args.principalId}`,
    limit: "1"
  });
  const response = await rest(`agent_control_runs?${params.toString()}`, { method: "GET" });
  const rows = (await response.json()) as Array<{
    run_id: string;
    tenant_id: string;
    principal_id: string | null;
    mandate_id: string | null;
    request: AgentRunRequest;
    objective: string;
    workload: AgentRunRequest["workload"];
    risk: AgentRunRequest["risk"];
    status: StoredRunState["status"];
    token_budget: string | number;
    cost_budget_eur: string | number;
    plan: AgentRunPlan;
    result: AgentRunResult | null;
  }>;
  const row = rows[0];
  if (!row) return null;
  return {
    runId: row.run_id,
    tenantId: row.tenant_id,
    principalId: row.principal_id,
    mandateId: row.mandate_id,
    request: row.request,
    objective: row.objective,
    workload: row.workload,
    risk: row.risk,
    status: row.status,
    tokenBudget: Number(row.token_budget),
    costBudgetEur: Number(row.cost_budget_eur),
    plan: row.plan,
    outputs: Array.isArray(row.result?.outputs) ? row.result.outputs : []
  };
}

export async function persistPlannedRun(args: {
  request: AgentRunRequest;
  plan: AgentRunPlan;
  mandateId?: string;
  principalId?: string;
  externalSpendBudgetEur?: number;
}): Promise<void> {
  const { request, plan } = args;
  await rest("agent_control_runs", {
    method: "POST",
    headers: { Prefer: "resolution=ignore-duplicates,return=minimal" },
    body: JSON.stringify({
      run_id: request.id,
      tenant_id: request.tenantId,
      principal_id: args.principalId ?? null,
      mandate_id: args.mandateId ?? null,
      objective: request.objective,
      workload: request.workload,
      risk: request.risk,
      orchestration_pattern: plan.pattern,
      status: "planned",
      token_budget: plan.totalTokenBudget,
      cost_budget_eur: plan.estimatedMaxCostEur,
      external_spend_budget_eur: args.externalSpendBudgetEur ?? 0,
      request,
      plan
    })
  });
}

export async function appendExecutionEvents(events: ExecutionEvent[]): Promise<void> {
  if (events.length === 0) return;
  await rest("agent_run_events", {
    method: "POST",
    headers: { Prefer: "return=minimal" },
    body: JSON.stringify(events.map((event) => ({
      run_id: event.runId,
      step_id: event.stepId ?? null,
      event_type: event.type,
      actor: event.actor,
      model: event.model ?? null,
      tool: event.tool ?? null,
      input_tokens: event.inputTokens ?? null,
      output_tokens: event.outputTokens ?? null,
      cost_eur: event.costEur ?? null,
      metadata: event.metadata ?? {}
    })))
  });
}

export async function persistRunResult(result: AgentRunResult): Promise<void> {
  const tokensUsed = result.outputs.reduce((sum, output) => sum + output.totalTokens, 0);
  const status = result.status === "completed" ? "completed" : result.status === "approval-required" ? "approval_required" : "failed";
  const params = new URLSearchParams({ run_id: `eq.${result.runId}` });
  await rest(`agent_control_runs?${params.toString()}`, {
    method: "PATCH",
    headers: { Prefer: "return=minimal" },
    body: JSON.stringify({
      status,
      tokens_used: tokensUsed,
      result: result.status === "failed" ? null : result,
      failure: result.status === "failed" ? { status: "failed" } : null,
      completed_at: result.status === "approval-required" ? null : new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
  });
}

export async function approvalGranted(args: {
  runId: string;
  stepId: string;
  authority: string;
  principalId: string;
}): Promise<boolean> {
  const params = new URLSearchParams({
    select: "id,expires_at",
    run_id: `eq.${args.runId}`,
    step_id: `eq.${args.stepId}`,
    authority: `eq.${args.authority}`,
    principal_id: `eq.${args.principalId}`,
    status: "eq.approved",
    limit: "1"
  });
  const response = await rest(`agent_approvals?${params.toString()}`, { method: "GET" });
  const rows = (await response.json()) as Array<{ id: string; expires_at?: string | null }>;
  const row = rows[0];
  if (!row) return false;
  return !row.expires_at || Date.parse(row.expires_at) > Date.now();
}

export async function runBelongsToPrincipal(args: {
  runId: string;
  tenantId: string;
  principalId: string;
}): Promise<boolean> {
  return Boolean(await loadStoredRun(args));
}

export async function recordApproval(args: {
  runId: string;
  stepId: string;
  authority: "external-write" | "purchase" | "settlement" | "deploy";
  principalId: string;
  status: "approved" | "rejected" | "revoked";
  reason?: string;
  expiresAt?: string;
  context?: Record<string, unknown>;
}): Promise<void> {
  await rest("agent_approvals?on_conflict=run_id,step_id,authority,principal_id", {
    method: "POST",
    headers: { Prefer: "resolution=merge-duplicates,return=minimal" },
    body: JSON.stringify({
      run_id: args.runId,
      step_id: args.stepId,
      authority: args.authority,
      principal_id: args.principalId,
      status: args.status,
      reason: args.reason ?? null,
      approval_context: args.context ?? {},
      expires_at: args.expiresAt ?? null,
      decided_at: new Date().toISOString()
    })
  });
}
