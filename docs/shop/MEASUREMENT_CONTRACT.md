# Shop measurement contract v1

Emission is disabled until `NEXT_PUBLIC_SHOP_ANALYTICS=v1` is set in the deployment. Events go through `emitShopEvent()` (`src/lib/shop/analytics.ts`), which drops unknown events and strips any property outside the allow-list (`route`, `product`, `collection`, `format`, `destination`, `relationship`). No free text, no email addresses. Transport is Vercel Web Analytics custom events (cookieless), already mounted in the layout.

| Event | Fires when | Properties | May be reported as |
| --- | --- | --- | --- |
| `shop_view` | a shop route renders on the client | route, collection?, product? | traffic only |
| `product_view` | an edition or free product page renders | route, product | interest only |
| `free_lab_start` | first interaction with the lab (example loaded, text typed, extract pressed) | product | engagement only |
| `free_artifact_exported` | brief.md / brief.json downloaded or Markdown copied | product, format | engagement only |
| `availability_request_started` | first focus inside the availability form | product | intent only |
| `availability_request_completed` | at least one configured sink (private Blob store or endpoint) accepted the submission (202) | product | a request, never a sale |
| `affiliate_link_click` | an external link with relationship `affiliate` is clicked | destination (hostname), relationship, product? | referral click, never revenue |

## What is never counted

- Downloads, exports, lab starts, previews and synthetic or test traffic are never activation, demand, conversion or revenue.
- An availability request is not demand in any public number and not a pre-order.
- Independent-recommendation clicks are not recorded at all.
- Nothing from the lab's content is sent anywhere.

## Change control

Bump the contract version when adding an event or property. The code constant `SHOP_MEASUREMENT_CONTRACT` and this file change together; the environment flag must match the new version before emission resumes. Update `/privacy` in the same change.
