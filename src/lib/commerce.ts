import type { ProductSku } from "./products";

export const releaseChecks = ["installed-workflow", "delivery-recovery", "license-rights", "independent-review", "buyer-acceptance"] as const;
export type ReleaseCheck = typeof releaseChecks[number];
export interface ReleaseApproval {
  schemaVersion: 1;
  skuId: string;
  edition: string;
  artifactSha256: string;
  amountCents: number;
  currency: "EUR";
  checkoutUrl: string;
  reviewedAtMs: number;
  expiresAtMs: number;
  evidence: { check: ReleaseCheck; reference: string }[];
}

// Trusted operator records only. Populate after inspecting the referenced proof,
// exact artifact, provider product/price and acceptance, never from request data.
// Shape/freshness checks do not independently authenticate a review or a buyer.
const releaseApprovals: Readonly<Record<string, ReleaseApproval>> = Object.freeze({});
export function getReleaseApproval(id: string) { return releaseApprovals[id]; }

export type PurchaseState =
  | { status: "free"; href: string; reasons: [] }
  | { status: "unreleased"; reasons: string[] }
  | { status: "available"; href: string; amountCents: number; currency: "EUR"; reasons: [] };

export function isPolarCheckoutUrl(value: unknown): value is string {
  if (typeof value !== "string" || value.length > 2083 || value !== value.trim()) return false;
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" || url.username || url.password || url.port || url.hash) return false;
    return (url.hostname === "polar.sh" && /^\/checkout\/polar_c_[A-Za-z0-9_-]+$/.test(url.pathname))
      || (url.hostname === "buy.polar.sh" && /^\/polar_cl_[A-Za-z0-9_-]+$/.test(url.pathname))
      || (url.hostname === "api.polar.sh" && /^\/v1\/checkout-links\/polar_cl_[A-Za-z0-9_-]+\/redirect$/.test(url.pathname));
  } catch { return false; }
}

export function decidePurchase(product: ProductSku, checkoutUrl: unknown, approval: unknown, nowMs = Date.now()): PurchaseState {
  if (product.billing === "free") return { status: "free", href: product.productPath, reasons: [] };
  const reasons: string[] = [];
  if (product.kind !== "digital" || product.billing !== "once") reasons.push("This offer is outside the current self-service digital release path.");
  if (!product.edition || !product.artifactSha256 || !/^[a-f0-9]{64}$/.test(product.artifactSha256)
    || !Number.isSafeInteger(product.amountCents) || (product.amountCents ?? 0) <= 0 || product.currency !== "EUR") reasons.push("The released artifact and confirmed price are missing.");
  if (!Number.isSafeInteger(nowMs) || nowMs < 0) reasons.push("Release freshness could not be checked.");
  if (!approval || typeof approval !== "object" || Array.isArray(approval)) reasons.push("Release acceptance is not recorded.");
  else {
    const record = approval as Record<string, unknown>;
    const keys = ["schemaVersion", "skuId", "edition", "artifactSha256", "amountCents", "currency", "checkoutUrl", "reviewedAtMs", "expiresAtMs", "evidence"];
    if (Object.keys(record).length !== keys.length || !Object.keys(record).every(key => keys.includes(key)) || record.schemaVersion !== 1) reasons.push("The release record has an unsupported format.");
    if (record.skuId !== product.id || record.edition !== product.edition || record.artifactSha256 !== product.artifactSha256
      || record.amountCents !== product.amountCents || record.currency !== product.currency) reasons.push("Release acceptance does not match this product and price.");
    if (!Number.isSafeInteger(record.reviewedAtMs) || !Number.isSafeInteger(record.expiresAtMs)
      || (record.reviewedAtMs as number) < 0 || (record.reviewedAtMs as number) > nowMs
      || (record.expiresAtMs as number) <= nowMs || (record.expiresAtMs as number) <= (record.reviewedAtMs as number)
      || (record.expiresAtMs as number) - (record.reviewedAtMs as number) > 7 * 86400000) reasons.push("Release acceptance is missing, expired or outside its review window.");
    if (!Array.isArray(record.evidence) || record.evidence.length !== releaseChecks.length) reasons.push("Required acceptance evidence is missing.");
    else {
      const seen = new Set<string>();
      for (const value of record.evidence) {
        if (!value || typeof value !== "object" || Array.isArray(value)) { reasons.push("Acceptance evidence is malformed."); continue; }
        const item = value as Record<string, unknown>;
        const reference = item.reference;
        if (Object.keys(item).length !== 2 || typeof item.check !== "string" || !releaseChecks.includes(item.check as ReleaseCheck)
          || seen.has(item.check) || typeof reference !== "string" || reference.length > 2083) reasons.push("Acceptance evidence is incomplete or duplicated.");
        else {
          try { const url = new URL(reference); if (url.protocol !== "https:" || url.username || url.password || url.port) reasons.push("Acceptance references must use HTTPS without credentials."); }
          catch { reasons.push("Acceptance reference is invalid."); }
          seen.add(item.check);
        }
      }
      if (seen.size !== releaseChecks.length) reasons.push("Required acceptance evidence is missing.");
    }
    if (record.checkoutUrl !== checkoutUrl) reasons.push("The checkout link differs from its verified release record.");
  }
  if (!isPolarCheckoutUrl(checkoutUrl)) reasons.push("A verified Polar checkout link is unavailable.");
  if (reasons.length) return { status: "unreleased", reasons: [...new Set(reasons)] };
  return { status: "available", href: checkoutUrl as string, amountCents: product.amountCents as number, currency: "EUR", reasons: [] };
}
