import { calculateFactoryScenario, factoryModelRates } from "./ai-factory-costs";
import { toBuildSheetJson, toBuildSheetMarkdown } from "./build-sheet";
import { assessCreatorPlan, CREATOR_PLAN_MAX_BYTES, monthlyScenario, parseCreatorPlan, readCreatorPlan, type CreatorPlan } from "./creator-plan";
import { decisionGraph } from "./dataset";
import { indexGraph, stableHash } from "./graph";
import { assessPurchase } from "./purchase-review";
import { assessFreshness } from "./staleness";
import type { DecisionGraph } from "./schema";

export const CREATOR_REPORT_SCHEMA = "StarlightCreatorReport.v2";
const legacyFields = ["schema", "generatedAt", "sourceCatalogHash", "plan", "catalogChanged", "selectionInvalidated", "selectedSystem", "hardware", "recurring", "factory", "makerAlternatives"];
const fields = [...legacyFields, "requirements", "purchaseReviews"];

function timestamp(value: unknown): value is string {
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(value) &&
    Number.isFinite(Date.parse(value)) && new Date(value).toISOString() === value;
}

/** The report carries validated inputs and a dated comparison. It cannot authorize execution. */
export function toCreatorReport(value: CreatorPlan, generatedAt: string, graph: DecisionGraph = decisionGraph) {
  const plan = readCreatorPlan(value, graph);
  if (!plan || !timestamp(generatedAt)) throw new Error("Current plan or report date is invalid; export has been stopped.");
  const asOf = generatedAt.slice(0, 10);
  const assessment = assessCreatorPlan(plan, graph);
  const index = indexGraph(graph);
  const hardware = toBuildSheetJson(assessment.output, { now: asOf, graph });
  const existing = monthlyScenario(plan.monthly);
  const factory = plan.factory === null ? null : calculateFactoryScenario(plan.factory, asOf);
  const factoryEuroMinor = factory?.modeledSubtotal?.euroMinor ?? null;
  const combined = existing.totalMinor === null || factoryEuroMinor === null ? null : existing.totalMinor + factoryEuroMinor;
  // Only the maker's dated model rate changes. Work, repairs, API share, reviewer and compute stay equal.
  const makerAlternatives = plan.factory === null ? [] : factoryModelRates.filter((rate) => rate.id !== plan.factory!.maker.rate.id).map((rate) => ({
    modelId: rate.id, label: rate.label,
    result: calculateFactoryScenario({ ...plan.factory!, maker: { ...plan.factory!.maker, rate: { ...rate } } }, asOf),
  }));
  return {
    schema: CREATOR_REPORT_SCHEMA, generatedAt, sourceCatalogHash: stableHash(graph), plan,
    catalogChanged: assessment.catalogChanged, selectionInvalidated: assessment.selectionInvalidated,
    selectedSystem: assessment.selected === null ? null : { archetypeId: assessment.selected.archetypeId, label: assessment.selected.label, freshness: assessFreshness(assessment.selected, { now: asOf, graph }) },
    requirements: { workloads: plan.input.workloadIds.map((id) => ({ id, label: index.get(id)!.label })),
      constraints: plan.input.constraintIds.map((id) => ({ id, label: index.get(id)!.label })), budget: index.get(plan.input.budgetId)!.label, region: plan.input.regionCode },
    purchaseReviews: assessment.output.systems.map((system) => assessPurchase(system, plan.input, graph, asOf)),
    hardware, recurring: { existing, combinedEuroMinor: combined !== null && Number.isSafeInteger(combined) ? combined : null },
    factory, makerAlternatives,
  };
}
export type CreatorReport = ReturnType<typeof toCreatorReport>;

export function encodeCreatorReport(plan: CreatorPlan, generatedAt: string, graph: DecisionGraph = decisionGraph): string {
  const text = JSON.stringify(toCreatorReport(plan, generatedAt, graph), null, 2);
  if (new TextEncoder().encode(text).byteLength > CREATOR_PLAN_MAX_BYTES) throw new Error("Report exceeds 64 KiB; export has been stopped. Export the editable plan separately.");
  return text;
}

