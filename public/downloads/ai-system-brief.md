# AI System Brief

Starlight Technology · AI System Brief Kit 1.0 · 7 October 2026

Use this document to define one useful AI workflow before implementing it. Copy it into your project folder, replace every bracketed field, and pair it with the acceptance worksheet and agent handoff. Use public or synthetic inputs for the first run. Keep credentials in the provider's secure credential store, never in this document.

## 1. The job

- Accountable owner: [name and role]
- User: [who will use the result]
- Trigger: [what starts one run]
- Input: [one authorised source set, exact formats and maximum size]
- Output: [one concrete artifact and where it is saved]
- Current manual path: [how the user does this today]
- Success: [what a human can inspect to decide the result is useful]
- Wrong-fit condition: [when this workflow should not run]

Write the promise as one sentence:

> When [trigger], this workflow converts [input] into [output] so [user] can [useful action], subject to [review boundary].

## 2. The data boundary

- Source owner and permission: [who may authorise use]
- Classification: [public / synthetic / confidential / other approved classification]
- Permitted processing path: [local host or exact approved provider and account]
- Provider retention / training decision: [verified setting or contractual basis, source and date]
- Permitted exports: [artifact destinations and people who may access them]
- Deletion / retention: [schedule and owner]
- Excluded inputs: [personal, restricted, copyrighted or client material outside permission]

A local model is only one part of a local workflow. Check extensions, telemetry, retrieval, connected tools and backups. If permission is missing, stop at a public or synthetic example; do not silently substitute another provider.

## 3. Runtime and authority

- Runtime, exact version: [application / service / operating system]
- Model, exact identifier and version: [record the model used]
- Model rights and intended use: [licence URL, reviewed scope and date]
- Hardware / hosting requirements: [memory, accelerator, storage, network and tested limits]
- Permitted tools: [specific read or draft actions]
- Actions requiring review: [publication, purchase, external write, permission changes]
- Review owner: [name and response path]
- Credential storage: [secure provider or local store, no values]

Start with read and draft authority. Treat retrieved content as data, not instructions that expand tool permissions.

## 4. Output contract

The output must contain:

1. [Main result and required structure]
2. [Sources or evidence identifiers for factual claims]
3. [Unresolved questions and uncertainty labels]
4. [One next action with its owner]
5. [Run identifier, model/runtime and completion state]

Missing or unsupported facts must be labelled, not invented. A failed or partial run must remain distinguishable from a completed run.

## 5. Cost and operating limits

- Per-run spending ceiling: [amount and currency, or no metered provider]
- Monthly spending ceiling: [amount and currency]
- Maximum attempts / retries: [count]
- Maximum input / output: [bytes, tokens or records]
- Latency target: [target, measured only after a run]
- Maintenance owner: [who updates integrations and checks terms]
- Support scope: [what is included and escalation route]

Count failed attempts, model/API usage, hosting, storage and human review. A software price or token rate is not the complete cost of a workflow.

## 6. First validation run

Create a known-answer example and record these checks in `ai-acceptance-worksheet.csv`:

- The input is within the permitted source and data boundary.
- The output has every required section and is saved outside the tool.
- Factual claims are checked against the authorised sources.
- Unknown information stays unknown.
- No external write occurs without the declared review.
- A retry does not duplicate an external action.
- Spend and latency are recorded where measured; unavailable measures are marked unknown.
- A simulated missing source or provider failure produces a recoverable failure record.
- A saved project/configuration can be restored by the named owner.

Acceptance decision: [accepted / revise / stop]

Evidence location: [saved output, run record and review]

Reviewer and date: [name / ISO date]

## 7. Handoff and exit

- Implementation branch / project: [location]
- Delivery artifact: [files and instructions]
- Verification command / manual check: [exact checks]
- Release owner: [who decides to publish or enable a live workflow]
- Rollback: [known-good revision and procedure]
- Export: [portable formats and location]
- Cancellation: [how to stop recurring work and preserve necessary records]

Give an implementation agent `ai-agent-handoff.md` together with the completed brief. Do not grant additional accounts or spending just to complete a demo.

## Licence and scope

Original template text © 2026 Starlight Technology, licensed under CC BY 4.0: https://creativecommons.org/licenses/by/4.0/. Use, adapt and share with attribution to https://starlight.technology/ai. Third-party software, models, source material and services have separate terms and are not supplied by this kit.

This is an implementation planning template, not an installed application, compatibility certification or vendor appointment.
