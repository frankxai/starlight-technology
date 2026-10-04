import { calculateFactoryScenario, readFactoryScenario, type FactoryCostScenario, type StageAssumptions } from "./ai-factory-costs";

const observedAt = "2026-10-03";
const sourceCatalog = {
  codex: { id: "codex", label: "Codex usage and surfaces", url: "https://developers.openai.com/codex/pricing", observedAt },
  codexCloud: { id: "codex-cloud", label: "Codex cloud environments", url: "https://developers.openai.com/codex/cloud", observedAt },
  claude: { id: "claude", label: "Claude Code authentication and product use", url: "https://code.claude.com/docs/en/legal-and-compliance", observedAt },
  claudeCloud: { id: "claude-cloud", label: "Claude managed cloud", url: "https://code.claude.com/docs/en/claude-code-on-the-web", observedAt },
  claudeHosted: { id: "claude-hosted", label: "Claude self-hosted environments", url: "https://code.claude.com/docs/en/self-hosted-environments", observedAt },
  claudeRemote: { id: "claude-remote", label: "Claude Remote Control", url: "https://code.claude.com/docs/en/remote-control", observedAt },
  glm: { id: "glm", label: "GLM coding-plan tool and quota boundaries", url: "https://docs.z.ai/devpack/faq", observedAt },
  kimi: { id: "kimi-code", label: "Kimi Code new and legacy membership limits", url: "https://www.kimi.com/code/docs/en/kimi-code/membership.html", observedAt: "2026-10-04" },
  kimiCache: { id: "kimi-cache", label: "Kimi API cache pricing and TTL configuration", url: "https://platform.kimi.ai/docs/guide/context-caching", observedAt: "2026-10-04" },
  kimiOutput: { id: "kimi-output", label: "Published K3 output pricing", url: "https://www.kimi.com/en/blog/kimi-k3", observedAt: "2026-10-04" },
} as const;
type Source = typeof sourceCatalog[keyof typeof sourceCatalog];
type Route = {
  id: string; label: string; executionLocation: "provider-cloud" | "customer-host";
  relievesLocalCompute: boolean | null; accountAccess: "unverified"; requirement: string; sourceId: string;
};

function stageRoutes(role: "maker" | "reviewer", stage: StageAssumptions) {
  const route = (id: string, label: string, executionLocation: Route["executionLocation"], requirement: string, source: Source, relievesLocalCompute: boolean | null): Route =>
    ({ id, label, executionLocation, requirement, sourceId: source.id, relievesLocalCompute, accountAccess: "unverified" });
  let nativeRoutes: Route[];
  let apiRequirement: string;
  let sources: Source[];
  switch (stage.rate.provider) {
    case "openai":
      sources = [sourceCatalog.codex, sourceCatalog.codexCloud];
      nativeRoutes = [
        route("codex-local", "Codex CLI on your machine", "customer-host", "Eligible ChatGPT sign-in and remaining shared local/cloud allowance. Confirm the selected model in this account.", sourceCatalog.codex, false),
        route("codex-cloud", "Codex managed cloud", "provider-cloud", "Published repository environment, permitted network/tools and remaining shared allowance. Each task has a separate workspace; exact model availability needs verification.", sourceCatalog.codexCloud, true),
      ];
      apiRequirement = "Customer-owned OpenAI API billing and a permitted worker. ChatGPT plan allowance is not assumed to fund this API route.";
      break;
    case "anthropic":
      sources = [sourceCatalog.claude, sourceCatalog.claudeCloud, sourceCatalog.claudeHosted, sourceCatalog.claudeRemote];
      nativeRoutes = [
        route("claude-local", "Unmodified Claude Code on your host", "customer-host", "Your own eligible sign-in through Anthropic. Hosted product use has separate commercial requirements; credentials remain with their owner.", sourceCatalog.claude, null),
        route("claude-cloud", "Claude managed cloud", "provider-cloud", "Pro/Max, Team or an eligible Enterprise seat, repository access and configured cloud environment. Account/model access and remaining allowance are unverified.", sourceCatalog.claudeCloud, true),
        route("claude-self-hosted", "Claude self-hosted cloud beta", "customer-host", "Team or Enterprise organization with owner enablement; Pro/Max does not provide this beta. Organization usage and your runner compute are separate resources.", sourceCatalog.claudeHosted, null),
        route("claude-remote-control", "Claude Remote Control", "customer-host", "Eligible Pro/Max/Team/Enterprise sign-in and an awake host. Code and filesystem access stay on that host; steering it remotely does not move its compute.", sourceCatalog.claudeRemote, false),
      ];
      apiRequirement = "Product/Agent SDK workers use customer-owned API or supported inference-provider authentication and billing.";
      break;
    case "zai":
      sources = [sourceCatalog.glm];
      nativeRoutes = [route("glm-coding-plan", "GLM Coding Plan in supported tools", "customer-host", "Use only officially supported coding tools/products and their plan endpoint. All tools share 5-hour and weekly limits; confirm host/tool eligibility.", sourceCatalog.glm, null)];
      apiRequirement = "General API workers require a separate metered API route. Coding-plan quota is limited to supported tools and is not an API balance.";
      break;
    case "moonshot":
      sources = [sourceCatalog.kimi, sourceCatalog.kimiCache, sourceCatalog.kimiOutput];
      nativeRoutes = [route("kimi-code", "Kimi Code in supported coding hosts", "customer-host", "K3 requires new Plus or above, or legacy Moderato or above; Go includes no Code quota. New plans share a rolling 5-hour limit and monthly total, with no weekly limit. Legacy plans retain the weekly limit as well. Devices and supported tools share the applicable account pool. New Pro or legacy Allegretto is required for 1M context/High Speed. Verify this host, model and account. Extra Usage can spend prepaid funds when enabled; this plan does not enable it.", sourceCatalog.kimi, null)];
      apiRequirement = "General workers use a separate metered Kimi API account and route. Membership/Code quota does not fund API credits. Configure the selected cache TTL explicitly; the Messages API requires top-level cache_control to write. No paid fallback is enabled by this plan.";
      break;
    default:
      throw new Error("This provider has no documented runtime route.");
  }
  const apiRoute = route(`${stage.rate.provider}-api`, "Customer-owned metered API worker", "customer-host", apiRequirement, stage.rate.provider === "moonshot" ? sourceCatalog.kimiCache : sources[0], null);
  return { role, modelId: stage.rate.id, model: stage.rate.label, provider: stage.rate.provider,
    apiShareBps: stage.apiShareBps, nativeShareBps: 10000 - stage.apiShareBps,
    accountAccess: "unverified" as const, apiRoute, nativeRoutes, sources };
}

