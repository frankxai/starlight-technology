# IT Integration Standard

## Principle

Attach before replacing. Observe before writing. Normalise before automating. Delegate only after acceptance.

## Sequence

### 1. Inventory

Map ERP, shop, CRM, identity, email, documents, finance preparation, facilities, energy, network, APIs, exports, owners and manual exceptions.

### 2. Trust boundaries

Separate organisations, users, service accounts, secrets, repositories, memory, storage, queues and budgets. Shared hardware never implies shared identity or data.

### 3. Read-only connectors

Collect only the fields required for the named workload. Record source identity, freshness and authoritative-system status.

### 4. Canonical records

Normalise parties, customers, suppliers, products, inventory, offers, contracts, assets, workloads, approvals and evidence into typed records with stable references.

### 5. Shadow mode

Run recommendations beside the existing process. Record agreement, disagreement, exceptions, quality, latency and operator intervention.

### 6. Write-back gates

A production action requires:

- accepted workflow and data owner;
- narrow delegated identity;
- exact fields and permitted transitions;
- precondition and validation checks;
- idempotency and rollback;
- human approval where consequential;
- complete decision and action receipt.

## Reference compute pattern

- always-on worker nodes for scheduling, browser, repository and monitoring tasks;
- high-memory local node for confidential retrieval and document intelligence;
- metered cloud frontier models for irregular high-quality work;
- NVIDIA/CUDA capacity only after measured workload or revenue crossover;
- encrypted storage, UPS, network segmentation, metering and recovery as first-class assets.
