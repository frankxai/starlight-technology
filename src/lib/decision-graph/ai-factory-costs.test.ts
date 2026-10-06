import { describe, expect, it } from "vitest";
import { calculateFactoryScenario, newFactoryScenario, readFactoryScenario } from "./ai-factory-costs";
import { encodeCreatorPlan, monthlyScenario, newCreatorPlan, parseCreatorPlan, readCreatorPlan } from "./creator-plan";
import { saveCreatorDraft, type DraftLock } from "./draft-storage";

const stamp = "2026-10-03T17:00:00.000Z";
describe("recoverable agent operating estimates", () => {
  it("identifies bundled model and compute observations without implying measured billing", () => {
    const result = calculateFactoryScenario(newFactoryScenario(), "2026-10-03");
    expect(result).toMatchObject({ ratesModified: false, rateEvidence: [
      { component: "maker", kind: "bundled-snapshot", modifiedFields: [], sourceAgeStatus: "within-window" },
      { component: "reviewer", kind: "bundled-snapshot", modifiedFields: [], sourceAgeStatus: "within-window" },
      { component: "compute", kind: "bundled-snapshot", modifiedFields: [], sourceAgeStatus: "within-window" },
    ], measured: false, executable: false });
  });
  it("keeps the trusted source date when an imported scenario rebases model and compute dates", () => {
    const original = newFactoryScenario(); const imported = structuredClone(original);
    imported.maker.rate.observedAt = "2026-11-04"; imported.compute.observedAt = "2026-11-04";
    const result = calculateFactoryScenario(imported, "2026-11-04");
    expect(result).toMatchObject({ ratesModified: true, rateEvidence: [
      { component: "maker", kind: "edited-assumption", sourceObservedAt: original.maker.rate.observedAt, assumedObservedAt: "2026-11-04", modifiedFields: ["observedAt"], sourceAgeStatus: "older-than-window" },
      { component: "reviewer", kind: "bundled-snapshot", sourceAgeStatus: "older-than-window" },
      { component: "compute", kind: "edited-assumption", sourceObservedAt: original.compute.observedAt, assumedObservedAt: "2026-11-04", modifiedFields: ["observedAt"], sourceAgeStatus: "older-than-window" },
    ] });
    // Date-only edits already produce an import warning; they never establish a new source observation.
    expect(result.warnings.join(" ")).toMatch(/imported rate assumptions/);
    expect(result.knownSubtotal).toEqual(calculateFactoryScenario(original, "2026-11-04").knownSubtotal);
  });
  it("labels modified price fields while preserving the user's scenario arithmetic", () => {
    const scenario = newFactoryScenario(); scenario.maker.rate.inputMicroUsdPerMillion = 0;
    scenario.compute.cpuMicroUsdPerHour += 1;
    const result = calculateFactoryScenario(scenario, "2026-10-03");
    expect(result).toMatchObject({ ratesModified: true, rateEvidence: [
      { component: "maker", kind: "edited-assumption", modifiedFields: ["inputMicroUsdPerMillion"] },
      { component: "reviewer", kind: "bundled-snapshot" },
      { component: "compute", kind: "edited-assumption", modifiedFields: ["cpuMicroUsdPerHour"] },
    ] });
    expect(result.makerApi.usd).toBeLessThan(calculateFactoryScenario(newFactoryScenario()).makerApi.usd);
  });
  it("marks unquoted cache-write pricing in computed results without changing the established fallback", () => {
    const plan = newFactoryScenario("glm");
    plan.maker.cacheWriteTokens = 20000;
    const result = calculateFactoryScenario(plan);
    expect(result.warnings.join(" ")).toMatch(/unquoted cache.write/);
    const explicit = structuredClone(plan); explicit.maker.rate.cacheWriteMicroUsdPerMillion = explicit.maker.rate.inputMicroUsdPerMillion;
    expect(result.makerApi).toEqual(calculateFactoryScenario(explicit).makerApi);
  });
  it("warns on an unquoted cache-read rate only when a cache hit is actually assumed", () => {
    const plan = newFactoryScenario(); plan.maker.cacheCandidateTokens = 20000; plan.maker.rate.cacheReadMicroUsdPerMillion = null;
    expect(calculateFactoryScenario(plan).warnings.join(" ")).not.toMatch(/unquoted cache.read/);
    plan.maker.cacheHitBps = 5000;
    expect(calculateFactoryScenario(plan).warnings.join(" ")).toMatch(/unquoted cache.read/);
  });
  it("reproduces the matched frontier and GLM scenarios without rounding individual token calls", () => {
    const frontier = calculateFactoryScenario(newFactoryScenario()), glm = calculateFactoryScenario(newFactoryScenario("glm"));
    expect(frontier.knownSubtotal.usd).toBeCloseTo(78.9012, 8);
    expect(glm.knownSubtotal.usd).toBeCloseTo(51.1812, 8);
    expect(frontier.knownSubtotal.euroMinor).toBe(7259);
    expect(glm.knownSubtotal.euroMinor).toBe(4709);
    expect(frontier.measured).toBe(false); expect(frontier.executable).toBe(false);
  });
  it("holds the reviewer, workload and compute fixed when comparing another maker", () => {
    const frontier = newFactoryScenario(), alternative = structuredClone(frontier);
    alternative.maker.rate = newFactoryScenario("glm").maker.rate;
    const originalCost = calculateFactoryScenario(frontier), alternativeCost = calculateFactoryScenario(alternative);
    expect(alternative.reviewer).toEqual(frontier.reviewer);
    expect(alternative.compute).toEqual(frontier.compute);
    expect(alternativeCost.reviewerApi).toEqual(originalCost.reviewerApi);
    expect(alternativeCost.compute).toEqual(originalCost.compute);
    expect(alternativeCost.retainedStorage).toEqual(originalCost.retainedStorage);
    expect(alternativeCost.knownSubtotal.usd).toBeCloseTo(59.9812, 8);
  });
  it("keeps reviewer cache/native billing independent and flags same-provider review", () => {
    const scenario = newFactoryScenario("opus");
    scenario.maker.apiShareBps = 0; scenario.maker.cacheHitBps = 10_000; scenario.maker.cacheCandidateTokens = 200_000;
    scenario.reviewer.cacheCandidateTokens = 200_000;
    const cost = calculateFactoryScenario(scenario);
    expect(cost.makerApi.usd).toBe(0); expect(cost.reviewerApi.usd).toBeCloseTo(96.8, 8);
    expect(cost.warnings.join(" ")).toContain("native share");
    scenario.reviewer.rate = { ...scenario.maker.rate };
    expect(calculateFactoryScenario(scenario).independentProvider).toBe(false);
  });
  it("preserves unknown fees/FX, stopped disks and zero accepted output", () => {
    const scenario = newFactoryScenario(); scenario.compute.activeHoursPerSlot = 0;
    let cost = calculateFactoryScenario(scenario);
    expect(cost.compute.usd).toBe(0); expect(cost.retainedStorage.usd).toBeCloseTo(2.3652, 8);
    scenario.fees.browserMicroUsd = null; scenario.eurPerUsdMicros = null; scenario.acceptanceBps = 0;
    cost = calculateFactoryScenario(scenario);
    expect(cost.modeledSubtotal).toBeNull(); expect(cost.knownSubtotal.euroMinor).toBeNull(); expect(cost.overCap).toBeNull(); expect(cost.costPerExpectedAccepted).toBeNull();
  });
  it("reports a proven cap breach even while another fee remains unknown", () => {
    const scenario = newFactoryScenario();
    scenario.fees.browserMicroUsd = null;
    scenario.monthlyCapEuroMinor = 7200;
    const cost = calculateFactoryScenario(scenario);
    expect(cost.knownSubtotal.euroMinor).toBe(7259);
    expect(cost.modeledSubtotal).toBeNull();
    expect(cost.overCap).toBe(true);
    scenario.monthlyCapEuroMinor = 10_000;
    expect(calculateFactoryScenario(scenario).overCap).toBeNull();
    scenario.fees.browserMicroUsd = 0;
    expect(calculateFactoryScenario(scenario).overCap).toBe(false);
  });
  it("compares the exact known lower bound before rounding or unknown fees", () => {
    const scenario = newFactoryScenario();
    scenario.missionsPerDay = 0; scenario.compute.slots = 0;
    scenario.fees.toolsMicroUsd = 1_000_000; scenario.fees.browserMicroUsd = null;
    scenario.eurPerUsdMicros = 1_000_000; scenario.monthlyCapEuroMinor = 100;
    expect(calculateFactoryScenario(scenario).overCap).toBeNull();
    scenario.fees.toolsMicroUsd += 1;
    const cost = calculateFactoryScenario(scenario);
    expect(cost.knownSubtotal.euroMinor).toBe(100);
    expect(cost.overCap).toBe(true);
    scenario.eurPerUsdMicros = null;
    expect(calculateFactoryScenario(scenario).overCap).toBeNull();
    scenario.eurPerUsdMicros = 1_000_000; scenario.monthlyCapEuroMinor = null;
    expect(calculateFactoryScenario(scenario).overCap).toBeNull();
  });
  it("denies malformed imports and preserves bounded snapshot prices as disclosed assumptions", () => {
    const scenario = newFactoryScenario();
    for (const invalid of [
      { ...scenario, compute: { ...scenario.compute, slots: 0.5 } },
      { ...scenario, compute: { ...scenario.compute, retainedHoursPerSlot: 1 } },
      { ...scenario, exec: "dispatch" },
      { ...scenario, maker: { ...scenario.maker, rate: { ...scenario.maker.rate, sourceUrl: "javascript:alert(1)" } } },
      { ...scenario, reviewer: { ...scenario.reviewer, rate: { ...scenario.reviewer.rate, provider: "fake-independent-provider" } } },
      { ...scenario, maker: { ...scenario.maker, outputTokens: Infinity } },
    ]) expect(readFactoryScenario(invalid)).toBeNull();
    scenario.maker.rate.inputMicroUsdPerMillion += 1;
    expect(readFactoryScenario(scenario)).toEqual(scenario);
    expect(calculateFactoryScenario(scenario, "2026-12-01").warnings.join(" ")).toContain("older than 30 days");
    expect(calculateFactoryScenario(scenario).warnings.join(" ")).toContain("imported rate assumptions");
  });
  it("migrates v1 data without changing private notes and exports a complete v2 scenario", () => {
    const current = newCreatorPlan(); current.privateContext = "Synthetic private source";
    const legacy = { schema: "StarlightCreatorPlan.v1", catalogHash: current.catalogHash, savedAt: stamp, title: current.title, privateContext: current.privateContext, input: current.input, selectedArchetypeId: current.selectedArchetypeId, monthly: current.monthly };
    const restored = parseCreatorPlan(JSON.stringify(legacy));
    expect(restored.factory).toBeNull(); expect(restored.privateContext).toBe(current.privateContext); expect(restored.input).toEqual(current.input);
    expect(readCreatorPlan({ ...legacy, factory: newFactoryScenario() })).toBeNull();
    restored.factory = newFactoryScenario("glm");
    expect(parseCreatorPlan(encodeCreatorPlan(restored, stamp)).factory).toEqual(restored.factory);
    expect(() => parseCreatorPlan(JSON.stringify({ ...restored, factory: { ...restored.factory, exec: true } }))).toThrow(/invalid fields/);
  });
  it("retains legacy bytes on a timestamp-only open and preserves foreign edits", async () => {
    const current = newCreatorPlan();
    const legacy = JSON.stringify({schema:"StarlightCreatorPlan.v1",catalogHash:current.catalogHash,savedAt:stamp,title:current.title,privateContext:current.privateContext,input:current.input,selectedArchetypeId:current.selectedArchetypeId,monthly:current.monthly});
    const storage = {raw:legacy,writes:0,getItem(){return this.raw;},setItem(_key:string,raw:string){this.raw=raw;this.writes++;}};
    const lock: DraftLock = async (operation) => operation();
    const draft = parseCreatorPlan(legacy);
    expect((await saveCreatorDraft(storage,"plan",legacy,encodeCreatorPlan(draft,stamp),lock)).status).toBe("saved");
    expect(storage.raw).toBe(legacy); expect(storage.writes).toBe(0);
    draft.factory = newFactoryScenario(); storage.raw="foreign invalid data";
    const payload = encodeCreatorPlan(draft,stamp);
    expect((await saveCreatorDraft(storage,"plan",legacy,payload,lock)).status).toBe("conflict");
    expect((await saveCreatorDraft(storage,"plan",storage.raw,payload,null)).status).toBe("unavailable");
    expect(storage.raw).toBe("foreign invalid data"); expect(storage.writes).toBe(0);
    expect(parseCreatorPlan(payload).factory).toEqual(draft.factory);
  });
  it("adds incremental costs once and keeps the combined total unknown for missing inputs", () => {
    const monthly = {softwareMinor:10000,cloudMinor:5000,averageWatts:100,hoursPerDay:8,euroPerKwh:0.3};
    const scenario = newFactoryScenario();
    expect(monthlyScenario(monthly,scenario).totalMinor).toBe(15720 + calculateFactoryScenario(scenario).modeledSubtotal!.euroMinor!);
    scenario.fees.platformMicroUsd=null;
    expect(monthlyScenario(monthly,scenario).totalMinor).toBeNull();
  });
});
