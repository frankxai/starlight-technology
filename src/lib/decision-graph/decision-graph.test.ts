import { describe, expect, it } from "vitest";
import { decisionGraph } from "./dataset";
import { dependencyHash, nodesOfKind, validateGraph } from "./graph";
import { configure } from "./configurator";
import { assessFreshness, stalenessReport } from "./staleness";
import { toBuildSheetJson, toBuildSheetMarkdown } from "./build-sheet";
import { resolveOutboundLink } from "./partner-links";
import { NODE_KINDS, type DecisionGraph, type PriceObservationNode } from "./schema";

const NOW = "2026-09-02";

function clone(): DecisionGraph {
  return JSON.parse(JSON.stringify(decisionGraph)) as DecisionGraph;
}

describe("graph integrity", () => {
  it("validates with no issues", () => {
    expect(validateGraph(decisionGraph)).toEqual([]);
  });

  it("carries all seventeen node kinds across the seed graph and what the configurator materialises", () => {
    const generated = configure({
      workloadIds: ["wl-video-4k"],
      budgetId: "bud-3000",
      regionCode: "EU-NL",
      constraintIds: [],
    }).systems.flatMap((system) => [system.node, system.recommendation]);
    const present = new Set([...decisionGraph.nodes, ...generated].map((node) => node.kind));
    expect(NODE_KINDS.length).toBe(17);
    for (const kind of NODE_KINDS) expect(present.has(kind), `missing ${kind}`).toBe(true);
  });

  it("materialised systems and recommendations pass the same validator as the seed graph", () => {
    const output = configure({
      workloadIds: ["wl-video-4k", "wl-music"],
      budgetId: "bud-3000",
      regionCode: "EU-NL",
      constraintIds: [],
    });
    const merged: DecisionGraph = {
      ...decisionGraph,
      nodes: [...decisionGraph.nodes, ...output.systems.flatMap((s) => [s.node, s.recommendation])],
    };
    expect(validateGraph(merged)).toEqual([]);
  });

  it("rejects a claim whose source does not resolve", () => {
    const graph = clone();
    const component = graph.nodes.find((node) => node.id === "cmp-rtx-5090");
    if (!component || component.kind !== "Component") throw new Error("fixture missing");
    component.specs.vramGb.source = "src-does-not-exist";
    expect(validateGraph(graph).some((issue) => issue.problem.includes("does not resolve"))).toBe(true);
  });

  it("rejects an unverified price that carries a number anyway", () => {
    const graph = clone();
    const observation = graph.nodes.find((node) => node.id === "px-5090-street-nl") as PriceObservationNode;
    observation.amountMinor = 249900;
    expect(validateGraph(graph).some((issue) => issue.problem.includes("unverified price"))).toBe(true);
  });

  it("never prints a number for an unverified price", () => {
    for (const price of nodesOfKind(decisionGraph, "PriceObservation")) {
      if (price.basis === "unverified") expect(price.amountMinor).toBeNull();
    }
  });
});

describe("configurator", () => {
  it("produces three distinct tiers when three distinct systems qualify", () => {
    const result = configure({
      workloadIds: ["wl-video-4k"],
      budgetId: "bud-3000",
      regionCode: "EU-NL",
      constraintIds: [],
    });
    expect(result.systems).toHaveLength(3);
    expect(result.systems.map((system) => system.tier)).toEqual([
      "minimum-viable",
      "recommended",
      "uncompromised",
    ]);
    expect(new Set(result.systems.map((system) => system.archetypeId)).size).toBe(3);
  });

  it("shows fewer tiers rather than printing the same machine three times", () => {
    const result = configure({
      workloadIds: ["wl-local-llm-mid", "wl-video-4k"],
      budgetId: "bud-3000",
      regionCode: "EU-NL",
      constraintIds: [],
    });
    expect(new Set(result.systems.map((system) => system.archetypeId)).size).toBe(result.systems.length);
    expect(result.systems.length).toBeLessThan(3);
    expect(result.unmet.join(" ")).toContain("rather than padding the page to three");
  });

  it("disqualifies rather than downgrades when a non-negotiable is violated", () => {
    const result = configure({
      workloadIds: ["wl-travel-capture"],
      budgetId: "bud-7000",
      regionCode: "EU-NL",
      constraintIds: ["con-carry-daily"],
    });
    expect(result.disqualified.some((item) => item.archetypeId === "arch-tower-5090")).toBe(true);
    for (const system of result.systems) expect(system.archetypeId).toBe("arch-macbook-pro-14");
  });

  it("says so when nothing fits instead of inventing a compromise", () => {
    const result = configure({
      workloadIds: ["wl-local-llm-large"],
      budgetId: "bud-7000",
      regionCode: "EU-NL",
      constraintIds: ["con-carry-daily"],
    });
    expect(result.systems).toHaveLength(0);
    expect(result.unmet[0]).toContain("No system in the current dataset");
  });

  it("routes a 70B-class workload to unified memory, not to the biggest GPU", () => {
    const result = configure({
      workloadIds: ["wl-local-llm-large"],
      budgetId: "bud-7000",
      regionCode: "EU-NL",
      constraintIds: [],
    });
    expect(result.systems.every((system) => system.archetypeId === "arch-framework-desktop")).toBe(true);
    expect(result.disqualified.some((item) => item.archetypeId === "arch-tower-5090")).toBe(true);
  });

  it("refuses to score a budget it cannot price", () => {
    const result = configure({
      workloadIds: ["wl-local-llm-mid"],
      budgetId: "bud-3000",
      regionCode: "EU-NL",
      constraintIds: [],
    });
    for (const system of result.systems) {
      expect(system.cost.budgetVerdict).toBe("unknown");
      expect(system.cost.budgetNote).toContain("Cannot be scored");
    }
  });

  it("is deterministic", () => {
    const input = {
      workloadIds: ["wl-music"],
      budgetId: "bud-1500",
      regionCode: "EU-NL" as const,
      constraintIds: ["con-silent"],
    };
    expect(configure(input).inputsHash).toBe(configure(input).inputsHash);
    expect(JSON.stringify(configure(input))).toBe(JSON.stringify(configure(input)));
  });
});

