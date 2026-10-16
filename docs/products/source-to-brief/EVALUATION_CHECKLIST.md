# Source-to-Brief evaluation checklist (12 checks)

Shipped in `checks/evaluation-checklist.md` of the Workflow Edition and run by the free lab. A failing check does not block export; it is recorded in the artifact.

1. **title** — the brief has a title.
2. **summary** — a person wrote a summary of at least 20 characters.
3. **sources** — at least one source in the register.
4. **approved** — at least one approved line.
5. **citations** — every line cites a source that exists in the register.
6. **review-complete** — no line is still pending review.
7. **findings** — at least one finding.
8. **questions** — every entry under open questions ends with a question mark.
9. **owners** — every next action names an owner (`@name`, `owner:`, `owned by`, `assigned to`).
10. **source-coverage** — every source contributed a line or is listed as unused.
11. **contradictions** — the contradiction scan ran and candidate pairs are listed.
12. **provenance** — generator name, version and timestamp are recorded.
