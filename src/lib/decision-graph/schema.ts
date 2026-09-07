/**
 * DecisionGraph.v1 — the typed substrate behind every Starlight Technology recommendation.
 *
 * The rule this file exists to enforce: a buyer can always tell WHERE a statement came from.
 * Nothing reaches a build sheet except through `Claim<T>`, which forces an evidence kind, a
 * source, an observation date and a region. There is no untyped escape hatch.
 */

export const DECISION_GRAPH_VERSION = "DecisionGraph.v1";

/** How a statement is known. `inference` is ours and is always labelled as ours. */
export type EvidenceKind = "spec" | "benchmark" | "hands-on" | "inference";

export type Region = "EU-NL" | "EU" | "US" | "GLOBAL";

export type Visibility = "public" | "member" | "internal";

export type Claim<T> = {
  value: T;
  evidenceKind: EvidenceKind;
  /** EvidenceSource id. Required even for inference — the inference cites what it reasoned over. */
  source: string;
  observedAt: string;
  region: Region;
  note?: string;
};

export const NODE_KINDS = [
  "Workload",
  "Model",
  "Device",
  "Component",
  "Peripheral",
  "Constraint",
  "Budget",
  "Region",
  "PriceObservation",
  "Benchmark",
  "EvidenceSource",
  "Compatibility",
  "CompleteSystem",
  "Recommendation",
  "WrongPurchaseCondition",
  "AffiliateRelationship",
  "ReviewDate",
] as const;

export type NodeKind = (typeof NODE_KINDS)[number];

/** Every node and every edge carries these five. No exceptions, enforced by `validateGraph`. */
export type Governed = {
  owner: string;
  provenance: string;
  version: string;
  visibility: Visibility;
  /** The rule under which this node is judged still true. Human-readable, machine-reviewed. */
  evaluationRule: string;
};

export type NodeBase = Governed & {
  id: string;
  kind: NodeKind;
  label: string;
  /** ReviewDate node id. Absent means the node never expires, which is almost never right. */
  reviewDateId?: string;
};

export type PortabilityClass = "desk-only" | "transportable" | "carry-daily";
export type NoiseClass = "silent" | "quiet" | "audible" | "loud";

export type WorkloadDemands = {
  vramGb: number;
  systemRamGb: number;
  cpuThreads: number;
  fastStorageTb: number;
  portability: PortabilityClass;
  maxNoise: NoiseClass;
};

export type WorkloadNode = NodeBase & {
  kind: "Workload";
  /** What the job actually needs to be done at all, not what would be pleasant. */
  demands: Claim<WorkloadDemands>;
  /** Model ids this workload runs locally, if any. */
  requiresModels: string[];
};

export type ModelNode = NodeBase & {
  kind: "Model";
  parametersB: number;
  quantization: string;
  vramRequiredGb: Claim<number>;
};

export type ComponentClass =
  | "gpu"
  | "cpu"
  | "memory"
  | "storage"
  | "motherboard"
  | "psu"
  | "case"
  | "cooling";

export type ComponentNode = NodeBase & {
  kind: "Component";
  componentClass: ComponentClass;
  vendor: string;
  /** Spec fields that, when they change, invalidate every recommendation built on them. */
  specs: Record<string, Claim<string | number>>;
  priceObservationIds: string[];
  benchmarkIds: string[];
};

export type DeviceNode = NodeBase & {
  kind: "Device";
  vendor: string;
  formFactor: "desktop" | "mini" | "laptop" | "tablet";
  specs: Record<string, Claim<string | number>>;
  /** Components soldered or fixed into the device — not user-replaceable. */
  fixedComponentIds: string[];
  priceObservationIds: string[];
  benchmarkIds: string[];
  portability: Claim<PortabilityClass>;
  noise: Claim<NoiseClass>;
};

export type PeripheralClass =
  | "microphone"
  | "audio-interface"
  | "headphones"
  | "display"
  | "control"
  /** A studio is hardware plus the tools run on it; both belong in the total cost. */
  | "software";

export type PeripheralNode = NodeBase & {
  kind: "Peripheral";
  peripheralClass: PeripheralClass;
  vendor: string;
  specs: Record<string, Claim<string | number>>;
  priceObservationIds: string[];
};

export type ConstraintNode = NodeBase & {
  kind: "Constraint";
  /** A buyer non-negotiable. Violating one disqualifies a system outright, it does not cost points. */
  test:
    | { type: "max-noise"; value: NoiseClass }
    | { type: "portability"; value: PortabilityClass }
    | { type: "max-total-watts"; value: number }
    | { type: "platform"; value: "apple" | "windows" | "linux" | "any" }
    | { type: "must-run-model"; modelId: string };
};

