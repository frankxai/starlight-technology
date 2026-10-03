/** Deterministic planning estimates. No provider calls, quota claims or dispatch authority. */
export const FACTORY_COST_SCHEMA = "StarlightFactoryCostScenario.v1";
const OBSERVED_AT = "2026-10-03";
export type ModelRate = {
  id: string; label: string; provider: string; sourceUrl: string; observedAt: string;
  inputMicroUsdPerMillion: number; outputMicroUsdPerMillion: number;
  cacheReadMicroUsdPerMillion: number | null; cacheWriteMicroUsdPerMillion: number | null;
};
export const factoryModelRates: readonly ModelRate[] = [
  { id: "opus", label: "Claude Opus 5.5", provider: "anthropic", sourceUrl: "https://platform.claude.com/docs/en/about-claude/pricing", observedAt: OBSERVED_AT, inputMicroUsdPerMillion: 4_000_000, outputMicroUsdPerMillion: 20_000_000, cacheReadMicroUsdPerMillion: 200_000, cacheWriteMicroUsdPerMillion: 5_000_000 },
  { id: "sol", label: "GPT-6.1 Sol", provider: "openai", sourceUrl: "https://developers.openai.com/api/docs/pricing", observedAt: OBSERVED_AT, inputMicroUsdPerMillion: 2_000_000, outputMicroUsdPerMillion: 10_000_000, cacheReadMicroUsdPerMillion: 100_000, cacheWriteMicroUsdPerMillion: 2_500_000 },
  { id: "glm", label: "GLM-5.3", provider: "zai", sourceUrl: "https://docs.z.ai/guides/overview/pricing", observedAt: OBSERVED_AT, inputMicroUsdPerMillion: 1_400_000, outputMicroUsdPerMillion: 4_400_000, cacheReadMicroUsdPerMillion: 260_000, cacheWriteMicroUsdPerMillion: null },
];
export type StageAssumptions = {
  rate: ModelRate;
  freshInputTokens: number; cacheWriteTokens: number; cacheCandidateTokens: number;
  outputTokens: number; cacheHitBps: number; apiShareBps: number;
};
export type ComputeAssumptions = {
  sourceUrl: string; observedAt: string;
  cpuMicroUsdPerHour: number; memoryMicroUsdPerGiBHour: number;
  storageMicroUsdPerGiBHour: number; windowsMicroUsdPerCpuHour: number;
  slots: number; activeHoursPerSlot: number; retainedHoursPerSlot: number;
  vcpu: number; memoryGiB: number; diskGiB: number; os: "linux" | "windows";
};
export type FactoryCostScenario = {
  schema: typeof FACTORY_COST_SCHEMA;
  missionsPerDay: number; workDays: number; repairBps: number; acceptanceBps: number;
  maker: StageAssumptions; reviewer: StageAssumptions;
  compute: ComputeAssumptions;
  fees: { toolsMicroUsd: number | null; browserMicroUsd: number | null; platformMicroUsd: number | null; newSubscriptionsMicroUsd: number | null };
  eurPerUsdMicros: number | null; monthlyCapEuroMinor: number | null;
};
export const factoryComputeRate = {
  sourceUrl: "https://www.daytona.io/pricing", observedAt: OBSERVED_AT,
  cpuMicroUsdPerHour: 50_400, memoryMicroUsdPerGiBHour: 16_200,
  storageMicroUsdPerGiBHour: 108, windowsMicroUsdPerCpuHour: 85_800,
};
export function newFactoryScenario(makerId = "sol"): FactoryCostScenario {
  const rate = factoryModelRates.find((item) => item.id === makerId);
  if (!rate) throw new Error("Unknown maker rate.");
  const stage = (model: ModelRate, input: number, output: number): StageAssumptions => ({ rate: { ...model }, freshInputTokens: input, cacheWriteTokens: 0, cacheCandidateTokens: 0, outputTokens: output, cacheHitBps: 0, apiShareBps: 10_000 });
  return {
    schema: FACTORY_COST_SCHEMA, missionsPerDay: 8, workDays: 22, repairBps: 2_500, acceptanceBps: 8_000,
    maker: stage(rate, 50_000, 10_000), reviewer: stage(factoryModelRates[makerId === "sol" ? 0 : 1], 10_000, 2_000),
    compute: { ...factoryComputeRate, slots: 2, activeHoursPerSlot: 30, retainedHoursPerSlot: 730, vcpu: 2, memoryGiB: 4, diskGiB: 15, os: "linux" },
    fees: { toolsMicroUsd: 5_000_000, browserMicroUsd: 0, platformMicroUsd: 0, newSubscriptionsMicroUsd: 0 },
    eurPerUsdMicros: 920_000, monthlyCapEuroMinor: 10_000,
  };
}
function record(value: unknown): value is Record<string, unknown> { return !!value && typeof value === "object" && !Array.isArray(value); }
function exact(value: Record<string, unknown>, fields: string[]) { return Object.keys(value).length === fields.length && fields.every((field) => Object.hasOwn(value, field)); }
function integer(value: unknown, maximum: number, minimum = 0): value is number { return typeof value === "number" && Number.isSafeInteger(value) && value >= minimum && value <= maximum; }
function date(value: unknown): value is string { return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value) && Number.isFinite(Date.parse(value)) && new Date(value).toISOString().slice(0, 10) === value; }
function nullable(value: unknown, maximum: number, minimum = 0) { return value === null || integer(value, maximum, minimum); }
function readRate(value: unknown): ModelRate | null {
  if (!record(value) || !exact(value, ["id", "label", "provider", "sourceUrl", "observedAt", "inputMicroUsdPerMillion", "outputMicroUsdPerMillion", "cacheReadMicroUsdPerMillion", "cacheWriteMicroUsdPerMillion"])) return null;
  const known = factoryModelRates.find((rate) => rate.id === value.id);
  if (!known || value.label !== known.label || value.provider !== known.provider || value.sourceUrl !== known.sourceUrl || !date(value.observedAt)) return null;
  if (!integer(value.inputMicroUsdPerMillion, 1_000_000_000) || !integer(value.outputMicroUsdPerMillion, 1_000_000_000) || !nullable(value.cacheReadMicroUsdPerMillion, 1_000_000_000) || !nullable(value.cacheWriteMicroUsdPerMillion, 1_000_000_000)) return null;
  return { id: known.id, label: known.label, provider: known.provider, sourceUrl: known.sourceUrl, observedAt: value.observedAt,
    inputMicroUsdPerMillion: value.inputMicroUsdPerMillion, outputMicroUsdPerMillion: value.outputMicroUsdPerMillion,
    cacheReadMicroUsdPerMillion: value.cacheReadMicroUsdPerMillion as number | null, cacheWriteMicroUsdPerMillion: value.cacheWriteMicroUsdPerMillion as number | null };
}
function readStage(value: unknown): StageAssumptions | null {
  if (!record(value) || !exact(value, ["rate", "freshInputTokens", "cacheWriteTokens", "cacheCandidateTokens", "outputTokens", "cacheHitBps", "apiShareBps"])) return null;
  const rate = readRate(value.rate);
  if (!rate || ![value.freshInputTokens, value.cacheWriteTokens, value.cacheCandidateTokens, value.outputTokens].every((number) => integer(number, 10_000_000)) || !integer(value.cacheHitBps, 10_000) || !integer(value.apiShareBps, 10_000)) return null;
  return { rate, freshInputTokens: value.freshInputTokens as number, cacheWriteTokens: value.cacheWriteTokens as number, cacheCandidateTokens: value.cacheCandidateTokens as number, outputTokens: value.outputTokens as number, cacheHitBps: value.cacheHitBps, apiShareBps: value.apiShareBps };
}
export function readFactoryScenario(value: unknown): FactoryCostScenario | null {
  if (!record(value) || !exact(value, ["schema", "missionsPerDay", "workDays", "repairBps", "acceptanceBps", "maker", "reviewer", "compute", "fees", "eurPerUsdMicros", "monthlyCapEuroMinor"]) || value.schema !== FACTORY_COST_SCHEMA) return null;
  if (!integer(value.missionsPerDay, 1_000) || !integer(value.workDays, 31, 1) || !integer(value.repairBps, 30_000) || !integer(value.acceptanceBps, 10_000) || !nullable(value.eurPerUsdMicros, 100_000_000, 1) || !nullable(value.monthlyCapEuroMinor, 100_000_000)) return null;
  const maker = readStage(value.maker), reviewer = readStage(value.reviewer);
  const compute = value.compute, fees = value.fees;
  if (!maker || !reviewer || !record(compute) || !exact(compute, ["sourceUrl", "observedAt", "cpuMicroUsdPerHour", "memoryMicroUsdPerGiBHour", "storageMicroUsdPerGiBHour", "windowsMicroUsdPerCpuHour", "slots", "activeHoursPerSlot", "retainedHoursPerSlot", "vcpu", "memoryGiB", "diskGiB", "os"])) return null;
  if (compute.sourceUrl !== factoryComputeRate.sourceUrl || !date(compute.observedAt) || ![compute.cpuMicroUsdPerHour, compute.memoryMicroUsdPerGiBHour, compute.storageMicroUsdPerGiBHour, compute.windowsMicroUsdPerCpuHour].every((number) => integer(number, 1_000_000_000))) return null;
  if (!integer(compute.slots, 100) || !integer(compute.activeHoursPerSlot, 744) || !integer(compute.retainedHoursPerSlot, 744) || compute.activeHoursPerSlot > compute.retainedHoursPerSlot || !integer(compute.vcpu, 64, 1) || !integer(compute.memoryGiB, 512, 1) || !integer(compute.diskGiB, 10_000) || !["linux", "windows"].includes(compute.os as string)) return null;
  if (!record(fees) || !exact(fees, ["toolsMicroUsd", "browserMicroUsd", "platformMicroUsd", "newSubscriptionsMicroUsd"]) || !Object.values(fees).every((number) => nullable(number, 1_000_000_000_000))) return null;
  // Exact keys plus explicit copies keep imported configuration separate from execution directives.
  return {
    schema: FACTORY_COST_SCHEMA, missionsPerDay: value.missionsPerDay, workDays: value.workDays, repairBps: value.repairBps, acceptanceBps: value.acceptanceBps, maker, reviewer,
    compute: { sourceUrl: factoryComputeRate.sourceUrl, observedAt: compute.observedAt, cpuMicroUsdPerHour: compute.cpuMicroUsdPerHour as number, memoryMicroUsdPerGiBHour: compute.memoryMicroUsdPerGiBHour as number, storageMicroUsdPerGiBHour: compute.storageMicroUsdPerGiBHour as number, windowsMicroUsdPerCpuHour: compute.windowsMicroUsdPerCpuHour as number, slots: compute.slots, activeHoursPerSlot: compute.activeHoursPerSlot, retainedHoursPerSlot: compute.retainedHoursPerSlot, vcpu: compute.vcpu, memoryGiB: compute.memoryGiB, diskGiB: compute.diskGiB, os: compute.os as "linux" | "windows" },
    fees: { toolsMicroUsd: fees.toolsMicroUsd as number | null, browserMicroUsd: fees.browserMicroUsd as number | null, platformMicroUsd: fees.platformMicroUsd as number | null, newSubscriptionsMicroUsd: fees.newSubscriptionsMicroUsd as number | null },
    eurPerUsdMicros: value.eurPerUsdMicros as number | null, monthlyCapEuroMinor: value.monthlyCapEuroMinor as number | null,
  };
}

