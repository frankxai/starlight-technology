# Shop production build — implementation plan

Date: 2026-10-16. Branch: `claude/starlight-shop-production-wl99xc`. Base: `main` @ `20de9ec`.

## What exists and is reused

| Existing | Decision |
| --- | --- |
| `/shop/[slug]` hardware decision pages (8 records in `src/lib/shop.ts`) | Kept unchanged as the rollback surface. They become the detail pages behind `/shop/local-ai-hardware`. |
| `ShopExplorer`, `HardwareDiagram`, `shop.module.css` | Reused on `/shop/local-ai-hardware`. No duplicate explorer. |
| `resolveShopOffer` approval boundary + `data/commerce/approved-offers.json` | Reused verbatim. It already distinguishes affiliate from official links and fails closed. |
| `products.ts` (Polar SaaS tiers, blueprints), `/pricing`, `/checkout/[sku]` | Untouched. Advisory and membership offers stay on `/pricing`. |
| Design tokens in `globals.css` (`--ink`, `--signal`, `--cyan`, `--amber`, `--paper`, `--muted`) | Extended with storefront tokens; no new colour system. |
| `layout.tsx` fonts (Syne display, Space Grotesk body, IBM Plex Mono) | Reused. |
| Vercel Analytics already mounted | Custom events go through one gated wrapper. |

## Information architecture

```
/shop                                   storefront (static)
/shop/agent-workflow-kits               collection
/shop/mcp-and-agent-skills              collection
/shop/research-and-decision-intelligence collection
/shop/creative-production               collection
/shop/local-ai-hardware                 collection + reused hardware explorer (request-rendered for link approvals)
/shop/products/[slug]                   digital product pages (flagship: source-to-brief-workflow-edition)
/shop/free/[slug]                       free products (source-to-brief-lab, runs in the browser)
/shop/how-it-works                      journey + public checkout-readiness board
/shop/licensing-and-support             licence, updates, support, refund boundaries
/shop/updates                           dated changelog across shop + products
/shop/availability                      availability list / request access (fail-closed form)
/shop/[slug]                            existing hardware decision pages (unchanged)
/api/shop/availability                  POST, writes to the private Blob store and/or forwards to an https endpoint; with neither configured 503 + mailto fallback
/api/shop/availability/export           GET, operator export (JSON or CSV) behind SHOP_ADMIN_TOKEN; 503 when unconfigured
/api/shop/catalog                       GET, machine-readable catalogue (starlight.shop.catalog/v1) for programmatic embeds
/shop/embed/[slug]                      GET, self-contained embeddable card (frame-ancestors *, noindex) for editions and the free lab
/api/shop/webhooks/payment              POST, signature-verified, fail-closed until a provider is configured
```

Static segments win over `[slug]` in the App Router, so the new routes never shadow the hardware slugs and vice versa.

## Data model (`src/lib/catalog/`)

- `types.ts` — `Collection`, `DigitalProduct`, `FreeProduct`, `Recommendation`, `PriceLabel`, `Licence`, `SupportScope`, `ChangelogEntry`, `Prerequisite`, `Deliverable`, `MediaPreview`.
- `collections.ts` — the five collections; each lists products, free products, recommendation groups and planned editions (labelled, never priced, never sold).
- `products.ts` — flagship `source-to-brief-workflow-edition` with every required product-page field.
- `free.ts` — `source-to-brief-lab`.
- `recommendations.ts` — software/tooling recommendations with `relationship: "independent" | "affiliate"`; hardware recommendations derive from `shop.ts` + `resolveShopOffer`.
- `schema.ts` — JSON-LD builders: Organization, BreadcrumbList, Product (+ Offer only when checkout is actually open), FAQPage, ItemList.
- `src/lib/commerce/fulfilment-gates.ts` + `data/commerce/fulfilment-gates.json` — nine named gates; `resolveCheckoutState()` returns `checkout` only when every gate is satisfied with evidence and a verified payment URL exists. Anything else returns `availability-list` with the open gates listed, which the UI renders.
- `src/lib/commerce/entitlements.ts` — order/entitlement state machines, idempotency key derivation, HMAC signature verification. Pure functions, tested, not wired to any provider.
- `src/lib/brief/` — the Source-to-Brief core used by the free lab: `parse`, `classify`, `render-markdown`, `render-json`, `evaluate`. Pure, tested, shared with the paid edition's export format `starlight.brief/v1`.
- `src/lib/shop/analytics.ts` — measurement contract v1 (seven events). Emission is off until `NEXT_PUBLIC_SHOP_ANALYTICS=v1`.

## Component inventory (`src/components/shop/`)

`StorefrontHero`, `CollectionCard`, `ProductCard`, `PricingModule` (price + status + licence + version), `MediaModule` (file tree, terminal, workflow diagram, before/after), `CtaModule` (primary + secondary resolved from checkout state), `Disclosure` (independent / affiliate / official-source label), `Reveal` (CSS view-timeline only; reduced-motion safe; content visible without JS), `ReadinessBoard` (fulfilment gates), `AvailabilityForm` (client), `SourceToBriefLab` (client), `ShopEvent` (client view events), `Breadcrumbs`.

## Visual system

Dark storefront on the existing palette. Storefront tokens: `--surface-0/1/2`, `--edge`, `--glow`, `--radius`, spacing scale, `--measure`. Display type Syne at tight tracking, mono labels for metadata rails, signal green for one action per view, cyan for diagnostics, amber for proposed/unverified status. Motion: CSS `animation-timeline: view()` reveals under `@supports` and `prefers-reduced-motion: no-preference` only. Minimum 360px layout.

## SEO plan

Per-route `metadata` with canonical + OG; `/shop/opengraph-image.tsx`; sitemap entries for every new route; JSON-LD per route; `public/llms.txt` updated; semantic heading order (one `h1` per page).

## Fulfilment gates (fail closed)

inventory/rights · merchant eligibility · tax/consumer terms · payment webhook · entitlement delivery · delivery email · recovery paths · refund/revocation · support flow · admin reconciliation · licence portal. All open on this branch. Paid checkout cannot render while any gate is open. Full design: `docs/shop/FULFILMENT_ARCHITECTURE.md`.

## Test plan

- Catalog integrity: unique slugs, required fields, collections reference real products, no forbidden claims (testimonials, rankings, scarcity, revenue), every route in the sitemap.
- Checkout state: all permutations of open gates and payment URL → never `checkout` unless all satisfied.
- Brief core: parse, classification, markdown/json round-trip, evaluation checklist.
- Entitlements: state transitions, idempotency, HMAC verification incl. timing-safe mismatch.
- Analytics: gated off by default, known events only.
- Toolchain, lint, typecheck, build, Playwright screenshots at 360/390/768/1349, keyboard pass, Lighthouse-style review.

## Rollback

Production stays on `main`. This ships behind a Vercel preview. Rollback = promote the previous production deployment or revert the squash merge; hardware routes and data are untouched by this change.
