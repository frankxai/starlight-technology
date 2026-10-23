import { digitalProducts } from "@/lib/catalog/products";
import { buildRecord, configuredSinks, persistRecord } from "@/lib/shop/availability-store";

// Availability requests are written to the configured sinks (private Blob
// store and/or https endpoint) and never to this repository or the edge.
// Without any sink the route fails closed with 503 and the client offers the
// pre-filled email fallback. See docs/shop/FULFILMENT_ARCHITECTURE.md.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const maxBody = 4000;
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const noStore = { "Cache-Control": "no-store" };

export async function POST(request: Request) {
  const raw = await request.text();
  if (raw.length > maxBody) return Response.json({ error: "Request too large." }, { status: 413 });
  let body: Record<string, unknown>;
  try { body = JSON.parse(raw) as Record<string, unknown>; } catch { return Response.json({ error: "Invalid JSON." }, { status: 400 }); }
  const product = typeof body.product === "string" ? body.product : "";
  const email = typeof body.email === "string" ? body.email.trim() : "";
  if (!digitalProducts.some((item) => item.slug === product)) return Response.json({ error: "Unknown product." }, { status: 400 });
  if (!emailPattern.test(email) || email.length > 254) return Response.json({ error: "A valid email is required." }, { status: 400 });
  if (body.consent !== true) return Response.json({ error: "Consent is required to email you about availability." }, { status: 400 });
  if (configuredSinks().length === 0) return Response.json({ error: "The availability list is not storing requests yet. Use the email option; your request is pre-filled." }, { status: 503, headers: noStore });

  const record = buildRecord({
    product,
    email,
    role: typeof body.role === "string" ? body.role : "",
    useCase: typeof body.useCase === "string" ? body.useCase : "",
    interests: Array.isArray(body.interests) ? body.interests.filter((item): item is string => typeof item === "string") : []
  });
  const results = await persistRecord(record);
  const stored = results.filter((result) => result.ok).map((result) => result.sink);
  if (stored.length === 0) {
    console.error("availability: every sink failed", results.map((result) => (result.ok ? result.sink : `${result.sink}: ${result.error}`)));
    return Response.json({ error: "The request could not be recorded right now." }, { status: 502, headers: noStore });
  }
  return Response.json({ ok: true, id: record.id, stored }, { status: 202, headers: noStore });
}
