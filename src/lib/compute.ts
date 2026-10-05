import machinesJson from "../../data/compute/machines.json";
import brandsJson from "../../data/compute/brands.json";
import workloadsJson from "../../data/compute/workloads.json";
import supplyJson from "../../data/compute/supply.json";
import suppliersJson from "../../data/compute/suppliers.json";
import siliconJson from "../../data/compute/silicon.json";
import sourcesJson from "../../data/compute/sources.json";
import claimsJson from "../../data/compute/claims.json";
import gapsJson from "../../data/compute/gaps.json";
import graphJson from "../../data/compute/graph.json";

export type PriceEvidence = "page-read" | "reported" | "forum" | "derived" | "snippet";
export type EdgeEvidence = "documented" | "inferred" | "rumor";

export interface Price {
  kind: string;
  amount: number;
  currency: string;
  merchant: string;
  region: string;
  variant: string;
  includesTax: boolean | null;
  verifiedOn: string;
  evidence: PriceEvidence;
  note?: string;
}

export interface Machine {
  id: string;
  kind: "system" | "board" | "gpu";
  brandId: string;
  model: string;
  siliconId: string | null;
  status: string;
  memory: { gb: number | null; maxGb: number | null; type: string | null; soldered: boolean | null; bandwidthGBs: number | null };
  os: string[];
  prices: Price[];
  llmEvidence: { model: string; quant: string; tokensPerSecond: string; backend: string; source: string }[];
  sourceIds: string[];
}

export interface Workload {
  id: string;
  name: string;
  kind: "always-on" | "local-llm" | "gpu-later";
  minMemoryGb?: number;
  modelGb?: number;
  headroomGb?: number;
  minVramGb?: number;
  measured?: string;
  note: string;
}

export interface TechChoice { topic: string; choice: string; evidence: EdgeEvidence; sourceIds: string[] }
export interface Brand {
  id: string;
  name: string;
  kind: string;
  approach: string;
  platform: string | null;
  ownBoardDesign: boolean | null;
  techChoices: TechChoice[];
  strengths: string[];
  weaknesses: string[];
  euTerms: { note?: string };
}
export interface SupplyEdge { fromType: "machine" | "brand" | "silicon"; fromId: string; supplierId: string; part: string; evidence: EdgeEvidence; note?: string }
export interface Supplier { id: string; name: string; role: string; country: string | null }
export interface Silicon { id: string; name: string; memoryBandwidthGBs: number | null }

export const machines = machinesJson as unknown as Machine[];
export const brands = brandsJson as unknown as Brand[];
export const workloads = workloadsJson as unknown as Workload[];
export const supply = supplyJson as unknown as SupplyEdge[];
export const suppliers = suppliersJson as unknown as Supplier[];
export const silicon = siliconJson as unknown as Silicon[];

export const researchDate = "2026-10-05";
export const stats = {
  sources: sourcesJson.length,
  claims: claimsJson.length,
  gaps: gapsJson.length,
  nodes: graphJson.nodeCount,
  edges: graphJson.edgeCount,
  machines: machines.length,
  brands: brands.length
};

export function headlinePrice(machine: Pick<Machine, "prices">, currency = "EUR"): Price | null {
  const pool = machine.prices.filter((p) => p.evidence === "page-read" && p.currency === currency);
  return pool.length ? pool.reduce((a, b) => (b.amount < a.amount ? b : a)) : null;
}

export function fits(machine: Pick<Machine, "kind" | "memory">, workload: Workload): boolean | null {
  if (machine.kind === "gpu") {
    if (workload.kind === "gpu-later") return machine.memory.gb != null && machine.memory.gb >= (workload.minVramGb ?? Infinity);
    if (workload.kind === "local-llm") return machine.memory.gb != null && machine.memory.gb >= (workload.modelGb ?? Infinity);
    return false;
  }
  if (machine.memory.gb == null) return null;
  if (workload.kind === "gpu-later") return false;
  if (workload.kind === "always-on") return machine.memory.gb >= (workload.minMemoryGb ?? Infinity);
  return machine.memory.gb - (workload.headroomGb ?? 0) >= (workload.modelGb ?? Infinity);
}

