import { digitalProducts } from "@/lib/catalog/products";

// Availability requests are forwarded to a configured endpoint (for example an
// n8n webhook) and never stored in this repository or on the edge. Without a
// configured endpoint the route fails closed with 503 and the client offers
// the pre-filled email fallback. No database is introduced here.
export const runtime = "nodejs";

const maxBody = 4000;
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  const endpoint = process.env.SHOP_AVAILABILITY_ENDPOINT;
  const raw = await request.text();
  if (raw.length > maxBody) return Response.json({ error: "Request too large." }, { status: 413 });
  let body: Record<string, unknown>;
  try { body = JSON.parse(raw) as Record<string, unknown>; } catch { return Response.json({ error: "Invalid JSON." }, { status: 400 }); }
  const product = typeof body.product === "string" ? body.product : "";
  const email = typeof body.email === "string" ? body.email.trim() : "";
  if (!digitalProducts.some((item) => item.slug === product)) return Response.json({ error: "Unknown product." }, { status: 400 });
  if (!emailPattern.test(email) || email.length > 254) return Response.json({ error: "A valid email is required." }, { status: 400 });
  if (body.consent !== true) return Response.json({ error: "Consent is required to email you about availability." }, { status: 400 });
  if (!endpoint || !endpoint.startsWith("https://")) return Response.json({ error: "The availability endpoint is not configured yet. Use the email option; your request is pre-filled." }, { status: 503, headers: { "Cache-Control": "no-store" } });

  const forward = {
    kind: "availability_request",
    receivedAt: new Date().toISOString(),
    product,
    email,
    role: typeof body.role === "string" ? body.role.slice(0, 80) : "",
    useCase: typeof body.useCase === "string" ? body.useCase.slice(0, 1000) : "",
    interests: Array.isArray(body.interests) ? body.interests.filter((item): item is string => typeof item === "string").slice(0, 8) : [],
    source: "starlight.technology/shop/availability"
  };
  try {
    const response = await fetch(endpoint, { method: "POST", headers: { "content-type": "application/json", ...(process.env.SHOP_AVAILABILITY_TOKEN ? { authorization: `Bearer ${process.env.SHOP_AVAILABILITY_TOKEN}` } : {}) }, body: JSON.stringify(forward), signal: AbortSignal.timeout(8000) });
    if (!response.ok) return Response.json({ error: "The request could not be recorded right now." }, { status: 502, headers: { "Cache-Control": "no-store" } });
    return Response.json({ ok: true }, { status: 202, headers: { "Cache-Control": "no-store" } });
  } catch {
    return Response.json({ error: "The request could not be recorded right now." }, { status: 502, headers: { "Cache-Control": "no-store" } });
  }
}