/** Sourced deployment choices and a matched contingency, never an entitlement or dispatcher. */
export function planFactoryRuntime(scenario: FactoryCostScenario, asOf = new Date().toISOString().slice(0, 10)) {
  const checked = readFactoryScenario(scenario);
  if (!checked) throw new Error("Factory assumptions are outside supported ranges.");
  scenario = checked;
  const current = calculateFactoryScenario(scenario, asOf);
  const meteredContingency = calculateFactoryScenario({ ...scenario,
    maker: { ...scenario.maker, apiShareBps: 10000 }, reviewer: { ...scenario.reviewer, apiShareBps: 10000 } }, asOf);
  const stages = [stageRoutes("maker", scenario.maker), stageRoutes("reviewer", scenario.reviewer)];
  const sources = [...new Map(stages.flatMap((stage) => stage.sources).map((source) => [source.id, source])).values()];
  const sourceAges = sources.map((source) => (Date.parse(asOf) - Date.parse(source.observedAt)) / 86400000);
  const sourceAgeStatus = sourceAges.some((age) => age < 0) ? "future" as const : sourceAges.some((age) => age > 30) ? "older-than-window" as const : "within-window" as const;
  const nativeUsePlanned = current.plannedMissions > 0 && stages.some((stage) => stage.nativeShareBps > 0);
  const warnings = [
    "Runtime choices are documented possibilities. Account access, quota, exact model, permissions and actual execution are unverified.",
    "A managed cloud route does not consume the modeled Daytona slots automatically. Recalculate tool compute for the chosen host; this comparison keeps it unchanged.",
    "The metered contingency is a comparison only. It does not authorize fallback spending or dispatch.",
  ];
  if (nativeUsePlanned) warnings.push("Your native share depends on fresh entitlement, the lowest remaining quota window and runnable authentication. API-equivalent tokens or dollars are not subscription credits or cash savings.");
  if (!current.independentProvider) warnings.push("Choose a different provider for the reviewer before an independent provider review is possible.");
  if (sourceAgeStatus !== "within-window") warnings.push("Runtime documentation observations are future-dated or older than 30 days. Imported price dates cannot refresh them.");
  if (scenario.compute.slots === 0 && current.plannedMissions > 0) warnings.push("No remote tool slots are modeled. A managed cloud environment or another admitted host still needs its own tools and capacity evidence.");
  return {
    schema: "StarlightFactoryRuntimePlan.v1" as const, asOf, executionAuthorized: false as const,
    nativeUsePlanned, independentProvider: current.independentProvider, sourceAgeStatus,
    stages: stages.map(({ sources: _sources, ...stage }) => { void _sources; return stage; }), sources,
    current, meteredContingency,
    toolCompute: { provider: "Daytona rate scenario", plannedSlots: scenario.compute.slots, admittedSlots: null,
      os: scenario.compute.os, vcpuPerSlot: scenario.compute.vcpu, memoryGiBPerSlot: scenario.compute.memoryGiB,
      activeHours: scenario.compute.slots * scenario.compute.activeHoursPerSlot,
      retainedGiBHours: scenario.compute.slots * scenario.compute.diskGiB * scenario.compute.retainedHoursPerSlot,
      modelInference: "provider-remote" as const },
    controlRoles: [
      { role: "Dispatcher", output: "Bounded task with owner, budget, checkpoint and stop condition", activatedByThisPlan: false },
      { role: "Maker", output: "Useful artifact and execution/recovery receipt", activatedByThisPlan: false },
      { role: "Independent reviewer", output: "Exact-revision findings and acceptance evidence", activatedByThisPlan: false },
      { role: "Integrator", output: "Verified merge/release through the existing authority", activatedByThisPlan: false },
    ],
    warnings,
  };
}
export type FactoryRuntimePlan = ReturnType<typeof planFactoryRuntime>;
