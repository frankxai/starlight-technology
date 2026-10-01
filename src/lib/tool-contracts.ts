import type { AuthorityLevel } from "./agentic-engine";

export type ToolSideEffect = "none" | "reversible" | "consequential";
export type ToolRuntime = "vercel" | "sandbox" | "workflow" | "railway" | "cloudflare" | "external";

export type ToolContract = {
  id: string;
  description: string;
  authority: AuthorityLevel;
  sideEffect: ToolSideEffect;
  runtime: ToolRuntime;
  idempotent: boolean;
  approval: "never" | "policy" | "always";
  defaultTimeoutMs: number;
  maxCostEur: number;
  dataClass: "public" | "tenant" | "sensitive";
  enabledByDefault: boolean;
};

const tools: ToolContract[] = [
  { id: "memory.read", description: "Read scoped working/episodic/semantic/policy memory.", authority: "observe", sideEffect: "none", runtime: "vercel", idempotent: true, approval: "never", defaultTimeoutMs: 5_000, maxCostEur: 0.01, dataClass: "tenant", enabledByDefault: true },
  { id: "registry.read", description: "Read agent/tool/model registry metadata.", authority: "observe", sideEffect: "none", runtime: "vercel", idempotent: true, approval: "never", defaultTimeoutMs: 2_000, maxCostEur: 0, dataClass: "public", enabledByDefault: true },
  { id: "run.inspect", description: "Inspect scoped run state and receipts.", authority: "observe", sideEffect: "none", runtime: "vercel", idempotent: true, approval: "never", defaultTimeoutMs: 5_000, maxCostEur: 0, dataClass: "tenant", enabledByDefault: true },
  { id: "policy.read", description: "Read active Starlight policy and mandate records.", authority: "observe", sideEffect: "none", runtime: "vercel", idempotent: true, approval: "never", defaultTimeoutMs: 5_000, maxCostEur: 0, dataClass: "tenant", enabledByDefault: true },
  { id: "evidence.read", description: "Read approved evidence records and provenance.", authority: "observe", sideEffect: "none", runtime: "vercel", idempotent: true, approval: "never", defaultTimeoutMs: 5_000, maxCostEur: 0.01, dataClass: "tenant", enabledByDefault: true },
  { id: "catalog.read", description: "Read governed product/capability catalog records.", authority: "observe", sideEffect: "none", runtime: "vercel", idempotent: true, approval: "never", defaultTimeoutMs: 5_000, maxCostEur: 0.01, dataClass: "public", enabledByDefault: true },
  { id: "benchmark.read", description: "Read benchmark/evaluation records with provenance.", authority: "observe", sideEffect: "none", runtime: "vercel", idempotent: true, approval: "never", defaultTimeoutMs: 5_000, maxCostEur: 0.01, dataClass: "public", enabledByDefault: true },
  { id: "offer.read", description: "Read timestamped merchant/provider offers.", authority: "observe", sideEffect: "none", runtime: "vercel", idempotent: true, approval: "never", defaultTimeoutMs: 5_000, maxCostEur: 0.01, dataClass: "public", enabledByDefault: true },
  { id: "asset.read", description: "Read governed asset metadata and manifests.", authority: "observe", sideEffect: "none", runtime: "vercel", idempotent: true, approval: "never", defaultTimeoutMs: 5_000, maxCostEur: 0.01, dataClass: "tenant", enabledByDefault: true },
  { id: "test.read", description: "Read test/eval results.", authority: "observe", sideEffect: "none", runtime: "vercel", idempotent: true, approval: "never", defaultTimeoutMs: 5_000, maxCostEur: 0, dataClass: "tenant", enabledByDefault: true },
  { id: "calculator", description: "Deterministic arithmetic/economic calculations.", authority: "observe", sideEffect: "none", runtime: "vercel", idempotent: true, approval: "never", defaultTimeoutMs: 1_000, maxCostEur: 0, dataClass: "public", enabledByDefault: true },

  { id: "web.search", description: "Search the public web through an approved research provider.", authority: "research", sideEffect: "none", runtime: "external", idempotent: false, approval: "policy", defaultTimeoutMs: 30_000, maxCostEur: 0.25, dataClass: "public", enabledByDefault: true },
  { id: "supplier.search", description: "Discover approved suppliers/providers and current evidence.", authority: "research", sideEffect: "none", runtime: "workflow", idempotent: false, approval: "policy", defaultTimeoutMs: 60_000, maxCostEur: 0.5, dataClass: "public", enabledByDefault: true },

  { id: "rfq.draft", description: "Produce an RFQ/message draft without sending it.", authority: "draft", sideEffect: "none", runtime: "vercel", idempotent: true, approval: "never", defaultTimeoutMs: 15_000, maxCostEur: 0.2, dataClass: "tenant", enabledByDefault: true },
  { id: "repo.read", description: "Read an explicitly scoped repository.", authority: "research", sideEffect: "none", runtime: "external", idempotent: true, approval: "policy", defaultTimeoutMs: 30_000, maxCostEur: 0.05, dataClass: "tenant", enabledByDefault: true },
  { id: "sandbox.run", description: "Execute bounded untrusted code in an isolated sandbox.", authority: "draft", sideEffect: "reversible", runtime: "sandbox", idempotent: false, approval: "policy", defaultTimeoutMs: 300_000, maxCostEur: 2, dataClass: "tenant", enabledByDefault: false },
  { id: "test.run", description: "Run bounded verification commands in an isolated workspace.", authority: "draft", sideEffect: "reversible", runtime: "sandbox", idempotent: false, approval: "policy", defaultTimeoutMs: 300_000, maxCostEur: 2, dataClass: "tenant", enabledByDefault: false },
  { id: "media.generate", description: "Generate image/video/audio assets through an approved provider.", authority: "draft", sideEffect: "reversible", runtime: "external", idempotent: false, approval: "policy", defaultTimeoutMs: 300_000, maxCostEur: 10, dataClass: "tenant", enabledByDefault: false },
  { id: "render.request", description: "Queue a governed media/render job.", authority: "draft", sideEffect: "reversible", runtime: "workflow", idempotent: true, approval: "policy", defaultTimeoutMs: 30_000, maxCostEur: 25, dataClass: "tenant", enabledByDefault: false },

  { id: "repo.write", description: "Write code to an explicitly scoped branch/PR; never direct-to-production.", authority: "external-write", sideEffect: "reversible", runtime: "external", idempotent: false, approval: "always", defaultTimeoutMs: 60_000, maxCostEur: 0.1, dataClass: "tenant", enabledByDefault: false },
  { id: "deploy.request", description: "Request a preview or production deployment through governed Git/Vercel flow.", authority: "deploy", sideEffect: "consequential", runtime: "external", idempotent: false, approval: "always", defaultTimeoutMs: 300_000, maxCostEur: 5, dataClass: "tenant", enabledByDefault: false },
  { id: "purchase.execute", description: "Execute an approved purchase against a fixed offer and spend ceiling.", authority: "purchase", sideEffect: "consequential", runtime: "external", idempotent: true, approval: "always", defaultTimeoutMs: 120_000, maxCostEur: 50_000, dataClass: "sensitive", enabledByDefault: false },
  { id: "settlement.execute", description: "Settle an approved commercial obligation through a configured payment rail.", authority: "settlement", sideEffect: "consequential", runtime: "external", idempotent: true, approval: "always", defaultTimeoutMs: 120_000, maxCostEur: 50_000, dataClass: "sensitive", enabledByDefault: false }
];

export const toolRegistry = Object.fromEntries(tools.map((tool) => [tool.id, tool])) as Record<string, ToolContract>;

export function validateToolSelection(toolIds: string[], allowedAuthorities: AuthorityLevel[]): string[] {
  const failures: string[] = [];
  for (const id of toolIds) {
    const tool = toolRegistry[id];
    if (!tool) {
      failures.push(`unknown tool: ${id}`);
      continue;
    }
    if (!allowedAuthorities.includes(tool.authority) && tool.authority !== "observe") {
      failures.push(`tool authority not granted: ${id} requires ${tool.authority}`);
    }
  }
  return failures;
}

export const toolRegistryManifest = {
  id: "starlight-tool-registry",
  version: "2026-09-14",
  tools: tools.map(({ id, description, authority, sideEffect, runtime, idempotent, approval, maxCostEur, dataClass, enabledByDefault }) => ({
    id, description, authority, sideEffect, runtime, idempotent, approval, maxCostEur, dataClass, enabledByDefault
  }))
} as const;
