import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArticleNav, ArticleSources, EditorialSections, EvidenceBar } from "@/components/editorial";
import { guides } from "@/lib/content";

export function generateStaticParams() { return guides.map(({ slug }) => ({ slug })); }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> { const { slug } = await params; const item = guides.find((entry) => entry.slug === slug); return item ? { title: item.title, description: item.summary, alternates: { canonical: `/guides/${slug}` } } : {}; }

export default async function GuidePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params; const item = guides.find((entry) => entry.slug === slug); if (!item) notFound();
  return <article className="article shell"><ArticleNav /><header className="article-header"><p className="eyebrow">Field guide</p><h1>{item.title}</h1><p className="article-summary">{item.summary}</p><EvidenceBar status={item.evidenceStatus} verified={item.lastVerified} /></header><EditorialSections sections={item.sections} /><ArticleSources ids={item.sourceIds} /></article>;
}
