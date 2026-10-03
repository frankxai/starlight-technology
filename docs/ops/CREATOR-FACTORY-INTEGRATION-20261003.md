# Creator Studio operating-cost integration

Status: draft for independent review. Source tasks: `01a0f8ee-5c6e-7ac1-b094-7567bfefbb5b` and `01a101b1-9d38-7fa1-b1f0-dec923631d7f`. Tracks [Technology issue 30](https://github.com/frankxai/starlight-technology/issues/30).

## Actual product change

The existing Creator Studio now compares maker and independent-reviewer operating costs within its editable system plan. Each provider has separate input, cache, output and API-share assumptions. Compute, retained disks, tools, browser fees, platform increments, new subscriptions, currency and repair assumptions remain explicit. The same-workload alternative changes the maker while preserving the reviewer and all other assumptions.

The scenario uses rational BigInt arithmetic and rounds only display amounts. Unknown fees preserve a partial subtotal; unknown exchange rates and incomplete totals cannot establish a euro cap. Expected accepted missions remain hypothetical. This page neither dispatches workers nor proves native subscription capacity.

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
