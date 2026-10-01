# Starlight Technology Platform Architecture — 2026

## North star

**Acquire the right capability.**

Starlight Technology turns an intent, constraints and budget into a verified capability acquisition. The first market is European AI infrastructure procurement; the same contract later spans cloud compute, inference, APIs, agents, data, media generation and specialist services.

The platform must remain useful without any single model lab, cloud, merchant, payment rail or agent framework.

## Architectural law

1. **Intent before vendor.** Product code expresses workload and constraints, not provider-specific requests.
2. **Contracts before agents.** Every side effect has a typed input, authority boundary, idempotency key, acceptance test and evidence record.
3. **Deterministic core, probabilistic edge.** Pricing, budgets, permissions, scoring floors and settlement are code; models explain, research, synthesize and propose.
4. **One control plane, multiple execution planes.** Do not reproduce orchestration in every cloud.
5. **Portable protocols.** JSON Schema/OpenAPI for public contracts; MCP `2026-07-28` for tools/context; A2A `1.0` for independent agents; provider adapters behind internal interfaces.
6. **Human authority is explicit.** Recommendations may be autonomous; purchases, production writes, financing, contracts and irreversible actions remain mandate-gated.
7. **Every expensive action is metered.** Tokens, GPU seconds, browser minutes, render seconds, storage, egress and third-party API cost are attributable to tenant, workflow and economic outcome.

## Runtime topology

```text
Browser / Agent / Partner
          |
          v
+------------------------------+
| VERCEL PRODUCT + CONTROL     |
| Next.js 16 / React 19        |
| auth, UI, APIs, manifests    |
| decision objects, streaming  |
+---------------+--------------+
                |
       +--------+--------+
       |                 |
       v                 v
+--------------+   +-------------------+
| MODEL PLANE  |   | DURABLE JOB PLANE |
| AI Gateway   |   | workflow engine   |
| AI SDK 6     |   | approvals/retries |
+------+-------+   +---------+---------+
       |                     |
 OpenAI / Anthropic /        | tools, browsers,
 Gemini / Bedrock /          | supplier ingestion,
 Azure / Vertex / NIM        | quote collection
                             v
                    +-------------------+
                    | COMPUTE PLANE     |
                    | sandbox / workers |
                    | CPU + GPU render  |
                    +---------+---------+
                              |
                    Railway / Cloudflare /
                    NVIDIA / hyperscalers
```

## 1. Product and control plane — Vercel

Use Vercel as the canonical public/control plane because this repository already runs there and its strengths match the product:

- Next.js App Router for product surfaces and machine-readable routes.
- Server-first rendering; static generation/ISR for editorial and offer intelligence.
- Fluid Compute for bursty server work where enabled and justified.
- Vercel Firewall/WAF, deployment protection and rate limits at the public boundary.
- Vercel OIDC for short-lived service authentication where supported; avoid static cloud credentials.
- Vercel AI Gateway as the default model ingress so model/provider switching, budgets, tags, observability and failover do not leak into product code.
- AI SDK 6 for streaming UI, structured outputs, reusable agents, MCP clients and approval-aware tool execution.
- Vercel Sandbox only for bounded, isolated code execution—not durable business state.

Do **not** put GPU rendering, long-running crawlers, merchant polling fleets or durable state machines inside ordinary request handlers.

## 2. Model plane — provider neutral

Internal code addresses model classes, not brands:

- `fast_text`
- `frontier_reasoning`
- `research`
- `vision`
- `image`
- `video`
- `speech`
- `embedding`
- `rerank`
- `code_agent`

Initial routing uses Vercel AI Gateway. Maintain adapters for direct provider endpoints when economics, residency, enterprise contracts or unique capabilities justify bypassing the gateway.

Supported strategic providers:

- OpenAI: Responses/Agents APIs, hosted tools and managed agent harnesses.
- Anthropic: Claude models and Agent SDK.
- Google: Gemini plus Vertex AI where GCP controls/residency matter.
- AWS: Bedrock for enterprise procurement and AWS-native customers.
- Microsoft: Azure AI / Azure OpenAI for Microsoft estates.
- NVIDIA: NIM/OpenAI-compatible endpoints for self-hosted or sovereign GPU inference.
- Open models: vLLM/SGLang/NIM/other OpenAI-compatible serving behind the same capability interface.

Never fork product behavior by provider unless the capability is genuinely provider-specific.

## 3. Durable execution plane

A procurement job may run for minutes or days: discover suppliers, collect quotes, wait for approval, re-check stock, verify invoice, schedule deployment. This cannot be modeled as a single server request.

Use one durable workflow implementation per workflow class.

### Default

Use a durable workflow engine for:

- supplier ingestion and refresh;
- RFQ / quote collection;
- approval waits;
- multi-step research;
- media/render pipelines;
- fulfillment and deployment sequences;
- retries with idempotent side effects.

### Cloudflare boundary

