import Link from "next/link";
import type { Collection } from "@/lib/catalog/types";
import styles from "./storefront.module.css";

export function CollectionCard({ collection, index, productCount, freeCount }: { collection: Collection; index: number; productCount: number; freeCount: number }) {
  const status = productCount > 0 ? `${productCount} edition${productCount === 1 ? "" : "s"}` : collection.hardwareSlugs?.length ? `${collection.hardwareSlugs.length} recommendations` : "In development";
  return <Link href={`/shop/${collection.slug}`} className={`${styles.collectionCard} ${styles.reveal}`}>
    <span className={styles.cardIndex}>{String(index + 1).padStart(2, "0")}</span>
    <h3>{collection.name}</h3>
    <p>{collection.outcome}</p>
    <div className={styles.chips} aria-label="What you can build">{collection.builds.map((build) => <span key={build}>{build}</span>)}</div>
    <div className={styles.cardFoot}><span>{status}</span><span>{freeCount > 0 ? "Free lab inside" : collection.recommendationIds.length > 0 ? `${collection.recommendationIds.length} tools` : ""}</span></div>
    <span className={styles.cardArrow} aria-hidden="true">↗</span>
  </Link>;
}
