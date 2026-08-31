import Link from "next/link";
import type { Build, Comparison, Guide, Section } from "@/lib/types";
import { getSources } from "@/lib/sources";
import { EvidenceBar, SourceList } from "./evidence";

export function EditorialSections({ sections }: { sections: Section[] }) {
  return <>{sections.map((section) => <section className="article-section" key={section.heading}><h2>{section.heading}</h2>{section.body.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}{section.bullets && <ul>{section.bullets.map((bullet) => <li key={bullet}>{bullet}</li>)}</ul>}</section>)}</>;
}

export function CollectionCard({ item, type }: { item: Build | Comparison | Guide; type: "builds" | "compare" | "guides" }) {
  const label = type === "builds" ? "SYSTEM BUILD" : type === "compare" ? "DECISION" : "FIELD GUIDE";
  return <article className="collection-card"><div className="card-meta"><span>{label}</span><span>{item.lastVerified}</span></div><h2><Link href={`/${type}/${item.slug}`}>{item.title}</Link></h2><p>{item.summary}</p><div className="card-footer"><span>{item.evidenceStatus.replaceAll("-", " ")}</span><Link href={`/${type}/${item.slug}`}>Open analysis →</Link></div></article>;
}

export function ArticleSources({ ids }: { ids: string[] }) {
  return <section className="article-sources"><p className="eyebrow">Evidence register</p><h2>Sources and status</h2><SourceList sources={getSources(ids)} /></section>;
}

export function ArticleNav() {
  return <div className="article-nav"><Link href="/builds">Builds</Link><Link href="/compare">Comparisons</Link><Link href="/guides">Guides</Link></div>;
}

export { EvidenceBar };
