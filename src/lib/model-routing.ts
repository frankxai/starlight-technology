import type { ModelClass, RiskClass } from "./agentic-engine";

export type ModelRoute = {
  modelClass: ModelClass;
  primary: string;
  fallbacks: string[];
  maxOutputTokens: number;
  reasoning: "minimal" | "low" | "medium" | "high";
  zeroDataRetention: boolean;
};

export type ModelRoutingContext = {
  modelClass: ModelClass;
  risk: RiskClass;
  sensitive: boolean;
  maxOutputTokens?: number;
};

const routes: Record<ModelClass, Omit<ModelRoute, "zeroDataRetention">> = {
  fast_text: {
    modelClass: "fast_text",
    primary: "openai/gpt-5.6-luna",
    fallbacks: ["anthropic/claude-sonnet-5", "google/gemini-3.1-flash"],
    maxOutputTokens: 8_000,
    reasoning: "low"
  },
  frontier_reasoning: {
    modelClass: "frontier_reasoning",
    primary: "openai/gpt-5.6-sol",
    fallbacks: ["anthropic/claude-opus-5", "google/gemini-3.1-pro-preview"],
    maxOutputTokens: 24_000,
    reasoning: "high"
  },
  research: {
    modelClass: "research",
    primary: "google/gemini-3.1-pro-preview",
    fallbacks: ["openai/gpt-5.6-sol", "anthropic/claude-sonnet-5"],
    maxOutputTokens: 16_000,
    reasoning: "medium"
  },
  vision: {
    modelClass: "vision",
    primary: "google/gemini-3.1-pro-preview",
    fallbacks: ["openai/gpt-5.6-sol", "anthropic/claude-sonnet-5"],
    maxOutputTokens: 12_000,
    reasoning: "medium"
  },
  code_agent: {
    modelClass: "code_agent",
    primary: "anthropic/claude-opus-5",
    fallbacks: ["openai/gpt-5.6-sol", "anthropic/claude-sonnet-5"],
    maxOutputTokens: 32_000,
    reasoning: "high"
  },
  media: {
    modelClass: "media",
    primary: "openai/gpt-5.6-sol",
    fallbacks: ["google/gemini-3.1-pro-preview", "anthropic/claude-sonnet-5"],
    maxOutputTokens: 16_000,
    reasoning: "medium"
  }
};

export function resolveModelRoute(context: ModelRoutingContext): ModelRoute {
  const base = routes[context.modelClass];
  const hardOutputCeiling = context.risk === "critical" ? 16_000 : base.maxOutputTokens;
  return {
    ...base,
    maxOutputTokens: Math.max(1_000, Math.min(context.maxOutputTokens ?? base.maxOutputTokens, hardOutputCeiling)),
    zeroDataRetention: context.sensitive || context.risk === "critical"
  };
}

export const modelRoutingManifest = {
  id: "starlight-model-routing",
  version: "2026-09-14",
  contract: "model classes are stable; provider/model ids are replaceable policy",
  classes: Object.values(routes).map((route) => ({
    modelClass: route.modelClass,
    primary: route.primary,
    fallbacks: route.fallbacks,
    maxOutputTokens: route.maxOutputTokens,
    reasoning: route.reasoning
  }))
} as const;
