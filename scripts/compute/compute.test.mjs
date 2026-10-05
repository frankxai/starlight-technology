import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { loadData, dataHash, validate, buildGraph, renderIndex, headlinePrice, fits, normalizeText } from "./lib.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const dir = join(root, "data", "compute");
const fresh = () => structuredClone(loadData(dir));
const machine = (d, id) => d.machines.find((m) => m.id === id);
const firstError = (d, now) => validate(d, now ? { now } : undefined).errors;

test("committed records validate with no errors", () => {
  const { errors } = validate(loadData(dir));
  assert.deepEqual(errors, []);
});

test("generated graph and index match the records", () => {
  const data = loadData(dir);
  const graph = buildGraph(data, dataHash(dir));
  assert.equal(readFileSync(join(dir, "graph.json"), "utf8"), JSON.stringify(graph, null, 2) + "\n");
  assert.equal(readFileSync(join(root, "docs", "compute", "ENGINEERING-INDEX.md"), "utf8"), renderIndex(data, graph));
});

test("every graph edge lands on a real node", () => {
  const data = loadData(dir);
  const graph = buildGraph(data, "t");
  const ids = new Set(graph.nodes.map((n) => n.id));
  assert.ok(graph.edges.length > 100);
  for (const e of graph.edges) assert.ok(ids.has(e.from) && ids.has(e.to), `${e.from} -> ${e.to}`);
});

test("gate: unresolved source id is rejected", () => {
  const d = fresh();
  machine(d, "gmktec-evo-x2-64").sourceIds.push("nope-s99");
  assert.ok(firstError(d).some((e) => e.includes("unresolved source nope-s99")));
});

test("gate: price without a date is rejected", () => {
  const d = fresh();
  delete machine(d, "gmktec-evo-x2-64").prices[0].verifiedOn;
  assert.ok(firstError(d).some((e) => e.includes("real past or present")));
});

test("gate: Amazon prices are never stored", () => {
  const d = fresh();
  machine(d, "gmktec-evo-x2-64").prices.push({ kind: "merchant", amount: 1899, currency: "EUR", merchant: "Amazon.nl", region: "NL", variant: "64GB", includesTax: true, verifiedOn: "2026-10-05", evidence: "page-read" });
  assert.ok(firstError(d).some((e) => e.includes("Amazon prices are not stored")));
});

test("gate: a price for another memory size is rejected", () => {
  const d = fresh();
  machine(d, "gmktec-evo-x2-128").prices.push({ kind: "msrp", amount: 1999.99, currency: "EUR", merchant: "de.gmktec.com", region: "EU", variant: "64GB/1TB", includesTax: null, verifiedOn: "2026-10-05", evidence: "page-read" });
  assert.ok(firstError(d).some((e) => e.includes("disagrees with the machine memory")));
});

test("gate: a snippet relabelled page-read is rejected", () => {
  const d = fresh();
  const m = machine(d, "gmktec-evo-x2-64");
  d.sources.find((s) => s.id === m.prices[0].sourceId).access = "snippet";
  assert.ok(firstError(d).some((e) => e.includes("was not opened")));
});

test("gate: a page-read price needs its own source on the merchant's host", () => {
  const d = fresh();
  const m = machine(d, "gmktec-evo-x2-64");
  delete m.prices[0].sourceId;
  assert.ok(firstError(d).some((e) => e.includes("needs its own sourceId")));
  const d2 = fresh();
  const m2 = machine(d2, "gmktec-evo-x2-64");
  m2.prices[0].sourceId = machine(d2, "minisforum-ms-s1-max-64").prices[0].sourceId;
  assert.ok(firstError(d2).some((e) => e.includes("does not match merchantHost")));
});

test("gate: an Amazon source is rejected even under another merchant name", () => {
  const d = fresh();
  d.sources.push({ id: "t-amazon", title: "listing", publisher: "Amazon", url: "https://www.amazon.nl/dp/B0TEST", verifiedOn: "2026-10-05", primary: false, access: "opened" });
  const p = machine(d, "gmktec-evo-x2-64").prices[0];
  p.merchant = "Marketplace";
  p.sourceId = "t-amazon";
  assert.ok(firstError(d).some((e) => e.includes("Amazon prices are not stored")));
});