/** Restore only editable inputs. Frozen comparisons, claims and prices in a report are never trusted. */
export function parseCreatorExport(text: string, graph: DecisionGraph = decisionGraph): CreatorPlan {
  if (new TextEncoder().encode(text).byteLength > CREATOR_PLAN_MAX_BYTES) throw new Error("Plan exceeds 64 KiB.");
  let value: unknown;
  try { value = JSON.parse(text); } catch { return parseCreatorPlan(text, graph); }
  if (!value || typeof value !== "object" || Array.isArray(value) || !("schema" in value) || ![CREATOR_REPORT_SCHEMA, "StarlightCreatorReport.v1"].includes(value.schema as string)) return parseCreatorPlan(text, graph);
  const report = value as Record<string, unknown>;
  const expected = report.schema === "StarlightCreatorReport.v1" ? legacyFields : fields;
  if (Object.keys(report).length !== expected.length || expected.some((field) => !Object.hasOwn(report, field)) ||
    !timestamp(report.generatedAt) || typeof report.sourceCatalogHash !== "string" || !/^[0-9a-f]{16}$/.test(report.sourceCatalogHash)) {
    throw new Error("Unsupported report envelope. Your current draft is unchanged.");
  }
  const plan = readCreatorPlan(report.plan, graph);
  if (!plan) throw new Error("Report inputs are invalid. Your current draft is unchanged.");
  return plan;
}

export function confirmCreatorReplacement(action: "import" | "reset", unreadableSave: boolean, confirm: (message: string) => boolean): boolean {
  const message = unreadableSave ? `This device has unreadable saved data. ${action === "import" ? "Importing this plan" : "Resetting"} will replace that saved copy and this tab's draft. Export the recovery copy first to keep it. Replace the unreadable saved data?` :
    action === "import" ? "Replace your current draft with this plan? Export a backup first if needed." : "Reset this plan? Export a backup first if needed.";
  return confirm(message);
}

