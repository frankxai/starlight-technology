import { exampleSources, parseSources, sectionTitles } from "@/lib/brief";
import styles from "./storefront.module.css";

// Real preview: the free lab's deterministic core run over the worked example at
// build time. What you see here is what the lab produces from these lines.
export function StorefrontPreview() {
  const { lines } = parseSources(exampleSources.slice(0, 1));
  const shown = lines.slice(0, 5);
  const held = shown.filter((line) => line.status === "pending").length;
  return <figure className={styles.stage} aria-labelledby="preview-caption">
    <div className={styles.stageBar}><span>source-to-brief · live preview</span><span>meeting-0923.md → brief.md</span></div>
    <div className={styles.stageBody}>
      <div className={styles.stagePane}>
        <p className={styles.paneLabel}>Source · <b>S01</b> {exampleSources[0].label}</p>
        <ul className={styles.stageLines}>{shown.map((line) => <li key={line.id}>{line.text}</li>)}</ul>
      </div>
      <div className={styles.stageArrow} aria-hidden="true">→</div>
      <div className={styles.stagePane}>
        <p className={styles.paneLabel}>Brief · <b>cited</b> and reviewed</p>
        <ul className={styles.stageLines}>{shown.map((line) => <li key={line.id} className={line.status === "pending" ? styles.held : styles.out}><span className={styles.tag} data-kind={line.section}>{sectionTitles[line.section].replace("Open questions", "Question").replace(/s$/, "")}</span>{line.text} <span className={styles.cite}>[{line.sourceId}]</span>{line.status === "pending" ? <span className={styles.muted}> · held for review</span> : null}</li>)}</ul>
      </div>
    </div>
    <figcaption className={styles.stageFoot} id="preview-caption"><span><b>{shown.length} lines</b> extracted · <b>{held}</b> held for a person · every line keeps its source</span><span>deterministic core · no model call</span></figcaption>
  </figure>;
}