// Integer rate units and rational arithmetic preserve sub-cent token rates across all attempts.
// Only presentation amounts are rounded. These figures are scenarios, not billing ledgers.
type Rational = { n: bigint; d: bigint };
function rational(n: bigint, d = BigInt(1)): Rational {
  let a = n, b = d;
  while (b !== BigInt(0)) { const remainder = a % b; a = b; b = remainder; }
  return { n: n / (a || BigInt(1)), d: d / (a || BigInt(1)) };
}
const times = (value: Rational, n: number, d = 1): Rational => rational(value.n * BigInt(n), value.d * BigInt(d));
const plus = (left: Rational, right: Rational): Rational => rational(left.n * right.d + right.n * left.d, left.d * right.d);
function rounded(value: Rational): bigint { return (value.n * BigInt(2) + value.d) / (value.d * BigInt(2)); }
function stageCost(stage: StageAssumptions): Rational {
  const rate = stage.rate;
  const freshAndWrite = BigInt(stage.freshInputTokens) * BigInt(rate.inputMicroUsdPerMillion) + BigInt(stage.cacheWriteTokens) * BigInt(rate.cacheWriteMicroUsdPerMillion ?? rate.inputMicroUsdPerMillion) + BigInt(stage.outputTokens) * BigInt(rate.outputMicroUsdPerMillion);
  const cacheRate = BigInt(10_000 - stage.cacheHitBps) * BigInt(rate.inputMicroUsdPerMillion) + BigInt(stage.cacheHitBps) * BigInt(rate.cacheReadMicroUsdPerMillion ?? rate.inputMicroUsdPerMillion);
  return rational(freshAndWrite * BigInt(10_000) + BigInt(stage.cacheCandidateTokens) * cacheRate, BigInt(10_000_000_000));
}
export function calculateFactoryScenario(value: FactoryCostScenario, now = new Date().toISOString().slice(0, 10)) {
  const plan = readFactoryScenario(value);
  if (!plan || !date(now)) throw new Error("Factory assumptions are outside supported ranges.");
  const missions = plan.missionsPerDay * plan.workDays;
  const withAttempts = (stage: StageAssumptions) => times(times(stageCost(stage), missions), 10_000 + plan.repairBps, 10_000);
  const makerEquivalent = withAttempts(plan.maker), reviewerEquivalent = withAttempts(plan.reviewer);
  const makerApi = times(makerEquivalent, plan.maker.apiShareBps, 10_000), reviewerApi = times(reviewerEquivalent, plan.reviewer.apiShareBps, 10_000);
  const c = plan.compute;
  const activeHours = c.slots * c.activeHoursPerSlot;
  const compute = rational(BigInt(activeHours) * (BigInt(c.vcpu) * BigInt(c.cpuMicroUsdPerHour) + BigInt(c.memoryGiB) * BigInt(c.memoryMicroUsdPerGiBHour) + (c.os === "windows" ? BigInt(c.vcpu) * BigInt(c.windowsMicroUsdPerCpuHour) : BigInt(0))));
  // Charge every retained GiB; no free allowance is silently pooled across sandboxes.
  const storage = rational(BigInt(c.slots) * BigInt(c.diskGiB) * BigInt(c.retainedHoursPerSlot) * BigInt(c.storageMicroUsdPerGiBHour));
  const feeSum = Object.values(plan.fees).reduce((sum: Rational, fee) => plus(sum, rational(BigInt(fee ?? 0))), rational(BigInt(0)));
  const known = [makerApi, reviewerApi, compute, storage, feeSum].reduce(plus, rational(BigInt(0)));
  const missing = Object.entries(plan.fees).filter(([, amount]) => amount === null).map(([key]) => key);
  function amount(cost: Rational) {
    const euroMinor = plan!.eurPerUsdMicros === null ? null : Number(rounded(times(cost, plan!.eurPerUsdMicros, 10_000_000_000)));
    return { usd: Number(cost.n) / Number(cost.d) / 1_000_000, usdMicros: rounded(cost).toString(), euroMinor: euroMinor !== null && Number.isSafeInteger(euroMinor) ? euroMinor : null };
  }
  const warnings: string[] = [];
  const independentProvider = plan.maker.rate.provider !== plan.reviewer.rate.provider;
  if (!independentProvider) warnings.push("Maker and reviewer use the same provider; the independent-provider requirement is unmet.");
  if (plan.maker.apiShareBps < 10_000 || plan.reviewer.apiShareBps < 10_000) warnings.push("The native share is an assumption. Entitlement, remaining quota and runnable authentication still need separate evidence; no pooled API tokens are granted.");
  for (const stage of [plan.maker, plan.reviewer]) {
    const bundled = factoryModelRates.find((rate) => rate.id === stage.rate.id)!;
    if (JSON.stringify(stage.rate) !== JSON.stringify(bundled)) warnings.push(`${stage.rate.label}: imported rate assumptions differ from the bundled dated observation. Verify them before purchasing or dispatching.`);
    const age = (Date.parse(now) - Date.parse(stage.rate.observedAt)) / 86_400_000;
    if (age < 0 || age > 30) warnings.push(`${stage.rate.label}: rate evidence is future-dated or older than 30 days.`);
    if (stage.cacheCandidateTokens > 0 && stage.cacheHitBps > 0) warnings.push(`${stage.rate.label}: cache hits are a provider-local assumption, not shared cache or measured savings.`);
  }
  if (Object.keys(factoryComputeRate).some((key) => c[key as keyof typeof factoryComputeRate] !== factoryComputeRate[key as keyof typeof factoryComputeRate])) warnings.push("Imported compute rates differ from the bundled dated observation. Verify the billing region and terms.");
  const computeAge = (Date.parse(now) - Date.parse(c.observedAt)) / 86_400_000;
  if (computeAge < 0 || computeAge > 30) warnings.push("Compute-rate evidence is future-dated or older than 30 days.");
  const expectedAccepted = missions * plan.acceptanceBps / 10_000;
  const knownAmount = amount(known);
  const modeledSubtotal = missing.length ? null : knownAmount;
  const acceptedCost = missing.length || expectedAccepted === 0 ? null : amount(times(known, 10_000, missions * plan.acceptanceBps));
  const overCap = missing.length || plan.monthlyCapEuroMinor === null || plan.eurPerUsdMicros === null ? null : known.n * BigInt(plan.eurPerUsdMicros) > BigInt(plan.monthlyCapEuroMinor) * known.d * BigInt(10_000_000_000);
  return {
    measured: false as const, executable: false as const, currency: "USD" as const,
    plannedMissions: missions, expectedAttempts: missions * (10_000 + plan.repairBps) / 10_000, expectedAccepted, independentProvider,
    makerApi: amount(makerApi), reviewerApi: amount(reviewerApi), allApiEquivalent: amount(plus(makerEquivalent, reviewerEquivalent)),
    compute: amount(compute), retainedStorage: amount(storage), fees: amount(feeSum), knownSubtotal: knownAmount, modeledSubtotal, costPerExpectedAccepted: acceptedCost,
    missing, warnings, overCap, scope: "Incremental scenario before tax, egress and unlisted services. Existing software/cloud amounts and hardware purchases are separate. Bundled model rates use standard processing and short context; long context, premium speeds and regional uplifts need matching rates. Repair and acceptance are hypothetical; this is neither an invoice nor runtime admission.",
  };
}
