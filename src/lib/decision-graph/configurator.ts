/**
 * The configurator. Pure: same inputs, same output, no clock, no network, no storage.
 *
 * It answers three questions a review blog will not: what is the least you can buy and still
 * do the job, what would we buy, and what does the ceiling cost — and for each, what breaks
 * first, what it costs to fix, and when you should not buy it at all.
 */

import { indexGraph, stableHash, dependencyHash } from "./graph";
import { decisionGraph } from "./dataset";
import {
  isPriced,
  type CompleteSystemNode,
  type ConstraintNode,
  type RecommendationNode,
  type DecisionGraph,
  type NoiseClass,
  type PortabilityClass,
  type Region,
  type SystemLine,
  type WorkloadDemands,
  type WorkloadNode,
  type WrongPurchaseConditionNode,
} from "./schema";

export type ConfiguratorInput = {
  workloadIds: string[];
  budgetId: string;
  regionCode: Region;
  /** Non-negotiables. These disqualify; they never merely cost points. */
  constraintIds: string[];
};

export type Tier = "minimum-viable" | "recommended" | "uncompromised";

export type CostRollup = {
  /** Kept per currency. Nothing in this codebase invents an exchange rate. */
  pricedTotalsMinor: Record<string, number>;
  pricedLineCount: number;
  unpricedLines: string[];
  budgetVerdict: "within" | "over" | "unknown";
  budgetNote: string;
};

export type Bottleneck = { resource: string; headroom: number; explanation: string };

export type ConfiguredLine = SystemLine & {
  label: string;
  priceMinor: number | null;
  currency: string | null;
  priceBasis: string;
  citations: string[];
};

export type ConfiguredSystem = {
  tier: Tier;
  archetypeId: string;
  label: string;
  lines: ConfiguredLine[];
  cost: CostRollup;
  bottleneck: Bottleneck;
  upgradePath: string[];
  tradeoffs: { power: string; noise: string; mobility: string };
  wrongPurchaseConditions: WrongPurchaseConditionNode[];
  /** EvidenceSource ids behind every spec this system leaned on. */
  citations: string[];
  dependencyHashes: Record<string, string>;
  /** The result materialised back into the graph, so a build sheet is a graph object too. */
  node: CompleteSystemNode;
  recommendation: RecommendationNode;
};

export type Disqualification = { archetypeId: string; label: string; reason: string };

export type ConfiguratorOutput = {
  schema: "DecisionGraph.v1";
  inputsHash: string;
  requirement: WorkloadDemands;
  systems: ConfiguredSystem[];
  disqualified: Disqualification[];
  /** Stated plainly when the graph cannot answer, instead of downgrading to a guess. */
  unmet: string[];
};

type Archetype = {
  id: string;
  label: string;
  platform: "apple" | "windows" | "linux";
  /** Model-usable memory. On unified machines this is an allocation fraction, declared as such. */
  usableVramGb: number;
  usableVramBasis: string;
  systemRamGb: number;
  cpuThreads: number;
  fastStorageTb: number;
  portability: PortabilityClass;
  noise: NoiseClass;
  peakWatts: number;
  capabilityRank: number;
  coreLines: SystemLine[];
  upgradePath: string[];
  tradeoffs: { power: string; noise: string; mobility: string };
};

const UNIFIED_ALLOCATION = 0.75;

