import { describe, expect, it } from "vitest";
import { configure, type ConfiguratorInput } from "./configurator";
import { decisionGraph } from "./dataset";
import { assessPurchase } from "./purchase-review";
import { dependencyHash, validateGraph } from "./graph";
import type { DecisionGraph, PriceObservationNode } from "./schema";

const input: ConfiguratorInput = { workloadIds: ["wl-local-llm-mid"], budgetId: "bud-7000", regionCode: "EU-NL", constraintIds: [] };
function clone(): DecisionGraph { return structuredClone(decisionGraph); }
function gmktec(graph: DecisionGraph) { const system = configure(input, graph).systems.find((item) => item.archetypeId === "arch-gmktec-evox2-128"); if (!system) throw new Error("GMKtec candidate missing"); return system; }
function quotedGraph() {
  const graph = clone();
  const quote = graph.nodes.find((node) => node.id === "px-gmktec-evox2-128-2tb-eu") as PriceObservationNode;
  quote.purchaseTerms = { kind: "delivered-quote", destinationRegion: "EU-NL", merchantSku: "EVO-X2-128GB-2TB-EU", quantity: 1, vatIncluded: true, shippingMinor: 2500, importDutyMinor: 0, expiresAt: "2026-10-05" };
  return { graph, quote };
}

describe("purchase review", () => {
  it("retains the exact128GB/2TB listing, source and cents while holding delivered cost", () => {
    const review = assessPurchase(gmktec(decisionGraph), input, decisionGraph, "2026-10-03");
    expect(review.listedTotalsMinor).toEqual({ EUR: 339999 });
    expect(review.quotes[0]).toMatchObject({ observedAt: "2026-10-03", kind: "listing", merchantSku: "EVO-X2-128GB-2TB-EU", vatIncluded: null, shippingMinor: null });
    expect(review.sources[0].url).toContain("variant=51610049380536");
    expect(review.deliveredTotalMinor).toBeNull(); expect(review.budgetVerdict).toBe("unknown");
  });
  it("exposes missing motherboard, case and cooling instead of labeling a parts subtotal complete", () => {
    const tower = configure(input).systems.find((system) => system.archetypeId === "arch-tower-5090")!;
    expect(assessPurchase(tower, input, decisionGraph, "2026-10-03").missingAssemblySlots).toEqual(["motherboard", "case", "cooling"]);
  });
  it("keeps a complete listed device budget unknown until delivery terms are verified", () => {
    expect(gmktec(decisionGraph).cost.budgetVerdict).toBe("unknown");
    expect(gmktec(decisionGraph).cost.budgetNote).toContain("delivered budget");
  });
  it("does not qualify unmeasured wall power under a hard power ceiling", () => {
    const result = configure({ ...input, constraintIds: ["con-watts-400"] });
    expect(result.systems.some((system) => system.archetypeId === "arch-gmktec-evox2-128")).toBe(false);
    expect(result.disqualified.find((system) => system.archetypeId === "arch-gmktec-evox2-128")?.reason).toContain("unverified");
  });
  it("includes shipping and import cost only in a matching current delivered quote", () => {
    const { graph, quote } = quotedGraph(); quote.purchaseTerms!.importDutyMinor = 1000;
    const review = assessPurchase(gmktec(graph), input, graph, "2026-10-03");
    expect(review.deliveredTotalMinor).toBe(343499); expect(review.budgetVerdict).toBe("within");
    expect(assessPurchase(gmktec(graph), { ...input, budgetId: "bud-3000" }, graph, "2026-10-03").budgetVerdict).toBe("over");
  });
  it.each(["tax", "destination", "quantity", "shipping", "expired", "future"])("holds an incomplete or wrong %s quote", (failure) => {
    const { graph, quote } = quotedGraph();
    if (failure === "tax") quote.purchaseTerms!.vatIncluded = false;
    if (failure === "destination") quote.purchaseTerms!.destinationRegion = "US";
    if (failure === "quantity") quote.purchaseTerms!.quantity = 2;
    if (failure === "shipping") quote.purchaseTerms!.shippingMinor = null;
    if (failure === "expired") quote.purchaseTerms!.expiresAt = "2026-10-02";
    if (failure === "future") quote.observedAt = "2026-10-04";
    expect(assessPurchase(gmktec(graph), input, graph, "2026-10-03").deliveredTotalMinor).toBeNull();
  });
  it("invalidates a saved recommendation when dated delivery semantics change", () => {
    const { graph, quote } = quotedGraph(); const before = dependencyHash(graph, quote.subjectId);
    quote.purchaseTerms!.shippingMinor = 3000; expect(dependencyHash(graph, quote.subjectId)).not.toBe(before);
    const second = dependencyHash(graph, quote.subjectId); quote.observedAt = "2026-10-04"; expect(dependencyHash(graph, quote.subjectId)).not.toBe(second);
  });
  it("rejects fractional/negative money, impossible dates and dangling price evidence", () => {
    const { graph, quote } = quotedGraph(); quote.amountMinor = -0.5; quote.purchaseTerms!.shippingMinor = -1; quote.observedAt = "2026-02-30"; quote.sourceId = "missing-source";
    const issues = validateGraph(graph).map((issue) => issue.problem).join(" ");
    expect(issues).toContain("safe non-negative integer"); expect(issues).toContain("real date"); expect(issues).toContain("price source");
  });
  it("uses a distinct review format without changing editable plan or build-sheet contracts", () => {
    expect(assessPurchase(gmktec(decisionGraph), input, decisionGraph, "2026-10-03").schema).toBe("StarlightPurchaseReview.v1");
    expect(() => assessPurchase(gmktec(decisionGraph), input, decisionGraph, "2026-02-30")).toThrow("real YYYY-MM-DD");
  });
});
