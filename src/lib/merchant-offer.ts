/** Normalized licensed-feed boundary. No offer is published by this module. */
export interface MerchantOffer {
  id: string;
  merchantId: string;
  productVariantId: string;
  region: string;
  currency: string;
  amountMinor: number;
  taxBasis: "included" | "excluded" | "unknown";
  shippingBasis: "included" | "excluded" | "unknown";
  sourceUrl: string;
  destinationUrl: string;
  observedAt: string;
  expiresAt: string;
  rights: "approved-publication" | "research-only" | "withdrawn";
  reviewed: boolean;
}

export function isMerchantOffer(value: unknown): value is MerchantOffer {
  if (!value || typeof value !== "object") return false;
  const offer = value as Record<string, unknown>;
  const url = (key: string) => { try { return new URL(String(offer[key])).protocol === "https:"; } catch { return false; } };
  return ["id", "merchantId", "productVariantId"].every((key) => typeof offer[key] === "string" && Boolean((offer[key] as string).trim()))
    && typeof offer.region === "string" && /^[A-Z]{2}$/.test(offer.region)
    && typeof offer.currency === "string" && /^[A-Z]{3}$/.test(offer.currency)
    && typeof offer.amountMinor === "number" && Number.isSafeInteger(offer.amountMinor) && offer.amountMinor >= 0
    && ["included", "excluded", "unknown"].includes(String(offer.taxBasis))
    && ["included", "excluded", "unknown"].includes(String(offer.shippingBasis))
    && url("sourceUrl") && url("destinationUrl")
    && typeof offer.observedAt === "string" && Number.isFinite(Date.parse(offer.observedAt))
    && typeof offer.expiresAt === "string" && Number.isFinite(Date.parse(offer.expiresAt))
    && ["approved-publication", "research-only", "withdrawn"].includes(String(offer.rights))
    && typeof offer.reviewed === "boolean";
}

export function offerPublicationStatus(value: unknown, now = new Date()): { publish: false; reason: string } | { publish: true; offer: MerchantOffer } {
  if (!isMerchantOffer(value)) return { publish: false, reason: "invalid-record" };
  if (value.rights !== "approved-publication") return { publish: false, reason: "rights-not-approved" };
  if (!value.reviewed) return { publish: false, reason: "editorial-review-pending" };
  const observed = Date.parse(value.observedAt), expires = Date.parse(value.expiresAt);
  if (observed > now.getTime() || expires <= observed || expires <= now.getTime()) return { publish: false, reason: "stale-or-invalid-time" };
  if (value.taxBasis === "unknown" || value.shippingBasis === "unknown") return { publish: false, reason: "incomplete-total-cost" };
  return { publish: true, offer: value };
}
