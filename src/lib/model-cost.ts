import { agentRegistry, type AgentRunRequest, type AgentStep } from "./agentic-engine";
import { resolveModelRoute, type ModelRoute } from "./model-routing";

export type ModelPrice = {
  id: string;
  inputUsdPerToken: number;
  outputUsdPerToken: number;
};

export type StepCostEnvelope = {
  route: ModelRoute;
  maxOutputTokens: number;
  maxInputTokens: number;
  maxInputUsdPerToken: number;
  maxOutputUsdPerToken: number;
  maxCostEur: number;
  usdPerEur: number;
  prices: Record<string, ModelPrice>;
  costBasis: "uncached-upper-bound";
};

type GatewayModelList = {
  data?: Array<{
    id?: string;
    pricing?: { input?: string | number; output?: string | number };
  }>;
};

let cachedPrices: { expiresAt: number; prices: Record<string, ModelPrice> } | null = null;

function finitePositive(value: unknown): number | null {
  const number = typeof value === "number" ? value : typeof value === "string" ? Number(value) : Number.NaN;
  return Number.isFinite(number) && number > 0 ? number : null;
}

export function configuredUsdPerEur(): number {
  const value = finitePositive(process.env.STARLIGHT_USD_PER_EUR);
  if (!value) throw new Error("STARLIGHT_USD_PER_EUR must be configured before agent execution");
  return value;
}

async function gatewayPrices(): Promise<Record<string, ModelPrice>> {
  if (cachedPrices && cachedPrices.expiresAt > Date.now()) return cachedPrices.prices;

  const response = await fetch("https://ai-gateway.vercel.sh/v1/models", {
    method: "GET",
    headers: { Accept: "application/json" },
    signal: AbortSignal.timeout(15_000)
  });
  if (!response.ok) throw new Error(`Unable to load AI Gateway model pricing (${response.status})`);

  const payload = (await response.json()) as GatewayModelList;
  const prices: Record<string, ModelPrice> = {};
  for (const model of payload.data ?? []) {
    if (!model.id) continue;
    const input = finitePositive(model.pricing?.input);
    const output = finitePositive(model.pricing?.output);
    if (!input || !output) continue;
    prices[model.id] = { id: model.id, inputUsdPerToken: input, outputUsdPerToken: output };
  }
  cachedPrices = { expiresAt: Date.now() + 60 * 60 * 1_000, prices };
  return prices;
}

export async function getStepCostEnvelope(request: AgentRunRequest, step: AgentStep): Promise<StepCostEnvelope> {
  const agent = agentRegistry[step.agentId];
  if (!agent) throw new Error(`Unknown agent: ${step.agentId}`);
  const route = resolveModelRoute({ modelClass: agent.modelClass, risk: request.risk, sensitive: request.risk === "critical" });
  const prices = await gatewayPrices();
  const routeIds = [route.primary, ...route.fallbacks];
  const missing = routeIds.filter((id) => !prices[id]);
  if (missing.length > 0) throw new Error(`Missing current AI Gateway pricing for: ${missing.join(", ")}`);

  const usdPerEur = configuredUsdPerEur();
  const maxOutputTokens = Math.min(route.maxOutputTokens, Math.max(1_000, Math.floor(step.tokenBudget * 0.35)));
  const maxInputTokens = step.tokenBudget;
  const maxInputUsdPerToken = Math.max(...routeIds.map((id) => prices[id].inputUsdPerToken));
  const maxOutputUsdPerToken = Math.max(...routeIds.map((id) => prices[id].outputUsdPerToken));

  // Maximize the linear token-cost function over the allowed output interval [0, maxOutputTokens].
  // This remains conservative even when the actual prompt is much larger than the nominal 65/35 split.
  const allInputCostUsd = step.tokenBudget * maxInputUsdPerToken;
  const maxOutputMixCostUsd =
    (step.tokenBudget - maxOutputTokens) * maxInputUsdPerToken +
    maxOutputTokens * maxOutputUsdPerToken;
  const maxCostUsd = Math.max(allInputCostUsd, maxOutputMixCostUsd);

  return {
    route,
    maxOutputTokens,
    maxInputTokens,
    maxInputUsdPerToken,
    maxOutputUsdPerToken,
    maxCostEur: maxCostUsd / usdPerEur,
    usdPerEur,
    prices,
    costBasis: "uncached-upper-bound"
  };
}

export function accountModelCostEur(args: {
  model: string;
  inputTokens: number;
  outputTokens: number;
  envelope: StepCostEnvelope;
}): number {
  const price = args.envelope.prices[args.model];
  const inputRate = price?.inputUsdPerToken ?? args.envelope.maxInputUsdPerToken;
  const outputRate = price?.outputUsdPerToken ?? args.envelope.maxOutputUsdPerToken;
  const usd = args.inputTokens * inputRate + args.outputTokens * outputRate;
  return usd / args.envelope.usdPerEur;
}
