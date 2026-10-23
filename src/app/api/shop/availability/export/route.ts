import { AVAILABILITY_PREFIX, authorizeAdmin, dedupe, toCsv, type AvailabilityRecord } from "@/lib/shop/availability-store";

// Operator export of the availability list from the private Blob store.
// Requires SHOP_ADMIN_TOKEN (>= 24 chars) as a bearer token; 503 when the
// token or the store is not configured, 401 on mismatch. Never cached.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const noStore = { "Cache-Control": "no-store" };

export async function GET(request: Request) {
  const auth = authorizeAdmin(request.headers.get("authorization"));
  if (auth === "unconfigured") return Response.json({ error: "Export is not configured." }, { status: 503, headers: noStore });
  if (auth === "denied") return Response.json({ error: "Unauthorized." }, { status: 401, headers: { ...noStore, "WWW-Authenticate": "Bearer" } });
  if (!process.env.BLOB_READ_WRITE_TOKEN) return Response.json({ error: "No store is configured." }, { status: 503, headers: noStore });

  const { list, get } = await import("@vercel/blob");
  const records: AvailabilityRecord[] = [];
  let cursor: string | undefined;
  do {
    const page = await list({ prefix: AVAILABILITY_PREFIX, cursor, limit: 1000 });
    for (const blob of page.blobs) {
      const result = await get(blob.pathname, { access: "private", useCache: false });
      if (!result?.stream) continue;
      try { records.push(JSON.parse(await new Response(result.stream).text()) as AvailabilityRecord); } catch { /* skip unreadable file; the pathname is still listable */ }
    }
    cursor = page.hasMore ? page.cursor : undefined;
  } while (cursor);

  const url = new URL(request.url);
  const unique = url.searchParams.get("all") === "1" ? records.sort((a, b) => b.receivedAt.localeCompare(a.receivedAt)) : dedupe(records);
  if (url.searchParams.get("format") === "csv") {
    return new Response(toCsv(unique), { status: 200, headers: { ...noStore, "content-type": "text/csv; charset=utf-8", "content-disposition": `attachment; filename="availability-${new Date().toISOString().slice(0, 10)}.csv"` } });
  }
  return Response.json({ count: unique.length, raw: records.length, records: unique }, { status: 200, headers: noStore });
}