function escapeText(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/([`*_[\]{}()#!|])/g, "\\$1");
}
const euro = (minor: number | null) => minor === null ? "Unknown" : `EUR ${(minor / 100).toFixed(2)}`;
const dollars = (value: number | null | undefined) => value === null || value === undefined ? "Unknown" : `USD ${value.toFixed(4)}`;

export function toCreatorReportMarkdown(report: CreatorReport): string {
  const { plan, factory } = report;
  const lines = ["# Complete creator system plan", "", escapeText(plan.title).replace(/[\r\n]+/g, " "), "",
    `Generated ${report.generatedAt} from the device clock. Current catalog ${report.sourceCatalogHash}; saved plan catalog ${plan.catalogHash}.`, "",
    "## Private context", "", "This report includes your equipment and work notes. Share it only when you choose.", ""];
  for (const line of plan.privateContext.replace(/\r\n?/g, "\n").split("\n")) lines.push(`> ${escapeText(line)}`);
  lines.push("", "## Your hardware choice", "", report.selectedSystem ? `Preferred system: ${escapeText(report.selectedSystem.label)}.` : "No compatible hardware selection is recorded.");
  if (report.selectedSystem && !report.selectedSystem.freshness.valid) lines.push(`Selected hardware evidence needs renewal: ${report.selectedSystem.freshness.reasons.join("; ")}`);
  if (report.selectionInvalidated) lines.push("The saved selection no longer meets the current constraints. Keep the preference for reference and choose a compatible alternative.");
  if (report.catalogChanged) lines.push("The catalog changed since this plan was saved. Comparisons are recalculated against the current catalog; the original plan identity is preserved.");
  lines.push("", "## Requirements used", "", `Workloads: ${report.requirements.workloads.map((row) => `${row.label} (${row.id})`).join("; ") || "None"}.`,
    `Constraints: ${report.requirements.constraints.map((row) => `${row.label} (${row.id})`).join("; ") || "None"}.`,
    `Hardware budget: ${report.requirements.budget} (${plan.input.budgetId}). Destination: ${report.requirements.region}.`,
    "", "## Recurring costs", "", "| Component | Monthly scenario |", "| --- | --- |",
    `| Existing software | ${euro(plan.monthly.softwareMinor)} |`, `| Existing cloud | ${euro(plan.monthly.cloudMinor)} |`,
    `| Electricity | ${euro(report.recurring.existing.electricityMinor)} |`, `| Existing recurring total | ${euro(report.recurring.existing.totalMinor)} |`,
    `| Incremental factory | ${factory === null ? "Not included" : euro(factory.modeledSubtotal?.euroMinor ?? null)} |`, `| Combined recurring scenario | ${euro(report.recurring.combinedEuroMinor)} |`, "",
    "Electricity uses 30 days and your stated power, hours and tariff. Missing inputs remain unknown. Existing cloud/software must exclude the factory fees to avoid counting the same charge twice. Hardware purchases remain separate.");
  if (factory && plan.factory) {
    const scenario = plan.factory;
    lines.push("", "## Factory assumptions used", "", `Volume: ${scenario.missionsPerDay} missions/day × ${scenario.workDays} work days. Repair allowance: ${scenario.repairBps / 100}%. Expected acceptance: ${scenario.acceptanceBps / 100}%.`,
      `Conversion: ${scenario.eurPerUsdMicros === null ? "Unknown" : (scenario.eurPerUsdMicros / 1_000_000).toFixed(6)} EUR per USD. Incremental cap: ${euro(scenario.monthlyCapEuroMinor)}.`, "",
      "| Stage | Fresh input tokens | Cache writes | Cache candidates | Output tokens | Cache hit assumption | API share |", "| --- | --- | --- | --- | --- | --- | --- |");
    for (const [label, stage] of [["Maker", scenario.maker], ["Reviewer", scenario.reviewer]] as const) {
      lines.push(`| ${label} | ${stage.freshInputTokens} | ${stage.cacheWriteTokens} | ${stage.cacheCandidateTokens} | ${stage.outputTokens} | ${stage.cacheHitBps / 100}% | ${stage.apiShareBps / 100}% |`);
      if ((stage.cacheWriteTokens > 0 && stage.rate.cacheWriteMicroUsdPerMillion === null) || (stage.cacheCandidateTokens > 0 && stage.rate.cacheReadMicroUsdPerMillion === null)) lines.push(`${label}: an unquoted cache rate uses the fresh-input price for this scenario; verify the provider's cache terms.`);
    }
    lines.push("", "| Fee | Monthly USD assumption |", "| --- | --- |");
    for (const [name, amount] of [["Tools", scenario.fees.toolsMicroUsd], ["Browser", scenario.fees.browserMicroUsd], ["Platform", scenario.fees.platformMicroUsd], ["New subscriptions", scenario.fees.newSubscriptionsMicroUsd]] as const) lines.push(`| ${name} | ${dollars(amount === null ? null : amount / 1_000_000)} |`);
    lines.push("", "## Factory workload and cost", "",
      `${factory.plannedMissions} planned missions; ${factory.expectedAttempts} expected maker/reviewer attempts; ${factory.expectedAccepted} expected accepted missions. Repair and acceptance are assumptions, not completed work.`, "",
      `Maker: ${scenario.maker.rate.label}, ${scenario.maker.apiShareBps / 100}% API share. Reviewer: ${scenario.reviewer.rate.label}, ${scenario.reviewer.apiShareBps / 100}% API share.`,
      `Workers: ${scenario.compute.slots} ${scenario.compute.os} slots, ${scenario.compute.vcpu} vCPU / ${scenario.compute.memoryGiB} GiB each, ${scenario.compute.activeHoursPerSlot} active and ${scenario.compute.retainedHoursPerSlot} retained hours per slot, ${scenario.compute.diskGiB} GiB disk each.`, "",
      "| Cost component | Monthly USD scenario |", "| --- | --- |",
      `| Maker API | ${dollars(factory.makerApi.usd)} |`, `| Reviewer API | ${dollars(factory.reviewerApi.usd)} |`,
      `| Active compute | ${dollars(factory.compute.usd)} |`, `| Retained storage | ${dollars(factory.retainedStorage.usd)} |`,
      `| Known fees | ${dollars(factory.fees.usd)} |`, `| Known subtotal | ${dollars(factory.knownSubtotal.usd)} |`,
      `| Modeled subtotal | ${dollars(factory.modeledSubtotal?.usd)} |`, `| Cost per expected accepted mission | ${dollars(factory.costPerExpectedAccepted?.usd)} |`, "",
      `Incremental cap: ${euro(scenario.monthlyCapEuroMinor)}. ${factory.overCap === true ? "Known costs exceed the cap." : factory.overCap === false ? "The modeled subtotal is within the cap; unlisted costs remain outside this scenario." : "Cap compliance remains unknown."}`,
      `Tax, egress and unlisted services need separate verification. ${factory.scope}`);
    if (factory.missing.length) lines.push(`Unknown fees: ${factory.missing.join(", ")}.`);
    for (const warning of factory.warnings) lines.push(`- ${warning}`);
    lines.push("", "## Same-workload maker alternatives", "", "The maker rate changes; workload, API share, reviewer, repairs and compute stay equal. These comparisons grant no model access or measured performance.", "",
      "| Maker | Monthly USD | Independent provider | Cap exceeded |", "| --- | --- | --- | --- |");
    for (const row of [{ label: scenario.maker.rate.label, result: factory }, ...report.makerAlternatives]) {
      lines.push(`| ${row.label} | ${dollars(row.result.modeledSubtotal?.usd)} | ${row.result.independentProvider ? "Yes" : "No"} | ${row.result.overCap === null ? "Unknown" : row.result.overCap ? "Yes" : "No"} |`);
    }
    for (const row of report.makerAlternatives) for (const warning of row.result.warnings) lines.push(`- ${row.label}: ${warning}`);
    lines.push("", "### Factory rate sources", "");
    for (const rate of [scenario.maker.rate, scenario.reviewer.rate, ...factoryModelRates.filter((rate) => report.makerAlternatives.some((row) => row.modelId === rate.id))]) {
      lines.push(`- ${rate.label}: ${rate.sourceUrl}, observed ${rate.observedAt}. Per million tokens: input USD ${(rate.inputMicroUsdPerMillion / 1_000_000).toFixed(6)}, output USD ${(rate.outputMicroUsdPerMillion / 1_000_000).toFixed(6)}, cache write ${rate.cacheWriteMicroUsdPerMillion === null ? "unquoted" : `USD ${(rate.cacheWriteMicroUsdPerMillion / 1_000_000).toFixed(6)}`}, cache read ${rate.cacheReadMicroUsdPerMillion === null ? "unquoted" : `USD ${(rate.cacheReadMicroUsdPerMillion / 1_000_000).toFixed(6)}`}.`);
    }
    lines.push(`- Compute: ${scenario.compute.sourceUrl}, observed ${scenario.compute.observedAt}.`, "",
      "Model-rate, token-volume, cache, API-share, fee, currency and workload inputs are retained in the report JSON. Native authentication alone does not establish included usage. No runtime, spend or execution is authorized by this report.");
  } else lines.push("", "No factory scenario is included. Add one in Studio to compare inference, compute and retained-storage costs.");
  lines.push("", "## Delivered purchase review", "", "Listed costs do not establish a delivered purchase budget. VAT, shipping/import costs, exact SKU, quantity, expiry and assembly remain required.");
  for (const purchase of report.purchaseReviews) {
    lines.push("", `### ${purchase.label}`, "", `Delivered total: ${purchase.deliveredTotalMinor === null ? "Unknown" : `${purchase.currency} ${(purchase.deliveredTotalMinor / 100).toFixed(2)}`}. Delivered budget verdict: ${purchase.budgetVerdict}.`);
    for (const unresolved of purchase.unresolved) lines.push(`- ${unresolved}`);
  }
  lines.push("", "## Hardware alternatives, evidence and disclosures", "", toBuildSheetMarkdown(report.hardware));
  return lines.join("\n") + "\n";
}
