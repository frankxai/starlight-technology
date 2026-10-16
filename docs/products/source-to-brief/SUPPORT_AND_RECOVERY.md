# Support scope and recovery guide — Source-to-Brief Workflow Edition

**Channel.** hello@frankx.ai. Target: two business days for licence, installation and defect reports.

**Covered.** Installation and runtime diagnostics (`bin/doctor.mjs` report), defects in the shipped workflow, templates and schema, licence and update questions.

**Not covered.** Writing or reviewing your briefs, custom integrations, model provider billing or outages, legal review of what you publish.

## Recovery

| Problem | Do this |
| --- | --- |
| Lost download | Reply to your order email or use the portal; the link is re-issued from the entitlement. |
| Install fails | Run `node bin/doctor.mjs`, send the output. Node 22 or 24 is required. |
| Review gate never completes | Open `out/review.md`; every held line needs approve or reject. `--resume` re-runs from there. |
| Export missing citations | The evaluation check `citations` names the line; fix the source id or reject the line. |
| Paid but nothing delivered | The webhook audit trail identifies the order by provider event id; delivery is replayed or the payment refunded. |
| Licence revoked in error | Support reverses the revocation; the audit row carries the reason. |