const archetypes: Archetype[] = [
  {
    id: "arch-mac-mini",
    label: "Mac mini M4, quiet desk system",
    platform: "apple",
    usableVramGb: Math.floor(16 * UNIFIED_ALLOCATION),
    usableVramBasis: "75% of 16 GB unified memory, an allocation convention of ours, not a vendor guarantee",
    systemRamGb: 16,
    cpuThreads: 10,
    fastStorageTb: 0.25,
    portability: "transportable",
    noise: "quiet",
    peakWatts: 155,
    capabilityRank: 1,
    coreLines: [
      { nodeId: "dev-mac-mini-m4", role: "Machine", quantity: 1, justification: "Cheapest machine in the set that runs a small local model without noise or a build project." },
      { nodeId: "cmp-ssd-990pro-2tb", role: "External project storage", quantity: 1, justification: "The 256 GB base drive is under the storage floor for any real project library; external NVMe is cheaper than Apple's internal upgrade." },
    ],
    upgradePath: ["No internal upgrade exists. The upgrade path is a different machine, so buy the memory you need now."],
    tradeoffs: { power: "Around 155 W peak; the lowest energy cost in this set.", noise: "Quiet enough for a room with a microphone in it.", mobility: "Moves between desks; not a bag machine." },
  },
  {
    id: "arch-macbook-pro-14",
    label: "MacBook Pro 14in M4 Pro, carried system",
    platform: "apple",
    usableVramGb: Math.floor(24 * UNIFIED_ALLOCATION),
    usableVramBasis: "75% of 24 GB unified memory, an allocation convention of ours, not a vendor guarantee",
    systemRamGb: 24,
    cpuThreads: 12,
    fastStorageTb: 0.5,
    portability: "carry-daily",
    noise: "quiet",
    peakWatts: 96,
    capabilityRank: 2,
    coreLines: [
      { nodeId: "dev-macbook-pro-14-m4pro", role: "Machine", quantity: 1, justification: "The only line in this set that satisfies a carry-daily constraint without giving up mid-size local models." },
      { nodeId: "cmp-ssd-990pro-2tb", role: "External project storage", quantity: 1, justification: "Keeps footage and model weights off the internal drive, which cannot be enlarged later." },
    ],
    upgradePath: ["Memory and storage are soldered. Plan a three-year configuration at purchase, then upgrade by replacement."],
    tradeoffs: { power: "Around 96 W at the charger; runs on battery.", noise: "Quiet under editing load; fans are audible under sustained render.", mobility: "The strongest mobility in the set — this is the reason to buy it." },
  },
  {
    id: "arch-framework-desktop",
    label: "Framework Desktop, 128 GB unified local-AI box",
    platform: "linux",
    usableVramGb: Math.floor(128 * UNIFIED_ALLOCATION),
    usableVramBasis: "75% of 128 GB unified memory allocated to the GPU, an allocation convention of ours, not a vendor guarantee",
    systemRamGb: 128,
    cpuThreads: 32,
    fastStorageTb: 2,
    portability: "transportable",
    noise: "quiet",
    peakWatts: 250,
    capabilityRank: 4,
    coreLines: [
      { nodeId: "dev-framework-desktop-395", role: "Machine", quantity: 1, justification: "The only line in this set whose model-addressable memory is not capped by consumer GPU VRAM, which is what gates the largest local models." },
      { nodeId: "cmp-ssd-990pro-2tb", role: "System and weights storage", quantity: 1, justification: "Model weights at this size need fast local storage, and this chassis takes standard M.2." },
    ],
    upgradePath: ["Memory is soldered; storage and I/O are not. Capacity upgrades mean a new mainboard, which this chassis is designed to accept."],
    tradeoffs: { power: "Around 250 W peak; a third of a large-GPU tower.", noise: "Quiet for its capability; the trade is raw throughput per watt-hour, not silence.", mobility: "Transportable, but it lives at a desk." },
  },
  {
    id: "arch-tower-5070ti",
    label: "Tower with RTX 5070 Ti",
    platform: "windows",
    usableVramGb: 16,
    usableVramBasis: "Dedicated GDDR7 on the card, from NVIDIA's specification page",
    systemRamGb: 64,
    cpuThreads: 32,
    fastStorageTb: 2,
    portability: "desk-only",
    noise: "audible",
    peakWatts: 550,
    capabilityRank: 3,
    coreLines: [
      { nodeId: "cmp-rtx-5070ti", role: "GPU", quantity: 1, justification: "Same 16 GB memory as the 5080 at a lower power and price; the memory floor, not the shader count, is what gates local models." },
      { nodeId: "cmp-ryzen-9950x", role: "CPU", quantity: 1, justification: "Sixteen cores carry video encode and model preprocessing without becoming the bottleneck." },
      { nodeId: "cmp-ddr5-64", role: "Memory", quantity: 1, justification: "64 GB keeps a browser, a timeline and a model server resident at once." },
      { nodeId: "cmp-ssd-990pro-2tb", role: "Storage", quantity: 1, justification: "Two terabytes is the floor once weights and 4K footage share a drive." },
      { nodeId: "cmp-psu-850w", role: "Power supply", quantity: 1, justification: "Meets the vendor's recommended system power for this card with headroom." },
    ],
    upgradePath: ["The GPU is a socket, not a solder joint: a memory-larger card drops in later.", "Memory and storage take standard parts."],
    tradeoffs: { power: "Roughly 550 W under load; the electricity bill is part of the price.", noise: "Audible under sustained load. Not a microphone room without treatment.", mobility: "None. This is a desk." },
  },
  {
    id: "arch-tower-5090",
    label: "Tower with RTX 5090",
    platform: "windows",
    usableVramGb: 32,
    usableVramBasis: "Dedicated GDDR7 on the card, from NVIDIA's specification page",
    systemRamGb: 64,
    cpuThreads: 32,
    fastStorageTb: 2,
    portability: "desk-only",
    noise: "loud",
    peakWatts: 825,
    capabilityRank: 5,
    coreLines: [
      { nodeId: "cmp-rtx-5090", role: "GPU", quantity: 1, justification: "32 GB and the highest memory bandwidth in this set; the only discrete card here that clears a 32B-class model with real headroom." },
      { nodeId: "cmp-ryzen-9950x", role: "CPU", quantity: 1, justification: "Keeps a 575 W card fed on encode-heavy and preprocessing work." },
      { nodeId: "cmp-ddr5-64", role: "Memory", quantity: 1, justification: "64 GB system memory to stage weights before they reach the card." },
      { nodeId: "cmp-ssd-990pro-2tb", role: "Storage", quantity: 1, justification: "Two terabytes is the floor once weights and 4K footage share a drive." },
      { nodeId: "cmp-psu-1000w", role: "Power supply", quantity: 1, justification: "NVIDIA's own recommendation for this card is a 1000 W system supply; an 850 W build is disqualified, not risky." },
    ],
    upgradePath: ["The card is already the ceiling of this line; the next step up is a second machine, not a bigger card.", "Memory and storage take standard parts."],
    tradeoffs: { power: "Up to roughly 825 W under load. Check the circuit, not just the wallet.", noise: "Loud under sustained load. Put it in another room if you record audio.", mobility: "None." },
  },
];

