import type { Metadata } from "next";
import { CollectionCard } from "@/components/editorial";
import { comparisons } from "@/lib/content";

export const metadata: Metadata = { title: "Technology comparisons", description: "Constraint-led comparisons that state who each option fits and when it becomes the wrong purchase.", alternates: { canonical: "/compare" },
  openGraph: { title: "Technology comparisons", description: "Constraint-led comparisons that state who each option fits and when it becomes the wrong purchase.", url: "/compare" }
};

export default function ComparePage() {
  return <div className="page-shell shell"><header className="page-header"><p className="eyebrow">Comparisons</p><h1>Resolve one purchasing constraint.</h1><p>No universal winners. Each comparison names the workload, evidence boundary, wrong-purchase condition and decisive verdict.</p></header><div className="collection-grid">{comparisons.map((item) => <CollectionCard key={item.slug} item={item} type="compare" />)}</div></div>;
}
