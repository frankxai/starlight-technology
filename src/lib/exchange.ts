export const capabilityKinds = [
  "hardware",
  "compute",
  "inference",
  "api",
  "agent",
  "data",
  "media",
  "specialist-service"
] as const;

export type CapabilityKind = (typeof capabilityKinds)[number];

export type DecisionWeights = {
  cost: number;
  quality: number;
  reliability: number;
  latency: number;
  evidence: number;
  sovereignty: number;
};

export type CapabilityIntent = {
  id: string;
  capability: CapabilityKind;
  objective: string;
  region: string;
  budgetEur: number;
  quantity?: number;
  deadlineDays?: number;
  workloadTags: string[];
  hardConstraints?: {
    allowedProviders?: string[];
    excludedProviders?: string[];
    allowedRegions?: string[];
    maxLeadTimeDays?: number;
    minQuality?: number;
    minReliability?: number;
    minSovereignty?: number;
  };
  weights?: Partial<DecisionWeights>;
};

export type CapabilityOffer = {
  id: string;
  capability: CapabilityKind;
  provider: string;
  region: string;
  totalCostEur: number;
  unit: string;
  leadTimeDays?: number;
  quality?: number;
  reliability?: number;
  latencyMs?: number;
  sovereignty?: number;
  evidenceVerifiedAt: string;
  validUntil: string;
  evidenceIds: string[];
  constraints?: string[];
};

export type RejectionReason =
  | "capability-mismatch"
  | "over-budget"
  | "provider-not-allowed"
  | "provider-excluded"
  | "region-not-allowed"
  | "lead-time"
  | "quality-floor"
  | "reliability-floor"
  | "sovereignty-floor"
  | "expired-offer";

export type OfferScore = {
  offerId: string;
  accepted: boolean;
  score: number;
  reasons: RejectionReason[];
  components: DecisionWeights;
};

export const defaultDecisionWeights: DecisionWeights = {
  cost: 0.25,
  quality: 0.25,
  reliability: 0.2,
  latency: 0.1,
  evidence: 0.1,
  sovereignty: 0.1
};

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}

function normalizeWeights(overrides?: Partial<DecisionWeights>): DecisionWeights {
  const raw = { ...defaultDecisionWeights, ...overrides };
  const total = Object.values(raw).reduce((sum, value) => sum + Math.max(0, value), 0);
  if (total === 0) return defaultDecisionWeights;
  return {
    cost: Math.max(0, raw.cost) / total,
    quality: Math.max(0, raw.quality) / total,
    reliability: Math.max(0, raw.reliability) / total,
    latency: Math.max(0, raw.latency) / total,
    evidence: Math.max(0, raw.evidence) / total,
    sovereignty: Math.max(0, raw.sovereignty) / total
  };
}

function freshnessScore(verifiedAt: string, now: Date): number {
  const timestamp = Date.parse(verifiedAt);
  if (Number.isNaN(timestamp)) return 0;
  const ageDays = Math.max(0, (now.getTime() - timestamp) / 86_400_000);
  return clamp01(1 - ageDays / 30);
}

function latencyScore(latencyMs?: number): number {
  if (latencyMs === undefined) return 0.5;
  if (latencyMs <= 250) return 1;
  if (latencyMs >= 30_000) return 0;
  return clamp01(1 - (latencyMs - 250) / 29_750);
}

function costScore(totalCostEur: number, budgetEur: number): number {
  if (budgetEur <= 0 || totalCostEur < 0) return 0;
  // Being exactly on budget remains a viable 0.5. Savings improve the score;
  // going over budget is rejected before this component is used.
  return clamp01(1.5 - totalCostEur / budgetEur);
}

