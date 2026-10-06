import { describe, expect, it } from "vitest";
import { calculateFactoryScenario, newFactoryScenario } from "./ai-factory-costs";
import { planFactoryRuntime } from "./factory-runtime-plan";

const asOf = "2026-10-03";
describe("factory runtime decision", () => {
  it("compares the same workload with a fully metered contingency without changing inputs", () => {
    const scenario = newFactoryScenario();
    scenario.maker.apiShareBps = 5000; scenario.monthlyCapEuroMinor = 6000;
    const original = structuredClone(scenario);
    const output = planFactoryRuntime(scenario, asOf);
    expect(output.current.modeledSubtotal?.usd).toBeCloseTo(56.9012, 8);
    expect(output.meteredContingency.modeledSubtotal?.usd).toBeCloseTo(78.9012, 8);
    expect(output.current.overCap).toBe(false); expect(output.meteredContingency.overCap).toBe(true);
    expect(output.meteredContingency.reviewerApi).toEqual(output.current.reviewerApi);
    expect(output.meteredContingency.compute).toEqual(output.current.compute);
    expect(output.meteredContingency.retainedStorage).toEqual(output.current.retainedStorage);
    expect(scenario).toEqual(original);
    expect(output.executionAuthorized).toBe(false);
  });

  it("shows hosted Codex execution separately from customer-hosted API workers", () => {
    const scenario = newFactoryScenario(); scenario.maker.apiShareBps = 0;
    const output = planFactoryRuntime(scenario, asOf);
    const maker = output.stages[0];
    expect(maker.nativeShareBps).toBe(10000); expect(maker.accountAccess).toBe("unverified");
    expect(maker.nativeRoutes.find((route) => route.id === "codex-cloud")).toMatchObject({ executionLocation: "provider-cloud", accountAccess: "unverified" });
    expect(maker.apiRoute.executionLocation).toBe("customer-host");
    expect(output.nativeUsePlanned).toBe(true);
    expect(output.current.makerApi.usd).toBe(0);
    expect(output.meteredContingency.makerApi.usd).toBe(44);
  });

  it("separates Claude managed cloud, local Remote Control and the Team/Enterprise self-hosted beta", () => {
    const scenario = newFactoryScenario("opus"); scenario.maker.apiShareBps = 0;
    const maker = planFactoryRuntime(scenario, asOf).stages[0];
    expect(maker.nativeRoutes.find((route) => route.id === "claude-cloud")).toMatchObject({ executionLocation: "provider-cloud" });
    expect(maker.nativeRoutes.find((route) => route.id === "claude-remote-control")).toMatchObject({ executionLocation: "customer-host", relievesLocalCompute: false });
    const hosted = maker.nativeRoutes.find((route) => route.id === "claude-self-hosted")!;
    expect(hosted.requirement).toMatch(/Team or Enterprise/);
    expect(hosted.requirement).toMatch(/Pro\/Max/);
    expect(maker.apiRoute.requirement).toMatch(/API/);
    expect(maker.apiRoute.requirement).not.toMatch(/subscription credentials/);
  });

  it("does not treat GLM coding-plan credits as a general-purpose API balance", () => {
    const scenario = newFactoryScenario("glm"); scenario.maker.apiShareBps = 0;
    const maker = planFactoryRuntime(scenario, asOf).stages[0];
    expect(maker.nativeRoutes).toHaveLength(1);
    expect(maker.nativeRoutes[0].requirement).toMatch(/officially supported coding tools/);
    expect(maker.nativeRoutes[0].requirement).toMatch(/5-hour and weekly/);
    expect(maker.apiRoute.requirement).toMatch(/separate/);
  });

  it("retains unknown fees, conversion and independent-provider failure in both scenarios", () => {
    const scenario = newFactoryScenario("opus");
    scenario.reviewer.rate = { ...scenario.maker.rate };
    scenario.maker.apiShareBps = 5000; scenario.fees.platformMicroUsd = null; scenario.eurPerUsdMicros = null;
    const output = planFactoryRuntime(scenario, asOf);
    expect(output.current.modeledSubtotal).toBeNull(); expect(output.meteredContingency.modeledSubtotal).toBeNull();
    expect(output.meteredContingency.overCap).toBeNull(); expect(output.independentProvider).toBe(false);
    expect(output.warnings.join(" ")).toMatch(/different provider/);
  });

  it("reports planned tool compute without turning slots or provider percentages into capacity", () => {
    const scenario = newFactoryScenario(); scenario.compute.slots = 0;
    const output = planFactoryRuntime(scenario, asOf);
    expect(output.toolCompute.plannedSlots).toBe(0);
    expect(output.toolCompute.admittedSlots).toBeNull(); expect(output.toolCompute.modelInference).toBe("provider-remote");
    expect(output.warnings.join(" ")).toMatch(/No remote tool slots/);
    scenario.missionsPerDay = 0; scenario.maker.apiShareBps = 0;
    expect(planFactoryRuntime(scenario, asOf).nativeUsePlanned).toBe(false);
  });

  it("uses bundled runtime observations rather than an imported rate date for freshness", () => {
    const scenario = newFactoryScenario(); scenario.maker.rate.observedAt = "2027-01-01";
    const output = planFactoryRuntime(scenario, "2027-01-01");
    expect(output.sourceAgeStatus).toBe("older-than-window");
    expect(output.sources.every((source) => source.observedAt === asOf)).toBe(true);
    expect(output.warnings.join(" ")).toMatch(/Runtime documentation/);
    expect(planFactoryRuntime(scenario, "2026-10-02").sourceAgeStatus).toBe("future");
  });

  it("rejects invalid scenario input at the existing validated calculation boundary", () => {
    const scenario = newFactoryScenario(); scenario.compute.os = "unknown" as "linux";
    expect(() => planFactoryRuntime(scenario, asOf)).toThrow();
    expect(() => planFactoryRuntime(newFactoryScenario(), "2026-02-30")).toThrow();
    expect(planFactoryRuntime(newFactoryScenario(), asOf).current).toEqual(calculateFactoryScenario(newFactoryScenario(), asOf));
  });
});
