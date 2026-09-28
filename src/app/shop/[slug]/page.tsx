import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getTechnology, technology } from "@/lib/technology";

export function generateStaticParams() { return technology.map(({ slug }) => ({ slug })); }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const item = getTechnology((await params).slug);
  return { title: item ? `${item.name} decision record` : "Technology record", description: item?.decision, alternates: item ? { canonical: `/shop/${item.slug}` } : undefined, openGraph: item ? { url: `/shop/${item.slug}` } : undefined };
}

export default async function TechnologyPage({ params }: { params: Promise<{ slug: string }> }) {
  const item = getTechnology((await params).slug);
  if (!item) notFound();
  return <div className="atlas-detail shell"><Link className="atlas-back" href="/shop">← Technology Atlas</Link><div className="atlas-detail-header"><p className="eyebrow">{item.category} / {item.maker}</p><h1>{item.name}</h1><p>{item.decision}</p><div className="atlas-detail-meta"><span>Manufacturer-sourced research</span><span>Checked {item.source.checked}</span><span>No live offer</span></div></div>
    <div className="atlas-detail-grid"><section><span className="atlas-index">01 / DECISION</span><h2>Where it fits</h2><ul>{item.fit.map((text) => <li key={text}>{text}</li>)}</ul></section><section><span className="atlas-index">02 / FAILURE CONDITION</span><h2>When to walk away</h2><ul>{item.avoid.map((text) => <li key={text}>{text}</li>)}</ul></section><section><span className="atlas-index">03 / INTEGRATION</span><h2>Interfaces to verify</h2><ul>{item.interfaces.map((text) => <li key={text}>{text}</li>)}</ul></section><section><span className="atlas-index">04 / ECONOMICS</span><h2>Complete-system costs</h2><ul>{item.systemCosts.map((text) => <li key={text}>{text}</li>)}</ul></section></div>
    <aside className="atlas-source"><div><p className="eyebrow">Source and commerce boundary</p><h2>Verify the exact variant before buying.</h2><p>This is manufacturer-sourced research, not a hands-on review. Specifications, regional stock and terms can change. There is no merchant price or affiliate offer in this record.</p></div><a href={item.source.url} target="_blank" rel="noopener noreferrer">Open {item.source.title} ↗</a></aside>
    <div className="atlas-next"><Link href="/shop/studio">Map a complete system</Link><Link href="/builds">Explore complete builds</Link><Link href="/methodology">Read the evidence method</Link></div>
  </div>;
}
