import {
  DECISION_GRAPH_VERSION,
  NODE_KINDS,
  type Claim,
  type DecisionGraph,
  type GraphEdge,
  type GraphNode,
  type NodeKind,
} from "./schema";

export type ValidationIssue = { at: string; problem: string };

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const SEMVER = /^\d+\.\d+\.\d+$/;

function claimsOf(node: GraphNode): { path: string; claim: Claim<unknown> }[] {
  const out: { path: string; claim: Claim<unknown> }[] = [];
  const walk = (value: unknown, path: string) => {
    if (!value || typeof value !== "object") return;
    const candidate = value as Record<string, unknown>;
    if ("value" in candidate && "evidenceKind" in candidate && "source" in candidate) {
      out.push({ path, claim: candidate as unknown as Claim<unknown> });
      return;
    }
    for (const [key, child] of Object.entries(candidate)) walk(child, `${path}.${key}`);
  };
  for (const [key, child] of Object.entries(node)) walk(child, key);
  return out;
}

/**
 * Structural validation. This is the gate that stops an unsourced claim from ever rendering:
 * a claim whose `source` does not resolve to an EvidenceSource node fails the build, not the page.
 */
export function validateGraph(graph: DecisionGraph): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  if (graph.schema !== DECISION_GRAPH_VERSION) {
    issues.push({ at: "graph", problem: `schema must be ${DECISION_GRAPH_VERSION}` });
  }

  const byId = new Map<string, GraphNode>();
  for (const node of graph.nodes) {
    if (byId.has(node.id)) issues.push({ at: node.id, problem: "duplicate node id" });
    byId.set(node.id, node);
  }

  const kinds = new Set<NodeKind>(NODE_KINDS);
  for (const node of graph.nodes) {
    const at = node.id;
    if (!kinds.has(node.kind)) issues.push({ at, problem: `unknown kind ${node.kind}` });
    if (!node.owner) issues.push({ at, problem: "missing owner" });
    if (!node.provenance) issues.push({ at, problem: "missing provenance" });
    if (!SEMVER.test(node.version)) issues.push({ at, problem: "version must be semver" });
    if (!node.evaluationRule) issues.push({ at, problem: "missing evaluationRule" });
    if (node.reviewDateId && !byId.has(node.reviewDateId)) {
      issues.push({ at, problem: `reviewDateId ${node.reviewDateId} does not resolve` });
    }

    for (const { path, claim } of claimsOf(node)) {
      const source = byId.get(claim.source);
      if (!source) {
        issues.push({ at: `${at}.${path}`, problem: `source ${claim.source} does not resolve` });
      } else if (source.kind !== "EvidenceSource") {
        issues.push({ at: `${at}.${path}`, problem: `source ${claim.source} is not an EvidenceSource` });
      }
      if (!ISO_DATE.test(claim.observedAt)) {
        issues.push({ at: `${at}.${path}`, problem: "observedAt must be YYYY-MM-DD" });
      }
    }

    if (node.kind === "PriceObservation") {
      if (node.basis === "unverified" && node.amountMinor !== null) {
        issues.push({ at, problem: "unverified price must carry a null amount" });
      }
      if (node.basis !== "unverified" && node.amountMinor === null) {
        issues.push({ at, problem: "verified price must carry an amount" });
      }
      if (!byId.has(node.subjectId)) issues.push({ at, problem: "price subject does not resolve" });
    }

    if (node.kind === "CompleteSystem") {
      for (const line of node.lines) {
        if (!byId.has(line.nodeId)) issues.push({ at, problem: `line ${line.nodeId} does not resolve` });
        if (!line.justification.trim()) {
          issues.push({ at, problem: `line ${line.nodeId} has no justification` });
        }
      }
    }
  }

  for (const edge of graph.edges) {
    if (!byId.has(edge.from)) issues.push({ at: edge.id, problem: `edge from ${edge.from} does not resolve` });
    if (!byId.has(edge.to)) issues.push({ at: edge.id, problem: `edge to ${edge.to} does not resolve` });
    if (!edge.owner || !edge.provenance || !edge.evaluationRule) {
      issues.push({ at: edge.id, problem: "edge missing owner, provenance or evaluationRule" });
    }
    if (!SEMVER.test(edge.version)) issues.push({ at: edge.id, problem: "edge version must be semver" });
  }

  return issues;
}

export function indexGraph(graph: DecisionGraph): Map<string, GraphNode> {
  return new Map(graph.nodes.map((node) => [node.id, node]));
}

export function nodesOfKind<K extends NodeKind>(
  graph: DecisionGraph,
  kind: K,
): Extract<GraphNode, { kind: K }>[] {
  return graph.nodes.filter((node): node is Extract<GraphNode, { kind: K }> => node.kind === kind);
}

export function edgesFrom(graph: DecisionGraph, from: string): GraphEdge[] {
  return graph.edges.filter((edge) => edge.from === from);
}

/**
 * Deterministic, dependency-free content hash. Order-independent over object keys so that
 * reformatting the dataset does not invalidate live recommendations, but any value change does.
 */
export function stableHash(value: unknown): string {
  const canonical = canonicalise(value);
  let h1 = 0x811c9dc5;
  let h2 = 0x01000193;
  for (let i = 0; i < canonical.length; i += 1) {
    const code = canonical.charCodeAt(i);
    h1 = Math.imul(h1 ^ code, 0x01000193) >>> 0;
    h2 = Math.imul(h2 + code + i, 0x85ebca6b) >>> 0;
  }
  return `${h1.toString(16).padStart(8, "0")}${h2.toString(16).padStart(8, "0")}`;
}

function canonicalise(value: unknown): string {
  if (value === null || typeof value !== "object") return JSON.stringify(value) ?? "null";
  if (Array.isArray(value)) return `[${value.map(canonicalise).join(",")}]`;
  const entries = Object.entries(value as Record<string, unknown>)
    .filter(([, child]) => child !== undefined)
    .sort(([a], [b]) => (a < b ? -1 : 1));
  return `{${entries.map(([key, child]) => `${JSON.stringify(key)}:${canonicalise(child)}`).join(",")}}`;
}

/** The hash a recommendation records for one dependency: its specs plus its prices. */
export function dependencyHash(graph: DecisionGraph, nodeId: string): string {
  const index = indexGraph(graph);
  const node = index.get(nodeId);
  if (!node) throw new Error(`Unknown node ${nodeId}`);
  const priceIds =
    "priceObservationIds" in node && Array.isArray(node.priceObservationIds) ? node.priceObservationIds : [];
  const prices = priceIds.map((id) => {
    const price = index.get(id);
    if (!price || price.kind !== "PriceObservation") throw new Error(`Unknown price ${id}`);
    return { id: price.id, basis: price.basis, amountMinor: price.amountMinor, region: price.region };
  });
  const specs = "specs" in node ? node.specs : {};
  return stableHash({ specs, prices });
}
