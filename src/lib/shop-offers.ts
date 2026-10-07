import approvedOfferRecords from "../../data/commerce/approved-offers.json";
import type { ShopProduct } from "./shop";

export interface ApprovedAffiliateOffer {
  productSlug: string;
  merchant: string;
  programme: string;
  envKey: string;
  approvedAt: string;
  verifiedAt: string;
  validUntil: string;
  allowedHosts: string[];
  region: string;
}

export interface ShopOffer {
  href: string;
  merchant: string;
  relationship: "affiliate" | "official";
  region: string;
  verifiedAt: string;
}

export function resolveShopOffer(
  product: ShopProduct,
  approvals: ApprovedAffiliateOffer[] = approvedOfferRecords,
  env: Record<string, string | undefined> = process.env,
  now: Date = new Date()
): ShopOffer {
  const fallback: ShopOffer = { href: product.sourceUrl, merchant: product.brand, relationship: "official", region: product.region, verifiedAt: product.verifiedOn };
  const approval = approvals.find((offer) => offer.productSlug === product.slug);
  if (!approval || approval.envKey !== product.affiliateEnvKey || !approval.merchant || !approval.programme || !approval.region) return fallback;
  const timestamps = [approval.approvedAt, approval.verifiedAt, approval.validUntil].map(Date.parse);
  if (timestamps.some((time) => !Number.isFinite(time)) || timestamps[0] > now.getTime() || timestamps[1] > now.getTime() || timestamps[2] <= now.getTime()) return fallback;
  const href = env[approval.envKey];
  if (!href || href !== href.trim()) return fallback;
  try {
    const url = new URL(href);
    // Exact hosts only. Never invent attribution, wrap a redirect, or silently
    // permit a similarly named host. Partner-issued URL bytes stay unchanged.
    if (url.protocol !== "https:" || url.username || url.password || url.port || !approval.allowedHosts.includes(url.hostname)) return fallback;
    return { href, merchant: approval.merchant, relationship: "affiliate", region: approval.region, verifiedAt: approval.verifiedAt };
  } catch { return fallback; }
}