/** Peripheral and software lines attached by workload, not by taste. */
const attachments: { workloadId: string; lines: SystemLine[] }[] = [
  {
    workloadId: "wl-music",
    lines: [
      { nodeId: "per-sm7b", role: "Microphone", quantity: 1, justification: "A dynamic cardioid is the honest choice for an untreated room; it hears less of it." },
      { nodeId: "per-scarlett-2i2", role: "Audio interface", quantity: 1, justification: "Two channels covers voice plus one instrument. Note the gain caveat below before ordering." },
    ],
  },
  {
    workloadId: "wl-video-4k",
    lines: [
      { nodeId: "per-descript", role: "Edit tool", quantity: 1, justification: "Transcript-first editing removes the slowest part of a talking-head cut." },
      { nodeId: "per-topaz", role: "Upscale and restore", quantity: 1, justification: "Rescues archive and phone footage that would otherwise be unusable at delivery resolution." },
    ],
  },
  {
    workloadId: "wl-travel-capture",
    lines: [
      { nodeId: "per-elevenlabs", role: "Voice", quantity: 1, justification: "Covers narration when the room you are in is not recordable." },
    ],
  },
];

function mergeDemands(workloads: WorkloadNode[]): WorkloadDemands {
  const portabilityRank: Record<PortabilityClass, number> = { "desk-only": 0, transportable: 1, "carry-daily": 2 };
  const noiseRank: Record<NoiseClass, number> = { silent: 0, quiet: 1, audible: 2, loud: 3 };
  return workloads.reduce<WorkloadDemands>(
    (acc, workload) => {
      const d = workload.demands.value;
      return {
        vramGb: Math.max(acc.vramGb, d.vramGb),
        systemRamGb: Math.max(acc.systemRamGb, d.systemRamGb),
        cpuThreads: Math.max(acc.cpuThreads, d.cpuThreads),
        fastStorageTb: Math.max(acc.fastStorageTb, d.fastStorageTb),
        portability:
          portabilityRank[d.portability] > portabilityRank[acc.portability] ? d.portability : acc.portability,
        maxNoise: noiseRank[d.maxNoise] < noiseRank[acc.maxNoise] ? d.maxNoise : acc.maxNoise,
      };
    },
    { vramGb: 0, systemRamGb: 0, cpuThreads: 0, fastStorageTb: 0, portability: "desk-only", maxNoise: "loud" },
  );
}