export function evaluateOffer(
  intent: CapabilityIntent,
  offer: CapabilityOffer,
  now = new Date()
): OfferScore {
  const reasons: RejectionReason[] = [];
  const hard = intent.hardConstraints ?? {};

  if (offer.capability !== intent.capability) reasons.push("capability-mismatch");
  if (offer.totalCostEur > intent.budgetEur) reasons.push("over-budget");
  if (hard.allowedProviders?.length && !hard.allowedProviders.includes(offer.provider)) reasons.push("provider-not-allowed");
  if (hard.excludedProviders?.includes(offer.provider)) reasons.push("provider-excluded");
  if (hard.allowedRegions?.length && !hard.allowedRegions.includes(offer.region)) reasons.push("region-not-allowed");
  if (hard.maxLeadTimeDays !== undefined && (offer.leadTimeDays ?? Number.POSITIVE_INFINITY) > hard.maxLeadTimeDays) reasons.push("lead-time");
  if (hard.minQuality !== undefined && (offer.quality ?? 0) < hard.minQuality) reasons.push("quality-floor");
  if (hard.minReliability !== undefined && (offer.reliability ?? 0) < hard.minReliability) reasons.push("reliability-floor");
  if (hard.minSovereignty !== undefined && (offer.sovereignty ?? 0) < hard.minSovereignty) reasons.push("sovereignty-floor");
  if (Date.parse(offer.validUntil) < now.getTime()) reasons.push("expired-offer");

  const components: DecisionWeights = {
    cost: costScore(offer.totalCostEur, intent.budgetEur),
    quality: clamp01(offer.quality ?? 0.5),
    reliability: clamp01(offer.reliability ?? 0.5),
    latency: latencyScore(offer.latencyMs),
    evidence: freshnessScore(offer.evidenceVerifiedAt, now),
    sovereignty: clamp01(offer.sovereignty ?? 0.5)
  };

  if (reasons.length > 0) return { offerId: offer.id, accepted: false, score: 0, reasons, components };

  const weights = normalizeWeights(intent.weights);
  const score =
    components.cost * weights.cost +
    components.quality * weights.quality +
    components.reliability * weights.reliability +
    components.latency * weights.latency +
    components.evidence * weights.evidence +
    components.sovereignty * weights.sovereignty;

  return { offerId: offer.id, accepted: true, score: Number(score.toFixed(6)), reasons, components };
}

export function rankOffers(
  intent: CapabilityIntent,
  offers: CapabilityOffer[],
  now = new Date()
): OfferScore[] {
  return offers
    .map((offer) => evaluateOffer(intent, offer, now))
    .sort((a, b) => Number(b.accepted) - Number(a.accepted) || b.score - a.score || a.offerId.localeCompare(b.offerId));
}

export function isCapabilityIntent(value: unknown): value is CapabilityIntent {
  if (!value || typeof value !== "object") return false;
  const record = value as Record<string, unknown>;
  return (
    typeof record.id === "string" &&
    capabilityKinds.includes(record.capability as CapabilityKind) &&
    typeof record.objective === "string" &&
    typeof record.region === "string" &&
    typeof record.budgetEur === "number" &&
    Number.isFinite(record.budgetEur) &&
    record.budgetEur > 0 &&
    Array.isArray(record.workloadTags) &&
    record.workloadTags.every((tag) => typeof tag === "string")
  );
}

export function isCapabilityOffer(value: unknown): value is CapabilityOffer {
  if (!value || typeof value !== "object") return false;
  const record = value as Record<string, unknown>;
  return (
    typeof record.id === "string" &&
    capabilityKinds.includes(record.capability as CapabilityKind) &&
    typeof record.provider === "string" &&
    typeof record.region === "string" &&
    typeof record.totalCostEur === "number" &&
    Number.isFinite(record.totalCostEur) &&
    record.totalCostEur >= 0 &&
    typeof record.unit === "string" &&
    typeof record.evidenceVerifiedAt === "string" &&
    typeof record.validUntil === "string" &&
    Array.isArray(record.evidenceIds) &&
    record.evidenceIds.every((id) => typeof id === "string")
  );
}

export const exchangeManifest = {
  id: "starlight-exchange",
  version: "2026-09-14",
  status: "foundation",
  northStar: "Acquire the right capability.",
  capabilityKinds,
  transaction: [
    "intent",
    "discovery",
    "offers",
    "decision",
    "mandate",
    "execution",
    "receipt",
    "acceptance",
    "outcome"
  ],
  protocols: {
    http: "REST + JSON",
    schemas: "JSON Schema / OpenAPI",
    tools: "MCP 2026-07-28",
    agents: "A2A 1.0"
  },
  authority: {
    autonomous: ["research", "ranking", "explanation", "drafting"],
    approvalRequired: ["purchase", "contract", "financing", "production-write", "settlement"]
  }
} as const;
