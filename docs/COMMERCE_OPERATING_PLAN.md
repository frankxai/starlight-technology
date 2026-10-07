# Starlight Technology commerce operating plan

Decision date: 7 October 2026. Owner: Frank / Starlight Intelligence.

## Decision

Keep starlight.technology as the hardware buying and system-design surface. The commercial sequence is **affiliate referrals → selected fulfilled equipment → configured AI systems and support**. Preserve the existing Next.js / GitHub / Vercel project. Build buying demand and evidence before buying inventory or paying for a second commerce platform.

The durable offer is a working creator or AI studio: hardware selection, a validated software runtime, storage and recovery, commissioning and support. Starlight Intelligence owns the runtime and applied intelligence; Starlight Technology owns equipment selection and supply. FrankX supplies founder-led demonstrations and distribution; the academies teach deployment. Do not duplicate the same review across the brands.

## Delivered in this change

- `/shop`: eight source-backed equipment records, four categories, brand/runtime search, three studio planning shortlists and a three-component comparison board.
- `/shop/[slug]`: purchase-fit and avoid conditions, runtime boundary, complete-system obligations, manufacturer source/date and a labelled external destination.
- `/partners`: prospective affiliate, distribution and vendor routes. Every proposed relationship is identified as prospective.
- Homepage and navigation entry points; accessible mobile menu; canonical metadata, catalog structured data, sitemap entries and agent-readable site guidance.
- A commission-link approval boundary: both a reviewed approval record and a valid partner-issued environment URL are required. Missing, malformed, unapproved or expired destinations fall back to the official source.

No affiliate account, attributed revenue, hardware checkout, supplier account or reseller appointment is claimed. The source catalog deliberately has no live price or inventory field. Original category diagrams are labelled schematics; no vendor-photo licence is assumed.

## Connector decision and actual availability

A ChatGPT connector, a merchant API and an affiliate programme are different authorities. Account enrollment creates the commercial relationship; an API credential creates an integration; neither alone proves permission to publish every asset or sell every vendor's product.

| Layer | Decision | What it manages | Availability checked in this session |
| --- | --- | --- | --- |
| Source / release | GitHub + Vercel | Product/editorial records, approval changes, checks, deployments, runtime URL configuration | Native tools available; existing repo and verified production domain identified |
| First affiliate network | Awin Publisher account | Approved advertisers, authorised product feeds, partner links, transaction reports | No native Awin connector exposed; implement through a narrowly scoped API adapter in n8n |
| Additional affiliate network | impact.com Partner account | Specific approved brands and authorised catalogs/reporting | No native impact.com connector exposed; add only when an approved brand justifies it |
| Workflow control | Existing n8n – Starlight Workflows | Search, inspect and execute approved workflows | Native MCP available; affiliate search returned no workflows. This MCP does not expose workflow authoring or credential creation |
| Physical commerce | Shopify, introduced for stage two | SKU catalog, inventory, customer checkout, orders, fulfilment, returns | No Shopify tool exposed in this session. Requires a connected store app / authenticated API bridge |
| Own digital services | Existing Polar routes; Stripe where separately selected | Blueprints, services and payments for Starlight's own offers | Stripe tools exposed; no payment integration added by this hardware change |
| Operational data | Git records first; Supabase only when orders or offer history require it | Reconciliation, supplier mappings, operational audit | Supabase tools exposed; no project or database created for this release |

**Connect first: Awin publisher + approved MINISFORUM and UGREEN programmes.** Add GMKtec where the exact regional Awin programme and product quality fit. Add impact.com only for an otherwise unavailable priority brand; avoid running the same conversion through multiple networks.

The official Awin publisher guide describes feed access and update timestamps. Access and usable products depend on the publisher's actual advertiser permissions. UGREEN's EU page links to Awin, impact.com and CJ. MINISFORUM publishes an affiliate application route. Programme existence is verified; Frank's acceptance and account status are not.

Sources checked 7 October 2026:

- https://help.awin.com/developers/docs/product-feed-publisher-guide-intro
- https://help.awin.com/apidocs/retail-publisher-productapidocumentation-1
- https://help.impact.com/partner/what-would-you-like-to-learn-about/platform-features/marketing-content/product-marketplace-and-catalogs/download-product-catalogs-as-a-partner
- https://store.minisforum.com/pages/brand-ambassador
- https://ai-eu.ugreen.com/pages/affiliate
- https://www.gmktec.com/ — current footer contains an Awin affiliate route and a wholesale/dealer route

## Affiliate activation contract

