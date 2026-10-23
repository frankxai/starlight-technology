// Typed, CMS-ready catalog schema for the Starlight Technology shop.
// Every record is plain data. Nothing here fetches, prices or sells on its own.

export type CollectionSlug =
  | "agent-workflow-kits"
  | "mcp-and-agent-skills"
  | "research-and-decision-intelligence"
  | "creative-production"
  | "local-ai-hardware";

export type ProductKind = "workflow-edition" | "skill-pack" | "research-system" | "production-kit";

/** Commercial state of a native product. Only "live" may ever render a paid checkout, and only after every fulfilment gate passes. */
export type ProductStatus = "release-candidate" | "live" | "retired";

export interface PriceLabel {
  amount: number;
  currency: "EUR";
  /** Proposed prices are shown with an explicit "proposed / test pricing" label until commercial verification completes. */
  basis: "proposed" | "verified";
  verifiedOn?: string;
  note: string;
}

export interface Licence {
  name: string;
  seats: string;
  grants: string[];
  restrictions: string[];
  /** Short identifier used on cards and in exported artifacts. */
  code: string;
}

export interface SupportScope {
  channel: string;
  responseTarget: string;
  covers: string[];
  excludes: string[];
}

export interface ChangelogEntry {
  version: string;
  date: string;
  summary: string;
  changes: string[];
}

export interface Deliverable {
  path: string;
  kind: "workflow" | "example" | "template" | "checklist" | "diagnostics" | "schema" | "licence" | "policy" | "guide";
  description: string;
}

export interface Prerequisite {
  label: string;
  detail: string;
  required: boolean;
}

export interface TransformationStep {
  label: string;
  before: string;
  after: string;
}

export interface Faq {
  question: string;
  answer: string;
}

export interface MediaPreview {
  /** A file tree rendered from the actual deliverable manifest. */
  fileTree: string[];
  /** A terminal transcript. Must describe the shipped CLI honestly. */
  terminal: { command: string; output: string[] }[];
  /** Workflow stages drawn as an SVG pipeline. */
  workflow: { id: string; label: string; detail: string }[];
  transformation: TransformationStep[];
}

export interface DigitalProduct {
  slug: string;
  kind: ProductKind;
  status: ProductStatus;
  collection: CollectionSlug[];
  name: string;
  edition: string;
  version: string;
  tagline: string;
  outcome: string;
  summary: string;
  customerJob: string;
  format: string;
  runtime: string;
  delivery: string;
  updateCadence: string;
  price: PriceLabel;
  licence: Licence;
  support: SupportScope;
  includes: Deliverable[];
  forWhom: string[];
  notForWhom: string[];
  prerequisites: Prerequisite[];
  limitations: string[];
  refund: string[];
  recovery: string[];
  changelog: ChangelogEntry[];
  media: MediaPreview;
  faq: Faq[];
  freeEntry: string;
  /** Environment variable that may carry a verified payment URL once every gate passes. */
  checkoutEnvKey: string;
  sku: string;
}

export interface FreeProduct {
  slug: string;
  collection: CollectionSlug[];
  name: string;
  tagline: string;
  outcome: string;
  summary: string;
  version: string;
  format: string;
  runtime: string;
  licence: Licence;
  produces: string[];
  limitations: string[];
  pairedProduct: string;
  changelog: ChangelogEntry[];
}

export type RecommendationRelationship = "independent" | "affiliate";

export interface Recommendation {
  id: string;
  collection: CollectionSlug[];
  name: string;
  vendor: string;
  category: "runtime" | "editor" | "orchestration" | "storage" | "audio" | "capture" | "model-host";
  useCase: string;
  why: string;
  verifyBefore: string[];
  href: string;
  relationship: RecommendationRelationship;
  verifiedOn: string;
}

export interface PlannedEdition {
  name: string;
  kind: ProductKind;
  outcome: string;
  /** Planned editions are never priced, never sold, and never shown with a date commitment. */
  state: "in-development" | "scoping";
}

export interface Collection {
  slug: CollectionSlug;
  name: string;
  eyebrow: string;
  outcome: string;
  summary: string;
  builds: string[];
  productSlugs: string[];
  freeSlugs: string[];
  recommendationIds: string[];
  planned: PlannedEdition[];
  /** Which hardware records from src/lib/shop.ts belong to the collection, if any. */
  hardwareSlugs?: string[];
  faq: Faq[];
}
