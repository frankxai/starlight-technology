# Overnight Claude Code handoff — Starlight Technology

Objective: take the reviewed Technology Atlas branch toward a production-ready Vercel preview and a credible next release. Work in `frankxai/starlight-technology`; read `AGENTS.md`, `docs/EDITORIAL_STANDARD.md`, `docs/COMMERCE_AND_OPERATIONS.md`, `docs/PRODUCT_STRATEGY.md` and the PR before edits. The branch is `feat/technology-atlas-20260928`. Do not merge or change the production domain without the documented release gates.

Existing stacked work matters: [PR #22](https://github.com/frankxai/starlight-technology/pull/22) has an XR decision hub and versioned APIs; [PR #20](https://github.com/frankxai/starlight-technology/pull/20) has bounded hardware editorial automation; [PR #21](https://github.com/frankxai/starlight-technology/pull/21) holds phone/laptop research packets pending regional and asset-rights evidence; [PR #18](https://github.com/frankxai/starlight-technology/pull/18) has article figures. Review dependencies and reuse these branches rather than rebuilding their features or publishing held research. Deep XR decisions belong in `/xr` once #22 clears its visual gate; the Atlas remains the cross-category index.

The follow-on slice on this branch adds `/shop/studio`, `/shop/estate`, six catalog records, read-only technology APIs and a local TF-IDF vector index. Read `docs/TECHNOLOGY_OPERATING_SYSTEM.md` and `docs/COMPETITIVE_DESIGN_DIRECTION.md` with its original SVG board before visual edits. Do not call the lexical index neural, do not infer compatibility from the local ledger, and do not add a robot command endpoint.

## Parallel team contracts

Use separate worktrees and branches. One integrator owns the final merge into the feature branch, conflict resolution, verification and preview. Agents must not share a working tree or mutate the same files concurrently.

1. **Design and frontend:** inspect `/shop` and each detail route at desktop and mobile widths, plus keyboard and 200% text zoom. Improve the first viewport, result density, responsive navigation and visual coherence with existing pages. No fabricated product photos. Update `design-loop-evidence.json` with actual screenshots/observations and score; do not claim visual inspection based on source alone.
2. **Research and catalog:** verify exact manufacturer URLs and model variants. Add at most 6–10 records across one or two high-intent categories, with dated primary sources, conditional decision, wrong-fit criteria, interfaces and complete-system cost. Flag uncertainty instead of inventing specs. Do not add price, availability, reviews or affiliate links.
3. **Data and commerce architecture:** design schemas and migrations as a proposal; implement a pure normalization/expiry library and tests using fixtures, without live feeds or a database. Model `ProductFamily`, `Variant`, `Assertion`, `Source`, `Merchant`, `Offer`, `PriceObservation`, `CompatibilityEdge`, `Workload`, `SystemBuild`, rights and audit fields. Prove expired offers cannot be rendered and unknown compatibility cannot be cast as compatible.
4. **Platform and security:** inspect GitHub branch checks, Vercel project/domain association, existing Railway services and Cloudflare access. Produce an exact environment matrix, cost ceiling, secret scopes and deployment topology. Do not reuse the `starlight-launchpad` database or operator for this product without an ownership decision. No secret values in logs or PR.
5. **Growth and business:** map approved affiliate programs and actual application status, required disclosures, feed rights, direct merchant order flow, SEO eligibility and a unit-economics sheet with assumptions separated from measured values. Define R1 page selection from demand, not arbitrary SKU volume.

## Integrator acceptance

Run `pnpm install --frozen-lockfile`, `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build`. Inspect actual browser screenshots at 1440px and 390px and test search/filter, detail links and mobile navigation. Check source URLs and timestamps, metadata, sitemap, disclosure, noindex on previews and no fictitious offer JSON-LD. Record the commit SHA, preview URL, build outcome and unresolved gates in the PR. Vercel native Git integration is the only deployment path after project connection. Keep PR draft until checks and product review pass.

Observed baseline: Vercel project `prj_YHhpzehDzOpD5OqLf1vgEAVlWYhE` hosts `starlight.technology`; the updated feature preview is `https://starlight-technology-lanm5vv2m-starlight-intelligence.vercel.app/shop` at code commit `eafb9f07fb9da5a339356633e63c0d6cd184ca09`. GitHub CI run `36500646432` passed and Vercel reached READY. Preview fetch returned 200 and the correct canonical URL for `/shop` and `/shop/estate`, and 200 for `/api/technology/search?q=robot`. The Vercel fetch connector intermittently failed on other paths; local production-server route checks passed. Desktop/mobile browser screenshot and interaction inspection remain open.

## Decisions requiring Frank or external partners

- Merchant account acceptance and actual licensed feed access; attribution and permitted reuse vary by partner.
- Whether Starlight sells memberships now; checkout, entitlement and recurring delivery are not evidenced in this branch.
- Production domain and Vercel project association if the current team project is not already connected.
- Physical robot pilot site, operator, model/firmware, insurance, emergency procedure and vendor support agreement.

Stop at a reviewable PR and preview where those inputs are missing. Report observed facts separately from proposed architecture. Do not simulate a successful deploy or partner approval.
