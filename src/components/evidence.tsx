import type { EvidenceStatus, SourceRecord } from "@/lib/types";

const labels: Record<EvidenceStatus, string> = {
  "owned-and-tested": "Owned & tested",
  "hands-on": "Hands-on",
  "research-backed": "Source-backed research",
  "inferred": "Decision-model inference"
};

export function EvidenceBar({ status, verified }: { status: EvidenceStatus; verified: string }) {
  return <div className="evidence-bar" aria-label={`Evidence status: ${labels[status]}. Last verified ${verified}.`}><span className={`status-dot status-${status}`} aria-hidden="true" /><strong>{labels[status]}</strong><span>Verified {verified}</span></div>;
}

export function SourceList({ sources }: { sources: SourceRecord[] }) {
  if (!sources.length) return <p className="source-empty">This page is a disclosed decision-model inference and does not claim product testing.</p>;
  return <ol className="source-list">{sources.map((source) => <li key={source.id}><a href={source.url} rel="noreferrer">{source.title} ↗</a><span>{source.publisher} · verified {source.verifiedOn}{source.primary ? " · primary" : ""}</span></li>)}</ol>;
}
