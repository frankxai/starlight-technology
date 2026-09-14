# Starlight Agentic Engine — Production Rollout

## Decision

The Agentic Engine becomes the control substrate of `starlight.technology`.

Procurement is its first economically serious workload, not its architectural boundary. The same engine must later coordinate research, software delivery, infrastructure operations, creative/media production, games, inference and external capability exchange.

## Production topology

```text
Users / customer agents / operators
              |
              v
       starlight.technology
              |
      Vercel control plane
  Next.js / APIs / auth / UI
              |
     +--------+---------+
     |                  |
     v                  v
Agentic Engine       Exchange Engine
planner/runtime      intents/offers
     |                  |
     +--------+---------+
              |
        AI Gateway
     /    |     |    \
 OpenAI Anthropic Google others
              |
       Tool / Job planes
   Vercel Sandbox / Workflows
   Cloudflare / Railway / GPU APIs
              |
        Evidence + receipts
              |
        EU control database
```

## Phase P0 — foundation branch (this PR)

Ship without public autonomous execution.

### Included

- typed agent registry;
- six orchestration patterns;
- explicit non-hierarchical authority grants;
- deterministic planner;
- token/cost ceilings;
- human approval gates;
- Vercel AI Gateway provider-neutral routing policy;
- actual server-side execution runtime;
- execution event/receipt model;
- public read-only agent manifest;
- public deterministic plan endpoint;
- authenticated execution endpoint, **disabled by default**;
- capability exchange primitives;
- architecture/economics/capacity doctrine;
- unit tests for core planning invariants.

### Production state

`STARLIGHT_AGENT_RUNTIME_ENABLED` remains unset/false.

The runtime exists in production code but cannot spend inference money or execute a run until explicitly enabled.

## Phase P1 — production control plane

### Vercel

1. Keep the existing `starlight-technology` project and Git integration.
2. Protect preview deployments with Vercel Authentication.
3. Enable Git fork protection and skew protection.
4. Add/verify WAF rules for `/api/agents/*`.
5. Rate-limit `/api/agents/plan` even though it is deterministic; stricter limits for `/api/agents/run`.
6. Configure `AI_GATEWAY_API_KEY`, or use Vercel OIDC where the gateway path supports it.
7. Set AI Gateway spend budgets and alerting before runtime enablement.
8. Add production runtime observability: errors, model/token usage, route latency and agent runs.
9. Keep `STARLIGHT_AGENT_RUNTIME_ENABLED=0` until P2 gates pass.

### GitHub

1. Protect `main`.
2. Require the existing verify workflow/check before merge.
3. Require pull requests; no direct production writes by autonomous agents.
4. Add CODEOWNERS/required review for agent authority, auth, payment and deployment code.
5. Keep Dependabot majors isolated from product changes.
6. Add secret scanning/code scanning where available.
7. Every agent-generated PR includes run/plan/receipt metadata in the PR body.

## Phase P2 — private runtime

Enable the engine for internal/operator use only.

### Required before enablement

- authenticated organization/user identity;
- server-side mandate lookup;
- durable run/event persistence;
- actual cost accounting from AI Gateway/provider usage;
- per-run and per-tenant hard spend caps;
- idempotency keys;
- retry policy;
- rate limiting;
- audit log;
- explicit approval object rather than caller-supplied step ids;
- zero-data-retention policy for sensitive workflows;
- prompt-injection/evidence boundary tests for tool-using agents.

### Runtime toggle

Only after these gates:

```text
STARLIGHT_AGENT_RUNTIME_ENABLED=1
```

Remove the temporary `STARLIGHT_AGENT_ADMIN_TOKEN` path once real auth + mandates exist.

## Phase P3 — tool runtime

The model runtime alone is intentionally not “autonomy”. Autonomy arrives through tools with bounded contracts.

Tool contract:

```ts
type ToolContract = {
  id: string;
  authority: AuthorityLevel;
  sideEffect: "none" | "reversible" | "consequential";
  inputSchema: unknown;
  outputSchema: unknown;
  timeoutMs: number;
  maxCostEur: number;
  idempotent: boolean;
  approval: "never" | "policy" | "always";
};
```

Initial production tools:

1. evidence/search read;
2. supplier/offer read;
3. catalog/benchmark read;
4. RFQ draft;
5. email/draft only;
6. repository read;
7. sandbox test execution.

Do **not** begin with purchase, payment, deploy or arbitrary browser-write tools.

## Phase P4 — durable jobs + memory

Trigger a real database when private run state appears.

Canonical tables/entities:

- organizations;
- principals;
- mandates;
- agents;
- agent_runs;
- run_steps;
- execution_events;
- approvals;
- tools;
- memories;
- evidence_records;
- intents;
- offers;
- decisions;
- receipts;
- outcomes;
- usage_costs.

Use one EU Postgres control database. Keep blobs/media in object storage.

Memory is split into working, episodic, semantic and policy memory; vectors are indexes, not canonical truth.

### Durable execution

Use a workflow engine when a run requires:

- waits/approvals;
- retries beyond a request lifecycle;
- supplier response waits;
- long research/render jobs;
- scheduled wakeups;
- multi-hour/day execution.

Vercel stays the control plane. Cloudflare Workflows/Durable Objects or another workflow system is added only for workloads that benefit from those semantics. Railway is used for persistent container workers/custom binaries, not as a parallel application backend.

## Phase P5 — AI SDK migration + richer tools

The current native Gateway client avoids introducing package/lockfile churn in the foundation PR.

After P0 is green, install the current AI SDK through the package manager so the lockfile is generated and verified, then migrate runtime calls to AI SDK primitives for:

- streaming responses;
- structured outputs;
- tool definitions;
- model telemetry;
- reasoning configuration;
- MCP clients;
- approval-aware tool flows;
- AI Gateway ZDR/provider options.

The domain contracts (`AgentRunRequest`, `AgentRunPlan`, mandates, events) remain independent of AI SDK, so SDK upgrades never rewrite the business model.

## Phase P6 — procurement agents

First paid autonomous workflow:

```text
Customer intent
 -> Orchestrator
 -> Researcher (EU suppliers / current evidence)
 -> Architect (workload -> system)
 -> Buyer (normalized offers / RFQ draft)
 -> Sentinel (compatibility / freshness / economics)
 -> Synthesizer (purchase decision object)
 -> human approval
 -> supplier communication
 -> receipt + outcome
```

Economic targets:

- model/tool cost <= 5% of service revenue;
- human review <= 20% of service revenue;
- contribution margin >= 60% before founder time;
- all price claims timestamped;
- no supplier/payment action without authority receipt.

## Phase P7 — capability exchange

Once procurement has repeated transaction volume, generalize the same contracts to:

- inference;
- APIs;
- cloud/GPU compute;
- agents;
- datasets;
- media generation;
- specialist human services.

Then expose:

- OpenAPI;
- JSON Schema;
- MCP resources/tools;
- A2A Agent Card;
- signed webhooks;
- SDKs;
- machine-readable reputation and receipts.

The platform is open at the protocol edge and monetized in verified routing, data, governance, workflows and transaction outcomes.

## Phase P8 — media, games and launch engines

Do not create a separate autonomous stack for games/media.

Define `CreativeJob` and `RenderJob` contracts and route them through the same engine with media-specialist agents, GPU/API budgets, rights/provenance metadata and acceptance gates.

Runtime separation:

- deterministic gameplay loop: client/server game engine;
- generative ideation/assets: agentic engine;
- heavy rendering: async GPU/media plane;
- release/publishing: approval-gated tool workflow.

## Release gates for every phase

A phase is not “done” because an agent wrote code.

Required evidence:

1. lint;
2. typecheck;
3. unit tests;
4. production build;
5. exact-head GitHub Actions success;
6. exact-head Vercel preview READY;
7. API smoke tests;
8. runtime error check;
9. security/authority regression tests;
10. explicit production promotion.

## Current recommended production sequence

```text
P0 merge read-only foundation
 -> P1 harden Vercel/GitHub
 -> P2 add auth + Postgres + mandates + cost ledger
 -> P3 tools
 -> P4 durable workflows/memory
 -> P5 AI SDK runtime
 -> P6 paid procurement agents
 -> P7 exchange
 -> P8 media/game engines
```

Do not reverse this sequence by shipping public autonomous tools before identity, mandates, budgets and receipts exist.