function violatesConstraint(archetype: Archetype, constraint: ConstraintNode): string | null {
  const noiseRank: Record<NoiseClass, number> = { silent: 0, quiet: 1, audible: 2, loud: 3 };
  const portabilityRank: Record<PortabilityClass, number> = { "desk-only": 0, transportable: 1, "carry-daily": 2 };
  const test = constraint.test;
  switch (test.type) {
    case "max-noise":
      return noiseRank[archetype.noise] > noiseRank[test.value]
        ? `Noise class ${archetype.noise} exceeds the stated ceiling of ${test.value}.`
        : null;
    case "portability":
      return portabilityRank[archetype.portability] < portabilityRank[test.value]
        ? `${archetype.label} is ${archetype.portability}; the requirement is ${test.value}.`
        : null;
    case "max-total-watts":
      return archetype.peakWatts > test.value
        ? `Peak draw of about ${archetype.peakWatts} W exceeds the ${test.value} W ceiling.`
        : null;
    case "platform":
      return test.value !== "any" && archetype.platform !== test.value
        ? `Platform is ${archetype.platform}; the requirement is ${test.value}.`
        : null;
    case "must-run-model":
      return null;
  }
}

function missesRequirement(archetype: Archetype, need: WorkloadDemands): string | null {
  if (archetype.usableVramGb < need.vramGb) {
    return `Model-addressable memory of ${archetype.usableVramGb} GB is below the ${need.vramGb} GB floor for the selected work.`;
  }
  if (archetype.systemRamGb < need.systemRamGb) {
    return `System memory of ${archetype.systemRamGb} GB is below the ${need.systemRamGb} GB floor.`;
  }
  if (archetype.cpuThreads < need.cpuThreads) {
    return `${archetype.cpuThreads} threads is below the ${need.cpuThreads} thread floor.`;
  }
  const portabilityRank: Record<PortabilityClass, number> = { "desk-only": 0, transportable: 1, "carry-daily": 2 };
  if (portabilityRank[archetype.portability] < portabilityRank[need.portability]) {
    return `${archetype.portability} does not meet the ${need.portability} requirement of the selected work.`;
  }
  return null;
}

function computeBottleneck(archetype: Archetype, need: WorkloadDemands): Bottleneck {
  const ratios: { resource: string; headroom: number; explanation: string }[] = [
    {
      resource: "model memory",
      headroom: need.vramGb === 0 ? Number.POSITIVE_INFINITY : archetype.usableVramGb / need.vramGb,
      explanation: `${archetype.usableVramGb} GB addressable against a ${need.vramGb} GB floor. ${archetype.usableVramBasis}.`,
    },
    {
      resource: "system memory",
      headroom: need.systemRamGb === 0 ? Number.POSITIVE_INFINITY : archetype.systemRamGb / need.systemRamGb,
      explanation: `${archetype.systemRamGb} GB against a ${need.systemRamGb} GB floor.`,
    },
    {
      resource: "cpu threads",
      headroom: need.cpuThreads === 0 ? Number.POSITIVE_INFINITY : archetype.cpuThreads / need.cpuThreads,
      explanation: `${archetype.cpuThreads} threads against a ${need.cpuThreads} thread floor.`,
    },
    {
      resource: "fast storage",
      headroom: need.fastStorageTb === 0 ? Number.POSITIVE_INFINITY : archetype.fastStorageTb / need.fastStorageTb,
      explanation: `${archetype.fastStorageTb} TB of internal fast storage against a ${need.fastStorageTb} TB floor. External storage in the line items covers the gap but not at internal speed.`,
    },
  ];
  return ratios.reduce((worst, current) => (current.headroom < worst.headroom ? current : worst));
}

function rollUpCost(
  graph: DecisionGraph,
  lines: ConfiguredLine[],
  budgetId: string,
): CostRollup {
  const index = indexGraph(graph);
  const budget = index.get(budgetId);
  const totals: Record<string, number> = {};
  const unpriced: string[] = [];
  let pricedLineCount = 0;

  for (const line of lines) {
    if (line.priceMinor === null || !line.currency) {
      unpriced.push(line.label);
      continue;
    }
    totals[line.currency] = (totals[line.currency] ?? 0) + line.priceMinor * line.quantity;
    pricedLineCount += 1;
  }

  if (!budget || budget.kind !== "Budget") {
    return { pricedTotalsMinor: totals, pricedLineCount, unpricedLines: unpriced, budgetVerdict: "unknown", budgetNote: "No budget node resolved." };
  }

  const sameCurrency = totals[budget.currency] ?? 0;
  const otherCurrencies = Object.keys(totals).filter((code) => code !== budget.currency);

  if (unpriced.length > 0 || otherCurrencies.length > 0) {
    const reasons = [
      unpriced.length > 0 ? `${unpriced.length} line${unpriced.length === 1 ? "" : "s"} carry no verified price` : null,
      otherCurrencies.length > 0
        ? `priced lines are quoted in ${otherCurrencies.join(", ")} against a ${budget.currency} budget, and this site does not invent exchange rates`
        : null,
    ].filter(Boolean);
    return {
      pricedTotalsMinor: totals,
      pricedLineCount,
      unpricedLines: unpriced,
      budgetVerdict: "unknown",
      budgetNote: `Cannot be scored against the budget: ${reasons.join("; ")}.`,
    };
  }

  return {
    pricedTotalsMinor: totals,
    pricedLineCount,
    unpricedLines: unpriced,
    budgetVerdict: sameCurrency <= budget.ceilingMinor ? "within" : "over",
    budgetNote: `Verified lines total ${(sameCurrency / 100).toFixed(2)} ${budget.currency} against a ceiling of ${(budget.ceilingMinor / 100).toFixed(2)} ${budget.currency}.`,
  };
}

