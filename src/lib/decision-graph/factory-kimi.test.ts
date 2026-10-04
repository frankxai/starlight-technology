import { describe, expect, it } from "vitest";
import { calculateFactoryScenario, factoryModelRates, newFactoryScenario, readFactoryScenario } from "./ai-factory-costs";
import { newCreatorPlan } from "./creator-plan";
import { encodeCreatorReport, parseCreatorExport, toCreatorReport, toCreatorReportMarkdown } from "./creator-report";
import { planFactoryRuntime } from "./factory-runtime-plan";

const asOf = "2026-10-04";
const stamp = `${asOf}T01:00:00.000Z`;
describe("Kimi cache and membership planning", () => {
  it.each([["kimi-k3-5m", 3_000_000, 22.65], ["kimi-k3-1h", 6_000_000, 27.15]] as const)("bills disjoint fresh/write/candidate categories for %s", (id, writeRate, expected) => {
    const scenario = newFactoryScenario(id);
    expect(scenario.maker.rate).toMatchObject({ provider: "moonshot", observedAt: asOf, inputMicroUsdPerMillion: 3_000_000, outputMicroUsdPerMillion: 15_000_000, cacheReadMicroUsdPerMillion: 300_000, cacheWriteMicroUsdPerMillion: writeRate });
    scenario.missionsPerDay = 1; scenario.workDays = 1; scenario.repairBps = 0;
    Object.assign(scenario.maker, { freshInputTokens: 1_000_000, cacheWriteTokens: 1_000_000, cacheCandidateTokens: 1_000_000, cacheHitBps: 5000, outputTokens: 1_000_000 });
    const result = calculateFactoryScenario(scenario, asOf);
    // Fresh + first writes + half prefix rewrites + half reads + output, without double billing input.
    expect(result.makerApi.usd).toBeCloseTo(expected, 8);
    expect(result.rateEvidence[0]).toMatchObject({ sourceObservedAt: asOf, cachePolicy: { ttl: id.endsWith("5m") ? "5m" : "1h", candidateMiss: "write" } });
    expect(result.rateEvidence[0].sources.map((source) => source.url)).toEqual(["https://platform.kimi.ai/docs/guide/context-caching", "https://www.kimi.com/en/blog/kimi-k3"]);
  });

  it("discloses a missing write rate when candidate misses are rewritten, even with no initial-write tokens", () => {
    const scenario = newFactoryScenario("kimi-k3-1h");
    scenario.missionsPerDay = 1; scenario.workDays = 1; scenario.repairBps = 0;
    Object.assign(scenario.maker, { freshInputTokens: 0, cacheWriteTokens: 0, cacheCandidateTokens: 1_000_000, cacheHitBps: 0, outputTokens: 0 });
    scenario.maker.rate.cacheWriteMicroUsdPerMillion = null;
    const result = calculateFactoryScenario(scenario, asOf);
    expect(result.makerApi.usd).toBe(3);
    expect(result.warnings.join(" ")).toMatch(/unquoted cache.write/);
    expect(result.ratesModified).toBe(true);
  });

  it("keeps TTL variants in the same provider and distinguishes native new/legacy quotas from the API", () => {
    const scenario = newFactoryScenario("kimi-k3-1h");
    scenario.reviewer.rate = { ...factoryModelRates.find((rate) => rate.id === "kimi-k3-5m")! };
    scenario.maker.apiShareBps = 5000;
    const runtime = planFactoryRuntime(scenario, asOf);
    expect(runtime.independentProvider).toBe(false); expect(runtime.executionAuthorized).toBe(false);
    const maker = runtime.stages[0];
    expect(maker.nativeRoutes).toHaveLength(1);
    expect(maker.nativeRoutes[0]).toMatchObject({ executionLocation: "customer-host", accountAccess: "unverified" });
    expect(maker.nativeRoutes[0].requirement).toMatch(/new Plus/);
    expect(maker.nativeRoutes[0].requirement).toMatch(/new plans.*5-hour.*monthly.*no weekly/i);
    expect(maker.nativeRoutes[0].requirement).toMatch(/legacy.*weekly/i);
    expect(maker.nativeRoutes[0].requirement).toMatch(/Extra Usage/);
    expect(maker.apiRoute.requirement).toMatch(/separate metered/);
    expect(runtime.meteredContingency.makerApi.usd).toBe(runtime.current.makerApi.usd * 2);
  });

  it("uses all selected source dates for runtime freshness rather than refreshing older routes", () => {
    const scenario = newFactoryScenario("kimi-k3-1h"); // Kimi observed 4 October; reviewer Codex observed 3 October.
    expect(planFactoryRuntime(scenario, "2026-10-03").sourceAgeStatus).toBe("future");
    expect(planFactoryRuntime(scenario, "2026-11-03").sourceAgeStatus).toBe("older-than-window");
    scenario.maker.rate.observedAt = "2026-11-03";
    expect(calculateFactoryScenario(scenario, "2026-11-03").rateEvidence[0].sourceObservedAt).toBe(asOf);
    expect(planFactoryRuntime(scenario, "2026-11-03").sourceAgeStatus).toBe("older-than-window");
  });

  it("exports and restores the complete Kimi comparison, source pair and cache rule within the existing size limit", () => {
    const plan = newCreatorPlan(); plan.factory = newFactoryScenario("kimi-k3-1h");
    plan.privateContext = "Synthetic Kimi recovery fixture";
    plan.factory.maker.cacheCandidateTokens = 1_000_000; plan.factory.maker.cacheHitBps = 5000;
    const report = toCreatorReport(plan, stamp);
    const text = encodeCreatorReport(plan, stamp);
    expect(new TextEncoder().encode(text).byteLength).toBeLessThanOrEqual(64 * 1024);
    expect(parseCreatorExport(text)).toEqual(plan);
    expect(report.makerAlternatives.map((row) => row.modelId)).toEqual(["opus", "sol", "glm", "kimi-k3-5m"]);
    expect(report.makerAlternatives[3].result.reviewerApi).toEqual(report.factory!.reviewerApi);
    expect(report.makerAlternatives[3].result.compute).toEqual(report.factory!.compute);
    const markdown = toCreatorReportMarkdown(report);
    expect(markdown).toContain("https://www.kimi.com/en/blog/kimi-k3");
    expect(markdown).toMatch(/candidate misses.*cache.write/i);
    expect(readFactoryScenario(newFactoryScenario())).toEqual(newFactoryScenario());
    expect(readFactoryScenario({ ...plan.factory, maker: { ...plan.factory.maker, rate: { ...plan.factory.maker.rate, provider: "independent-ttl" } } })).toBeNull();
  });
});
