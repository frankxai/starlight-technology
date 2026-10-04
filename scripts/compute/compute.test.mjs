import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { loadData, dataHash, validate, buildGraph, renderIndex, headlinePrice, fits } from "./lib.mjs";

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
  assert.ok(firstError(d).some((e) => e.includes("verifiedOn missing")));
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

test("gate: page-read price needs an opened source", () => {
  const d = fresh();
  const m = machine(d, "gmktec-evo-x2-64");
  for (const id of m.sourceIds) d.sources.find((s) => s.id === id).access = "snippet";
  assert.ok(firstError(d).some((e) => e.includes("no opened source")));
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