1. Enroll the actual trading entity and starlight.technology with the network. Verify the contact, payment/tax details and promotional methods in the account; complete any programme agreement directly in the provider's secure flow.
2. Obtain acceptance for a specific advertiser and regional programme. Keep the programme rules and permitted promotion/asset use with the approval record.
3. Generate the exact product destination in the provider's link tool or API. Do not fabricate attribution parameters, mask destinations or modify signed links. Programmes that require direct linking remain direct.
4. Store the publisher API credential in n8n's credential store. It never goes into Git, public code, a feed fixture or an affiliate URL. Affiliate destination URLs are public link data, distinct from API credentials.
5. Add a reviewed record to `data/commerce/approved-offers.json`; set the corresponding `STARLIGHT_AFFILIATE_*_URL` through Vercel's secure environment-variable flow. No `.env` contents should be read or printed.
6. Verify the exact host, product variant, market, attribution, disclosure and permitted expiry period in preview. Release through the existing checks. The live count on `/disclosure` derives from valid approvals.
7. Validate the first attributed transaction in the provider's reports. Track pending, approved, reversed and paid commissions separately. Do not represent a click or pending transaction as collected revenue.

The current runtime resolves offers on the server for every request, without contacting a merchant API. Expired approval records fall back to the manufacturer page. This is link-record expiry, not a live price freshness system. A visitor's already-open tab retains its rendered link until refreshed.

An approval record has these fields: productSlug, merchant, programme, envKey, approvedAt, verifiedAt, validUntil, allowedHosts and region. Use ISO timestamps and exact hosts. Set expiry from the programme's permitted use and the operational review period. The repository starts with an empty approval array.

## n8n / agent operating contracts

Start with manually triggered, read-only integrations. Author and import workflows through n8n's supported admin interface/API once access is connected; the current MCP can review and execute existing approved workflows. No scheduler has been installed by this work.

| Workflow | Inputs | Deterministic handling | Output / authority |
| --- | --- | --- | --- |
| Affiliate inventory refresh | Approved network account, advertiser allowlist, permitted feed IDs, last successful watermark | Fetch authorised updates, validate schema and exact variants, reject unsupported regions, preserve partner links, record source/time/rights | Staging dataset and proposed diff; no automatic public claims |
| Product review and publication | Approved product packet, authorised images, buying objective, proposed link | Validate source dates, expired offers, image rights, canonical intent and complete-system checks | Draft PR, repository tests, preview; public release through current gates |
| Commission reconciliation | Network transaction/report access | Deduplicate by provider transaction ID, retain reversals and payouts, reconcile currency and settlement | Operational report; no payout changes or invented earnings |
| Partner pipeline | Programme facts, company profile, evidence links, draft pitch | Track proposed → applied → approved → active → revenue-validated states | Draft application/outreach for Frank; no automatic message sending |

A future agent-facing commerce adapter should expose narrow tools such as list_approved_programmes, fetch_authorised_feed, stage_offer_change, reconcile_commissions and inspect_order. Publishing unverified claims, placing supplier orders, refunding payments and submitting contracts are separate authorities. Use idempotency keys and replayable records for every order/financial action.

## Stage two: selected fulfilled equipment

Introduce Shopify only when Starlight accepts physical orders. Retain the editorial frontend and use Shopify as the commerce authority. Shopify's GraphQL Admin API and webhooks support products, inventory, orders and fulfilment. Start with read access; grant catalog writes or order actions only for the specific workflow being enabled. The customer's personal information stays in the commerce backend and is not copied into public source.

Shortlist **BigBuy** for a controlled EU accessory pilot and **Dutch authorised distributors** for hardware. This is a diligence shortlist, not a claim that a candidate can supply the chosen SKUs profitably. BigBuy documents catalog, stock, carrier and order APIs and a sandbox. Obtain current commercial terms, relevant category access, delivery coverage and a usable margin before subscribing or importing products.

Choose a small set of useful desk products: connectivity, stands, mounting and peripherals. Validate the exact electronics and supplier documents where applicable. Avoid beginning with anonymous marketplace GPU supply, fragile expensive items or a broad imported catalog.

Proposed operating gate for the first physical SKU:

- Demand exists in the affiliate site's conversion/report data or a specific paid customer brief.
- A sample has been inspected; exact SKU, support, warranty, return destination and delivered costs are agreed.
- Contribution is positive after payment fees, fulfilment, expected returns, support and acquisition cost. VAT collected is excluded from revenue in this calculation.
- Stock is authoritative; overselling prevention, payment handling, fulfilment tracking and a refund/return loop have been exercised with an end-to-end test order.
- Seller identity, applicable customer terms and product obligations have been reviewed for the actual market and supply chain.

Supplier-order automation starts after this flow has passed. Keep the first orders manually approved until reconciliation and recovery paths work. No supplier or store subscription has been purchased.

Technical sources:

- https://shopify.dev/docs/api/admin-graphql/latest/objects/Order
- https://shopify.dev/docs/api/admin-graphql/latest/objects/WebhookSubscription
- https://www.bigbuy.eu/public/doc/Guia_API_BigBuy_EN.pdf

