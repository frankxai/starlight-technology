# Technology Atlas: interface, knowledge and operations contract

Status: implemented public slice plus gated integration plan, 2026-09-28. The launch decision is to make the **system brief** portable and the **catalog record** inspectable. Neither requires an account, a merchant feed or a robot command channel.

## What runs now

| Interface | Contract | Storage / authority |
| --- | --- | --- |
| `/shop` | Visual catalog across compute, mobile, display, spatial and robotics; category filter, local TF-IDF vector retrieval, source dates and system boundaries | Versioned Git records; no visitor data sent for search |
| `/shop/[slug]` | Fit, failure condition, interfaces, complete-system costs and manufacturer source | Statically generated; no invented offer or hands-on claim |
| `/shop/studio` | Workload + environment + constraint → deterministic candidate or hold, with explicit checks | `localStorage` on the visitor's device; JSON export/import. Equipment notes never enter URL or API |
| `/shop/estate` | Local equipment ledger for PCs, phones, displays, headsets and robots; status and capability notes | Browser-only storage, schema-versioned JSON export/import with duplicate IDs skipped; no credentials or control |
| `/api/technology/catalog` | Versioned JSON with records and evidence | Public, read-only, cached; no operational secrets |
| `/api/technology/search?q=` | Ranked lexical vector results with source and score | Public, bounded input; no model call or query retention |
| `/api/technology/decision?workload=&environment=&constraint=` | Same deterministic decision boundary as UI | Public, read-only; no device command or inventory ingestion |

The vectors are genuine normalized TF-IDF embeddings over the six-record curated corpus, **not neural semantic embeddings**. This distinction is visible in the API metadata. They give reproducible retrieval without a paid dependency. At 20–30 reviewed records, evaluate multilingual recall, synonyms, zero-result rate and click relevance; only then add a neural model if it improves the measured decision task.

## The visual contract

The first screen presents a search and an actual device decision, with a one-click System Studio. Each card encodes **interface ↔ complete cost**, not a decorative product silhouette. Detail pages show the exclusion before the manufacturer outbound link. The Studio makes a hold state as prominent as a candidate state. Mobile navigation must expose all routes; controls must work with keyboard, reduced motion and enlarged text. No scraped or generative depiction of an exact product is treated as a photograph.

Media enters through a rights ledger: `asset_id`, `maker`, `product_variant`, `source_url`, `licence_or_permission`, `allowed_channels`, `attribution`, `expiry`, `checksum`, `alt_text`, `storage_key`, `reviewer`. A vendor-provided embed can be referenced by its canonical URL and loaded only after checking embedding terms and privacy behavior. Originals and permitted vendor assets can move to private R2 intake and a public custom-domain bucket after review. Stale rights remove the asset from publication independently of its underlying product record. Cloudflare's `r2.dev` public endpoint is for development, not production.

## Knowledge graph and embeddings

```
SourceSnapshot -> Claim -> ProductFamily -> Variant -> Capability
                                      |             |          |
                                      |             +--> CompatibilityEdge -> Workload
                                      +--> SystemBuild -> ComponentSlot
Merchant -> Offer -> PriceObservation -> Region / Tax / Expiry
OwnedAsset -> Firmware / Location / Operator -> MaintenanceEvent
```

The durable identity is source-backed `family + model + variant + region`, never the marketing name alone. A claim has exact source, observed date, reviewer and status. `CompatibilityEdge` is `compatible | incompatible | unknown`, tied to exact software/hardware versions and tested workload. No AI inference promotes unknown to compatible. Offer prices have source, tax/shipping basis and expiry. Owned assets and operational telemetry live in a separate private tenant boundary; the public product graph contains no household, client or fleet details.

When neural retrieval becomes useful, embed **reviewed claim chunks**, not raw merchant copy or whole pages. Key by `claim_id + revision_hash + embedding_model + dimensions`; re-embed changed chunks, retire superseded vectors and preserve citations. Use Vercel AI Gateway `/v1/embeddings` from a background ingestion job with an explicit model and spend ceiling. Store vectors with claim IDs in a dedicated Postgres/pgvector database after tenant and backup design. Public queries retrieve citations and deterministic compatibility checks before any optional AI explanation. Do not call the embedding provider from a page render or put a gateway key in `NEXT_PUBLIC_*`.

## External data contracts

