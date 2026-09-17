export type ProductKind = "saas" | "digital";
/** `waitlist` is a product with no checkout: it is UNGATED under PRODUCT-RELEASE-GATE. */
export type Billing = "free" | "month" | "once" | "waitlist";

export interface ProductSku {
  id: string;
  name: string;
  kind: ProductKind;
  billing: Billing;
  priceLabel: string;
  summary: string;
  includes: string[];
  cta: string;
  featured?: boolean;
  checkoutEnvKey?: string;
  productPath: string;
}

export const saasTiers: ProductSku[] = [
  {
    id: "tech-free",
    name: "Library",
    kind: "saas",
    billing: "free",
    priceLabel: "€0",
    summary: "Open builds, comparisons, and guides with explicit evidence states.",
    includes: ["Public build library", "Comparison verdicts", "Methodology standard", "No account wall"],
    cta: "Browse free library",
    productPath: "/builds"
  },
  {
    id: "tech-studio",
    name: "Studio Member",
    kind: "saas",
    billing: "month",
    priceLabel: "€29",
    summary: "Membership for creators who buy hardware and systems quarterly.",
    includes: [
      "Full decision models + worksheets",
      "Regional offer intelligence (NL/EU start)",
      "Blueprint generator history",
      "New analyses monthly",
      "Member-only stack alerts"
    ],
    cta: "Subscribe Studio",
    featured: true,
    checkoutEnvKey: "NEXT_PUBLIC_POLAR_TECH_STUDIO_URL",
    productPath: "/app"
  },
  {
    id: "tech-ops",
    name: "Studio Ops",
    kind: "saas",
    billing: "month",
    priceLabel: "€99",
    summary: "For small teams standardizing creator / AI workstation purchases.",
    includes: [
      "Everything in Studio Member",
      "Up to 5 seats",
      "Shared shortlist workspace",
      "Purchase policy templates"
    ],
    cta: "Subscribe Ops",
    checkoutEnvKey: "NEXT_PUBLIC_POLAR_TECH_OPS_URL",
    productPath: "/app"
  }
];

/**
 * One digital product, no services. A human-reviewed blueprint and a remote stack audit were
 * both 1:1 work; TRUTH.md rules that out, so they are gone rather than repriced. What replaces
 * them is the artefact the configurator already produces, sold as a pack — and it is UNGATED
 * under PRODUCT-RELEASE-GATE, so it captures demand and never takes money.
 */
export const digitalProducts: ProductSku[] = [
  {
    id: "starlight-technology-build-sheets",
    name: "Build sheet packs",
    kind: "digital",
    billing: "waitlist",
    priceLabel: "Waitlist",
    summary:
      "Cited, dated build sheets for a named studio objective, refreshed when the underlying prices or specs move.",
    includes: [
      "Complete system at three tiers, with the bottleneck named",
      "Every claim tagged spec, benchmark, hands-on or inference",
      "Wrong-purchase conditions and the upgrade path",
      "Reissued when a price or spec change invalidates it"
    ],
    cta: "Join the waitlist",
    productPath: "/studio"
  }
];

export const allProducts = [...saasTiers, ...digitalProducts];
export function getProduct(id: string) { return allProducts.find((p) => p.id === id); }
export function checkoutHref(sku: ProductSku): string {
  if (sku.billing === "free" || sku.billing === "waitlist") return sku.productPath;
  if (sku.checkoutEnvKey) {
    const url = process.env[sku.checkoutEnvKey];
    if (url?.startsWith("http")) return url;
  }
  return `/checkout/${sku.id}`;
}
