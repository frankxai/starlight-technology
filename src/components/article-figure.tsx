import Image from "next/image";
import visuals from "@/lib/editorial-visuals.json";
import styles from "./article-media.module.css";

export function ArticleFigure({ id }: { id: keyof typeof visuals }) {
  const visual = visuals[id];
  if (!visual) throw new Error(`Unknown editorial visual: ${id}`);
  return <figure className={styles.figure}>
    <a href={visual.src} aria-label={`Enlarge image: ${visual.alt}`} className={styles.imageLink}>
      <Image src={visual.src} alt={visual.alt} width={visual.width} height={visual.height}
        sizes="(max-width: 720px) 100vw, 760px" className={styles.image} />
    </a>
    <figcaption className={styles.caption}>
      <span>{visual.caption}</span>
      <span>{visual.credit} · <a href={visual.sourceUrl}>Source</a> · <a href={visual.src}>Enlarge image</a></span>
    </figcaption>
  </figure>;
}
