# Hardware publishing for Starlight and FrankX

Version: 1.0, 16 September 2026. Owner: Starlight Technology. Issue: #19.
State: implemented planning tools; research automation tracked separately; public release requires the existing repository gates.

## The operating choice

Research each product and variant once. Maintain a compact evidence packet, an approved image set and one canonical buying decision. Reuse these inputs across articles, comparisons, complete builds and distribution. Write each treatment for its own reader job.

| Surface | Owns | Example reader decision |
|---|---|---|
| starlight.technology | Market comparisons, configuration tradeoffs, complete-system costs, compatibility and regional offers | Which laptop configuration fits this workload, and when should I avoid it? |
| frankx.ai | Frank's creator/founder workflows and documented personal experience | How does this phone change a demonstrated capture-to-publish workflow? |
| Existing Content OS | Briefs, assignments, review decisions and performance records | Which evidence-backed story should advance next? |
| This repository | Hardware-specific source policy, portable packets and a deterministic intake planner | Which new signals are distinct and fit the work budget? |

Keep one canonical URL per intent. An announcement, comparison and hands-on review are different evidence classes. A manufacturer page supports attributed manufacturer claims; it does not establish independent performance. FrankX adaptations need a distinct contribution and link to the underlying Starlight evidence. Do not duplicate full articles.

## Coverage and sources

Start with phones and laptops. Add tablets, displays, audio, cameras, local AI compute and accessories through the same category and product records. Use exact model, generation, RAM/storage configuration and region; a family name is insufficient for price or performance comparisons.

