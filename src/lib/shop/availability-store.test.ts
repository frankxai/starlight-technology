import { describe, expect, it, vi } from "vitest";
import { authorizeAdmin, buildRecord, configuredSinks, dedupe, persistRecord, recordPath, toCsv } from "./availability-store";

const request = { product: "source-to-brief-workflow-edition", email: "Ada@Example.com", role: "Founder or operator", useCase: "quarterly vendor notes", interests: ["team-licence"] };

describe("availability store", () => {
  it("configures no sink by default, so the route fails closed", () => {
    expect(configuredSinks({})).toEqual([]);
    expect(configuredSinks({ SHOP_AVAILABILITY_ENDPOINT: "http://insecure.example" })).toEqual([]);
    expect(configuredSinks({ BLOB_READ_WRITE_TOKEN: "t", SHOP_AVAILABILITY_ENDPOINT: "https://hook.example/x" })).toEqual(["blob", "endpoint"]);
  });

  it("builds a dated, consented record with a stable per-day path", () => {
    const record = buildRecord(request, new Date("2026-10-21T09:30:00Z"), "id-1");
    expect(record.consent).toBe(true);
    expect(record.receivedAt).toBe("2026-10-21T09:30:00.000Z");
    expect(recordPath(record)).toBe("availability/2026-10-21/id-1.json");
  });

  it("writes to the private blob store and the endpoint when both are configured", async () => {
    const put = vi.fn(async (pathname: string) => ({ pathname }));
    const fetchMock = vi.fn<typeof fetch>(async () => new Response(null, { status: 200 }));
    const record = buildRecord(request, new Date("2026-10-21T09:30:00Z"), "id-2");
    const results = await persistRecord(record, { BLOB_READ_WRITE_TOKEN: "t", SHOP_AVAILABILITY_ENDPOINT: "https://hook.example/x", SHOP_AVAILABILITY_TOKEN: "s" }, { blob: async () => ({ put }), fetch: fetchMock });
    expect(put).toHaveBeenCalledWith("availability/2026-10-21/id-2.json", JSON.stringify(record), { access: "private", contentType: "application/json", addRandomSuffix: false });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const init = fetchMock.mock.calls[0][1]!;
    expect((init.headers as Record<string, string>).authorization).toBe("Bearer s");
    expect(results.every((result) => result.ok)).toBe(true);
  });

  it("reports a failed sink without throwing", async () => {
    const record = buildRecord(request, new Date(), "id-3");
    const results = await persistRecord(record, { BLOB_READ_WRITE_TOKEN: "t" }, { blob: async () => ({ put: async () => { throw new Error("store missing"); } }) });
    expect(results).toEqual([{ sink: "blob", ok: false, error: "store missing" }]);
  });

  it("gates the export behind a long bearer token with constant-time comparison", () => {
    expect(authorizeAdmin("Bearer x", {})).toBe("unconfigured");
    expect(authorizeAdmin("Bearer x", { SHOP_ADMIN_TOKEN: "short" })).toBe("unconfigured");
    const token = "a".repeat(32);
    expect(authorizeAdmin(`Bearer ${token}`, { SHOP_ADMIN_TOKEN: token })).toBe("ok");
    expect(authorizeAdmin(`Bearer ${"b".repeat(32)}`, { SHOP_ADMIN_TOKEN: token })).toBe("denied");
    expect(authorizeAdmin(null, { SHOP_ADMIN_TOKEN: token })).toBe("denied");
  });

  it("dedupes by email and product, keeping the latest, and escapes CSV cells", () => {
    const older = buildRecord(request, new Date("2026-10-20T10:00:00Z"), "a");
    const newer = buildRecord({ ...request, email: "ada@example.com", useCase: '=cmd(), "quoted"' }, new Date("2026-10-21T10:00:00Z"), "b");
    const unique = dedupe([older, newer]);
    expect(unique.map((record) => record.id)).toEqual(["b"]);
    const csv = toCsv(unique);
    expect(csv.split("\n")[0]).toBe("receivedAt,id,product,email,role,interests,useCase,consentVersion");
    expect(csv).toContain(`"'=cmd(), ""quoted"""`);
  });
});
