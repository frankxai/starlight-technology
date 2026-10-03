import { configure, configuratorArchetypes, type ConfiguratorInput } from "./configurator";
import { decisionGraph } from "./dataset";
import { indexGraph, stableHash } from "./graph";
import type { DecisionGraph } from "./schema";
import { calculateFactoryScenario, readFactoryScenario, type FactoryCostScenario } from "./ai-factory-costs";

export const CREATOR_PLAN_SCHEMA = "StarlightCreatorPlan.v2";
export const CREATOR_PLAN_MAX_BYTES = 65536;

export type MonthlyAssumptions = {
  softwareMinor: number | null;
  cloudMinor: number | null;
  averageWatts: number | null;
  hoursPerDay: number | null;
  euroPerKwh: number | null;
};

export type CreatorPlan = {
  schema: typeof CREATOR_PLAN_SCHEMA;
  catalogHash: string;
  savedAt: string | null;
  title: string;
  privateContext: string;
  input: ConfiguratorInput;
  selectedArchetypeId: string | null;
  monthly: MonthlyAssumptions;
  factory: FactoryCostScenario | null;
};

export function newCreatorPlan(graph: DecisionGraph = decisionGraph): CreatorPlan {
  return {
    schema: CREATOR_PLAN_SCHEMA,
    catalogHash: stableHash(graph),
    savedAt: null,
    title: "My creator system",
    privateContext: "",
    input: { workloadIds: ["wl-local-llm-mid", "wl-video-4k"], budgetId: "bud-3000", regionCode: "EU-NL", constraintIds: [] },
    selectedArchetypeId: null,
    monthly: { softwareMinor: null, cloudMinor: null, averageWatts: null, hoursPerDay: null, euroPerKwh: null },
    factory: null,
  };
}

