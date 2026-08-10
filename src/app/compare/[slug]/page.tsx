import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArticleNav, ArticleSources, EditorialSections, EvidenceBar } from "@/components/editorial";
import { comparisons } from "@/lib/content";

export function generateStaticParams() { return comparisons.map(({ slug }) => ({ slug })); }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> { const { slug } = await params; const item = comparisons.find((entry) => entry.slug === slug); return item ? { title: item.title, description: item.summary, alternates: { canonical: `/compare/${slug}` } } : {}; }

export default async function ComparisonPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params; const item = comparisons.find((entry) => entry.slug === slug); if (!item) notFound();
  return <article className="article shell"><ArticleNav /><header className="article-header"><p className="eyebrow">Decision comparison</p><h1>{item.title}</h1><p className="article-summary">{item.summary}</p><EvidenceBar status={item.evidenceStatus} verified={item.lastVerified} /></header><section className="verdict"><p className="eyebrow">Decisive verdict</p><h2>{item.verdict}</h2></section><section className="option-grid">{item.options.map((option) => <article key={option.name}><p className="eyebrow">Option</p><h2>{option.name}</h2><dl><div><dt>Best for</dt><dd>{option.bestFor}</dd></div><div><dt>Wrong for</dt><dd>{option.wrongFor}</dd></div><div><dt>Key constraint</dt><dd>{option.keyConstraint}</dd></div></dl></article>)}</section><EditorialSections sections={item.sections} /><ArticleSources ids={item.sourceIds} /></article>;
}
