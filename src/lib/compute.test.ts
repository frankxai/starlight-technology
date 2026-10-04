import { describe, expect, it } from "vitest";
import { brandSupply, capacityTable, fits, headlinePrice, ladderRows, machines, stats, workloads } from "./compute";

describe("compute data layer", () => {
  it("matches the validated .mjs rules on every machine and workload", async () => {
    const lib = (await import(/* @vite-ignore */ "../../scripts/compute/lib.mjs" as string)) as {
      fits: (m: unknown, w: unknown) => boolean | null;
      headlinePrice: (m: unknown) => unknown;
    };
    for (const m of machines) {
      expect(headlinePrice(m)).toEqual(lib.headlinePrice(m));
      for (const w of workloads) expect(fits(m, w)).toBe(lib.fits(m, w));
    }
  });

  it("builds a price ladder from page-read prices with Apple shown as reported", () => {
    const rows = ladderRows(64);
    expect(rows.length).toBeGreaterThan(8);
    expect(rows.every((r, i) => i === 0 || rows[i - 1].amountEur <= r.amountEur)).toBe(true);
    const mac = rows.find((r) => r.id === "apple-mac-studio-m5max-64");
    expect(mac?.evidence).toBe("reported");
    expect(rows.find((r) => r.id === "gmktec-evo-x2-128")?.evidence).toBe("page-read");
    expect(rows.every((r) => r.verifiedOn === "2026-10-05")).toBe(true);
  });

  it("never prices a machine from a forum post or a search snippet", () => {
    const rows = ladderRows(0);
    const ids = new Set(rows.map((r) => r.id));
    expect(ids.has("asus-ascent-gx10")).toBe(false);
    expect(ids.has("rtx-5090")).toBe(false);
  });

  it("answers capacity by memory class", () => {
    const table = capacityTable();
    const dense = table.find((t) => t.workload.id === "local-dense-70b-q4");
    expect(dense?.cells).toEqual([false, false, true, true, true]);
    const moe120 = table.find((t) => t.workload.id === "local-moe-120b");
    expect(moe120?.cells).toEqual([false, false, false, true, true]);
  });

  it("lists documented suppliers for a brand and carries evidence tags", () => {
    const framework = brandSupply("framework");
    expect(framework.map((s) => s.supplier)).toEqual(expect.arrayContaining(["FSP Group", "Cooler Master", "Noctua"]));
    expect(framework.every((s) => s.evidence === "documented")).toBe(true);
    expect(brandSupply("gmktec").some((s) => s.supplier === "Sixunited")).toBe(true);
  });

  it("reports counts that match the records", () => {
    expect(stats.machines).toBe(machines.length);
    expect(stats.sources).toBeGreaterThan(150);
  });
});
