import type { Faq as FaqItem } from "@/lib/catalog/types";
import { faqSchema } from "@/lib/catalog/schema";
import { JsonLd } from "./json-ld";
import styles from "./storefront.module.css";

export function Faq({ items, withSchema = true }: { items: FaqItem[]; withSchema?: boolean }) {
  if (items.length === 0) return null;
  return <div className={styles.faq}>
    {withSchema && <JsonLd schema={faqSchema(items)} />}
    {items.map((item) => <details key={item.question}><summary>{item.question}</summary><p>{item.answer}</p></details>)}
  </div>;
}
