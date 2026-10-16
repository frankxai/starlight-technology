import type { MediaPreview } from "@/lib/catalog/types";
import styles from "./storefront.module.css";

export function FileTree({ lines, title }: { lines: string[]; title: string }) {
  return <figure className={styles.window} style={{ margin: 0 }}>
    <figcaption className={styles.windowBar}><i aria-hidden="true" /><i aria-hidden="true" /><i aria-hidden="true" /><span>{title}</span></figcaption>
    <pre className={styles.windowBody} aria-label={`File tree for ${title}`}><code>{lines.join("\n")}</code></pre>
  </figure>;
}

export function Terminal({ entries, title }: { entries: MediaPreview["terminal"]; title: string }) {
  return <figure className={styles.window} style={{ margin: 0 }}>
    <figcaption className={styles.windowBar}><i aria-hidden="true" /><i aria-hidden="true" /><i aria-hidden="true" /><span>{title}</span></figcaption>
    <pre className={styles.windowBody} aria-label={`Terminal transcript: ${title}`}><code>{entries.map((entry, index) => <span key={entry.command}>{index > 0 ? "\n" : ""}<span className={styles.prompt}>{entry.command}</span>{"\n"}{entry.output.map((line) => <span className={styles.out} key={line}>{line}</span>)}</span>)}</code></pre>
  </figure>;
}

export function WorkflowPipeline({ stages, gateIds = ["review"] }: { stages: MediaPreview["workflow"]; gateIds?: string[] }) {
  return <ol className={styles.pipeline} aria-label="Workflow stages">
    {stages.map((stage) => <li key={stage.id} data-gate={gateIds.includes(stage.id)}><strong>{stage.label}{gateIds.includes(stage.id) ? " · gate" : ""}</strong><p>{stage.detail}</p></li>)}
  </ol>;
}

export function Transformation({ steps }: { steps: MediaPreview["transformation"] }) {
  return <div className={styles.journey}>
    {steps.map((step) => <div className={`${styles.journeyStep} ${styles.reveal}`} key={step.label}>
      <div><span>Before · {step.label}</span>{step.before}</div>
      <div><span>After · brief</span>{step.after}</div>
    </div>)}
  </div>;
}
