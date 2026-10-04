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
  it("shows that the exact recorded listing already exceeds the budget while delivery is unknown", () => {
    const constrained = { ...input, budgetId: "bud-3000" };
    const system = configure(constrained).systems.find((candidate) => candidate.archetypeId === "arch-gmktec-evox2-128")!;
    const review = assessPurchase(system, constrained, decisionGraph, "2026-10-03");
    expect(review.unresolved).toContain("Recorded EUR 3399.99 subtotal exceeds the EUR 3000.00 budget. Confirm current prices and delivered terms.");
    expect(system.cost.budgetNote).toContain("Recorded EUR 3399.99 subtotal exceeds");
    expect(review.deliveredTotalMinor).toBeNull(); expect(review.budgetVerdict).toBe("unknown");
  });
  it.each([0, 299999, 300000])("does not infer affordability from a recorded subtotal of %s", (amount) => {
    const graph = clone();
    (graph.nodes.find((node) => node.id === "px-gmktec-evox2-128-2tb-eu") as PriceObservationNode).amountMinor = amount;
    const review = assessPurchase(gmktec(graph), { ...input, budgetId: "bud-3000" }, graph, "2026-10-03");
    expect(review.unresolved.join(" ")).not.toContain("subtotal exceeds");
    expect(review.deliveredTotalMinor).toBeNull(); expect(review.budgetVerdict).toBe("unknown");
  });
  it.each(["stale", "future", "invalid-date", "unverified", "missing-source"])("does not use %s price evidence for a budget warning", (failure) => {
    const graph = clone(); const system = gmktec(graph);
    const observation = graph.nodes.find((node) => node.id === "px-gmktec-evox2-128-2tb-eu") as PriceObservationNode;
    if (failure === "stale") observation.observedAt = "2026-09-01";
    if (failure === "future") observation.observedAt = "2026-10-04";
    if (failure === "invalid-date") observation.observedAt = "2026-02-30";
    if (failure === "unverified") observation.basis = "unverified";
    if (failure === "missing-source") observation.sourceId = "missing-source";
    const review = assessPurchase(system, { ...input, budgetId: "bud-3000" }, graph, "2026-10-03");
    expect(review.unresolved.join(" ")).not.toContain("subtotal exceeds");
    expect(review.deliveredTotalMinor).toBeNull(); expect(review.budgetVerdict).toBe("unknown");
  });
  it("keeps currencies separate instead of converting a USD listing to the EUR budget", () => {
    const graph = clone();
    (graph.nodes.find((node) => node.id === "px-gmktec-evox2-128-2tb-eu") as PriceObservationNode).currency = "USD";
    const review = assessPurchase(gmktec(graph), { ...input, budgetId: "bud-3000" }, graph, "2026-10-03");
    expect(review.listedTotalsMinor).toEqual({ USD: 339999 });
    expect(review.unresolved.join(" ")).not.toContain("subtotal exceeds");
    expect(review.budgetVerdict).toBe("unknown");
  });
  it("counts selected quantities even when other configured items are unpriced", () => {
    const mixed = { ...input, workloadIds: ["wl-local-llm-mid", "wl-video-4k"] };
    const system = configure(mixed).systems.find((candidate) => candidate.archetypeId === "arch-gmktec-evox2-128")!;
    expect(system.lines.some((line) => line.priceMinor === null)).toBe(true);
    system.lines.find((line) => line.priceObservationId === "px-gmktec-evox2-128-2tb-eu")!.quantity = 3;
    const review = assessPurchase(system, mixed, decisionGraph, "2026-10-03");
    expect(review.unresolved).toContain("Recorded EUR 10199.97 subtotal exceeds the EUR 7000.00 budget. Confirm current prices and delivered terms.");
    expect(review.deliveredTotalMinor).toBeNull(); expect(review.budgetVerdict).toBe("unknown");
  });
  it("preserves every cent at the safe integer boundary", () => {
    const graph = clone();
    (graph.nodes.find((node) => node.id === "px-gmktec-evox2-128-2tb-eu") as PriceObservationNode).amountMinor = Number.MAX_SAFE_INTEGER - 1;
    const review = assessPurchase(gmktec(graph), { ...input, budgetId: "bud-3000" }, graph, "2026-10-03");
    expect(review.unresolved).toContain("Recorded EUR 90071992547409.90 subtotal exceeds the EUR 3000.00 budget. Confirm current prices and delivered terms.");
  });
  it.each([0, -1, 1.5])("does not count invalid quantity %s toward a budget warning", (quantity) => {
    const system = gmktec(decisionGraph); system.lines[0].quantity = quantity;
    const review = assessPurchase(system, { ...input, budgetId: "bud-3000" }, decisionGraph, "2026-10-03");
    expect(review.unresolved.join(" ")).not.toContain("subtotal exceeds");
    expect(review.budgetVerdict).toBe("unknown");
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
