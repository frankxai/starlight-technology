import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CollectionPage } from "@/components/shop/collection-page";
import { getCollection } from "@/lib/catalog";

const slug = "local-ai-hardware";
const collection = getCollection(slug);
// Hardware link approvals resolve at request time so expired offers fall back
// to official destinations. No merchant API is called in this request path.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: collection ? `${collection.name} — Shop` : "Shop",
  description: collection?.outcome,
  alternates: { canonical: `/shop/${slug}` },
  openGraph: { title: collection?.name, description: collection?.outcome, url: `/shop/${slug}` }
};

export default function Page() {
  if (!collection) notFound();
  return <CollectionPage collection={collection} />;
}
