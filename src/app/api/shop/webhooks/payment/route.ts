import { auditEntry, idempotencyKey, verifyWebhookSignature } from "@/lib/commerce/entitlements";

// Payment webhook receiver. Fail closed: without a configured secret every
// delivery is rejected with 503 and nothing is processed. With a secret, the
// signature is verified first; the entitlement store is not wired in this
// release, so verified events are acknowledged as "received, not processed"
// and logged for reconciliation. See docs/shop/FULFILMENT_ARCHITECTURE.md.
export const runtime = "nodejs";

export async function POST(request: Request) {
  const secret = process.env.SHOP_PAYMENT_WEBHOOK_SECRET;
  if (!secret) return Response.json({ error: "Payment webhook is not configured. No order was processed." }, { status: 503, headers: { "Cache-Control": "no-store" } });
  const payload = await request.text();
  const verification = verifyWebhookSignature({ payload, signatureHeader: request.headers.get("x-starlight-signature") ?? request.headers.get("webhook-signature"), secret, timestamp: request.headers.get("x-starlight-timestamp") ?? request.headers.get("webhook-timestamp") });
  if (!verification.ok) return Response.json({ error: `Rejected: ${verification.reason}.` }, { status: 401, headers: { "Cache-Control": "no-store" } });
  let event: { id?: string; type?: string; sku?: string; provider?: string };
  try { event = JSON.parse(payload) as typeof event; } catch { return Response.json({ error: "Invalid payload." }, { status: 400 }); }
  if (!event.id || !event.type || !event.sku) return Response.json({ error: "Event id, type and sku are required." }, { status: 400 });
  const key = idempotencyKey(event.provider ?? "unknown", event.id, event.sku);
  const entry = auditEntry({ actor: "webhook", action: `received:${event.type}`, orderId: event.id, idempotencyKey: key, detail: { processed: false, reason: "entitlement store not configured" } });
  console.info(JSON.stringify(entry));
  // 202: acknowledged for replay later. Returning 200 would tell the provider
  // the order was fulfilled, which is not true until the store exists.
  return Response.json({ received: true, processed: false, idempotencyKey: key }, { status: 202, headers: { "Cache-Control": "no-store" } });
}