function expandLines(graph: DecisionGraph, lines: SystemLine[], region: Region): ConfiguredLine[] {
  const index = indexGraph(graph);
  return lines.map((line) => {
    const node = index.get(line.nodeId);
    if (!node) throw new Error(`Unknown line node ${line.nodeId}`);
    const priceIds = "priceObservationIds" in node && Array.isArray(node.priceObservationIds) ? node.priceObservationIds : [];
    const observations = priceIds
      .map((id) => index.get(id))
      .filter((candidate): candidate is Extract<typeof candidate, { kind: "PriceObservation" }> =>
        Boolean(candidate && candidate.kind === "PriceObservation"),
      );
    const regional = observations.find((observation) => observation.region === region && isPriced(observation));
    const anyPriced = regional ?? observations.find((observation) => isPriced(observation));
    const citations = new Set<string>();
    if ("specs" in node) {
      for (const value of Object.values(node.specs)) citations.add(value.source);
    }
    if (anyPriced) citations.add(anyPriced.sourceId);

    return {
      ...line,
      label: node.label,
      priceMinor: anyPriced && isPriced(anyPriced) ? anyPriced.amountMinor : null,
      currency: anyPriced ? anyPriced.currency : null,
      priceBasis: anyPriced
        ? `${anyPriced.basis}${anyPriced.region === region ? "" : ` (${anyPriced.region}, not your region)`}`
        : "unverified",
      citations: [...citations],
    };
  });
}

function conditionsFor(graph: DecisionGraph, lines: ConfiguredLine[]): WrongPurchaseConditionNode[] {
  const ids = new Set(lines.map((line) => line.nodeId));
  const usesCitedMsrp = lines.some((line) => line.priceBasis.startsWith("cited-msrp"));
  return graph.nodes.filter(
    (node): node is WrongPurchaseConditionNode =>
      node.kind === "WrongPurchaseCondition" &&
      (ids.has(node.appliesTo) || (usesCitedMsrp && node.id === "wpc-msrp-illusion")),
  );
}

