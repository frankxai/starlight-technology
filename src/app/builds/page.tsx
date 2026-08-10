import type { Metadata } from "next";
import { CollectionCard } from "@/components/editorial";
import { builds } from "@/lib/content";

export const metadata: Metadata = { title: "Complete system builds", description: "Workload-first AI creator studio blueprints by objective, budget and decisive constraint." };

export default function BuildsPage() {
  return <div className="page-shell shell"><header className="page-header"><p className="eyebrow">Complete systems</p><h1>Builds organised around the work.</h1><p>Planning blueprints include compute, storage, capture, monitoring, mobility and recovery. They are not live merchant baskets.</p></header><div className="collection-grid">{builds.map((item) => <CollectionCard key={item.slug} item={item} type="builds" />)}</div></div>;
}