| Connector | Read path | Write path | Activation gate |
| --- | --- | --- | --- |
| GitHub | Editorial records, manifests, review history, connector specs | Draft PR with source diffs | Existing; no automatic publish |
| Vercel | Static UI, bounded public APIs, previews and logs | Native Git deploy | Existing project `prj_YHhpzehDzOpD5OqLf1vgEAVlWYhE`; production only after visual and release checks |
| Cloudflare R2 | Approved public media, private raw feed snapshots | Rights-gated ingest job | Account/zone, bucket, custom domain, signed private access, retention and cost owner |
| Railway | Scheduled feed normalization, reconciliation, long-running adapter or telemetry bridge | Isolated service and database migrations | First licensed feed or paying operations tenant; do not attach to `starlight-launchpad` by default |
| Merchant programs | Authorized catalog/offer feeds and attributed links | None in launch | Partner acceptance, rights, exact locale, cache window, disclosure and return attribution |
| Manufacturers | Specs, SDK support, documentation, warranty/service | Possible partner handoff | Exact variant, region, image rights and support terms |
| Robot adapters | Simulator and read-only telemetry first | Supervised site-specific dispatch much later | Vendor SDK, local controller, authenticated operator, physical stop, incident plan and signed acceptance |

## Ingest and synchronization

1. Discover an official page or licensed feed; store URL, owner, locale, terms and a checksum. No arbitrary crawler content becomes public truth.
2. Snapshot raw bytes in a private object store when permitted; a parser maps fields into **candidate** records. Normalize units, GTIN/MPN and variant identity, but keep source values for audit.
3. Validate claim/date/region, rights, bounds and compatibility. Quarantine collisions or changed product identifiers. An agent proposes a PR with a compact diff and source links.
4. A human accepts the editorial verdict and asset rights. Git publishes stable claims to Vercel. Offer records, once licensed, have independent expiry and a scheduled stale-offer removal job.
5. Reconcile inventory and operational observations into tenant-owned state. Event IDs and version checks make imports idempotent. Exports contain schema version and source provenance; conflict resolution never silently overwrites an accepted record.

For the personal Studio, the JSON file is the portable sync mechanism today. A future signed-in workspace should offer encrypted-at-rest records, per-tenant authorization, export/delete and optimistic revision control. A user-owned Git repository is a viable portability adapter for *non-sensitive* manifests; secrets, device credentials and private telemetry belong in a scoped secret store and operational database. Browser extension and MCP clients consume the same versioned read APIs; write tools require separate explicit scopes and an approval receipt.

## Configuration ledger

| Setting | Where | Needed now? | Owner / verification |
| --- | --- | --- | --- |
| GitHub ↔ Vercel project and production domain | Existing native integration | Yes, already observed | Verify preview SHA, CI and domain alias for each release |
| `AI_GATEWAY_API_KEY`, embedding model ID, request/spend limit | Vercel/Railway server secrets | No | Add only with vector quality case; never expose browser-side |
| `DATABASE_URL` for isolated Postgres | Railway private reference variable | No | Add after feed/tenant decision, migrations, backup and connection budget |
| R2 S3 endpoint/access key/secret, bucket and public asset domain | Private worker secrets; public origin string only in UI | No | Create after media rights and lifecycle policy; no raw keys in Vercel public env |
| Merchant IDs/feed tokens/affiliate link formats | Ingestion worker secrets | No | Join programs and record permitted fields/cache before activation |
| Robot vendor SDK credentials and local bridge | Site-controlled runtime | No | Per-site operator and safety acceptance, never public Vercel function |

## Operating loop

- Daily once offers exist: feed health, expiry, broken outbound links, source and rights changes, spend and conversion anomalies.
- Weekly: source freshness, zero-result searches, decision holds, correction queue and data rights review.
- Monthly: contribution by category and merchant, editorial production cost, return rate, blueprint fulfillment, model evaluation and platform spend.
- Release: CI, preview HTTP and interaction checks, desktop/mobile visual review (26/30 design threshold), accessibility, source links, metadata, cost boundary, rollback, then production merge.

## References checked 2026-09-28

- Vercel AI Gateway embeddings API: https://vercel.com/docs/ai-gateway/sdks-and-apis/openai-chat-completions/embeddings
- Vercel AI SDK embeddings: https://ai-sdk.dev/docs/ai-sdk-core/embeddings
- Cloudflare R2 public custom domains and development URL: https://developers.cloudflare.com/r2/buckets/public-buckets/
- Railway cron/worker tradeoffs and variables: https://docs.railway.com/guides/cron-workers-queues ; https://docs.railway.com/variables
