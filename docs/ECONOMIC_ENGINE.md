# Starlight Economic Engine

## Objective

Starlight wins when it creates measurable surplus for buyers and suppliers while taking a small, legible share of that surplus.

The platform therefore optimizes **verified economic outcome**, not clicks, tokens, sessions or gross transaction value in isolation.

## Core equation

For each acquisition or execution:

```text
buyer_surplus = counterfactual_cost - actual_total_cost + verified_value_gain
supplier_surplus = realized_revenue - incremental_fulfillment_cost
starlight_value = fees + transaction_margin + recurring_software_revenue
network_value = buyer_surplus + supplier_surplus + starlight_value
```

`counterfactual_cost` must be evidence-based. Never claim savings against an invented list price or imaginary implementation.

## Transaction object

Every economically meaningful workflow should produce one immutable outcome record:

```text
Intent
  -> Candidate set
  -> Offers
  -> Decision
  -> Mandate / approval
  -> Execution
  -> Receipt
  -> Acceptance
  -> Outcome observation
```

Each step has timestamps, provenance, actor, cost and confidence.

## What to track

### Acquisition funnel

- qualified intents
- decision objects generated
- sourcing/RFQ requests
- quote completion rate
- purchase / contract rate
- days from intent to accepted decision
- days from decision to fulfilled outcome

### Buyer economics

- requested budget
- recommended budget
- final landed price
- verified reference/counterfactual price
- absolute and percentage savings
- avoided wrong-purchase value where objectively measurable
- deployment cost
- 12/24/36 month TCO
- payback period for productive systems
- time-to-first-useful-output
- accepted quality / performance metrics

### Supplier economics

- quote win rate
- response latency
- fulfillment rate
- cancellation / substitution rate
- return/RMA rate
- warranty incidents
- gross supplier revenue routed
- repeat buyer rate

### AI economics

Every model call receives tags for:

- `org_id`
- `workflow_id`
- `intent_id`
- `feature`
- `model_class`
- `provider`
- `environment`

Track:

- input / cached / reasoning / output tokens
- model cost
- tool/API cost
- time-to-first-token
- total latency
- retries / fallbacks
- acceptance / eval score
- human intervention minutes
- cost per accepted decision
- cost per transacted euro
- gross margin after AI + tool costs

### Compute/media economics

- CPU seconds
- GPU seconds
- sandbox minutes
- browser minutes
- render seconds
- storage GB-month
- egress GB
- generated asset count
- accepted asset count
- cost per accepted asset
- derivative/reuse count
- revenue or qualified demand attributable to each asset/campaign

## Unit economics gates

### Procurement

Do not automate a workflow merely because an agent can perform it. Automate when:

```text
(agent + API + review cost) < human marginal cost
AND acceptance rate >= required quality floor
```

Initial target for routine sourcing research:

- AI/tool cost <= 5% of service revenue;
- human review <= 20% of service revenue;
- contribution margin >= 60% before founder time;
- no claimed savings without timestamped offer evidence.

### Marketplace

Introduce transaction take-rate only after Starlight influences a transaction and can provide ongoing value such as verified pricing, payment protection, fulfillment evidence, financing, SLA management or support.

Candidate monetization layers:

1. buyer subscription / procurement workspace;
2. fixed sourcing fee;
3. supplier lead/RFQ fee where permitted and transparently disclosed;
4. transaction take rate;
5. managed deployment margin;
6. financing/lease referral economics where properly licensed/partnered;
7. model/API/compute routing spread or software fee;
8. enterprise policy, governance and private-market subscription.

Avoid hidden margin that compromises recommendation integrity.

## Reputation

Reputation is not a five-star average. Maintain dimensions:

- quote accuracy;
- price competitiveness;
- fulfillment reliability;
- delivery latency;
- support quality;
- warranty/RMA performance;
- evidence freshness;
- agent task acceptance rate;
- SLA adherence.

Use Bayesian/shrunk scores so ten perfect transactions do not outrank ten thousand reliable ones by accident.

## North-star metrics

### Phase 1 — procurement

**Verified buyer surplus per month** and **accepted procurement GMV**.

### Phase 2 — infrastructure

**Verified productive capacity deployed** and **customer payback achieved**.

### Phase 3 — exchange

**Verified capability volume routed** and **net economic surplus created**.

These metrics align Starlight with the ecosystem: the network becomes more valuable when participants become more productive, not when they spend more tokens.
