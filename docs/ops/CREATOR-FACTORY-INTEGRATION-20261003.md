# Creator Studio operating-cost integration

Status: draft for independent review. Source tasks: `01a0f8ee-5c6e-7ac1-b094-7567bfefbb5b` and `01a101b1-9d38-7fa1-b1f0-dec923631d7f`. Tracks [Technology issue 30](https://github.com/frankxai/starlight-technology/issues/30).

## Actual product change

The existing Creator Studio now compares maker and independent-reviewer operating costs within its editable system plan. Each provider has separate input, cache, output and API-share assumptions. Compute, retained disks, tools, browser fees, platform increments, new subscriptions, currency and repair assumptions remain explicit. The same-workload alternative changes the maker while preserving the reviewer and all other assumptions.

The scenario uses rational BigInt arithmetic and rounds only display amounts. Unknown fees preserve a partial subtotal. Known costs exceeding the entered cap prove a breach even when other nonnegative fees are unknown; a partial subtotal below the cap cannot prove affordability. An unknown exchange rate or cap leaves the comparison unknown. Expected accepted missions remain hypothetical. This page neither dispatches workers nor proves native subscription capacity.

CreatorPlan v1 imports migrate in memory to v2. Opening a legacy plan preserves its original saved bytes until an actual edit. Existing equipment, private context, selections and hardware constraints remain in the plan. Cost-only export excludes private context. Explicit conflict recovery, Web Locks, export, invalid-import preservation and storage-denial behavior reuse the published Studio implementation.

The published 54-file source includes the existing Atlas, evidence and buying-intelligence work. It was integrated once into an isolated branch from actual remote main `4588a2409588b62cb394dc370ff52a46819ba346`. The Hermes primary checkout and other tasks' private source were preserved.

## Reproducible source chain

- Published Studio source: [issue comment 5967242898](https://github.com/frankxai/starlight-technology/issues/30#issuecomment-5967242898), manifest `7dd5c36c2789d05eb70bd5b31ecbf7f4e547d5e5f66704447611ce029c359ad5`.
- Recoverable six-file cost delta: [issue comment 5971350872](https://github.com/frankxai/starlight-technology/issues/30#issuecomment-5971350872), manifest `8304b7f5caee24a569ddedf2ed99424dfad0e6ff0f84eb47422e5b2e1ee5b130`.
- Integration refinement: replace BigInt literal syntax with constructors to support this repository's ES2017 compiler target while retaining native BigInt arithmetic. The full Windows type check exposed the mismatch missed by the earlier ES2022 partial-tree check.
- Next.js regenerated `next-env.d.ts` with its root-params type import during the successful production build.
- Tested 59-file source binding: `efd760e121785e3e924eba96553cdfc5754307a40848fd789b5590cacde383f5`. It covers the 58 integrated source files and generated type entry. Evidence documents are outside this runtime-source fingerprint.

## Verification, 3 October 2026

On Windows, Node 24.16.0 and Corepack pnpm 10.15.1 ran the frozen lockfile with Next 16.3.6, React 19.3.0, TypeScript 5.9.3 and Vitest 5.0.0.

The first offline install reused 340 packages and failed on missing `caniuse-lite`. The following frozen-lockfile install reused 340 and downloaded 25 packages. Install scripts remained disabled. No npm cache purge occurred. Package and lockfile contents stayed unchanged. This does not establish a fully offline installation.

Passed:

- Toolchain verification, full repository lint and type check.
- All 100 Vitest tests, serial file execution.
- All 11 existing editorial-planner tests required by CI.
- Optimized production build, 51 generated pages.
- Fifteen actual Chrome checks: legacy bytes, two tabs, explicit v2 migration, independent exports, numeric re-entry, invalid fractions, unknown fees, same-provider warning, actual reload, unsafe import preservation, mobile overflow/touch/focus, older-client conflict, cancelled/confirmed removal, missing Web Locks and private-context network exclusion. No page errors; the synthetic private sentinel was absent from 216 observed request URLs and bodies.
- Secret scan of the complete `src` tree: no findings. Git whitespace check passed.

The first browser fixture used an unsuitable label locator for the model select. The actual accessibility tree showed a labeled combobox within the reviewer group; the corrected role locator passed. The failed attempt remains in private evidence. Earlier captures had mid-section scroll framing; three additional heading-aligned captures preserve those originals and show the actual summaries.

The default paired scenario models USD 78.9012 / EUR 72.59 with eight missions per working day, 22 days, 25% repairs, 80% hypothetical acceptance, Sol maker, Opus reviewer and the entered compute/fee assumptions. Changing only the maker to GLM models USD 59.9812. Switching both stages to the separate GLM-maker/Sol-reviewer preset models USD 51.1812; that is a different comparison.

All browser workers and the exact owned SDS production server were stopped. Storage remained above 15% throughout this validation. Space recovered externally before integration; the cause is unverified. No foreign process, cache, lock or source checkout was deleted.

## Open gates and pickup

Independent provider/security review, independent design/buyer review, exact-commit CI and preview checks, privacy/licence/commercial acceptance, measured useful missions and delivered hardware quotes remain separate gates. A local passing build and lead design score do not grant release approval. Preserve the waitlist and current commercial boundary until the applicable release gate passes.

Native subscription shares remain assumptions until entitlement, quota and runnable authentication are measured. Full-factory orchestration, autonomous mission acceptance and business outcomes remain open under the original objective.

Estate handover belongs in `frankxai/agentic-ops-hub`, existing draft PR 109 and issue 102. Product updates belong in issue 30. Resume from this branch and its exact reviewed revision; do not reapply published patches over the integrated files.

## Native review continuation, 3 October 2026

The Google native CLI completed a nonce-bound review of three immutable core files at `b8b079ffba5c8256d9febe206d68f7ac7302bc2f` in 195 seconds. It reported a failing verdict and five findings. The known-cost cap finding was reproduced by two failing regression cases and fixed: exact known costs now establish a breach before missing fees are considered. Unknown totals, exchange rates and affordability remain unknown where appropriate.

Four proposed changes conflict with the existing product behavior or need surrounding source that the reviewer was not given. The maker-only UI comparison preserves the reviewer; the separate GLM/Sol preset deliberately changes both stages. Complete plan export preserves private context for recovery, while cost-only export excludes it. Unknown catalog IDs are rejected without replacing the saved draft, rather than silently changing the user's intended workload. Timestamp-only legacy opens preserve original bytes; an actual edit saves v2. These dispositions and the original provider findings are retained in `docs/evidence/creator-factory-20261003/native-core-review.json`.

The terminal result was successful and contained review text, with no observed tool steps. Requested and CLI-reported model: `gemini-3.1-pro-high`. Reported usage was 45,021 input and 27,961 output tokens, including 27,254 thinking tokens. Served-model identity, quota and invoice were not independently proved. Plan command expansion was observed; inherited permission mode remained `always-proceed` with 60 registered tools, so this establishes no hard tool confinement. The earlier empty timeout and ineffective plan invocation remain historical evidence.

This review covers three core files at the earlier commit. It grants no wider product, design, buyer or autonomous deployment acceptance. After the cap correction, full Windows toolchain, lint, type check, all 102 Vitest tests and the 51-page production build passed. No new browser run was performed for this arithmetic change; the 15 browser checks above remain bound to the earlier source. A provider review bound to the corrected revision remains pending. CI and preview at the earlier commit passed; they do not verify later changes.

## Exact decimal input continuation

The native Opus review of four complete source files at `2a1063937f02cf56229a2fc09dc95eda546fc22f` returned WARN. It verified the corrected cost/cap arithmetic and identified silent rounding in the numeric editor. The actual Studio caller blocks unreadable storage before automatic saving; that caller was outside the provider packet. Non-locking legacy writers still have a best-effort conflict boundary.

The numeric editor now parses decimal strings directly into integer units. It rejects excess significant precision, unsupported notation and out-of-range values. Caps use cents, fees and exchange-rate assumptions use millionths, and percentages use basis points. Trailing decimal zeroes preserve exact values. Optional blank values remain unknown; explicit zero remains known zero.

Numeric edits commit on blur or Enter. Typing a partial zero before a sub-micro fee no longer saves that zero. Invalid input remains visible with an associated error, while the saved assumption is kept. Escape restores the saved value. Fifteen regression cases pass; seven failed under the previous rounding behavior. Full lint, TypeScript and 117 Vitest cases pass. The first production-build admission was held at 7,942 MB available RAM against 8,192 MB required. No build or browser verification is claimed for this revision at this stage.

The existing Railway launchpad returned a healthy public readiness response on 3 October. Its live public court reports deterministic coordination, no autonomous execution, no continuous workers and zero running role instances. The configured source is `frankxai/production-agent-patterns`, branch `agent/codex/starlight-agent-launchpad-v1`; the inspected branch source is `6fd6181560df4d604074d62350aae78e46de6006`. The service's deployment status is SUCCESS from 14 September; no serving-commit attestation was returned. Health and planning records establish no model-worker execution. SIS PR 160 is merged, while durable activation remains open under starlight-swarm issue 15. No runtime, schedule, credential or budget was changed.