## Stage three: global supply and value-added resale

| Candidate | Initial approach | Evidence needed before expanding |
| --- | --- | --- |
| MINISFORUM | Affiliate evaluation of exact AMD mini-workstation variants; later regional supply discussion | Runtime compatibility, sample quality, correct SKU, landed cost, warranty/RMA and territorial terms |
| UGREEN | EU affiliate relationship for NAS and useful studio connectivity; later selected fulfilment | Disk/network compatibility, data-recovery limits, stock, delivery and product support |
| GMKtec | Evaluate its advertised affiliate and wholesale/dealer routes | Regional programme acceptance, benchmark packet, QA and EU support agreement |
| TD SYNNEX Netherlands | Distribution-account diligence for authorised systems and vendor lines | Acceptance, specific vendor/SKU availability, ship-to-customer service, credit/payment terms, returns |
| Ingram Micro Netherlands | Alternative authorised distribution path | The same operational and vendor-access checks; account approval is not blanket vendor certification |
| ALSO Netherlands | Alternative distributor / service route | Actual vendor access, supply terms, fulfilment and technical support scope |
| NVIDIA | NPN Solution Provider as the future value-added reseller route | Accepted application, competencies/requirements for chosen product lines, authorised supply and reference deployments |
| AMD | APN Sell track for retail/systems/value-added resale; evaluate Service separately for integration | Accepted programme role, product and territory rights, supply/support capability and evidence of customer value |

NVIDIA describes Solution Providers as value-added resellers who can integrate its products and technologies for customers. AMD explicitly lists retailers, system builders, resellers and distributors under Sell Partners. These are suitable routes to investigate; acceptance, purchasing conditions and product authorization are not guaranteed. NVIDIA startup/developer participation does not constitute a reseller appointment.

Use official supplier and distribution relationships for branded GPUs and systems. A Chinese supplier relationship can support mini-PCs and peripherals without providing authority to advertise Starlight as an authorised NVIDIA or AMD reseller. Keep sample evaluation, affiliate acceptance, dealer agreements, vendor badges and trademark/asset permissions as separate records.

Distributor and vendor sources checked 7 October 2026:

- https://www.tdsynnex.com/eu/nl/nl/partnerfirst.html
- https://emea.ingrammicro.com/nl-nl/general/become-a-reseller
- https://www.also.com/ec/cms5/en_2420/2420/company/contact/index.jsp
- https://www.nvidia.com/en-us/about-nvidia/partners/
- https://www.amd.com/en/partner/partner-network.html

## Partner application packet to prepare

Use the exact legal trading entity, KvK/VAT data and secure account contact; confirm them before submission. The public business description can be:

> Starlight Technology helps AI-native creators and small teams choose and deploy complete working systems. We publish source-backed buying decisions, compare runtime and configuration constraints, and develop validated studio and local-AI deployment blueprints. Our initial market is the Netherlands and EU. We are seeking an affiliate relationship for relevant products, with a later path to regional supply and supported system delivery after demand and operational readiness are established.

Attach the shop, methodology, disclosure, a representative product decision and the system-design/infrastructure portfolio. Do not invent traffic, revenue, purchase volume, independent testing, certifications or installed customer references. Commercial forecast fields use an explicit forecast with assumptions; historical fields use verified actuals.

## Immediate next actions and ownership

| Priority | Action | Owner / dependency | Completion evidence |
| --- | --- | --- | --- |
| 1 | Release and verify the shop in the existing domain | This implementation / repository checks | Merged commit, READY production deployment, working routes |
| 2 | Connect the Awin publisher account and enroll priority advertisers | Frank: secure account enrollment / programme acceptance | Approved advertiser and regional permissions |
| 3 | Add the first approved URLs and near-link disclosure | Engineering, once publisher links are issued | Two product destinations validated and first transaction attributed |
| 4 | Expose a narrow feed/report adapter through existing n8n | n8n admin/API access plus authorised publisher credentials | Read-only workflow tested; report reconciles provider totals |
| 5 | Publish one exact-system evaluation per chosen platform | Editorial + real hardware access | Own benchmark packet and explicit evidence status |
| 6 | Request supplier/distributor account terms | Frank / prepared applications | Written stock, shipment, warranty and commercial terms |
| 7 | Add Shopify and a small physical pilot | Positive demand/contribution case, supplier terms | Tested order, fulfilment, return and reconciliation |
| 8 | Apply for NVIDIA/AMD partner roles tied to deployed systems | References, delivery capacity and programme requirements | Programme acceptance and vendor-specific permissions |

Measure useful product visits, merchant clicks, attributed approved commissions, paid commissions and contribution per delivered system. A larger catalog or a partner badge is not the operating objective. A customer receiving a working system is.
