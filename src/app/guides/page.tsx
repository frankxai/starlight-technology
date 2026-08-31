import type { Metadata } from "next";
import { CollectionCard } from "@/components/editorial";
import { guides } from "@/lib/content";

export const metadata: Metadata = { title: "Buying field guides", description: "Decision frameworks for GPU memory, complete-system cost and evidence-led technology reviews." };

export default function GuidesPage() {
  return <div className="page-shell shell"><header className="page-header"><p className="eyebrow">Field guides</p><h1>Make the decision before opening the store.</h1><p>Define workloads, system boundaries, evidence and exit conditions before comparing products.</p></header><div className="collection-grid">{guides.map((item) => <CollectionCard key={item.slug} item={item} type="guides" />)}</div></div>;
}
