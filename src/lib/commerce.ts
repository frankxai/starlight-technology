import type { ProductSku } from "./products";

export const releaseChecks = [
  "installed-workflow",
  "delivery-recovery",
  "license-rights",
  "independent-review",
  "buyer-acceptance"
] as const;
export type ReleaseCheck = (typeof releaseChecks)[number];

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

// Trusted operator records only. Populate after inspecting the referenced
// proof, exact artifact, provider product/price and buyer acceptance. Never
// build an approval from request data or a public environment variable.
// Shape and freshness checks do not authenticate a review or a buyer.
const releaseApprovals: Readonly<Record<string, ReleaseApproval>> = Object.freeze({});

export function getReleaseApproval(id: string): ReleaseApproval | undefined {
  return releaseApprovals[id];
}

export type PurchaseState =
  | { status: "free"; href: string; reasons: [] }
  | { status: "unreleased"; reasons: string[] }
  | { status: "available"; href: string; amountCents: number; currency: "EUR"; reasons: [] };

const approvalKeys = [
  "schemaVersion",
  "skuId",
  "edition",
  "artifactSha256",
  "amountCents",
  "currency",
  "checkoutUrl",
  "reviewedAtMs",
  "expiresAtMs",
  "evidence"
] as const;

const maxApprovalWindowMs = 7 * 86_400_000;

export function isPolarCheckoutUrl(value: unknown): value is string {
  if (typeof value !== "string" || value.length > 2083 || value !== value.trim()) return false;
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" || url.username || url.password || url.port || url.hash) return false;
    return (
      (url.hostname === "polar.sh" && /^\/checkout\/polar_c_[A-Za-z0-9_-]+$/.test(url.pathname)) ||
      (url.hostname === "buy.polar.sh" && /^\/polar_cl_[A-Za-z0-9_-]+$/.test(url.pathname)) ||
      (url.hostname === "api.polar.sh" && /^\/v1\/checkout-links\/polar_cl_[A-Za-z0-9_-]+\/redirect$/.test(url.pathname))
    );
  } catch {
    return false;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function isSafeTime(value: unknown): value is number {
  return typeof value === "number" && Number.isSafeInteger(value) && value >= 0;
}

function isHttpsReference(value: unknown): value is string {
  if (typeof value !== "string" || value.length === 0 || value.length > 2083) return false;
  try {
    const url = new URL(value);
    return url.protocol === "https:" && !url.username && !url.password && !url.port;
  } catch {
    return false;
  }
}

export function decidePurchase(
  product: ProductSku,
  checkoutUrl: unknown,
  approval: unknown,
  nowMs = Date.now()
): PurchaseState {
  if (product.billing === "free") return { status: "free", href: product.productPath, reasons: [] };

  const reasons: string[] = [];
  if (product.kind !== "digital" || product.billing !== "once") {
    reasons.push("This offer is outside the current self-service digital release path.");
  }
  if (
    !product.edition ||
    !product.artifactSha256 ||
    !/^[a-f0-9]{64}$/.test(product.artifactSha256) ||
    !Number.isSafeInteger(product.amountCents) ||
    (product.amountCents ?? 0) <= 0 ||
    product.currency !== "EUR"
  ) {
    reasons.push("The released artifact and confirmed price are missing.");
  }
  if (!isSafeTime(nowMs)) reasons.push("Release freshness could not be checked.");

  if (!isRecord(approval)) {
    reasons.push("Release acceptance is not recorded.");
  } else {
    const record = approval;
    const keysMatch =
      Object.keys(record).length === approvalKeys.length &&
      Object.keys(record).every((key) => approvalKeys.includes(key as (typeof approvalKeys)[number]));
    if (!keysMatch || record.schemaVersion !== 1) reasons.push("The release record has an unsupported format.");

    if (
      record.skuId !== product.id ||
      record.edition !== product.edition ||
      record.artifactSha256 !== product.artifactSha256 ||
      record.amountCents !== product.amountCents ||
      record.currency !== product.currency
    ) {
      reasons.push("Release acceptance does not match this product and price.");
    }

    const reviewedAt = record.reviewedAtMs;
    const expiresAt = record.expiresAtMs;
    if (
      !isSafeTime(reviewedAt) ||
      !isSafeTime(expiresAt) ||
      reviewedAt > nowMs ||
      expiresAt <= nowMs ||
      expiresAt <= reviewedAt ||
      expiresAt - reviewedAt > maxApprovalWindowMs
    ) {
      reasons.push("Release acceptance is missing, expired or outside its review window.");
    }

    if (!Array.isArray(record.evidence) || record.evidence.length !== releaseChecks.length) {
      reasons.push("Required acceptance evidence is missing.");
    } else {
      const seen = new Set<string>();
      for (const value of record.evidence) {
        if (!isRecord(value)) {
          reasons.push("Acceptance evidence is malformed.");
          continue;
        }
        const check = value.check;
        const reference = value.reference;
        if (
          Object.keys(value).length !== 2 ||
          typeof check !== "string" ||
          !releaseChecks.includes(check as ReleaseCheck) ||
          seen.has(check) ||
          !isHttpsReference(reference)
        ) {
          reasons.push("Acceptance evidence is incomplete, duplicated or not HTTPS.");
        } else {
          seen.add(check);
        }
      }
      if (seen.size !== releaseChecks.length) reasons.push("Required acceptance evidence is missing.");
    }

    if (record.checkoutUrl !== checkoutUrl) reasons.push("The checkout link differs from its verified release record.");
  }

  if (!isPolarCheckoutUrl(checkoutUrl)) reasons.push("A verified Polar checkout link is unavailable.");
  if (reasons.length) return { status: "unreleased", reasons: [...new Set(reasons)] };

  return {
    status: "available",
    href: checkoutUrl as string,
    amountCents: product.amountCents as number,
    currency: "EUR",
    reasons: []
  };
}