export type BudgetNode = NodeBase & {
  kind: "Budget";
  currency: "EUR" | "USD";
  /** Minor units (cents). Integers only — no float money anywhere in this graph. */
  ceilingMinor: number;
};

export type RegionNode = NodeBase & {
  kind: "Region";
  code: Region;
  vatIncluded: boolean;
};

export type PriceBasis = "cited-msrp" | "street-observed" | "unverified";

export type PriceObservationNode = NodeBase & {
  kind: "PriceObservation";
  subjectId: string;
  basis: PriceBasis;
  currency: "EUR" | "USD";
  /** null when basis is "unverified". A guessed number is worse than no number. */
  amountMinor: number | null;
  observedAt: string;
  region: Region;
  sourceId: string;
};

export type BenchmarkNode = NodeBase & {
  kind: "Benchmark";
  subjectId: string;
  metric: string;
  result: Claim<number>;
  unit: string;
};

export type EvidenceSourceNode = NodeBase & {
  kind: "EvidenceSource";
  publisher: string;
  title: string;
  url: string;
  retrievedAt: string;
  /** first-party = the vendor's own spec page. third-party = independent. editorial = ours. */
  standing: "first-party" | "third-party" | "editorial";
};

export type CompatibilityNode = NodeBase & {
  kind: "Compatibility";
  aId: string;
  bId: string;
  verdict: Claim<"compatible" | "incompatible" | "requires-adapter" | "unverified">;
  reason: string;
};

export type SystemLine = {
  nodeId: string;
  role: string;
  quantity: number;
  /** Why this part and not the cheaper one. Empty string is a validation failure. */
  justification: string;
};

export type CompleteSystemNode = NodeBase & {
  kind: "CompleteSystem";
  tier: "minimum-viable" | "recommended" | "uncompromised";
  lines: SystemLine[];
  bottleneck: Claim<string>;
  upgradePath: Claim<string[]>;
  tradeoffs: Claim<{ power: string; noise: string; mobility: string }>;
};

export type RecommendationNode = NodeBase & {
  kind: "Recommendation";
  systemId: string;
  inputsHash: string;
  /** Snapshot of every spec + price hash this recommendation depended on, for staleness checks. */
  dependencyHashes: Record<string, string>;
  generatedAt: string;
  wrongPurchaseConditionIds: string[];
  rationale: string;
};

export type WrongPurchaseConditionNode = NodeBase & {
  kind: "WrongPurchaseCondition";
  appliesTo: string;
  /** Stated as the buyer's situation, not as a caveat about the product. */
  condition: string;
  instead: string;
};

export type AffiliateRelationshipNode = NodeBase & {
  kind: "AffiliateRelationship";
  subjectId: string;
  hasRelationship: boolean;
  /** Route on go.agenticincome.ai. null means we link the merchant directly, unpaid. */
  routerSlug: string | null;
  disclosure: string;
};

export type ReviewDateNode = NodeBase & {
  kind: "ReviewDate";
  appliesTo: string;
  reviewBy: string;
  cadenceDays: number;
};

export type GraphNode =
  | WorkloadNode
  | ModelNode
  | DeviceNode
  | ComponentNode
  | PeripheralNode
  | ConstraintNode
  | BudgetNode
  | RegionNode
  | PriceObservationNode
  | BenchmarkNode
  | EvidenceSourceNode
  | CompatibilityNode
  | CompleteSystemNode
  | RecommendationNode
  | WrongPurchaseConditionNode
  | AffiliateRelationshipNode
  | ReviewDateNode;

export type EdgeRelation =
  | "requires"
  | "satisfies"
  | "contains"
  | "priced-by"
  | "benchmarked-by"
  | "sourced-from"
  | "compatible-with"
  | "disqualified-by"
  | "reviewed-on"
  | "monetised-by";

export type GraphEdge = Governed & {
  id: string;
  from: string;
  to: string;
  relation: EdgeRelation;
};

export type DecisionGraph = {
  schema: typeof DECISION_GRAPH_VERSION;
  generatedAt: string;
  nodes: GraphNode[];
  edges: GraphEdge[];
};

export function isPriced(node: PriceObservationNode): node is PriceObservationNode & { amountMinor: number } {
  return node.basis !== "unverified" && node.amountMinor !== null;
}
