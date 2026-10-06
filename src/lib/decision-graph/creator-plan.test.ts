import { describe, expect, it } from "vitest";
import { decisionGraph } from "./dataset";
import { assessCreatorPlan, encodeCreatorPlan, monthlyScenario, newCreatorPlan, parseCreatorPlan, readCreatorPlan } from "./creator-plan";

const savedAt = "2026-10-03T00:00:00.000Z";
describe("recoverable creator plan", () => {
  it("roundtrips private context, selection and exact monetary units", () => {
    const plan = newCreatorPlan(); plan.privateContext = "Two private software repos and existing workstation";
    plan.selectedArchetypeId = assessCreatorPlan(plan).output.systems[0].archetypeId;
    plan.monthly.softwareMinor = 12345;
    expect(parseCreatorPlan(encodeCreatorPlan(plan, savedAt))).toEqual({ ...plan, savedAt });
  });
  it("rejects future versions, hidden authority, duplicate IDs and unknown workloads", () => {
    const plan = newCreatorPlan();
    for (const invalid of [{ ...plan, schema: "StarlightCreatorPlan.v99" }, { ...plan, execute: true }, { ...plan, input: { ...plan.input, workloadIds: ["unknown"] } }, { ...plan, input: { ...plan.input, workloadIds: ["wl-video-4k", "wl-video-4k"] } }, { ...plan, input: { ...plan.input, shell: "run" } }]) expect(readCreatorPlan(invalid)).toBeNull();
  });
  it("rejects malformed, oversized multibyte data and nested unknown fields", () => {
    expect(() => parseCreatorPlan("{broken")).toThrow(/valid JSON/);
    expect(() => parseCreatorPlan("界".repeat(22000))).toThrow(/64 KiB/);
    const plan = newCreatorPlan(); expect(readCreatorPlan({ ...plan, monthly: { ...plan.monthly, billed: true } })).toBeNull();
  });
  it("rejects malformed dates, nonfinite costs and impossible usage", () => {
    const plan = newCreatorPlan();
    expect(readCreatorPlan({ ...plan, savedAt: "2026-02-30T00:00:00.000Z" })).toBeNull();
    for (const monthly of [{ ...plan.monthly, softwareMinor: 0.1 }, { ...plan.monthly, cloudMinor: -1 }, { ...plan.monthly, hoursPerDay: 25 }, { ...plan.monthly, averageWatts: Number.NaN }]) expect(readCreatorPlan({ ...plan, monthly })).toBeNull();
    expect(readCreatorPlan({ ...plan, input: { ...plan.input, regionCode: { toString: null, valueOf: null } } })).toBeNull();
    expect(() => monthlyScenario({ ...plan.monthly, hoursPerDay: 25 })).toThrow(/supported ranges/);
  });
  it("preserves old evidence identity and invalidates an incompatible selection", () => {
    const plan = newCreatorPlan(); plan.selectedArchetypeId = "arch-framework-desktop";
    expect(assessCreatorPlan(plan).selected).not.toBeNull();
    plan.input.constraintIds = ["con-carry-daily"];
    expect(assessCreatorPlan(plan).selectionInvalidated).toBe(true);
    const graph = structuredClone(decisionGraph); graph.generatedAt = "2026-10-04";
    expect(assessCreatorPlan(plan, graph).catalogChanged).toBe(true);
    expect(plan.catalogHash).not.toEqual(newCreatorPlan(graph).catalogHash);
  });
  it("keeps unknown recurring costs unknown and treats explicit zero separately", () => {
    expect(monthlyScenario(newCreatorPlan().monthly).totalMinor).toBeNull();
    expect(monthlyScenario({ softwareMinor: 10000, cloudMinor: 5000, averageWatts: 100, hoursPerDay: 8, euroPerKwh: 0.3 })).toEqual({ currency: "EUR", days: 30, electricityMinor: 720, totalMinor: 15720, measured: false });
    expect(monthlyScenario({ softwareMinor: 0, cloudMinor: 0, averageWatts: 0, hoursPerDay: 0, euroPerKwh: 0 }).totalMinor).toBe(0);
  });
});
