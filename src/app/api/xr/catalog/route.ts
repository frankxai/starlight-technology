import { xrDevices } from "@/lib/xr-catalog";

export const dynamic = "force-static";
export function GET() {
  return Response.json({
    schema: "https://starlight.technology/api/xr/catalog",
    version: "2026-09-24",
    evidenceStatus: "source-backed-research",
    notice: "Manufacturer claims and editorial inferences; no verified local merchant offers or hands-on testing.",
    devices: xrDevices
  }, { headers: { "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400" } });
}
