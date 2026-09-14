import { agenticEngineManifest } from "@/lib/agentic-engine";
import { controlStoreConfigured } from "@/lib/control-store";
import { modelRoutingManifest } from "@/lib/model-routing";
import { toolRegistryManifest } from "@/lib/tool-contracts";

export function GET() {
  const persistenceConfigured = controlStoreConfigured();
  return Response.json(
    {
      service: "starlight-technology",
      engine: agenticEngineManifest,
      tools: toolRegistryManifest,
      modelRouting: modelRoutingManifest,
      runtime: {
        executionEnabled: process.env.STARLIGHT_AGENT_RUNTIME_ENABLED === "1",
        gatewayConfigured: Boolean(process.env.AI_GATEWAY_API_KEY || process.env.VERCEL_OIDC_TOKEN),
        persistenceConfigured,
        persistence: persistenceConfigured ? "starlight-platform-eu-control-store" : "git-native-foundation",
        consequentialActions: "durable-mandate-and-approval-gated"
      }
    },
    { headers: { "Cache-Control": "public, max-age=60, s-maxage=300" } }
  );
}
