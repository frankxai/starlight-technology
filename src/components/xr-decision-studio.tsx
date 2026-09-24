"use client";

import { useState, useSyncExternalStore, type FormEvent } from "react";
import { xrDevices } from "@/lib/xr-catalog";
import { getXRAdvice, getXRDevice, parseXRSelection, xrGoalOptions, type XRSelection } from "@/lib/xr-decision";
import styles from "@/app/xr/xr.module.css";

type Answer = {
  answer: string;
  mode: "catalog" | "ai";
  sources: { title: string; url: string; checked: string }[];
  unknown: string;
};

function subscribeToSelection(notify: () => void) {
  window.addEventListener("popstate", notify);
  window.addEventListener("xr-selection-change", notify);
  return () => {
    window.removeEventListener("popstate", notify);
    window.removeEventListener("xr-selection-change", notify);
  };
}
function currentSearch() { return window.location.search; }
function serverSearch() { return ""; }

export function XRDecisionStudio() {
  const search = useSyncExternalStore(subscribeToSelection, currentSearch, serverSearch);
  const params = new URLSearchParams(search);
  const selection = parseXRSelection({ goal: params.get("goal"), timing: params.get("timing"), host: params.get("host") });
  const [copied, setCopied] = useState(false);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState<Answer | null>(null);
  const [asking, setAsking] = useState(false);
  const advice = getXRAdvice(selection);
  const device = getXRDevice(advice.deviceId)!;

  function choose<K extends keyof XRSelection>(key: K, value: XRSelection[K]) {
    const url = new URL(window.location.href);
    url.searchParams.set("goal", key === "goal" ? value : selection.goal);
    url.searchParams.set("timing", key === "timing" ? value : selection.timing);
    url.searchParams.set("host", key === "host" ? value : selection.host);
    window.history.replaceState(null, "", url);
    window.dispatchEvent(new Event("xr-selection-change"));
    setAnswer(null);
    setCopied(false);
  }

  async function share() {
    const url = new URL(window.location.href);
    url.searchParams.set("goal", selection.goal);
    url.searchParams.set("timing", selection.timing);
    url.searchParams.set("host", selection.host);
    try {
      await navigator.clipboard.writeText(url.toString());
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  async function ask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!question.trim() || asking) return;
    setAsking(true);
    setAnswer(null);
    try {
      const response = await fetch("/api/xr/ask", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: question.trim().slice(0, 300), selection })
      });
      if (!response.ok) throw new Error("Unavailable");
      setAnswer(await response.json() as Answer);
    } catch {
      setAnswer({
        answer: "The question service is temporarily unavailable. Use the evidence and next actions above to continue.",
        mode: "catalog", sources: [device.source], unknown: advice.constraint
      });
    } finally {
      setAsking(false);
    }
  }

  return <section className={styles.studio} aria-labelledby="studio-title">
    <div className={styles.studioTop}><span>XR / DECISION STUDIO</span><span>01 — 03 / YOUR BRIEF</span></div>
    <h2 id="studio-title">What are you trying to do?</h2>
    <fieldset className={styles.goalField}>
      <legend className={styles.srOnly}>Choose a primary goal</legend>
      <div className={styles.goalGrid}>{xrGoalOptions.map((option) => <label key={option.id} className={styles.goalOption}>
        <input type="radio" name="xr-goal" value={option.id} checked={selection.goal === option.id} onChange={() => choose("goal", option.id)} />
        <span className={styles.radioMark} aria-hidden="true" />
        <strong>{option.label}</strong><small>{option.detail}</small>
      </label>)}</div>
    </fieldset>
    <div className={styles.controls}>
      <fieldset><legend>When do you need it?</legend><div className={styles.toggle}>
        {(["now", "later"] as const).map((value) => <label key={value}><input type="radio" name="xr-timing" checked={selection.timing === value} onChange={() => choose("timing", value)} /><span>{value === "now" ? "This year" : "Exploring 2027"}</span></label>)}
      </div></fieldset>
      <label className={styles.hostLabel}>What can you connect?<select value={selection.host} onChange={(e) => choose("host", e.target.value as XRSelection["host"])}><option value="laptop">Laptop</option><option value="phone">Phone</option><option value="none">Neither</option></select></label>
    </div>
    <div className={styles.result} aria-live="polite">
      <div className={styles.resultHead}><span>{advice.state === "watchlist" ? "WATCHLIST · NOT A PURCHASE RECOMMENDATION" : "STARTING POINT · SOURCE-BACKED INFERENCE"}</span><span>24 SEP 2026</span></div>
      <p className={styles.resultKicker}>{advice.verdict}</p><h3>{device.name}</h3>
      <p>{advice.reason}</p>
      <div className={styles.guardrail}><strong>Check before committing</strong><span>{advice.constraint}</span></div>
      <details className={styles.details}><summary>Three next actions</summary><ol>{advice.next.map((step) => <li key={step}>{step}</li>)}</ol></details>
      <div className={styles.resultLinks}><a href={device.source.url} target="_blank" rel="noopener noreferrer">Inspect the source ↗</a><button type="button" onClick={share}>{copied ? "Link copied" : "Share this brief ↗"}</button></div>
    </div>
    <details className={styles.askPanel}>
      <summary>Ask a follow-up about this decision</summary>
      <form onSubmit={ask}><label htmlFor="xr-question">Question</label><div className={styles.askRow}><input id="xr-question" value={question} maxLength={300} onChange={(e) => setQuestion(e.target.value)} placeholder="Will these work with my laptop?" /><button disabled={asking || !question.trim()} type="submit">{asking ? "Checking…" : "Ask"}</button></div></form>
      {answer && <div className={styles.answer} role="status"><span>{answer.mode === "ai" ? "AI synthesis · verify sources" : "Catalog answer"}</span><p>{answer.answer}</p><small>Boundary: {answer.unknown}</small><ul>{answer.sources.map((source) => <li key={source.url}><a href={source.url} target="_blank" rel="noopener noreferrer">{source.title} ↗</a> · checked {source.checked}</li>)}</ul></div>}
      <p className={styles.privacy}>No account or saved conversation. When AI is enabled, your question and selected goal are sent to Vercel AI Gateway for this answer.</p>
    </details>
    <p className={styles.studioFoot}>Decision rules and sources are open in the <a href="https://github.com/frankxai/starlight-technology" target="_blank" rel="noopener noreferrer">public repository ↗</a>. No commission affects the result.</p>
  </section>;
}

export function XRAtlasStrip() {
  return <div className={styles.atlasStrip} aria-label="Device roles">
    {xrDevices.map((device, index) => <a href={`#device-${device.id}`} key={device.id}><span>0{index + 1}</span><strong>{device.name}</strong><small>{device.class}</small></a>)}
  </div>;
}