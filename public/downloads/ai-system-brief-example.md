# Worked example: approved source notes to a project brief

Starlight Technology · AI System Brief Kit 1.0

**Fictional example.** This is a complete planning scenario, not a customer case, benchmark, installed system or revenue claim. The example has not been run against a model. Cost and timing targets below are planned thresholds, not measurements.

## The source set

Two invented notes are permitted for the trial:

**NOTE-A — Studio intake, 7 October 2026**

> A two-person design studio needs an internal project brief from approved intake notes. The first output stays in a local Markdown file. The producer reviews it before sharing it with the designer. A first draft needs the goal, deliverables, evidence and missing decisions. No customer names or personal information enter the trial.

**NOTE-B — Delivery agreement, 7 October 2026**

> The trial has one manual trigger and one output. It must not email anyone, publish anything or create a task in another system. The brand palette and delivery date are not yet decided. The studio will choose them after reviewing the draft. The source-note references must remain in the brief.

## 1. The job

- Accountable owner: Studio producer (fictional role).
- User: Studio designer.
- Trigger: Producer explicitly starts a draft after approving NOTE-A and NOTE-B.
- Input: The two synthetic notes above, copied as plain text.
- Output: `studio-project-brief.md`, saved in the local project folder.
- Manual path: Producer reads the notes and writes the brief.
- Success: Designer can see the stated goal, deliverables and unresolved decisions without rereading the intake.
- Wrong-fit condition: Source permission is absent, the task needs external delivery, or a date/brand decision is required before the draft.

> When the producer approves the source set, the workflow converts two intake notes into a local project brief so the designer can review scope and unresolved decisions, subject to producer approval before sharing.

## 2. Data boundary

- Source owner and permission: Example author permits use of these synthetic notes for this trial.
- Classification: Synthetic, no real customer or personal information.
- Processing path: An existing assistant account permitted for synthetic content, or a locally evaluated runtime.
- Provider decision: Producer records the actual provider, retention settings and model at run time. No provider has been selected or provisioned by this example.
- Exports: Local Markdown, shared with the designer only after review.
- Retention: Keep the reviewed brief and a run record; discard trial chats according to the selected tool's controls.
- Exclusions: Real customer documents, credentials, third-party private content and attachments.

## 3. Authority

Read NOTE-A and NOTE-B. Produce a draft file. No tools may send messages, publish, spend money, alter permissions or update external systems. Review is owned by the producer. Missing decisions remain explicitly missing.

## 4. Output contract and reference answer

The producer compares the draft to this reference structure; phrasing may differ:

```markdown
# Studio project brief

## Goal
Create an internal project brief from approved intake notes. [NOTE-A]

## Deliverables
- One local Markdown brief. [NOTE-A, NOTE-B]
- Goal, deliverables, evidence and missing decisions are visible. [NOTE-A]

## Workflow
One manual trigger; producer reviews before sharing with the designer. No email,
publication or external task creation is authorised. [NOTE-A, NOTE-B]

## Unresolved decisions
- Brand palette: not decided. [NOTE-B]
- Delivery date: not decided. [NOTE-B]

## Next action
Producer reviews the draft and decides palette and delivery date with the designer.

## Run record
Run ID: [actual ID]
Model/runtime: [actual identifier]
State: draft awaiting review
```

## 5. Planning limits

- No new subscription or hardware purchase for this trial.
- With an existing metered provider: maximum €1 incremental spend per trial, confirmed in the actual account before running. This is an example cap, not a rate or measured cost.
- One initial attempt and one correction at most.
- No background schedule.
- Target: one inspectable draft in a single manual run. No latency is claimed.
- Maintenance/support: producer owns the trial; no maintained service is included.

## 6. Acceptance and recovery

1. Save the actual draft and a run ID.
2. Verify each factual claim against NOTE-A/NOTE-B.
3. Reject invented palettes, dates, customer details or delivery commitments.
4. Record that no external writes occurred.
5. Record actual provider cost where available; otherwise mark unknown.
6. Run once with NOTE-B omitted: date and palette must remain unknown, and the missing note must be recorded.
7. Close the tool, reopen the saved local file and confirm the brief can be recovered independently.

The worksheet begins with `not-run` states. Mark checks only after inspecting actual output. A complete example specification is not proof that a model passes it.

## 7. Next implementation

Use the agent handoff to package the manual trial in an isolated project. External integrations remain out of scope until the producer requests them. Preserve the local Markdown export. Rollback means return to the producer's manual brief process and remove any trial integration.

Original example text © 2026 Starlight Technology · CC BY 4.0 · https://creativecommons.org/licenses/by/4.0/ · attribution: https://starlight.technology/ai. Third-party terms remain separate.
