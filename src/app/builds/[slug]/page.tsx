import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArticleNav, ArticleSources, EditorialSections, EvidenceBar } from "@/components/editorial";
import { builds } from "@/lib/content";

export function generateStaticParams() { return builds.map(({ slug }) => ({ slug })); }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> { const { slug } = await params; const item = builds.find((entry) => entry.slug === slug); return item ? { title: item.title, description: item.summary, alternates: { canonical: `/builds/${slug}` } } : {}; }

export default async function BuildPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params; const item = builds.find((entry) => entry.slug === slug); if (!item) notFound();
  return <article className="article shell"><ArticleNav /><header className="article-header"><p className="eyebrow">System blueprint · {item.budget}</p><h1>{item.title}</h1><p className="article-summary">{item.summary}</p><EvidenceBar status={item.evidenceStatus} verified={item.lastVerified} /></header><section className="decision-box"><p className="eyebrow">Objective</p><h2>{item.objective}</h2><div className="fit-grid"><div><h3>Strong fit</h3><ul>{item.fit.map((entry) => <li key={entry}>{entry}</li>)}</ul></div><div><h3>Wrong purchase when</h3><ul>{item.avoidWhen.map((entry) => <li key={entry}>{entry}</li>)}</ul></div></div></section><section className="allocation"><p className="eyebrow">Allocation model</p>{item.allocation.map((entry) => <div className="allocation-row" key={entry.label}><strong>{entry.label}</strong><span>{entry.value}</span><p>{entry.rationale}</p></div>)}</section><EditorialSections sections={item.sections} /><ArticleSources ids={item.sourceIds} /></article>;
}
