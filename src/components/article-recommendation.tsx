import { editorialRecommendations, recommendationDestination } from "@/lib/editorial-recommendations";
import styles from "./article-media.module.css";

export function ArticleRecommendation({ id }: { id: string }) {
  const item = editorialRecommendations[id];
  if (!item) throw new Error(`Unknown editorial recommendation: ${id}`);
  const destination = recommendationDestination(item);
  return <aside className={styles.recommendation} aria-label={item.title}>
    <strong>{item.title}</strong>
    <p>{item.reason}</p>
    {destination.sponsored && <p>Affiliate link: we may earn a commission when you purchase through this link.</p>}
    <a className={styles.link} href={destination.href} rel={destination.sponsored ? "sponsored noopener" : undefined}>{item.label}</a>
  </aside>;
}
