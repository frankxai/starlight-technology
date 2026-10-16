# Shop fulfilment architecture (designed, not activated)

Status: 2026-10-16. Every gate in `data/commerce/fulfilment-gates.json` is open. `resolveCheckoutState()` in `src/lib/commerce/fulfilment-gates.ts` therefore returns `availability-list` for every edition and no page can render a paid checkout. This document is the design the gates measure against.

## Components

| # | Component | Authority | Designed behaviour | Code today |
| --- | --- | --- | --- | --- |
| 1 | Product catalogue / SKU | Git (`src/lib/catalog/products.ts`) | One SKU per edition (`ST-WE-S2B-001`). Versions immutable once released. Price has a `basis` (`proposed` / `verified`) and a `verifiedOn` date. | Live |
| 2 | Checkout session | Merchant of record (Polar is the repo's existing self-serve choice; Stripe where separately selected) | Session created from SKU + verified price + licence code. Site never holds card data. URL arrives via `SHOP_CHECKOUT_URL_<SKU>` and must be https with no credentials. | Resolver only |
| 3 | Payment webhook | `/api/shop/webhooks/payment` | HMAC-SHA256 over `timestamp.payload`, constant-time compare, 300 s tolerance. Unsigned, stale or unconfigured → 401/503, nothing processed. | Live, acknowledges only (202, `processed:false`) |
| 4 | Idempotent entitlement | Entitlement store (not provisioned; Supabase is the repo's named candidate when operational data is required) | Key = HMAC(provider, event id, sku). First write creates `active`; replays return the existing row; audit row written for both. | Pure functions + tests |
| 5 | Private versioned delivery | Object storage with signed, expiring URLs (private bucket, one object per version) | Link bound to entitlement + version, 24 h expiry, re-issuable from the portal or support. | Not provisioned |
| 6 | Delivery email | Transactional provider | Template: order id, version, licence code, download link, recovery guide link. Delivery status logged; failure → replay queue + support alert. | Not provisioned |
| 7 | Recovery paths | Runbook + tests | See table below. | Documented |
| 8 | Admin reconciliation and audit | Provider report → entitlements → deliveries → refunds | Daily reconciliation; mismatch opens a ticket. Every state change: actor, action, order id, idempotency key, timestamp. | `auditEntry()` only |
| 9 | Customer licence portal | Magic-link access keyed on order email | Shows entitlements, versions, download re-issue, licence state, refund status. | Not built |

## State machines

Order: `created → pending_payment | paid | declined`; `paid → refunded | disputed`; `disputed → paid | refunded`; `declined → paid | pending_payment` (late success). Unknown or repeated events are ignored, never thrown.

Entitlement derived from order state: `paid → active`, `disputed → suspended`, `refunded → revoked`, otherwise none. Implemented in `src/lib/commerce/entitlements.ts` with tests.

## Recovery paths

| Case | Detection | Action | Customer sees |
| --- | --- | --- | --- |
| Payment failed | provider event `payment.declined` | order `declined`; no entitlement; no email | Provider's decline screen; our page explains retry |
| Duplicate event | same idempotency key | no-op; audit row `replayed` | nothing |
| Delayed payment (bank transfer, 3DS) | `payment.pending` | order `pending_payment`; email "we will deliver when funds clear" | pending notice |
| Declined after pending | `payment.declined` | order `declined`; email with retry link | decline notice |
| Replay / out-of-order | timestamp tolerance + idempotency key | reject stale; apply only transitions the machine allows | nothing |
| Delivery email bounced | provider webhook / status | replay to corrected address via support; portal link always available | support reply |
| Lost download | customer request | re-issue signed link from entitlement | new link |
| Refund | `refund.succeeded` | order `refunded`; entitlement `revoked`; email confirms; downloads disabled | refund notice |
| Dispute | `dispute.opened` | entitlement `suspended`; evidence packet assembled from audit trail | suspension notice |
| Revocation in error | admin action | reversal with reason; audit row; email | restored access |
| Support escalation | email to hello@frankx.ai | two-business-day target; audit trail is the source of truth | reply |

## Fail-closed rule

`resolveCheckoutState()` returns `checkout` only when **all** of: ten required gates `satisfied` with `evidence.reference` and a past `evidence.verifiedOn`; product `status === "live"`; `price.basis === "verified"`; a valid https payment URL. Any other state returns the availability list with the open gates, and the UI explains them. The product JSON-LD attaches an `Offer` only in the `checkout` state. The same record renders the public readiness board, so the page cannot disagree with the resolver.

## Activation sequence

1. Merchant-of-record account, trading entity, VAT and consumer terms (gates `merchant`, `terms`).
2. Package and sign the 1.0.0 deliverable; confirm rights (gate `rights`).
3. Provision private storage, transactional email, entitlement store; deploy webhook secret (gates `webhook`, `entitlement`, `delivery`).
4. Run the recovery test matrix end to end in test mode (gate `recovery`).
5. Confirm support flow and publish the recovery guide (gate `support`).
6. Reconciliation report and portal (gates `reconciliation`, `portal`).
7. Flip `status` to `live`, set `price.basis` to `verified` with a date, set `SHOP_CHECKOUT_URL_ST_WE_S2B_001`. Each gate change is a reviewed commit with evidence.

No step is skipped by configuration alone; a missing gate keeps checkout closed even if the payment URL is present.
