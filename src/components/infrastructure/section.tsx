import type { ReactNode } from "react";
import styles from "./infrastructure.module.css";

export function SectionHeading({ index, eyebrow, title, children }: { index?: string; eyebrow: string; title: string; children?: ReactNode }) {
  return (
    <div className={styles.sectionHeading}>
      <div className={styles.sectionIndex}>{index ?? ""}</div>
      <div>
        <p className={styles.kicker}>{eyebrow}</p>
        <h2>{title}</h2>
      </div>
      {children ? <div className={styles.sectionNote}>{children}</div> : null}
    </div>
  );
}

export function SourceNote({ children }: { children: ReactNode }) {
  return <p className={styles.sourceNote}>{children}</p>;
}