Cloudflare Agents + Workflows is a strong optional execution plane when a feature specifically needs long-lived agent identity, WebSockets, geographically distributed state, scheduled wakeups or durable edge coordination. Durable Objects are appropriate for realtime sessions/rooms and coordinated agent state, not for duplicating the canonical commercial ledger.

### Railway boundary

Railway is appropriate for persistent containerized workers, custom binaries, queues, browser services and CPU-heavy background services that do not fit request-oriented serverless execution. Add it only when a measured workload requires it; no always-on service merely because it is available.

## 4. Compute plane

Classify jobs before assigning infrastructure.

| Job | Default execution |
|---|---|
| deterministic API / UI | Vercel |
| short isolated code execution | Vercel Sandbox |
| long/retryable orchestration | durable workflow engine |
| persistent container worker | Railway or equivalent |
| realtime stateful session | Cloudflare Durable Object when justified |
| burst GPU generation | managed image/video/model API first |
| repeatable high-volume GPU workload | NVIDIA/cloud GPU endpoint after crossover analysis |
| local/private inference | customer-owned NVIDIA workstation/server + NIM/vLLM/SGLang |

**Never buy or reserve GPU capacity before a measured queue establishes the crossover from API economics.**

## 5. Data + memory plane

### Phase 0 — current

Keep public evidence and deterministic reference data Git-native. This preserves provenance and zero-ops deployment.

### Phase 1 trigger

Introduce Postgres only when one of these becomes true:

- repeated merchant/offer updates make Git review operationally expensive;
- authenticated organizations need private procurement workspaces;
- quote/RFQ state becomes transactional;
- agent runs need durable tenant-scoped memory;
- event volume requires queryable economic telemetry.

Prefer one EU Postgres control database (an existing governed Supabase project is acceptable) rather than one database per feature.

### Memory model

Do not call a transcript “memory”. Store four explicit classes:

1. **Working memory** — ephemeral run state with TTL.
2. **Episodic memory** — prior decisions/outcomes tied to organization and workflow.
3. **Semantic memory** — normalized facts/evidence with provenance and freshness.
4. **Policy memory** — mandates, budgets, permissions, approved suppliers and hard constraints.

Vector search is an index over memory, never the source of truth. Canonical records remain relational/document records with provenance.

## 6. Exchange contract

Every capability supplier can ultimately expose the same economic envelope:

```ts
interface CapabilityOffer {
  capability: string;
  provider: string;
  region: string;
  unit: string;
  price: number;
  currency: string;
  latency?: number;
  quality?: number;
  reliability?: number;
  validUntil: string;
  evidence: string[];
  constraints: string[];
}
```

A buyer submits an `Intent`; Starlight returns ranked `OfferDecision` objects. Execution and settlement are separate commands with separate authority.

## 7. Open adoption surfaces

Starlight should be easier to integrate than to replace.

Public surfaces:

- REST + OpenAPI for deterministic resources and transaction APIs.
- JSON Schema for intents, offers, decisions, receipts and evidence.
- MCP server for tools/resources presented to model clients.
- A2A Agent Card for independent agents that can quote or fulfill capability work.
- webhooks with signed delivery for transaction state.
- exportable JSON/CSV/Parquet for customer-owned data.
- OpenAI-compatible inference endpoints where Starlight brokers model access.

Open schemas and SDKs; monetize routing, verified data, supplier economics, workflow execution, enterprise controls and successful transactions.

## 8. Media, graphics and games

Media and edutainment are workloads on the same platform, not a second architecture.

A `CreativeJob` describes:

- narrative/game objective;
- asset graph;
- model/tool constraints;
- target formats and device classes;
- token/GPU/render budget;
- rights/provenance requirements;
- quality gates;
- publication destinations.

The pipeline writes immutable asset manifests and derivative links. Large binaries live in object storage/CDN, never Postgres or Git. Rendering is asynchronous and resumable. Interactive games keep gameplay state separate from generative production state so inference failure cannot corrupt the game loop.

## 9. Security baseline

- Preview deployments protected; production APIs explicitly public only where intended.
- WAF/rate limiting for anonymous mutation and AI endpoints.
- short-lived OIDC identities instead of static infrastructure credentials where possible;
- secrets scoped by environment and service, never exposed to browser code;
- per-tenant and per-agent budgets; hard caps before model calls;
- tool allowlists and explicit approval for consequential actions;
- signed webhooks + replay protection;
- idempotency keys on every mutation with financial or external effect;
- strict request-size ceilings and schema validation;
- no arbitrary URL fetching without SSRF controls;
- immutable audit trail for mandate, approval, quote, purchase and settlement transitions;
- sandbox untrusted code and generated artifacts;
- data-region and retention policy attached to every enterprise tenant.

## 10. Deployment rule

Production remains boring:

`branch -> PR -> verify -> Vercel preview -> tests + visual/e2e gates -> explicit promotion/merge -> production -> runtime/error check`

Agent autonomy happens **inside** these boundaries, never by bypassing them.
