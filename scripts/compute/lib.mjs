import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { join } from "node:path";

export const FILES = ["sources", "silicon", "machines", "brands", "suppliers", "channels", "builds", "partners", "stack", "claims", "gaps", "supply", "workloads"];
export const PRICE_EVIDENCE = ["page-read", "reported", "forum", "derived", "snippet"];
export const CLAIM_TYPES = ["manufacturer-assertion", "independent-measurement", "inference", "market-data"];
export const EDGE_EVIDENCE = ["documented", "inferred", "rumor"];
export const FRESH_DAYS = 30;

export function loadData(dir) {
  const data = {};
  for (const f of FILES) data[f] = JSON.parse(readFileSync(join(dir, f + ".json"), "utf8"));
  return data;
}

export function dataHash(dir) {
  const h = createHash("sha256");
  for (const f of FILES) h.update(readFileSync(join(dir, f + ".json")));
  return h.digest("hex").slice(0, 16);
}

const dup = (list, key = "id") => {
  const seen = new Set();
  const out = [];
  for (const x of list) { if (seen.has(x[key])) out.push(x[key]); seen.add(x[key]); }
  return out;
};

export function validate(data, { now = new Date() } = {}) {
  const errors = [];
  const warnings = [];
  const err = (m) => errors.push(m);
  const sourceById = new Map(data.sources.map((s) => [s.id, s]));
  const ids = {
    silicon: new Set(data.silicon.map((x) => x.id)),
    machines: new Set(data.machines.map((x) => x.id)),
    brands: new Set(data.brands.map((x) => x.id)),
    suppliers: new Set(data.suppliers.map((x) => x.id)),
    channels: new Set(data.channels.map((x) => x.id)),
    workloads: new Set(data.workloads.map((x) => x.id))
  };
  for (const [name, list] of Object.entries({ sources: data.sources, silicon: data.silicon, machines: data.machines, brands: data.brands, suppliers: data.suppliers, channels: data.channels, claims: data.claims, workloads: data.workloads })) {
    for (const d of dup(list)) err(`${name}: duplicate id ${d}`);
  }
  const checkSources = (where, list) => {
    for (const id of list ?? []) if (!sourceById.has(id)) err(`${where}: unresolved source ${id}`);
  };

  for (const s of data.sources) {
    if (!/^https?:\/\//.test(s.url)) err(`source ${s.id}: url must be http(s)`);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(s.verifiedOn ?? "")) err(`source ${s.id}: verifiedOn must be YYYY-MM-DD`);
    if (!["opened", "snippet"].includes(s.access)) err(`source ${s.id}: access must be opened or snippet`);
  }

  for (const m of data.machines) {
    if (!ids.brands.has(m.brandId)) err(`machine ${m.id}: unknown brand ${m.brandId}`);
    if (m.siliconId && !ids.silicon.has(m.siliconId)) err(`machine ${m.id}: unknown silicon ${m.siliconId}`);
    if (!m.siliconId) warnings.push(`machine ${m.id}: no silicon mapped`);
    checkSources(`machine ${m.id}`, m.sourceIds);
    for (const l of m.llmEvidence) checkSources(`machine ${m.id} llm`, l.sourceIds);
    for (const p of m.prices) {
      const w = `machine ${m.id} price ${p.amount} ${p.currency}`;
      if (typeof p.amount !== "number" || p.amount <= 0) err(`${w}: amount must be a positive number`);
      if (!p.currency) err(`${w}: currency missing`);
      if (!/^\d{4}-\d{2}-\d{2}$/.test(p.verifiedOn ?? "")) err(`${w}: verifiedOn missing (a price without a date cannot be published)`);
      if (!PRICE_EVIDENCE.includes(p.evidence)) err(`${w}: evidence must be one of ${PRICE_EVIDENCE.join(", ")}`);
      const variantGb = /(\d+)\s?GB/i.exec(p.variant ?? "")?.[1];
      if (variantGb && m.memory.gb && Number(variantGb) !== m.memory.gb) err(`${w}: variant "${p.variant}" disagrees with the machine memory (${m.memory.gb} GB)`);
      if (/amazon/i.test(p.merchant ?? "")) err(`${w}: Amazon prices are not stored (Associates terms limit how long they may be shown)`);
      if (p.evidence === "page-read" && (!p.merchant || !p.region)) err(`${w}: page-read price needs merchant and region`);
      if (p.evidence === "page-read" && !m.sourceIds.some((id) => sourceById.get(id)?.access === "opened")) err(`${w}: page-read price but no opened source on the machine`);
      const age = (now - new Date(p.verifiedOn)) / 86400000;
      if (age > FRESH_DAYS) warnings.push(`${w}: ${Math.floor(age)} days old (over ${FRESH_DAYS})`);
    }
  }

  for (const b of data.brands) {
    checkSources(`brand ${b.id}`, b.sourceIds);
    checkSources(`brand ${b.id} euTerms`, b.euTerms?.sourceIds);
    for (const t of b.techChoices) {
      if (!EDGE_EVIDENCE.includes(t.evidence)) err(`brand ${b.id} techChoice ${t.topic}: bad evidence ${t.evidence}`);
      checkSources(`brand ${b.id} techChoice ${t.topic}`, t.sourceIds);
    }
    for (const c of b.channels) if (!ids.channels.has(c)) err(`brand ${b.id}: unknown channel ${c}`);
    if (b.platform && !["own", "own-or-unidentified", "nvidia-gb10"].includes(b.platform) && !ids.suppliers.has(b.platform)) err(`brand ${b.id}: unknown platform ${b.platform}`);
  }
  for (const s of data.suppliers) checkSources(`supplier ${s.id}`, s.sourceIds);
  for (const c of data.channels) checkSources(`channel ${c.id}`, c.sourceIds);
  for (const e of data.supply) {
    const pool = { machine: ids.machines, brand: ids.brands, silicon: ids.silicon }[e.fromType];
    if (!pool?.has(e.fromId)) err(`supply edge: unknown ${e.fromType} ${e.fromId}`);
    if (!ids.suppliers.has(e.supplierId)) err(`supply edge: unknown supplier ${e.supplierId}`);
    if (!EDGE_EVIDENCE.includes(e.evidence)) err(`supply edge ${e.fromId}->${e.supplierId}: bad evidence`);
    checkSources(`supply edge ${e.fromId}->${e.supplierId}`, e.sourceIds);
  }
  for (const s of data.silicon) checkSources(`silicon ${s.id}`, s.sourceIds);
  for (const w of data.workloads) checkSources(`workload ${w.id}`, w.sourceIds);

  for (const c of data.claims) {
    if (!CLAIM_TYPES.includes(c.type)) err(`claim ${c.id}: bad type ${c.type}`);
    if (!c.sourceIds?.length) err(`claim ${c.id}: no sources`);
    checkSources(`claim ${c.id}`, c.sourceIds);
    if (c.type === "independent-measurement" && c.sourceIds.length && c.sourceIds.every((id) => sourceById.get(id)?.access === "snippet")) {
      err(`claim ${c.id}: independent-measurement rests only on search snippets; downgrade to inference or open the source`);
    }
  }
  return { errors, warnings };
}

// price helpers -------------------------------------------------------------
export function headlinePrice(machine, currency = "EUR") {
  const pool = machine.prices.filter((p) => p.evidence === "page-read" && p.currency === currency);
  if (!pool.length) return null;
  return pool.reduce((a, b) => (b.amount < a.amount ? b : a));
}

export function fits(machine, workload) {
  if (machine.kind === "gpu") {
    if (workload.kind === "gpu-later") return machine.memory.gb != null && machine.memory.gb >= workload.minVramGb;
    if (workload.kind === "local-llm") return machine.memory.gb != null && machine.memory.gb >= workload.modelGb;
    return false;
  }
  if (machine.memory.gb == null) return null;
  if (workload.kind === "gpu-later") return false;
  if (workload.kind === "always-on") return machine.memory.gb >= workload.minMemoryGb;
  if (workload.kind === "local-llm") return machine.memory.gb - workload.headroomGb >= workload.modelGb;
  return false;
}

// graph ---------------------------------------------------------------------
export function buildGraph(data, hash) {
  const nodes = [];
  const edges = [];
  const add = (type, id, label, extra = {}) => nodes.push({ id: `${type}:${id}`, type, label, ...extra });
  for (const b of data.brands) add("brand", b.id, b.name, { kind: b.kind });
  for (const m of data.machines) add("machine", m.id, m.model, { kind: m.kind, memoryGb: m.memory.gb });
  for (const s of data.silicon) add("silicon", s.id, s.name, { bandwidthGBs: s.memoryBandwidthGBs });
  for (const s of data.suppliers) add("supplier", s.id, s.name, { role: s.role });
  for (const c of data.channels) add("channel", c.id, c.name, { channelType: c.type });
  for (const o of ["windows", "linux", "macos"]) add("os", o, o);
  for (const w of data.workloads) add("workload", w.id, w.name, { kind: w.kind });
  const edge = (from, to, rel, evidence, extra = {}) => edges.push({ from, to, rel, evidence, ...extra });
  const brandSilicon = new Set();
  for (const m of data.machines) {
    edge(`machine:${m.id}`, `brand:${m.brandId}`, "made-by", "documented");
    if (m.siliconId) {
      edge(`machine:${m.id}`, `silicon:${m.siliconId}`, "uses", "documented");
      brandSilicon.add(`${m.brandId}|${m.siliconId}`);
    }
    for (const os of m.os) edge(`machine:${m.id}`, `os:${os}`, "runs", "documented");
    for (const w of data.workloads) {
      const f = fits(m, w);
      if (f) edge(`machine:${m.id}`, `workload:${w.id}`, "fits-capacity", "inferred");
    }
  }
  for (const key of brandSilicon) {
    const [b, s] = key.split("|");
    edge(`brand:${b}`, `silicon:${s}`, "ships", "documented");
  }
  for (const b of data.brands) for (const c of b.channels) edge(`brand:${b.id}`, `channel:${c}`, "sold-via", "documented");
  for (const e of data.supply) edge(`${e.fromType}:${e.fromId}`, `supplier:${e.supplierId}`, e.part, e.evidence, { note: e.note });
  const nodeIds = new Set(nodes.map((n) => n.id));
  for (const e of edges) if (!nodeIds.has(e.from) || !nodeIds.has(e.to)) throw new Error(`graph edge endpoint missing: ${e.from} -> ${e.to}`);
  return { schemaVersion: 1, dataHash: hash, nodeCount: nodes.length, edgeCount: edges.length, nodes, edges };
}

// index ---------------------------------------------------------------------
const money = (p) => `${p.currency === "EUR" ? "EUR" : p.currency} ${p.amount.toLocaleString("en-US", { maximumFractionDigits: 2 })}`;
const taxLabel = (p) => (p.includesTax === true ? "incl. VAT" : p.includesTax === false ? "ex tax" : "tax not stated");

export function renderIndex(data, graph) {
  const L = [];
  const brandName = new Map(data.brands.map((b) => [b.id, b.name]));
  const supName = new Map(data.suppliers.map((s) => [s.id, s.name]));
  const silName = new Map(data.silicon.map((s) => [s.id, s]));
  L.push("# Engineering index: mini PCs and local-AI compute");
  L.push("");
  L.push("Generated by `node scripts/compute/build.mjs` from `data/compute/*.json`. Do not edit by hand; edit the records and rerun.");
  L.push(`Data hash \`${graph.dataHash}\`. Research date 2026-10-05. Buyer region assumed NL/EU (OPEN). ${graph.nodeCount} nodes, ${graph.edgeCount} edges.`);
  L.push("");
  L.push("## How to read the evidence tags");
  L.push("");
  L.push("| Tag | Meaning |");
  L.push("|---|---|");
  L.push("| documented | A page we opened states it (manufacturer page, teardown, review, community wiki where named) |");
  L.push("| inferred | Our reasoning from documented facts |");
  L.push("| rumor | Reported, not confirmed by an opened primary source |");
  L.push("| page-read price | Read from a merchant or manufacturer page on the date shown |");
  L.push("| reported / forum / derived / snippet price | Not shown as a headline price: second-hand, forum post, arithmetic, or search-result text |");
  L.push("");
  L.push("## Supply lineage");
  L.push("");
  L.push("Solid arrows are documented. Dashed arrows are inferred or rumor. Brand-level arrows aggregate machine records.");
  L.push("");
  L.push("```mermaid");
  L.push("flowchart LR");
  const mm = (id) => id.replace(/[^a-zA-Z0-9]/g, "_");
  for (const b of data.brands) L.push(`  b_${mm(b.id)}["${b.name}"]`);
  for (const s of data.suppliers) L.push(`  s_${mm(s.id)}(["${s.name}"])`);
  const used = new Set();
  for (const e of graph.edges) {
    if (e.rel === "ships" ) { const [, b] = e.from.split(":"); const [, s] = e.to.split(":"); used.add(s); L.push(`  b_${mm(b)} --> si_${mm(s)}`); }
  }
  for (const s of used) L.push(`  si_${mm(s)}{{"${silName.get(s).name}"}}`);
  const seenEdge = new Set();
  for (const e of data.supply) {
    const brand = e.fromType === "brand" ? e.fromId : e.fromType === "machine" ? data.machines.find((m) => m.id === e.fromId)?.brandId : null;
    const from = e.fromType === "silicon" ? `si_${mm(e.fromId)}` : `b_${mm(brand)}`;
    const arrow = e.evidence === "documented" ? "-->" : "-.->";
    const line = `  ${from} ${arrow}|${e.part}| s_${mm(e.supplierId)}`;
    if (seenEdge.has(line)) continue;
    seenEdge.add(line);
    L.push(line);
  }
  L.push("```");
  L.push("");
  L.push("## Brands: how each one builds and sells");
  for (const b of data.brands) {
    L.push("");
    L.push(`### ${b.name} (${b.kind})`);
    L.push("");
    L.push(b.approach);
    L.push("");
    const platformLabel = { own: "own design", "own-or-unidentified": "own or unidentified (not established)", "nvidia-gb10": "NVIDIA GB10 reference platform" };
    L.push(`- Platform: ${b.platform == null ? "n/a" : platformLabel[b.platform] ?? supName.get(b.platform) ?? b.platform}. Own board design: ${b.ownBoardDesign ?? "not established"}.`);
    for (const t of b.techChoices) L.push(`- ${t.topic}: ${t.choice} [${t.evidence}]`);
    if (b.euTerms?.note) L.push(`- EU terms: ${b.euTerms.note}`);
    if (b.strengths.length) L.push(`- Strengths: ${b.strengths.join("; ")}`);
    if (b.weaknesses.length) L.push(`- Weak points: ${b.weaknesses.join("; ")}`);
    const aff = data.partners.affiliatePrograms.find((a) => a.id === b.affiliate?.programId);
    if (aff) L.push(`- Affiliate: ${aff.network}, ${aff.commission ?? "rate not found"}, cookie ${aff.cookieDays ?? "not found"} [${aff.evidenceStatus}]`);
  }
  L.push("");
  L.push("## Machines with a page-read price");
  L.push("");
  L.push("| Machine | Memory | Bandwidth | Cheapest page-read EUR | EUR per GB | Other reported price (not page-read) | Measured local-LLM (as reported) |");
  L.push("|---|---|---|---|---|---|---|");
  const sold = data.machines.filter((x) => x.kind === "system" || x.kind === "board");
  for (const m of sold) {
    const p = headlinePrice(m);
    const gb = m.memory.gb;
    const mem = gb ? `${gb} GB ${m.memory.type ?? ""}`.trim() : m.memory.maxGb ? `up to ${m.memory.maxGb} GB, ${m.memory.type ?? "SO-DIMM"} (not included)` : "n/v";
    const bw = m.memory.bandwidthGBs ? `${m.memory.bandwidthGBs} GB/s` : "n/v";
    const rep = m.prices.filter((q) => q.evidence !== "page-read").map((q) => `${money(q)} (${q.evidence}: ${q.merchant}${q.includesTax === true ? ", incl. VAT" : ""})`).join("; ") || "none";
    const llm = m.llmEvidence
      .filter((l) => /\d/.test(String(l.tokensPerSecond)))
      .slice(0, 2)
      .map((l) => `${l.model}${l.quant && !/unspecified|not stated/.test(l.quant) ? " " + l.quant : ""} ${l.tokensPerSecond} t/s${l.source === "manufacturer" ? " [mfr]" : ""}`)
      .join("; ") || "none verified";
    const eurGb = p && gb && p.currency === "EUR" ? Math.round(p.amount / gb) : "n/v";
    L.push(`| ${m.model} | ${mem} | ${bw} | ${p ? `${money(p)}${p.kind === "promo" ? " sale" : ""} (${taxLabel(p)}, ${p.merchant}, ${p.verifiedOn})` : "none page-read"} | ${eurGb} | ${rep} | ${llm} |`);
  }
  L.push("");
  L.push("Price notes: `n/v` means not verified. A price on this page is a snapshot from the named merchant on the named date, never a current offer. Amazon prices are not stored. EUR per GB uses the cheapest page-read EUR price for the stated memory size; sale prices are marked. Variant and memory must agree or the record fails validation.");
  L.push("");
  L.push("## Which workloads each machine fits on capacity alone");
  L.push("");
  L.push("Capacity only: bandwidth, software support and thermals are separate (see the speed column above). Rules are in `workloads.json`.");
  L.push("");
  const wl = data.workloads.filter((w) => w.kind === "always-on" || w.kind === "local-llm");
  L.push(`| Machine | ${wl.map((w) => w.id).join(" | ")} |`);
  L.push(`|---|${wl.map(() => "---").join("|")}|`);
  for (const m of sold) {
    L.push(`| ${m.model} | ${wl.map((w) => { const f = fits(m, w); return f === null ? "n/v" : f ? "yes" : "no"; }).join(" | ")} |`);
  }
  L.push("");
  L.push("## Channels");
  L.push("");
  for (const c of data.channels) L.push(`- **${c.name}** (${c.type}, ${c.region}): ${c.note}`);
  L.push("");
  L.push("## Open gaps");
  L.push("");
  L.push(`${data.gaps.length} open items are recorded in \`data/compute/gaps.json\`. The ones that block a purchase decision are listed in \`docs/compute/FLEET-BLUEPRINT.md\`.`);
  L.push("");
  return L.join("\n");
}

