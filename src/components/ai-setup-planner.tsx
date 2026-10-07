"use client";

import Link from "next/link";
import { useId, useState } from "react";
import { planAiSetup, setupPlanMarkdown, type AiSetupInput } from "@/lib/ai-shop";
import styles from "@/components/ai-shop.module.css";

export function AiSetupPlanner() {
  const id = useId();
  const [input, setInput] = useState<AiSetupInput>({ goal: "knowledge", dataBoundary: "public", startingPoint: "existing-tools" });
  const [downloaded, setDownloaded] = useState(false);
  const plan = planAiSetup(input);
  function update<K extends keyof AiSetupInput>(key: K, value: AiSetupInput[K]) {
    setInput(current => ({ ...current, [key]: value }));
    setDownloaded(false);
  }
  function downloadPlan() {
    const url = URL.createObjectURL(new Blob([setupPlanMarkdown(input)], { type: "text/markdown;charset=utf-8" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "starlight-ai-setup-plan.md";
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    // Allow the browser to begin the download before releasing the object URL.
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    setDownloaded(true);
  }
  return <section id="setup" className={styles.planner} aria-labelledby={`${id}-title`}>
    <div className={styles.sectionHead}><div><p className="eyebrow">02 / Find your starting point</p><h2 id={`${id}-title`}>An AI setup with<br />a clear first job.</h2></div><p>Three decisions. A practical plan.<br />No account or AI API call.</p></div>
    <div className={styles.plannerGrid}>
      <div className={styles.controls}>
        <label htmlFor={`${id}-goal`}>What should it do?<select id={`${id}-goal`} value={input.goal} onChange={event => update("goal", event.target.value as AiSetupInput["goal"])}><option value="knowledge">Turn knowledge into a brief</option><option value="automation">Automate one repeated task</option><option value="build">Build with an AI agent</option></select></label>
        <label htmlFor={`${id}-data`}>Where may the data go?<select id={`${id}-data`} value={input.dataBoundary} onChange={event => update("dataBoundary", event.target.value as AiSetupInput["dataBoundary"])}><option value="public">Public or synthetic inputs first</option><option value="approved-cloud">An approved cloud provider</option><option value="local">Keep the workflow local</option></select></label>
        <label htmlFor={`${id}-start`}>What are you starting with?<select id={`${id}-start`} value={input.startingPoint} onChange={event => update("startingPoint", event.target.value as AiSetupInput["startingPoint"])}><option value="existing-tools">Use the tools I already have</option><option value="new-setup">Design a new setup</option></select></label>
        <p>Your selections stay in this page. Download saves a text file on your device; it does not create a provider account or send your brief to a model.</p>
      </div>
      <div className={styles.result} aria-live="polite" aria-atomic="true"><p className="eyebrow">Planning direction / rules-based</p><h3>{plan.title}</h3><p>{plan.result}</p><p className={styles.runtime}>{plan.runtime}</p><div className={styles.constraint}><span>DECISIVE CONSTRAINT</span><p>{plan.constraint}</p></div><ol>{plan.steps.map(step => <li key={step}>{step}</li>)}</ol><div className={styles.planLinks}>{plan.links.map(link => link.href.startsWith("/") ? <Link key={link.href} href={link.href}>{link.label} →</Link> : <a key={link.href} href={link.href}>{link.label} ↗</a>)}</div><button className="button button-primary" type="button" onClick={downloadPlan}>Download this plan ↓</button><p className={styles.downloadStatus} role="status">{downloaded ? "Download requested. Your editable Markdown plan is ready to save." : "Editable Markdown · no email required"}</p></div>
    </div>
  </section>;
}
