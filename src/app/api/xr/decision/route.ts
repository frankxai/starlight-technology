import { getXRAdvice, getXRDevice, parseXRSelection } from "@/lib/xr-decision";

export function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const selection = parseXRSelection({
    goal: params.get("goal"), timing: params.get("timing"), host: params.get("host")
  });
  const advice = getXRAdvice(selection);
  const device = getXRDevice(advice.deviceId)!;
  return Response.json({
    selection, advice,
    device: { id: device.id, name: device.name, status: device.status, source: device.source },
    evidenceStatus: "decision-model-inference"
  }, { headers: { "Cache-Control": "public, max-age=300" } });
}
