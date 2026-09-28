# Starlight Technology: commerce and operations architecture

Status: implementation plan, 2026-09-28. The public Technology Atlas is a source-backed catalog prototype, not a live merchant marketplace or robot control plane. Existing editorial, paid Blueprint, and Infrastructure Partnership OS remain separate product lines within the same brand.

## Decision

Build a **system decision network**. A conventional SKU catalog optimizes for product lookup. Starlight must answer: which workload, in which environment, with which existing assets, constraints, interfaces, recovery path and total cost? A listing is useful only when it resolves those conditions. The consumer entry is a free, evidence-rich catalog and system builder; the business layer is paid decision work and team procurement; the long-term network connects authorized merchants, integrators, device operators and agents.

The identity of a device is not its price. Separate `ProductFamily → Variant → SpecificationAssertion → Source`; `Merchant → Offer → PriceObservation`; `Workload → Requirement → CompatibilityAssertion`; and `SystemBuild → ComponentSlot → selected Variant`. Every assertion has a source, date, confidence, region and review state. An offer has merchant ownership, currency, VAT/shipping terms, availability timestamp, expiry and outbound-link rights. Never fuse several regional variants under a single spec sheet.

## Product surfaces

| Surface | User action | Release rule |
| --- | --- | --- |
| `/shop` | Search, filter and inspect sourced device decisions | Shipped in this branch with four manufacturer-sourced references and no prices |
| `/builds`, `/compare`, `/guides` | Learn the workload boundary and complete system | Existing editorial product; retain canonical URLs |
| System composer | Enter workload, assets, region, budget and constraints; receive a short list, exclusions and unknowns | Build deterministic logic before an AI explanation layer; save/share only after consent and persistence design |
| Offer layer | Compare authorized regional seller offers and leave for merchant checkout | Requires program acceptance, feed rights, timestamps, freshness and disclosure |
| Team workspace | Policy, approval, purchase record, lifecycle and refresh decisions | Requires accounts, roles, tenancy and a paid customer; keep separate from public catalog |
| Robot operations | Inventory, capabilities, operator checklist and supervised task intent | Requires vendor adapter, site-specific safety acceptance and authenticated command path; no public action endpoint |

The future aerospace category is research and systems architecture. Do not imply that a rocket can be bought, managed or operated from the consumer shop.

## Commercial model and gates

1. **Organic discovery and authority:** high-quality system decisions, original comparison methodology, source updates, structured internal linking and candid failure conditions. No mass-generated thin product pages.
2. **Outward affiliate commerce:** begin with direct manufacturer destinations. Join relevant NL/EU programs individually; only introduce tracked links after approval and destination, image, price-cache and disclosure rules are recorded. Start with a small reviewed merchant set, not every possible retailer.
3. **Own products:** the €190 human-reviewed Creator System Blueprint and €890 stack audit already exist as proposed SKUs; verify actual fulfillment capacity, legal terms and checkout before promoting at scale. The €29/€99 memberships need active accounts, entitlement, recurring value and support capacity before being sold as delivered software.
4. **B2B systems:** team procurement and compatibility audits, with fixed scope and acceptance criteria. Infrastructure Partnership OS is higher-ticket, separate from the consumer funnel.
5. **Later transactions:** direct merchant integrations or marketplace checkout only after seller contracts, payments, consumer obligations, returns, VAT, support and unit economics justify becoming merchant of record. Affiliate outbound checkout remains the low-ops first stage.

Illustrative planning model, not a forecast: `monthly contribution = qualified visits × outbound rate × merchant conversion × average order × commission rate − content/research − feed/API − hosting − support`. At 10,000 visits × 8% × 2% × €1,000 × 3%, affiliate gross is **€480/month** before costs. The same audience converting 0.5% to a €190 blueprint yields **€9,500 gross** but requires fulfillment capacity. Measure actual attribution, returns and cohort behavior before staffing or feed expansion. Prioritize system tools and original editorial that generate qualified intent over a large commodity catalog.

## Partner sequence

| Partner | Why | Gate |
| --- | --- | --- |
| Direct manufacturers / retailers | Authoritative specs and visible purchase destination | Permission for assets; variant and regional verification |
| impact.com | Partner catalogs can be downloaded via platform, FTP or API | Brand partnership and uploaded catalog required; feed license and attribution verified |
| Amazon Associates Creators API | Broad marketplace catalog for selected categories | Acceptance, locale, API access and program terms; the older PA-API 5 is deprecated |
| Specialist retailers and affiliate networks | Deep audio, PC, camera and EU offer coverage | Join programs and compare net commission, returns, feed quality and permitted cache duration |
| Robot manufacturers and integrators | SDK/support, field service, training and site acceptance | Written partner terms, exact model/firmware support, safety case and operator responsibility |

Google Merchant API manages **a merchant's own catalog**, and is not a general competing-retailer price feed. Search product structured data should describe real page content; do not emit fictitious `Offer`, availability, reviews or ratings.

## Runtime topology