export const taxLabel = (p: Price) => (p.includesTax === true ? "incl. VAT" : p.includesTax === false ? "ex tax" : "tax not stated");

export interface LadderRow {
  id: string;
  name: string;
  memoryGb: number;
  amountEur: number;
  evidence: "page-read" | "reported";
  sale: boolean;
  eurPerGb: number;
  bandwidth: number | null;
  tax: string;
  source: string;
  verifiedOn: string;
  speed: string | null;
}

const shortName = (m: Machine) =>
  m.model
    .replace(/\s*\(.*?\)/g, "")
    .replace(/,?\s*Ryzen AI Max\+?(?: PRO)?\s*\d+,?/gi, "")
    .replace(/Desktop DIY /, "Framework Desktop ")
    .replace(/^Desktop /, "Framework Desktop ")
    .replace(/^Z2 Mini/, "HP Z2 Mini")
    .replace(/\s{2,}/g, " ")
    .trim();

export function ladderRows(minGb = 64): LadderRow[] {
  const rows: LadderRow[] = [];
  for (const m of machines) {
    if (m.kind === "gpu" || m.memory.gb == null || m.memory.gb < minGb) continue;
    const page = headlinePrice(m);
    const reported = m.prices.find((p) => p.evidence === "reported" && p.currency === "EUR");
    const p = page ?? reported;
    if (!p) continue;
    const llm = m.llmEvidence.find((l) => /\d/.test(String(l.tokensPerSecond)) && l.source === "independent");
    rows.push({
      id: m.id,
      name: shortName(m),
      memoryGb: m.memory.gb,
      amountEur: p.amount,
      evidence: page ? "page-read" : "reported",
      sale: p.kind === "promo",
      eurPerGb: Math.round(p.amount / m.memory.gb),
      bandwidth: m.memory.bandwidthGBs,
      tax: taxLabel(p),
      source: p.merchant,
      verifiedOn: p.verifiedOn,
      speed: llm ? `${llm.model} ${llm.tokensPerSecond} t/s` : null
    });
  }
  return rows.sort((a, b) => a.amountEur - b.amountEur);
}

export interface LadderGroup { memoryGb: number; label: string; low: number; high: number; rows: LadderRow[] }

export function ladderGroups(minGb = 64): LadderGroup[] {
  const rows = ladderRows(minGb);
  const sizes = [...new Set(rows.map((r) => r.memoryGb))].sort((a, b) => a - b);
  return sizes.map((gb) => {
    const group = rows.filter((r) => r.memoryGb === gb);
    return { memoryGb: gb, label: `${gb} GB class`, low: group[0].amountEur, high: group[group.length - 1].amountEur, rows: group };
  });
}

export const capacityClasses = [32, 64, 96, 128, 192] as const;

export function capacityTable() {
  return workloads
    .filter((w) => w.kind === "always-on" || w.kind === "local-llm")
    .map((w) => ({
      workload: w,
      cells: capacityClasses.map((gb) => fits({ kind: "system", memory: { gb, maxGb: null, type: null, soldered: null, bandwidthGBs: null } }, w) === true)
    }));
}

export function brandSupply(brandId: string) {
  const own = new Set(machines.filter((m) => m.brandId === brandId).map((m) => m.id));
  const names = new Map(suppliers.map((s) => [s.id, s]));
  const seen = new Set<string>();
  const out: { supplier: string; part: string; evidence: EdgeEvidence; note?: string }[] = [];
  for (const e of supply) {
    const belongs = (e.fromType === "brand" && e.fromId === brandId) || (e.fromType === "machine" && own.has(e.fromId));
    if (!belongs) continue;
    const key = `${e.supplierId}|${e.part}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({ supplier: names.get(e.supplierId)?.name ?? e.supplierId, part: e.part, evidence: e.evidence, note: e.note });
  }
  return out;
}

export function brandSilicon(brandId: string) {
  const names = new Map(silicon.map((s) => [s.id, s.name]));
  return [...new Set(machines.filter((m) => m.brandId === brandId && m.siliconId).map((m) => m.siliconId as string))].map((id) => names.get(id) ?? id);
}

export const graph = graphJson;