export function configure(input: ConfiguratorInput, graph: DecisionGraph = decisionGraph): ConfiguratorOutput {
  const index = indexGraph(graph);
  const workloads = input.workloadIds
    .map((id) => index.get(id))
    .filter((node): node is WorkloadNode => Boolean(node && node.kind === "Workload"));
  const constraints = input.constraintIds
    .map((id) => index.get(id))
    .filter((node): node is ConstraintNode => Boolean(node && node.kind === "Constraint"));

  const requirement = mergeDemands(workloads);
  const disqualified: Disqualification[] = [];
  const eligible: Archetype[] = [];

  for (const archetype of archetypes) {
    const constraintFailure = constraints
      .map((constraint) => violatesConstraint(archetype, constraint))
      .find((reason): reason is string => Boolean(reason));
    if (constraintFailure) {
      disqualified.push({ archetypeId: archetype.id, label: archetype.label, reason: constraintFailure });
      continue;
    }
    const requirementFailure = missesRequirement(archetype, requirement);
    if (requirementFailure) {
      disqualified.push({ archetypeId: archetype.id, label: archetype.label, reason: requirementFailure });
      continue;
    }
    eligible.push(archetype);
  }

  const attachedLines = attachments
    .filter((attachment) => input.workloadIds.includes(attachment.workloadId))
    .flatMap((attachment) => attachment.lines);

  const ranked = [...eligible].sort((a, b) => a.capabilityRank - b.capabilityRank);

  /**
   * Three tiers when three distinct systems exist, and fewer when they do not. Printing the
   * same machine three times under three headings is the padding this product exists to refuse.
   */
  const picks: { tier: Tier; archetype: Archetype }[] =
    ranked.length === 0
      ? []
      : ranked.length === 1
        ? [{ tier: "recommended", archetype: ranked[0] }]
        : ranked.length === 2
          ? [
              { tier: "minimum-viable", archetype: ranked[0] },
              { tier: "uncompromised", archetype: ranked[1] },
            ]
          : [
              { tier: "minimum-viable", archetype: ranked[0] },
              { tier: "recommended", archetype: ranked[1] },
              { tier: "uncompromised", archetype: ranked[ranked.length - 1] },
            ];

  const systems: ConfiguredSystem[] = picks.map(({ tier, archetype }) => {
    const lines = expandLines(graph, [...archetype.coreLines, ...attachedLines], input.regionCode);
    const citations = [...new Set(lines.flatMap((line) => line.citations))];
    const dependencyHashes = Object.fromEntries(
      lines.map((line) => [line.nodeId, dependencyHash(graph, line.nodeId)]),
    );
    const bottleneck = computeBottleneck(archetype, requirement);
    const inputsHash = stableHash(input);
    const governance = {
      owner: "starlight.technology/configurator",
      provenance: `configure() over ${graph.schema} generated ${graph.generatedAt}`,
      version: "1.0.0",
      visibility: "public" as const,
    };
    const conditions = conditionsFor(graph, lines);

    const systemNode: CompleteSystemNode = {
      ...governance,
      id: `sys-${archetype.id}-${inputsHash}`,
      kind: "CompleteSystem",
      label: archetype.label,
      evaluationRule: "Void when any dependency hash drifts or any cited price passes its age ceiling.",
      tier,
      lines: lines.map(({ nodeId, role, quantity, justification }) => ({ nodeId, role, quantity, justification })),
      bottleneck: {
        value: `${bottleneck.resource}: ${bottleneck.explanation}`,
        evidenceKind: "inference",
        source: "src-starlight-method",
        observedAt: graph.generatedAt,
        region: input.regionCode,
      },
      upgradePath: {
        value: archetype.upgradePath,
        evidenceKind: "inference",
        source: "src-starlight-method",
        observedAt: graph.generatedAt,
        region: input.regionCode,
      },
      tradeoffs: {
        value: archetype.tradeoffs,
        evidenceKind: "inference",
        source: "src-starlight-method",
        observedAt: graph.generatedAt,
        region: input.regionCode,
      },
    };

    const recommendation: RecommendationNode = {
      ...governance,
      id: `rec-${archetype.id}-${inputsHash}`,
      kind: "Recommendation",
      label: `${tier}: ${archetype.label}`,
      evaluationRule: "Invalid the moment its dependency hashes stop matching the live graph.",
      systemId: systemNode.id,
      inputsHash,
      dependencyHashes,
      generatedAt: graph.generatedAt,
      wrongPurchaseConditionIds: conditions.map((condition) => condition.id),
      rationale: `Chosen as the ${tier} answer for the merged requirement; first bottleneck is ${bottleneck.resource}.`,
    };

    return {
      tier,
      archetypeId: archetype.id,
      label: archetype.label,
      lines,
      cost: rollUpCost(graph, lines, input.budgetId),
      bottleneck,
      upgradePath: archetype.upgradePath,
      tradeoffs: archetype.tradeoffs,
      wrongPurchaseConditions: conditions,
      citations,
      dependencyHashes,
      node: systemNode,
      recommendation,
    };
  });

  const unmet: string[] = [];
  if (systems.length === 0) {
    unmet.push(
      "No system in the current dataset satisfies these workloads and non-negotiables together. That is an answer, not a failure: relax one constraint or split the work across two machines.",
    );
  }
  if (workloads.length === 0) unmet.push("No workload selected, so there is nothing to size against.");
  if (systems.length > 0 && systems.length < 3) {
    unmet.push(
      `Only ${systems.length} system${systems.length === 1 ? "" : "s"} in the current dataset satisfies these workloads and non-negotiables. We show what exists rather than padding the page to three.`,
    );
  }

  return {
    schema: "DecisionGraph.v1",
    inputsHash: stableHash(input),
    requirement,
    systems,
    disqualified,
    unmet,
  };
}

export const configuratorArchetypes = archetypes;