test("gate: impossible and future dates are rejected", () => {
  const d = fresh();
  machine(d, "gmktec-evo-x2-64").prices[0].verifiedOn = "2026-13-45";
  assert.ok(firstError(d).some((e) => e.includes("real past or present")));
  const d2 = fresh();
  machine(d2, "gmktec-evo-x2-64").prices[0].verifiedOn = "2027-01-01";
  assert.ok(firstError(d2).some((e) => e.includes("real past or present")));
});

test("gate: GiB variants, bandwidth and capacity must agree with the machine and silicon", () => {
  const d = fresh();
  machine(d, "gmktec-evo-x2-128").prices.push({ kind: "msrp", amount: 1, currency: "EUR", merchant: "x", region: "EU", variant: "64GiB", includesTax: null, verifiedOn: "2026-10-05", evidence: "reported" });
  assert.ok(firstError(d).some((e) => e.includes("disagrees with the machine memory")));
  const d2 = fresh();
  machine(d2, "gmktec-evo-x2-128").memory.bandwidthGBs = 999;
  assert.ok(firstError(d2).some((e) => e.includes("disagrees with silicon")));
  const d3 = fresh();
  machine(d3, "gmktec-evo-x2-128").memory.gb = 256;
  assert.ok(firstError(d3).some((e) => e.includes("exceeds the 128 GB maximum")));
});

test("headline price uses one tax basis: VAT-inclusive beats ex-VAT", () => {
  const d = fresh();
  const hp = machine(d, "hp-z2-mini-g1a-128");
  assert.ok(hp.prices.some((p) => p.includesTax === false));
  assert.equal(headlinePrice(hp).amount, 3890.15);
  assert.equal(headlinePrice(hp).includesTax, true);
});

test("graph edges cite sources or say they are unsourced", () => {
  const data = loadData(dir);
  const graph = buildGraph(data, "t");
  const made = graph.edges.filter((e) => e.rel === "made-by");
  const bosgame = made.find((e) => e.from === "machine:bosgame-m5");
  assert.equal(bosgame.evidence, "unsourced");
  assert.ok(made.filter((e) => e.evidence === "documented").every((e) => e.sourceIds.length > 0));
});
test("gate: a measurement claim cannot rest only on search snippets", () => {
  const d = fresh();
  const snippet = d.sources.find((s) => s.access === "snippet");
  d.claims.push({ id: "t-1", text: "x", type: "independent-measurement", sourceIds: [snippet.id], asOf: "2026-10-05" });
  assert.ok(firstError(d).some((e) => e.includes("rests only on search snippets")));
});

test("gate: duplicate ids and unknown suppliers are rejected", () => {
  const d = fresh();
  d.machines.push(structuredClone(d.machines[0]));
  d.supply.push({ fromType: "brand", fromId: "gmktec", supplierId: "ghost", part: "board", evidence: "documented", sourceIds: [] });
  const errors = firstError(d);
  assert.ok(errors.some((e) => e.includes("duplicate id")));
  assert.ok(errors.some((e) => e.includes("unknown supplier ghost")));
});

test("stale prices warn but do not fail", () => {
  const d = fresh();
  const later = new Date("2026-12-31");
  const { errors, warnings } = validate(d, { now: later });
  assert.deepEqual(errors, []);
  assert.ok(warnings.some((w) => w.includes("days old")));
});

test("headline price ignores non-page-read evidence", () => {
  const d = fresh();
  assert.equal(headlinePrice(machine(d, "apple-mac-studio-m5max-64")), null);
  assert.equal(headlinePrice(machine(d, "gmktec-evo-x2-128")).amount, 3999);
});

test("capacity rule: 64 GB cannot host a 70B Q4 beside agent sessions, 128 GB can", () => {
  const d = fresh();
  const w70 = d.workloads.find((w) => w.id === "local-dense-70b-q4");
  assert.equal(fits(machine(d, "gmktec-evo-x2-64"), w70), false);
  assert.equal(fits(machine(d, "gmktec-evo-x2-128"), w70), true);
  assert.equal(fits(machine(d, "gmktec-k11-64"), w70), null);
});

test("data hash does not depend on line endings", () => {
  assert.equal(normalizeText("a\r\nb\r\n"), normalizeText("a\nb\n"));
  assert.match(dataHash(dir), /^[0-9a-f]{16}$/);
});
