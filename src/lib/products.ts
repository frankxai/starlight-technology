export type ProductKind = "saas" | "digital" | "service";
export type Billing = "free" | "month" | "once";

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
  edition?: string;
  artifactSha256?: string;
  amountCents?: number;
  currency?: "EUR";
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
      "Purchase policy templates",
      "Quarterly stack review call"
    ],
    cta: "Subscribe Ops",
    checkoutEnvKey: "NEXT_PUBLIC_POLAR_TECH_OPS_URL",
    productPath: "/app"
  }
];

export const digitalProducts: ProductSku[] = [
  {
    id: "creator-blueprint",
    name: "Creator System Blueprint",
    kind: "digital",
    billing: "once",
    priceLabel: "€190",
    summary: "Human-reviewed complete-system blueprint for one studio objective.",
    includes: ["Workload map", "Budget allocation", "Wrong-purchase conditions", "Next purchase order"],
    cta: "Buy blueprint",
    checkoutEnvKey: "NEXT_PUBLIC_POLAR_BLUEPRINT_URL",
    productPath: "/blueprint"
  },
  {
    id: "stack-audit",
    name: "Studio stack audit",
    kind: "digital",
    billing: "once",
    priceLabel: "€890",
    summary: "Remote audit of an existing creator/AI stack with upgrade sequence.",
    includes: ["Bottleneck analysis", "Evidence gap report", "Upgrade sequence", "Regional offer notes"],
    cta: "Buy audit",
    checkoutEnvKey: "NEXT_PUBLIC_POLAR_STACK_AUDIT_URL",
    productPath: "/offers"
  }
];

export const serviceProducts: ProductSku[] = [
  {
    id: "infrastructure-blueprint",
    name: "Infrastructure Partnership Blueprint",
    kind: "service",
    billing: "once",
    priceLabel: "€6,500 ex VAT",
    summary: "Fixed-scope underwriting and operating architecture for a joint AI infrastructure partnership.",
    includes: [
      "Party, asset, workload and IT graph",
      "Three viable deal structures",
      "Contract and specialist issue matrix",
      "Sources-and-uses and downside model",
      "Procurement and integration sequence",
      "90-day pilot mandate and acceptance gates"
    ],
    cta: "Commission blueprint",
    checkoutEnvKey: "NEXT_PUBLIC_POLAR_INFRASTRUCTURE_BLUEPRINT_URL",
    productPath: "/infrastructure"
  }
];

// Earlier SKU IDs remain resolvable for existing receipt/support links.
// Their presence is not approval to accept new orders or promise fulfillment.
export const candidateProducts: ProductSku[] = [{
  id: "creator-studio-kit",
  name: "AI Creator Studio kit",
  kind: "digital",
  billing: "once",
  priceLabel: "Price not announced",
  summary: "A self-service kit in development for planning complete systems and repeatable agent workflows with your own tools.",
  includes: ["Editable system and capacity plans", "Portable workflow skills and evidence records", "Installation, export and recovery guidance"],
  cta: "Prepare a release request",
  productPath: "/studio",
  edition: "development"
}];

export const allProducts = [...saasTiers, ...digitalProducts, ...serviceProducts, ...candidateProducts];
export function getProduct(id: string) { return allProducts.find((p) => p.id === id); }
export function checkoutHref(sku: ProductSku): string {
  if (sku.billing === "free") return sku.productPath;
  // Every paid CTA passes through the server's release/checkout decision.
  // A configured public payment URL is not fulfillment or release evidence.
  return `/checkout/${sku.id}`;
}
