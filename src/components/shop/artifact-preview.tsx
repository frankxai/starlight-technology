import { buildBrief, exampleSources, exampleSummary, exampleTitle, parseSources, renderJson, renderMarkdown } from "@/lib/brief";
import styles from "./storefront.module.css";

// Real artifact preview: the shared core runs over the worked example at build
// time. Tabs are CSS-only: visually hidden radios precede the panels, and
// `:checked ~` sibling rules reveal the matching panel. Radios are keyboard
// operable with the arrow keys; no JavaScript is involved.
export function ArtifactPreview({ id = "artifact" }: { id?: string }) {
  const { sources, lines } = parseSources(exampleSources);
  const brief = buildBrief({ title: exampleTitle, summary: exampleSummary, sources, lines: lines.map((line) => ({ ...line, status: "approved" as const })), surface: "workflow", now: new Date("2026-10-16T09:00:00Z") });
  const markdown = renderMarkdown(brief);
  const json = renderJson(brief).split("\n").slice(0, 60).join("\n") + "\n  …\n}";
  const tabs = [
    { key: "md", label: "brief.md", body: markdown },
    { key: "json", label: "brief.json", body: json },
    { key: "eval", label: "evaluation", body: brief.evaluation.checks.map((check) => `[${check.pass ? "x" : " "}] ${check.label} — ${check.detail}`).join("\n") }
  ];
  return <div className={styles.window} role="group" aria-label="Exported artifact preview">
    {tabs.map((tab, index) => <input key={tab.key} type="radio" name={`${id}-tab`} id={`${id}-${tab.key}`} value={tab.key} className={styles.tabInput} defaultChecked={index === 0} aria-label={`Show ${tab.label}`} />)}
    <div className={`${styles.windowBar} ${styles.tabBar}`}>
      <i aria-hidden="true" /><i aria-hidden="true" /><i aria-hidden="true" />
      <div className={styles.tabs}>{tabs.map((tab) => <label key={tab.key} htmlFor={`${id}-${tab.key}`} className={styles.tabLabel} data-tab={tab.key}>{tab.label}</label>)}</div>
      <span>out/ · worked example</span>
    </div>
    {tabs.map((tab) => <pre key={tab.key} className={`${styles.windowBody} ${styles.tabPanel}`} data-tab={tab.key} aria-label={`Preview of ${tab.label}`} tabIndex={0}><code>{tab.body}</code></pre>)}
  </div>;
}
