import { describe, expect, it } from "vitest";
import { decisionGraph } from "./dataset";
import { newFactoryScenario } from "./ai-factory-costs";
import { assessCreatorPlan, encodeCreatorPlan, newCreatorPlan } from "./creator-plan";
import { toBuildSheetJson } from "./build-sheet";
import { confirmCreatorReplacement, encodeCreatorReport, parseCreatorExport, toCreatorReport, toCreatorReportMarkdown } from "./creator-report";

const at = "2026-10-03T20:00:00.000Z";
function completePlan() {
  const plan = newCreatorPlan();
  plan.title = "Creator factory pilot";
  plan.privateContext = "Existing laptop: code and video. Remote workers finish builds.";
  plan.selectedArchetypeId = assessCreatorPlan(plan).output.systems[0].archetypeId;
  plan.monthly = { softwareMinor: 62000, cloudMinor: 0, averageWatts: 100, hoursPerDay: 8, euroPerKwh: 0.3 };
  plan.factory = newFactoryScenario();
  return plan;
}

describe("complete creator report", () => {
  it("preserves the plan that the incumbent hardware-only sheet omits", () => {
    const plan = completePlan();
    const incumbent = toBuildSheetJson(assessCreatorPlan(plan).output, { now: at.slice(0, 10) });
    expect(incumbent).not.toHaveProperty("factory");
    expect(incumbent).not.toHaveProperty("privateContext");
    const report = toCreatorReport(plan, at);
    expect(report.plan).toEqual(plan);
    expect(report.hardware).toEqual(incumbent);
    expect(report.selectedSystem).toEqual(expect.objectContaining({ archetypeId: plan.selectedArchetypeId }));
    expect(report.recurring.existing.totalMinor).toBe(62720);
    expect(report.factory?.modeledSubtotal?.usd).toBeCloseTo(78.9012, 8);
    expect(report.recurring.combinedEuroMinor).toBe(69979);
    expect(report.factory?.executable).toBe(false);
  });

  it("compares named maker alternatives with the same workload and reviewer", () => {
    const report = toCreatorReport(completePlan(), at);
    const glm = report.makerAlternatives.find((row) => row.modelId === "glm")!;
    expect(glm.result.modeledSubtotal?.usd).toBeCloseTo(59.9812, 8);
    expect(glm.result.plannedMissions).toBe(report.factory?.plannedMissions);
    expect(glm.result.reviewerApi).toEqual(report.factory?.reviewerApi);
    expect(glm.result.compute).toEqual(report.factory?.compute);
    expect(report.makerAlternatives.find((row) => row.modelId === "opus")?.result.independentProvider).toBe(false);
  });

  it("keeps missing fees, unknown conversion and absent scenarios unknown", () => {
    const plan = completePlan(); plan.factory!.fees.toolsMicroUsd = null;
    let report = toCreatorReport(plan, at);
    expect(report.factory?.modeledSubtotal).toBeNull();
    expect(report.recurring.combinedEuroMinor).toBeNull();
    plan.factory!.fees.toolsMicroUsd = 0; plan.factory!.eurPerUsdMicros = null;
    report = toCreatorReport(plan, at);
    expect(report.factory?.modeledSubtotal?.euroMinor).toBeNull();
    expect(report.recurring.combinedEuroMinor).toBeNull();
    plan.factory = null;
    report = toCreatorReport(plan, at);
    expect(report.factory).toBeNull(); expect(report.makerAlternatives).toEqual([]);
    expect(report.recurring.combinedEuroMinor).toBeNull();
  });

  it("exports a constraint failure and invalidated preference as a useful report", () => {
    const plan = completePlan(); plan.selectedArchetypeId = "arch-framework-desktop";
    plan.input.constraintIds = ["con-carry-daily"];
    const report = toCreatorReport(plan, at);
    expect(report.selectedSystem).toBeNull();
    expect(report.selectionInvalidated).toBe(true);
    expect(report.plan.selectedArchetypeId).toBe("arch-framework-desktop");
    expect(toCreatorReportMarkdown(report)).toMatch(/no longer meets/i);
  });

  it("restores report inputs and legacy plan exports while discarding frozen analysis", () => {
    const plan = completePlan(); const report = toCreatorReport(plan, at);
    expect(parseCreatorExport(encodeCreatorReport(plan, at))).toEqual(plan);
    expect(parseCreatorExport(encodeCreatorPlan(plan, at))).toEqual({ ...plan, savedAt: at });
    report.recurring.combinedEuroMinor = 0;
    report.hardware.systems = [];
    expect(parseCreatorExport(JSON.stringify(report))).toEqual(plan);
    expect(toCreatorReport(parseCreatorExport(JSON.stringify(report)), at).recurring.combinedEuroMinor).toBe(69979);
  });

  it("rejects unknown authority fields, future schemas, invalid plans, dates and oversized data", () => {
    const report = toCreatorReport(completePlan(), at);
    for (const altered of [{ ...report, execute: true }, { ...report, schema: "StarlightCreatorReport.v99" },
      { ...report, generatedAt: "2026-02-30T00:00:00.000Z" }, { ...report, sourceCatalogHash: "forged" },
      { ...report, plan: { ...report.plan, execute: true } }]) expect(() => parseCreatorExport(JSON.stringify(altered))).toThrow();
    expect(() => parseCreatorExport("界".repeat(22000))).toThrow(/64 KiB/);
    expect(() => toCreatorReport(completePlan(), "2026-02-30T00:00:00.000Z")).toThrow();
  });

  it("uses the export date for stale-rate warnings and preserves catalog drift", () => {
    const plan = completePlan(); const oldHash = plan.catalogHash;
    const graph = structuredClone(decisionGraph); graph.generatedAt = "2026-11-20";
    const report = toCreatorReport(plan, "2026-11-20T00:00:00.000Z", graph);
    expect(report.catalogChanged).toBe(true); expect(report.plan.catalogHash).toBe(oldHash);
    expect(report.factory?.warnings.join(" ")).toMatch(/older than 30 days/);
    expect(toCreatorReportMarkdown(report)).toMatch(/catalog changed/i);
    expect(toCreatorReportMarkdown(report)).toMatch(/GLM-5.3:.*older than 30 days/);
  });

  it("keeps the first report format recoverable after purchase-review fields were added", () => {
    const report = toCreatorReport(completePlan(), at);
    const { requirements: _requirements, purchaseReviews: _purchaseReviews, ...prior } = report;
    void _requirements; void _purchaseReviews;
    expect(parseCreatorExport(JSON.stringify({ ...prior, schema: "StarlightCreatorReport.v1" }))).toEqual(report.plan);
  });

  it("names unreadable saved data before permitting import or reset, and honors cancellation", () => {
    for (const action of ["import", "reset", "replace"] as const) {
      let calls = 0;
      const allowed = confirmCreatorReplacement(action, true, (message) => {
        calls++; expect(message).toMatch(/unreadable saved data/); expect(message).toMatch(/recovery copy/); return false;
      });
      expect(allowed).toBe(false); expect(calls).toBe(1);
      expect(confirmCreatorReplacement(action, false, () => true)).toBe(true);
    }
  });

  it("exposes an unquoted cache-write fallback in a matched alternative and its JSON", () => {
    const plan = completePlan(); plan.factory!.maker.cacheWriteTokens = 20000;
    const report = toCreatorReport(plan, at);
    const glm = report.makerAlternatives.find((row) => row.modelId === "glm")!;
    expect(glm.result.warnings.join(" ")).toMatch(/unquoted cache.write/i);
    expect(toCreatorReportMarkdown(report)).toMatch(/GLM-5.3:.*unquoted cache.write/i);
  });

  it("makes the standalone Markdown auditable and separates listings from delivered costs", () => {
    const plan = completePlan(); const report = toCreatorReport(plan, at);
    const markdown = toCreatorReportMarkdown(report);
    for (const text of ["0.920000 EUR per USD", "50,000", "Repair allowance", "Expected acceptance", "Fresh input tokens", "VAT", "Delivered total: Unknown", "bud-3000", "EU-NL"]) {
      expect(markdown.replace("50000", "50,000")).toContain(text);
    }
    expect(report.purchaseReviews.every((row) => row.deliveredTotalMinor === null)).toBe(true);
    expect(markdown).toContain("USD 5.0000");
  });

  it("quotes private text so it cannot plant markup or sections in the Markdown report", () => {
    const plan = completePlan(); plan.title = "<img src=https://tracker.invalid>";
    plan.privateContext = "First line\r\n# Forged approval\n<script>alert(1)</script>\n![beacon](https://tracker.invalid)";
    const markdown = toCreatorReportMarkdown(toCreatorReport(plan, at));
    expect(markdown).not.toContain("<img"); expect(markdown).not.toContain("<script>");
    expect(markdown).not.toMatch(/^# Forged approval/m);
    expect(markdown).not.toContain("![beacon]");
    expect(markdown).toContain("Private context"); expect(markdown).toContain("Tax");
    for (const stage of [plan.factory!.maker, plan.factory!.reviewer]) expect(markdown).toContain(stage.rate.sourceUrl);
    expect(markdown).toContain(plan.factory!.compute.sourceUrl);
  });
});
