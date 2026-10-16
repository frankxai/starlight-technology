# starlight.brief/v1

Shared export format produced by the free Source-to-Brief Lab and the Workflow Edition. Implemented in `src/lib/brief/core.ts`.

```json
{
  "schema": "starlight.brief/v1",
  "title": "string",
  "summary": "string written by a person",
  "generatedAt": "ISO-8601",
  "generator": { "name": "source-to-brief-core", "version": "1.0.0", "surface": "lab | workflow" },
  "sources": [{ "id": "S01", "label": "string", "url": "optional", "lineCount": 0, "hash": "8 hex chars" }],
  "sections": {
    "finding": [{ "lineId": "S01-L01", "sourceId": "S01", "text": "string" }],
    "decision": [], "question": [], "action": []
  },
  "review": { "approved": 0, "rejected": 0, "edited": 0, "pending": 0 },
  "contradictions": [{ "a": "S01-L03", "b": "S03-L01", "shared": ["renews", "november"] }],
  "evaluation": { "passed": 0, "total": 12, "checks": [{ "id": "citations", "label": "string", "pass": true, "detail": "string" }] }
}
```

Rules: every section entry carries a `sourceId` that exists in `sources`; `review.pending` must be 0 for a brief to pass the review check; `brief.md` is a rendering of the same object and adds nothing the JSON lacks.
