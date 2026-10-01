# Capacity, Token and Compute Budget

This document is a planning envelope, not a provider-price promise. Provider pricing changes; the system records actual usage and recomputes economics from metered cost.

## Engineering budget

The wrong optimization is “use as few coding tokens as possible.” The right optimization is **accepted production progress per euro** with bounded rework.

For the full Starlight Technology trajectory described in `PLATFORM_ARCHITECTURE_2026.md`, use these engineering-token envelopes across coding, review, research, tests, migration and launch work:

| Stage | Scope | Agent-token envelope |
|---|---|---:|
| A | exchange/procurement foundation, schemas, APIs, doctrine | 2–6M |
| B | production procurement product, auth, workspaces, offers, RFQ, payments | 20–45M |
| C | supplier network, ingestion, pricing graph, alerts, deployment workflows | 25–60M |
| D | machine exchange, MCP/A2A, budgets, routing, receipts, reputation | 35–80M |
| E | media/game/creative workload plane + launch automation | 40–100M |
| F | hardening, security, evals, accessibility, performance, docs/SDKs | 20–50M |
| **Total** | high-quality multi-surface platform | **142–341M** |

**Planning target: 180–250M tokens. Hard review gate at 300M.**

This is intentionally an order-of-magnitude budget. A strong harness with repo memory, caching, deterministic tests and specialized subagents should beat a naive “one giant agent prompt” by reducing repeated context and rework.

## Cost sensitivity

Convert tokens to engineering inference cost using the observed blended rate rather than hard-coding model list prices.

For 200M metered tokens:

| Blended effective cost | Inference spend |
|---:|---:|
| €2 / 1M | €400 |
| €5 / 1M | €1,000 |
| €10 / 1M | €2,000 |
| €20 / 1M | €4,000 |
| €30 / 1M | €6,000 |

Cached-input pricing, reasoning tokens and premium frontier-model output can materially change this. Track actual provider-reported cost per run.

## How to spend the engineering tokens

Target allocation:

- **35% implementation** — bounded features with tests.
- **20% review/refactor** — architecture, security and simplification.
- **15% eval/test generation** — deterministic + model evals.
- **10% research/provider validation** — standards, SDK/API changes, price capabilities.
- **10% design/content/launch** — product UX, copy, media, demos.
- **10% failed experiments reserve** — deliberately capped.

Model posture:

- use small/fast models for inventory, mechanical transforms and test expansion;
- use strong coding/reasoning models for architecture, migrations, security and ambiguous failures;
- use a second model family for adversarial review of consequential changes;
- never run multiple frontier agents on the same unconstrained task without independent roles.

## Product inference budgets

Every AI feature gets a **unit budget** before launch.

| Product action | Initial token ceiling | Notes |
|---|---:|---|
| explain deterministic recommendation | 15k | no web research |
| shortlist synthesis | 50k | approved offer records only |
| sourcing research pass | 250k | discovery + evidence compression |
| human-reviewed sourcing sprint | 1M | multiple research/eval passes |
| infrastructure blueprint | 3M | complex documents + multi-agent review |
| supplier/RFQ orchestration | 500k | excludes supplier-side models |
| launch campaign package | 2M | copy, visual prompts, QA, variants |

These are ceilings, not targets. Requests exceeding the ceiling must either escalate price/plan or enter a reviewed high-compute workflow.

## Memory/context budget

Do not repeatedly inject the entire organization history.

Per agent turn:

- policy/mandate context: <= 8k tokens;
- task state: <= 16k;
- retrieved semantic/episodic memory: <= 32k;
- source excerpts: <= 64k unless the model/task earns a larger context;
- previous trajectory: compact into typed state rather than replaying transcripts.

Prefer retrieval + durable artifacts over million-token conversational history.

## Initial infrastructure envelope

### Vercel

Keep the default product plane within the existing Pro account. Static/ISR content should dominate public traffic. Dynamic AI work is explicitly metered and budgeted.

Start with:

- one Vercel project for `starlight.technology`;
- preview + production environments;
- AI Gateway project budget;
- WAF/rate limits on mutation/AI routes;
- Web Analytics/observability only where policy-approved;
- no additional always-on servers.

### Database

**€0 incremental until transactional demand requires it.** When triggered, use one EU Postgres control database and begin with the smallest production tier that satisfies backup/PITR requirements.

### Railway / container workers

**€0 until a persistent worker exists.** First service must have a named workload, measured CPU/RAM profile and shutdown path. Avoid idle browser fleets.

### Cloudflare

Use on-demand Workers/Workflows/Durable Objects only for features that need their durability/realtime semantics. Do not duplicate the Vercel control plane.

### GPU

Begin API-first. A local/customer GPU node is a procurement product; Starlight-owned GPU is a capacity decision.

Track per workload:

```text
managed_api_cost_per_accepted_unit
vs
(gpu_hour_cost + idle_cost + ops + storage + egress) / accepted_units
```

Reserve/buy GPU only after measured demand shows durable savings and utilization.

### Media storage

Generated media belongs in object storage/CDN with lifecycle rules. Maintain lightweight manifests and hashes in the control database. Never pass large media blobs through model context when a URI/asset tool suffices.

## Capacity triggers

Scale infrastructure only when a metric crosses a gate:

- DB: transactional/user data appears.
- queue/workflow: jobs regularly exceed request lifetime or require retries/approvals.
- Railway: persistent process/custom binary needed.
- Durable Object: realtime coordinated state needed.
- dedicated GPU: measured API crossover.
- dedicated search/vector infra: Postgres/index cannot meet measured latency/recall.
- second region: customer/data-residency/SLO evidence requires it.

The architecture grows behind demand, not ahead of it.