function record(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

function keys(value: Record<string, unknown>, names: string[]): boolean {
  const actual = Object.keys(value);
  return actual.length === names.length && names.every((name) => Object.hasOwn(value, name));
}

function nullableNumber(value: unknown, max: number, integer = false): boolean {
  return value === null || typeof value === "number" && Number.isFinite(value) && value >= 0 && value <= max && (!integer || Number.isSafeInteger(value));
}

export function readCreatorPlan(value: unknown, graph: DecisionGraph = decisionGraph): CreatorPlan | null {
  if (!record(value)) return null;
  const fields = ["schema", "catalogHash", "savedAt", "title", "privateContext", "input", "selectedArchetypeId", "monthly"];
  const legacy = value.schema === "StarlightCreatorPlan.v1";
  if (!keys(value, legacy ? fields : [...fields, "factory"])) return null;
  if ((!legacy && value.schema !== CREATOR_PLAN_SCHEMA) || typeof value.catalogHash !== "string" || !/^[0-9a-f]{16}$/.test(value.catalogHash)) return null;
  if (value.savedAt !== null && (typeof value.savedAt !== "string" || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(value.savedAt) || !Number.isFinite(Date.parse(value.savedAt)) || new Date(value.savedAt).toISOString() !== value.savedAt)) return null;
  if (typeof value.title !== "string" || value.title.length > 120 || typeof value.privateContext !== "string" || value.privateContext.length > 4000) return null;
  const input = value.input;
  if (!record(input) || !keys(input, ["workloadIds", "budgetId", "regionCode", "constraintIds"])) return null;
  const index = indexGraph(graph);
  function ids(values: unknown, kind: "Workload" | "Constraint"): values is string[] {
    return Array.isArray(values) && values.length <= 16 && new Set(values).size === values.length && values.every((id) => typeof id === "string" && index.get(id)?.kind === kind);
  }
  if (!ids(input.workloadIds, "Workload") || !ids(input.constraintIds, "Constraint") || typeof input.budgetId !== "string" || index.get(input.budgetId)?.kind !== "Budget" || typeof input.regionCode !== "string" || !["EU-NL", "EU", "US"].includes(input.regionCode)) return null;
  if (value.selectedArchetypeId !== null && (typeof value.selectedArchetypeId !== "string" || !configuratorArchetypes.some((item) => item.id === value.selectedArchetypeId))) return null;
  const monthly = value.monthly;
  if (!record(monthly) || !keys(monthly, ["softwareMinor", "cloudMinor", "averageWatts", "hoursPerDay", "euroPerKwh"]) || !nullableNumber(monthly.softwareMinor, 100_000_000, true) || !nullableNumber(monthly.cloudMinor, 100_000_000, true) || !nullableNumber(monthly.averageWatts, 10000) || !nullableNumber(monthly.hoursPerDay, 24) || !nullableNumber(monthly.euroPerKwh, 100)) return null;
  const factory = legacy || value.factory === null ? null : readFactoryScenario(value.factory);
  if (!legacy && value.factory !== null && factory === null) return null;
  // Copy validated fields explicitly. Imported records cannot carry execution directives.
  return {
    schema: CREATOR_PLAN_SCHEMA, catalogHash: value.catalogHash, savedAt: value.savedAt as string | null,
    title: value.title, privateContext: value.privateContext,
    input: { workloadIds: [...input.workloadIds], constraintIds: [...input.constraintIds], budgetId: input.budgetId, regionCode: input.regionCode as CreatorPlan["input"]["regionCode"] },
    selectedArchetypeId: value.selectedArchetypeId as string | null,
    monthly: { softwareMinor: monthly.softwareMinor as number | null, cloudMinor: monthly.cloudMinor as number | null, averageWatts: monthly.averageWatts as number | null, hoursPerDay: monthly.hoursPerDay as number | null, euroPerKwh: monthly.euroPerKwh as number | null },
    factory,
  };
}

export function parseCreatorPlan(text: string, graph: DecisionGraph = decisionGraph): CreatorPlan {
  if (new TextEncoder().encode(text).byteLength > CREATOR_PLAN_MAX_BYTES) throw new Error("Plan exceeds 64 KiB.");
  let parsed: unknown;
  try { parsed = JSON.parse(text); } catch { throw new Error("Plan is not valid JSON. Your current draft is unchanged."); }
  const plan = readCreatorPlan(parsed, graph);
  if (!plan) throw new Error("Unsupported plan version or invalid fields. Your current draft is unchanged.");
  return plan;
}

export function encodeCreatorPlan(plan: CreatorPlan, savedAt: string, graph: DecisionGraph = decisionGraph): string {
  const checked = readCreatorPlan({ ...plan, savedAt }, graph);
  if (!checked) throw new Error("Current plan is invalid; export has been stopped.");
  const text = JSON.stringify(checked, null, 2);
  if (new TextEncoder().encode(text).byteLength > CREATOR_PLAN_MAX_BYTES) throw new Error("Plan exceeds 64 KiB; export has been stopped.");
  return text;
}

export function assessCreatorPlan(plan: CreatorPlan, graph: DecisionGraph = decisionGraph) {
  const output = configure(plan.input, graph);
  const selected = output.systems.find((system) => system.archetypeId === plan.selectedArchetypeId) ?? null;
  return {
    output, selected,
    catalogChanged: plan.catalogHash !== stableHash(graph),
    selectionInvalidated: plan.selectedArchetypeId !== null && selected === null,
  };
}

export function monthlyScenario(monthly: MonthlyAssumptions, factory: FactoryCostScenario | null = null) {
  if (!nullableNumber(monthly.softwareMinor, 100_000_000, true) || !nullableNumber(monthly.cloudMinor, 100_000_000, true) || !nullableNumber(monthly.averageWatts, 10000) || !nullableNumber(monthly.hoursPerDay, 24) || !nullableNumber(monthly.euroPerKwh, 100)) throw new Error("Recurring-cost assumptions are outside supported ranges.");
  const { averageWatts, hoursPerDay, euroPerKwh, softwareMinor, cloudMinor } = monthly;
  // Thirty days is an explicit scenario convention, not measured consumption or an invoice.
  const electricityMinor = averageWatts === null || hoursPerDay === null || euroPerKwh === null ? null : Math.round(averageWatts / 1000 * hoursPerDay * 30 * euroPerKwh * 100);
  const baseMinor = electricityMinor === null || softwareMinor === null || cloudMinor === null ? null : electricityMinor + softwareMinor + cloudMinor;
  if (factory === null) return { currency: "EUR" as const, days: 30, electricityMinor, totalMinor: baseMinor, measured: false as const };
  const modeled = calculateFactoryScenario(factory);
  const factoryMinor = modeled.modeledSubtotal?.euroMinor ?? null;
  const combined = baseMinor === null || factoryMinor === null ? null : baseMinor + factoryMinor;
  return { currency: "EUR" as const, days: 30, electricityMinor, totalMinor: combined !== null && Number.isSafeInteger(combined) ? combined : null, factory: modeled, measured: false as const };
}
