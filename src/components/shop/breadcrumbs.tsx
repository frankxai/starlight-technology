import Link from "next/link";
import { breadcrumbSchema } from "@/lib/catalog/schema";
import { JsonLd } from "./json-ld";
import styles from "./storefront.module.css";

export type Crumb = { name: string; path: string };

export function Breadcrumbs({ items }: { items: Crumb[] }) {
  const trail = [{ name: "Starlight Technology", path: "/" }, { name: "Shop", path: "/shop" }, ...items];
  return <nav className={styles.breadcrumbs} aria-label="Breadcrumb">
    <JsonLd schema={breadcrumbSchema(trail)} />
    <ol>{trail.map((crumb, index) => {
      const last = index === trail.length - 1;
      return <li key={crumb.path}>{last ? <span aria-current="page">{crumb.name}</span> : <Link href={crumb.path}>{crumb.name}</Link>}</li>;
    })}</ol>
  </nav>;
}
