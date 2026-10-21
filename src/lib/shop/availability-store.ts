import { createHash, randomUUID, timingSafeEqual } from "node:crypto";

// Availability requests are leads, not orders. This module turns a validated
// form payload into a record and writes it to whichever sinks are configured:
//   - a private Vercel Blob store (BLOB_READ_WRITE_TOKEN), one JSON file per request
//   - an https endpoint (SHOP_AVAILABILITY_ENDPOINT), for example an n8n webhook
// With neither configured the route fails closed and the form offers the
// pre-filled email. Nothing is ever written to the repository or the edge.

export const AVAILABILITY_PREFIX = "availability/";
export const CONSENT_VERSION = "availability-consent/2026-10-16";

export interface AvailabilityRequest {
  product: string;
  email: string;
  role: string;
  useCase: string;
  interests: string[];
}

export interface AvailabilityRecord extends AvailabilityRequest {
  kind: "availability_request";
  id: string;
  receivedAt: string;
  consent: true;
  consentVersion: typeof CONSENT_VERSION;
  source: "starlight.technology/shop/availability";
}

export type SinkName = "blob" | "endpoint";
export type SinkResult = { sink: SinkName; ok: true; reference: string } | { sink: SinkName; ok: false; error: string };

export type StoreEnv = Record<string, string | undefined>;

export function configuredSinks(env: StoreEnv = process.env): SinkName[] {
  const sinks: SinkName[] = [];
  if (env.BLOB_READ_WRITE_TOKEN) sinks.push("blob");
  if (env.SHOP_AVAILABILITY_ENDPOINT?.startsWith("https://")) sinks.push("endpoint");
  return sinks;
}

export function buildRecord(request: AvailabilityRequest, now: Date = new Date(), id: string = randomUUID()): AvailabilityRecord {
  return {
    kind: "availability_request",
    id,
    receivedAt: now.toISOString(),
    product: request.product,
    email: request.email,
    role: request.role.slice(0, 80),
    useCase: request.useCase.slice(0, 1000),
    interests: request.interests.slice(0, 8),
    consent: true,
    consentVersion: CONSENT_VERSION,
    source: "starlight.technology/shop/availability"
  };
}

/** Deterministic path: one file per request, grouped by day, never overwritten. */
export function recordPath(record: AvailabilityRecord) {
  const day = record.receivedAt.slice(0, 10);
  return `${AVAILABILITY_PREFIX}${day}/${record.id}.json`;
}

type BlobClient = { put: (pathname: string, body: string, options: { access: "private"; contentType: string; addRandomSuffix: boolean }) => Promise<{ pathname: string }> };
type Fetch = typeof fetch;

export async function persistRecord(
  record: AvailabilityRecord,
  env: StoreEnv = process.env,
  deps: { blob?: () => Promise<BlobClient>; fetch?: Fetch } = {}
): Promise<SinkResult[]> {
  const sinks = configuredSinks(env);
  const results: SinkResult[] = [];
  for (const sink of sinks) {
    if (sink === "blob") {
      try {
        const client = await (deps.blob ?? (() => import("@vercel/blob")))();
        const stored = await client.put(recordPath(record), JSON.stringify(record), { access: "private", contentType: "application/json", addRandomSuffix: false });
        results.push({ sink, ok: true, reference: stored.pathname });
      } catch (error) {
        results.push({ sink, ok: false, error: error instanceof Error ? error.message : "blob write failed" });
      }
    } else {
      try {
        const doFetch = deps.fetch ?? fetch;
        const response = await doFetch(env.SHOP_AVAILABILITY_ENDPOINT as string, {
          method: "POST",
          headers: { "content-type": "application/json", ...(env.SHOP_AVAILABILITY_TOKEN ? { authorization: `Bearer ${env.SHOP_AVAILABILITY_TOKEN}` } : {}) },
          body: JSON.stringify(record),
          signal: AbortSignal.timeout(8000)
        });
        if (!response.ok) results.push({ sink, ok: false, error: `endpoint responded ${response.status}` });
        else results.push({ sink, ok: true, reference: new URL(env.SHOP_AVAILABILITY_ENDPOINT as string).hostname });
      } catch (error) {
        results.push({ sink, ok: false, error: error instanceof Error ? error.message : "endpoint unreachable" });
      }
    }
  }
  return results;
}

/** Constant-time bearer check for the export route. False when no token is configured. */
export function authorizeAdmin(header: string | null, env: StoreEnv = process.env) {
  const expected = env.SHOP_ADMIN_TOKEN;
  if (!expected || expected.length < 24) return "unconfigured" as const;
  const presented = header?.startsWith("Bearer ") ? header.slice(7) : "";
  const a = createHash("sha256").update(presented).digest();
  const b = createHash("sha256").update(expected).digest();
  return timingSafeEqual(a, b) ? ("ok" as const) : ("denied" as const);
}

const csvColumns = ["receivedAt", "id", "product", "email", "role", "interests", "useCase", "consentVersion"] as const;

export function toCsv(records: AvailabilityRecord[]) {
  const escape = (value: string) => {
    const safe = /^[=+\-@\t\r]/.test(value) ? `'${value}` : value;
    return /[",\n\r]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe;
  };
  const rows = records.map((record) => csvColumns.map((column) => escape(column === "interests" ? record.interests.join("|") : String(record[column]))).join(","));
  return [csvColumns.join(","), ...rows].join("\n") + "\n";
}

/** Latest record per email+product wins; earlier duplicates are dropped. */
export function dedupe(records: AvailabilityRecord[]) {
  const byKey = new Map<string, AvailabilityRecord>();
  for (const record of [...records].sort((a, b) => a.receivedAt.localeCompare(b.receivedAt))) byKey.set(`${record.email.toLowerCase()}::${record.product}`, record);
  return [...byKey.values()].sort((a, b) => b.receivedAt.localeCompare(a.receivedAt));
}