describe("staleness", () => {
  // The recommended tier for 4K video is the RTX 5070 Ti tower, which carries a cited MSRP —
  // the only kind of price that can go stale, and therefore the only useful fixture here.
  const baseline = configure({
    workloadIds: ["wl-video-4k"],
    budgetId: "bud-3000",
    regionCode: "EU-NL",
    constraintIds: [],
  }).systems[0];

  it("is valid against the graph it was generated from", () => {
    expect(assessFreshness(baseline, { now: NOW }).valid).toBe(true);
  });

  it("changed price invalidates old recommendation", () => {
    const graph = clone();
    const observation = graph.nodes.find((node) => node.id === "px-5070ti-msrp") as PriceObservationNode;
    observation.amountMinor = 84900;

    const verdict = assessFreshness(baseline, { now: NOW, graph });
    expect(verdict.valid).toBe(false);
    expect(verdict.drifted).toContain("cmp-rtx-5070ti");
    expect(verdict.reasons.join(" ")).toContain("different specification or price");
  });

  it("changed spec invalidates old recommendation", () => {
    const graph = clone();
    const component = graph.nodes.find((node) => node.id === "cmp-rtx-5070ti");
    if (!component || component.kind !== "Component") throw new Error("fixture missing");
    component.specs.vramGb.value = 24;
    expect(assessFreshness(baseline, { now: NOW, graph }).drifted).toContain("cmp-rtx-5070ti");
  });

  it("expires a recommendation whose prices are older than the ceiling", () => {
    const verdict = assessFreshness(baseline, { now: "2026-12-01" });
    expect(verdict.valid).toBe(false);
    expect(verdict.stalePriceIds.length).toBeGreaterThan(0);
  });

  it("reports overdue reviews and unverified prices for the scheduled job", () => {
    const report = stalenessReport("2027-01-01");
    expect(report.ok).toBe(false);
    expect(report.overdueReviews.length).toBeGreaterThan(0);
    expect(report.unverifiedPrices.length).toBeGreaterThan(0);
    expect(stalenessReport(NOW).ok).toBe(true);
  });

  it("hashes a dependency stably", () => {
    expect(dependencyHash(decisionGraph, "cmp-rtx-5090")).toBe(dependencyHash(decisionGraph, "cmp-rtx-5090"));
  });
});

describe("outbound links", () => {
  it("routes software with a real registry entry through the governed router", () => {
    const link = resolveOutboundLink(decisionGraph, "per-descript", "https://www.descript.com/pricing");
    expect(link.href).toBe("https://go.agenticincome.ai/descript");
    expect(link.routed).toBe(true);
    expect(link.rel).toContain("sponsored");
  });

  it("links hardware plainly and says there is no relationship", () => {
    const link = resolveOutboundLink(decisionGraph, "cmp-rtx-5090", "https://www.nvidia.com/");
    expect(link.href).toBe("https://www.nvidia.com/");
    expect(link.routed).toBe(false);
    expect(link.disclosure).toBe("no commercial relationship");
    expect(link.rel).not.toContain("sponsored");
  });

  it("degrades to a plain link when the declared slug is not in the registry", () => {
    const graph = clone();
    const relationship = graph.nodes.find((node) => node.id === "aff-per-descript");
    if (!relationship || relationship.kind !== "AffiliateRelationship") throw new Error("fixture missing");
    relationship.routerSlug = "not-a-real-route";
    const link = resolveOutboundLink(graph, "per-descript", "https://www.descript.com/pricing");
    expect(link.routed).toBe(false);
    expect(link.disclosure).toBe("no commercial relationship");
  });
});

describe("build sheet", () => {
  const output = configure({
    workloadIds: ["wl-music", "wl-video-4k"],
    budgetId: "bud-3000",
    regionCode: "EU-NL",
    constraintIds: ["con-silent"],
  });
  const sheet = toBuildSheetJson(output, { now: NOW });

  it("cites a source for every system", () => {
    for (const system of sheet.systems) expect(system.lines.every((line) => line.citations.length > 0)).toBe(true);
    expect(sheet.sources.length).toBeGreaterThan(0);
  });

  it("carries the disclosure and the router provenance", () => {
    expect(sheet.disclosure).toContain("no commercial relationship");
    expect(sheet.routerProvenance.sourceRepo).toBe("frankxai/go-agenticincome");
  });

  it("renders markdown with wrong-purchase conditions and sources", () => {
    const markdown = toBuildSheetMarkdown(sheet);
    expect(markdown).toContain("# Starlight build sheet");
    expect(markdown).toContain("Do not buy this if.");
    expect(markdown).toContain("## Sources");
    expect(markdown).not.toContain("undefined");
  });

  it("marks a system invalid in the exported sheet once a price moves", () => {
    const graph = clone();
    const observation = graph.nodes.find((node) => node.id === "px-sm7b-msrp") as PriceObservationNode;
    observation.amountMinor = 44900;
    const stale = toBuildSheetJson(output, { now: NOW, graph });
    expect(stale.systems.some((system) => !system.freshness.valid)).toBe(true);
    expect(toBuildSheetMarkdown(stale)).toContain("This build is not currently valid.");
  });
});
