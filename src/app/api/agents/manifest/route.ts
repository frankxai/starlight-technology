import { agenticEngineManifest } from "@/lib/agentic-engine";
import { modelRoutingManifest } from "@/lib/model-routing";

export function GET() {
  return Response.json(
    {
      service: "starlight-technology",
      engine: agenticEngineManifest,
      modelRouting: modelRoutingManifest,
      runtime: {
        executionEnabled: process.env.STARLIGHT_AGENT_RUNTIME_ENABLED === "1",
        gatewayConfigured: Boolean(process.env.AI_GATEWAY_API_KEY || process.env.VERCEL_OIDC_TOKEN),
        persistence: "git-native-foundation",
        consequentialActions: "approval-gated"
      }
    },
    { headers: { "Cache-Control": "public, max-age=60, s-maxage=300" } }
  );
}