The checked directory is `data/editorial/policy.json`: [Apple Newsroom](https://www.apple.com/newsroom/), [Samsung Newsroom](https://news.samsung.com/global/), [Google Pixel](https://blog.google/products-and-platforms/devices/pixel/), [Lenovo StoryHub](https://news.lenovo.com/) and [HONOR](https://www.honor.com/global/news/). These URLs were opened on 16 September 2026. Directory access is not proof of feed availability, image permission or every product claim. Apple returned limited article content; Lenovo's guessed `/pressroom/` path was unavailable. Record these gaps instead of inventing access.

Expand coverage only after verifying each official endpoint and source policy. Competitor articles and social posts are discovery leads. Follow them back to official releases, specification sheets, support pages or original benchmark methods. Do not ingest another publisher's article or image library.

The existing RSS Content Monitor is active and covers general AI/creator sources. It posts to Slack. It was inspected read-only and was neither executed nor changed for this work. No second general news crawler is needed. Its source configuration can later accept verified hardware feeds through an authorized adapter change. A feed URL and its terms must be verified before enabling unattended fetching; all new directory entries currently have `automatedFetchEnabled: false`.

## One production cycle

1. **Detect:** read source changes since the last successful observation. Prefer approved RSS/API deltas and conditional HTTP requests where supported. Persist only identity, dates, links and compact paraphrases. A failed source does not advance its watermark.
2. **Filter in code:** validate source domains and timestamps; deduplicate source facts; group the same product and reader intent; resolve existing canonical coverage; enforce the outstanding-work and token reservation limits.
3. **Commission:** keep at most three outstanding briefs. Require a useful buyer/creator decision, a new fact or original artifact, and a reason the existing page is insufficient. Refresh a useful existing page before making a competing URL.
4. **Research once:** open the full sources for the selected decision, including limitations and footnotes. Record facts, manufacturer assertions, inference and firsthand observations separately. Maximum two research rounds; unresolved central evidence becomes HOLD.
5. **Produce:** fill `product-packet.template.json`; draft from the compact claim packet; select the appropriate visual tier; resolve affiliate fit from the existing ledger. Preserve source links throughout.
6. **Review:** a separate reviewer checks facts, rights and reader value. Apply the brand voice, accessibility and repository gates. Authoring is not approval.
7. **Release and reuse:** inspect mobile/desktop preview; publish only with authority. Create a comparison row, a relevant build update, a social crop or an email excerpt from the accepted packet when each has a real purpose. Adaptations retain the source content ID and are not counted as new researched articles.
8. **Maintain:** observe T+7, T+28 and T+90; refresh, consolidate or retire based on evidence. Stop producing when maintaining existing material would help readers more.

## Visual production

Readers should see the product, the relevant evidence and the decision clearly. Use captions to explain why each image belongs at that point in the article.

| Tier | Typical material | Visual requirement |
|---|---|---|
| ESSENTIAL | Useful announcement or factual update | Real approved product image or existing relevant figure, caption/credit, deliberate OG crop |
| EXPLAINER | A bounded technical or workflow explanation | Approved product/screen capture plus an exact decision diagram or comparison figure where useful |
| FLAGSHIP | High-intent buying guide, named-product comparison or substantial launch feature | Full governed visual packet, three reviewed directions and six meaningful visual roles; mobile treatment and independent review |

The governed FrankX flagship roles are narrative hero, exact architecture, decision comparison, workflow scene, OG/social cover and a mobile-native rendition. Apply these where the article earns a system narrative; a Starlight buying page keeps its local requirement for a real decision object in the first viewport. Verified product details and screenshots provide evidence alongside the visual sequence. Reuse assets and deterministic layouts where appropriate; six roles do not require six AI generations. Apply the full Govern Media Fabric flagship contract, current category benchmark and independent review before approval. No character or decorative scene is a substitute for product evidence.

Sourcing order: authorized manufacturer press assets; our own clean screenshots/photos; approved affiliate-network creatives; original diagrams; commissioned conceptual illustration. Samsung's [media library](https://news.samsung.com/medialibrary/global) is a sourcing entry point, not blanket permission.

Every asset needs its stable asset/version ID, exact source, permission evidence, allowed territory/channel, attribution, expiry, checksum, dimensions, caption and alt text. Rights uncertainty stays quarantined. Source credit alone does not authorize republication. Do not hotlink publisher images or generate an apparent photograph/screenshot of an actual device feature.

Reuse the article figure components from Starlight PR #18 and FrankX PR #715 after they land. Keep enlargement, source credit and purchase CTA distinct. Use the shared media fabric when available: immutable approved binaries in the existing media store, responsive delivery through Vercel Image, build-time asset manifests. This process does not provision a database or media vendor. Store portable metadata in Git until the existing control-plane adapter is verified; never claim a metadata row has been synced when it has not.

## Monetization and freshness

Evaluate commercial fit on every piece. Insert a commission-bearing destination only when it helps that reader and an approved, region-appropriate issued link exists. Preserve that URL byte-for-byte. Use a nearby disclosure and `rel="sponsored"`; keep citations ordinary source links. No partner account means an ordinary official/editorial destination. Commission size never controls ranking.

Phone/laptop variants and markets must match the offer. Reference price, live merchant price and complete-system cost are distinct fields. Recheck price and availability at release and honor the merchant's stricter expiry rules; otherwise omit them. Do not build unattended price scraping. No hardware affiliate enrollment or merchant feed is activated by this process.

| Evidence | Default recheck trigger |
|---|---|
| Launch/availability/feature support | At publication and on new regional rollout, firmware or support notice |
| Price/stock | At publication; merchant-policy TTL thereafter; hide on expiry |
| Specifications | At publication; exact variant change or 30 days while actively recommended |
| Hands-on benchmarks | Hardware, firmware, application or test-method change |
| Rights/partner terms | Each new asset/placement plus expiry or terms change |
| Source directory | Within 30 days; failed entries remain explicitly unavailable |

## Cost and token controls

The planner makes zero model calls and zero paid API calls. It is an admission controller, not an API billing proxy or automatic writer. The recurring ChatGPT research task still consumes the user's task/model allowance; actual token usage may be unavailable. Never label that unknown cost as zero.

Initial operating limits:

- Up to 200 compact signals per planning batch; at most 16 source-page opens per research run.
- Three outstanding briefs across both sites, maximum three newly reserved in a run.
- Reserve 6,000 input plus 2,000 output tokens per brief, including a review allowance. These are planning envelopes, not measured usage or a claim that every brief fits.
- 24,000 reserved tokens per run and 240,000 per UTC calendar month for this hardware commissioning lane. A full article or flagship asset production requires a separate explicit reservation; it is outside this brief allowance.
- No new paid API, generation subscription or infrastructure spend. External paid-tool budget is zero until a specific cap is authorized and enforced in the provider adapter.
- Maximum one substantive rewrite. Reuse the source packet rather than reloading entire pages or prior conversation history. Use a capable writer/reviewer only for selected work; do parsing, normalization, cropping and diagram rendering deterministically.
- Persist reservations before work. Failed attempts retain their reservation; never reset the ledger to regain budget. Record actual usage when supplied by the provider and all human review/rework time. Unknown usage remains unknown.

For any chosen provider, calculate cost with its current verified rate card:

`cost = uncached_input / 1e6 * input_rate + cached_input / 1e6 * cache_rate + output / 1e6 * output_rate + tool_calls + image_generation + storage/delivery + human_time`

Do not assume a cache discount, batch discount or model price. Use provider usage receipts. Thirty reserved briefs fill the monthly 240,000-token envelope; this is capacity for briefs, not thirty published articles. Compare cost per accepted article and per maintained useful page, including rejected work. Infrastructure and existing subscriptions are not free simply because this script adds no API charge.

## Run and recover

No install is required for the planner; use the repository's Node 24 runtime.

```sh
node --test scripts/editorial/plan.test.mjs
node scripts/editorial/plan.mjs data/editorial/pilot-intake.json data/editorial/initial-state.json .tmp/hardware-plan.json 2026-09-16T22:00:00Z
```

Create the output directory first. The CLI refuses to overwrite an existing output. It returns one bundle containing selected/pending job IDs, deferred/rejected reasons, reservations and `nextState`. Job bodies live once in `nextState.jobs` to avoid tripling model context. Save that whole bundle on the current editorial branch before any model work. For the next run, extract `nextState` as the state input. Use the latest saved branch state, including unmerged reservations; `initial-state.json` is bootstrap-only. Do not write private billing or partner data to this public repository.

One writer may reserve a hardware batch at a time. Compare the branch head immediately before saving; on conflict, reload the new state and rerun. Repeating identical input does not add jobs or reservations. Changed facts create a new event; if its reader job already has reserved work, update that brief instead of commissioning a duplicate. Deferred signals remain in the intake queue for the next run. Read `pending`, not only `selected`, when resuming after failure.

The planner trusts the source observations and intent IDs supplied by its caller. Its structural checks do not verify truth, semantic originality, legal permission or a real budget debit. `publishable: false` remains explicit. Only evidence-backed completion/rejection changes a reserved job to completed/held/killed. A held item needs a recorded release condition before it is reopened.

Roll back by reverting the process commit; pause the named hardware automation separately. Retain prior state and rights receipts. This cannot unpublish an article: publication continues to use each site's existing release process.

## Scale after evidence

Begin with the three source-backed research commissions in `pilot-intake.json`. They are not drafted or published articles. The intake's empty inventory must be reconciled with existing URLs and Content OS before authoring.

After three accepted pieces and one 28-day review, expand only if there are no unresolved factual/rights failures, the refresh queue is maintained, review time fits capacity and measured reader/commercial response justifies more work. Use 3/3/4 waves for ten canonical pieces; create the Content Intelligence program packet before expanding beyond the proof wave. Add categories and reuse product records before raising daily output targets.

Measure: accepted versus rejected briefs, source and asset reuse, corrections, expired prices/rights, production and review minutes, actual model/tool cost, engaged visits, useful affiliate clicks and attributed revenue. Report revenue and assisted conversions separately. A large page count is not evidence of success.
