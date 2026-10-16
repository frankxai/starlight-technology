import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CollectionPage } from "@/components/shop/collection-page";
import { getCollection } from "@/lib/catalog";

const slug = "creative-production";
const collection = getCollection(slug);

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