| Layer | Default | Activation condition |
| --- | --- | --- |
| Public UI | Next.js App Router on the existing Vercel Git project, static pages/ISR | Active now; project/domain linkage needs verification |
| Editorial truth | Typed Git records, reviewed PRs, citation checks | Active now; migrate only when human review or offer churn makes Git insufficient |
| Media | Approved manufacturer assets with provenance, or owned imagery | R2 with a production custom domain and cache only when rights and volume justify it; no hotlinked scraped images |
| Offer ingestion | Scheduled job reads licensed feeds, normalizes, validates, snapshots and expires | Railway worker or Cloudflare scheduled Worker after feed credentials and rate/cost decision; never fetch in a public page request |
| Transactional graph | Postgres with row-level product and offer provenance | Add after a real merchant feed and operating SLA; prefer isolated database, migrations and backups |
| Operator jobs | Railway for long-running normalization or vendor bridges | Existing `starlight-launchpad` Railway project has Postgres/operator; do not attach this product to it without tenancy, cost and ownership review |
| Edge | Cloudflare DNS/CDN and R2 for approved assets, optional Workers for bounded ingestion | Avoid duplicating Vercel SSR or creating two content authorities |
| AI | Explanation over approved records with citations and uncertainty | Never let model output create offers, compatibility certifications or robot commands without deterministic validation |

The pipeline is `licensed source → raw immutable snapshot → parser → normalized candidate → provenance and policy checks → editorial review → published record → scheduled recheck/expiry`. Store source checksum and rights scope. A crawler can suggest changes but cannot silently publish conclusions. A feed withdrawal removes offers while preserving an auditable revision history.

## Agent and robot authority

Content agents may research and propose PRs. Integration agents may test adapters against simulators or read-only APIs. Price agents may quarantine stale or mismatched offers. A human editor approves public verdicts, commercial program changes and partner claims. Operators approve site and device onboarding; a site-specific role authorizes physical tasks. Every task carries actor, scope, asset, environment, evidence, approval, TTL, idempotency key and rollback/emergency path.

For robots, first standardize **inventory and read-only telemetry**, then capabilities and simulator tasks, then supervised dispatch in controlled space. Use vendor adapters; evaluate ROS 2/Open-RMF where the platform actually supports it. Keep cloud agent reasoning separate from the local safety controller. Loss of connectivity, e-stop and physical access must not depend on Vercel or an LLM. No autonomous physical command surface exists in this release.

## Data and trust rules

- Accessibility, privacy, disclosure, EU consumer terms, cookie/analytics choice, VAT and seller responsibility receive review before transactional expansion.
- Price observations have `observed_at`, `expires_at`, region, currency, tax/shipping basis and merchant origin. An expired offer is hidden, not relabeled as current.
- Product content distinguishes tested, sourced and inferred; sponsored access and affiliate relationships appear at the decision point.
- Compatibility is directional and conditional: `compatible`, `incompatible`, `unknown`, with evidence and exact versions. Unknown never means yes.
- Security: least-privilege service identities, read-only discovery first, separate production/staging credentials, secret manager, audit log, deletion/export workflow, and no credentials in Git.
- Production telemetry: stale-offer rate, broken destinations, source age, editorial corrections, outbound CTR, attributed conversion, return rate, paid fulfillment time and gross contribution. Robot telemetry adds task failures, safety incidents and operator overrides.

## Release sequence

**R0, this PR:** Atlas and four decision records; verify responsive UI, source URLs, metadata, routes and existing tests. No affiliate links or robot commands.

**R1, editorial expansion:** 20–30 deeply reviewed records in the creator-studio wedge; six complete builds; filtering by workload, region and constraints; source freshness report; product page schema only where eligible. Add phones, displays and glasses when evidence passes. Publish an editorial correction process.

**R2, authorized commerce:** 2–3 approved merchants; feed adapter contract; offer ingestion with expiry, QA quarantine, disclosed outbound links and conversion instrumentation. Validate real unit economics before scaling feeds.

**R3, system composer and paid workflow:** deterministic compatibility graph, comparison state and human-reviewed blueprint fulfillment; only then accounts, saved workspace and membership entitlements.

**R4, managed technology estate:** team inventory, procurement approvals, device policy and supervised robot adapters. Build per customer/site with separate authority and safety acceptance.

## Decision references checked 2026-09-28

- Manufacturer references: https://frame.work/desktop ; https://www.nvidia.com/en-us/geforce/graphics-cards/50-series/rtx-5090/ ; https://www.meta.com/quest/quest-3s/ ; https://www.unitree.com/go2
- impact.com partner catalog access: https://help.impact.com/partner/platform-features/marketing-content/product-marketplace-and-catalogs/download-product-catalogs-as-a-partner
- Amazon Creators API and PA-API deprecation: https://affiliate-program.amazon.com/creatorsapi/docs/ ; https://affiliate-program.amazon.com/creatorsapi/docs/en-us/paapiv5-deprecation
- Google structured data and Merchant API scope: https://developers.google.com/search/docs/appearance/structured-data/product ; https://developers.google.com/merchant/api/overview
- Cloudflare R2 pricing and custom domain: https://developers.cloudflare.com/r2/pricing/ ; https://developers.cloudflare.com/r2/platform/limits/
- Open-RMF fleet adapter: https://docs.ros.org/en/rolling/p/rmf_fleet_adapter/

These URLs are integration research, not evidence of commercial approval or live API credentials.
