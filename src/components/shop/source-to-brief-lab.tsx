"use client";

import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { BRIEF_SCHEMA, briefSections, buildBrief, exampleSources, exampleSummary, exampleTitle, parseSources, renderJson, renderMarkdown, sectionTitles, slugify, type Brief, type BriefSection, type CandidateLine, type LineStatus, type SourceInput } from "@/lib/brief";
import { trackShopEvent } from "@/lib/shop/analytics-client";
import sf from "./storefront.module.css";
import styles from "./lab.module.css";

type Step = "sources" | "review" | "export";
const emptySource = (): SourceInput => ({ label: "", url: "", text: "" });
const DRAFT_KEY = "starlight.shop.lab.draft.v1";
function subscribeStorage(callback: () => void) { window.addEventListener("storage", callback); return () => window.removeEventListener("storage", callback); }
function readHasDraft() { try { return Boolean(window.localStorage.getItem(DRAFT_KEY)); } catch { return false; } }

export function SourceToBriefLab() {
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [sources, setSources] = useState<SourceInput[]>([emptySource()]);
  const [lines, setLines] = useState<CandidateLine[] | null>(null);
  const [parsedSources, setParsedSources] = useState<ReturnType<typeof parseSources>["sources"]>([]);
  const [pendingOnly, setPendingOnly] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [saveDraft, setSaveDraft] = useState(false);
  const [draftNote, setDraftNote] = useState<string | null>(null);
  const started = useRef(false);

  // Opt-in draft persistence. Off by default; lives only in this browser's
  // localStorage; restored only when the person asks; cleared by Clear or by
  // switching the toggle off.
  const hasStoredDraft = useSyncExternalStore(subscribeStorage, readHasDraft, () => false);
  useEffect(() => {
    if (!saveDraft) return;
    try { window.localStorage.setItem(DRAFT_KEY, JSON.stringify({ title, summary, sources, lines, parsedSources })); } catch { /* storage blocked: nothing saved, toggle note already says browser-only */ }
  }, [saveDraft, title, summary, sources, lines, parsedSources]);
  function restoreDraft() {
    try {
      const raw = window.localStorage.getItem(DRAFT_KEY);
      if (!raw) return;
      const draft = JSON.parse(raw) as { title: string; summary: string; sources: SourceInput[]; lines: CandidateLine[] | null; parsedSources: ReturnType<typeof parseSources>["sources"] };
      markStart();
      setTitle(draft.title ?? ""); setSummary(draft.summary ?? ""); setSources(draft.sources?.length ? draft.sources : [emptySource()]); setLines(draft.lines ?? null); setParsedSources(draft.parsedSources ?? []); setSaveDraft(true);
      setDraftNote("Draft restored from this browser.");
    } catch { setDraftNote("The saved draft could not be read."); }
  }
  function toggleDraft(next: boolean) {
    setSaveDraft(next);
    if (!next) { try { window.localStorage.removeItem(DRAFT_KEY); } catch { /* ignore */ } setDraftNote("Draft removed from this browser."); }
    else setDraftNote("Draft will be kept in this browser only. Nothing is uploaded.");
  }
  const step: Step = lines === null ? "sources" : lines.some((line) => line.status === "pending") ? "review" : "export";

  function markStart() {
    if (started.current) return;
    started.current = true;
    trackShopEvent("free_lab_start", { product: "source-to-brief-lab" });
  }
  function loadExample() {
    markStart();
    setTitle(exampleTitle);
    setSummary(exampleSummary);
    setSources(exampleSources.map((source) => ({ ...source })));
    setLines(null);
  }
  function clearAll() { setTitle(""); setSummary(""); setSources([emptySource()]); setLines(null); setParsedSources([]); setCopied(null); try { window.localStorage.removeItem(DRAFT_KEY); } catch { /* ignore */ } if (saveDraft) setDraftNote("Cleared. The saved draft was removed too."); }
  function rejectHeld() { setLines((current) => current?.map((line) => (line.status === "pending" ? { ...line, status: "rejected" } : line)) ?? current); }
  /** Import a starlight.brief/v1 file. Restores title, summary, the source register and the approved lines as each source's text. */
  async function importBrief(file: File | undefined) {
    if (!file) return;
    try {
      const parsed = JSON.parse(await file.text()) as Partial<Brief>;
      if (parsed.schema !== BRIEF_SCHEMA || !parsed.sources || !parsed.sections) { setDraftNote("That file is not a starlight.brief/v1 export."); return; }
      const bySource = new Map<string, string[]>();
      for (const section of briefSections) for (const entry of parsed.sections[section] ?? []) bySource.set(entry.sourceId, [...(bySource.get(entry.sourceId) ?? []), entry.text]);
      const restoredSources: SourceInput[] = parsed.sources.map((source) => ({ label: source.label, url: source.url ?? "", text: (bySource.get(source.id) ?? []).join("\n") }));
      markStart();
      setTitle(parsed.title ?? ""); setSummary(parsed.summary ?? ""); setSources(restoredSources.length ? restoredSources : [emptySource()]);
      const reparsed = parseSources(restoredSources);
      // Everything imported was already approved; keep the exported section assignment where the text matches.
      const sectionByText = new Map<string, BriefSection>();
      for (const section of briefSections) for (const entry of parsed.sections[section] ?? []) sectionByText.set(entry.text.trim(), section);
      setParsedSources(reparsed.sources);
      setLines(reparsed.lines.map((line) => ({ ...line, status: "approved" as const, section: sectionByText.get(line.text.trim()) ?? line.section })));
      setDraftNote(`Imported ${restoredSources.length} source(s) from ${file.name}. Source text is rebuilt from the approved lines; rejected lines were not in the export.`);
    } catch { setDraftNote("Could not read that file."); }
  }
  function updateSource(index: number, patch: Partial<SourceInput>) { markStart(); setSources((current) => current.map((source, i) => (i === index ? { ...source, ...patch } : source))); }
  function extract() {
    markStart();
    const usable = sources.filter((source) => source.text.trim().length > 0);
    const parsed = parseSources(usable);
    setParsedSources(parsed.sources);
    setLines(parsed.lines);
  }
  function setStatus(id: string, status: LineStatus) { setLines((current) => current?.map((line) => (line.id === id ? { ...line, status } : line)) ?? current); }
  function setSection(id: string, section: BriefSection) { setLines((current) => current?.map((line) => (line.id === id ? { ...line, section } : line)) ?? current); }
  function setEdited(id: string, edited: string) { setLines((current) => current?.map((line) => (line.id === id ? { ...line, edited } : line)) ?? current); }
  function approveConfident() { setLines((current) => current?.map((line) => (line.status === "pending" ? { ...line, status: "approved" } : line)) ?? current); }

  const brief = useMemo(() => (lines ? buildBrief({ title, summary, sources: parsedSources, lines, surface: "lab" }) : null), [lines, title, summary, parsedSources]);
  const markdown = useMemo(() => (brief ? renderMarkdown(brief) : ""), [brief]);

  function download(format: "md" | "json") {
    if (!brief) return;
    const content = format === "md" ? markdown : renderJson(brief);
    const blob = new Blob([content], { type: format === "md" ? "text/markdown;charset=utf-8" : "application/json;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${slugify(brief.title)}.brief.${format}`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
    trackShopEvent("free_artifact_exported", { product: "source-to-brief-lab", format });
  }
  async function copyMarkdown() {
    if (!brief) return;
    try { await navigator.clipboard.writeText(markdown); setCopied("Markdown copied to the clipboard."); trackShopEvent("free_artifact_exported", { product: "source-to-brief-lab", format: "clipboard" }); }
    catch { setCopied("Clipboard blocked by the browser. Use the download instead."); }
  }

  const visibleLines = lines?.filter((line) => !pendingOnly || line.status === "pending") ?? [];
  const counts = { approved: lines?.filter((l) => l.status === "approved").length ?? 0, pending: lines?.filter((l) => l.status === "pending").length ?? 0, rejected: lines?.filter((l) => l.status === "rejected").length ?? 0 };

  return <div className={styles.lab}>
    <div className={styles.toolbar}>
      <ol className={styles.steps} aria-label="Lab steps">
        <li aria-current={step === "sources" ? "step" : undefined}>01 Sources</li>
        <li aria-current={step === "review" ? "step" : undefined}>02 Review</li>
        <li aria-current={step === "export" ? "step" : undefined}>03 Export</li>
      </ol>
      <div className={styles.toolbarActions}>
        <button type="button" className={`${sf.btn} ${sf.btnSmall} ${sf.btnCyan}`} onClick={loadExample}>Load worked example</button>
        <label className={`${sf.btn} ${sf.btnSmall} ${sf.btnQuiet}`}><input type="file" accept="application/json,.json" className="sr-only" onChange={(event) => { void importBrief(event.target.files?.[0]); event.target.value = ""; }} />Import brief.json</label>
        {hasStoredDraft && !saveDraft && <button type="button" className={`${sf.btn} ${sf.btnSmall} ${sf.btnQuiet}`} onClick={restoreDraft}>Restore saved draft</button>}
        <label className={styles.draftToggle}><input type="checkbox" checked={saveDraft} onChange={(event) => toggleDraft(event.target.checked)} /><span>Keep a draft in this browser</span></label>
        <button type="button" className={`${sf.btn} ${sf.btnSmall} ${sf.btnQuiet}`} onClick={clearAll}>Clear</button>
      </div>
    </div>
    {draftNote && <p className={styles.status} role="status">{draftNote}</p>}

    <div className={styles.grid}>
      <section className={styles.panel} aria-labelledby="lab-sources">
        <div className={styles.panelHead}><h2 id="lab-sources">Sources you approve</h2><p>{sources.filter((s) => s.text.trim()).length} with text</p></div>
        <div className={styles.field}><label htmlFor="lab-title">Brief title</label><input id="lab-title" value={title} onChange={(event) => { markStart(); setTitle(event.target.value); }} placeholder="What decision or topic is this brief for?" /></div>
        <div className={styles.field}><label htmlFor="lab-summary">Summary in your words</label><textarea id="lab-summary" value={summary} onChange={(event) => setSummary(event.target.value)} placeholder="One or two sentences. The evaluation requires a person to write this." /></div>
        {sources.map((source, index) => <div className={styles.source} key={index}>
          <div className={styles.sourceHead}>
            <span className={styles.sourceId}>S{String(index + 1).padStart(2, "0")}</span>
            <label className="sr-only" htmlFor={`src-label-${index}`}>Source {index + 1} label</label>
            <input id={`src-label-${index}`} value={source.label} onChange={(event) => updateSource(index, { label: event.target.value })} placeholder="Label (file, meeting, thread)" />
            <label className="sr-only" htmlFor={`src-url-${index}`}>Source {index + 1} path or URL</label>
            <input id={`src-url-${index}`} value={source.url ?? ""} onChange={(event) => updateSource(index, { url: event.target.value })} placeholder="Path or URL (optional)" />
            <button type="button" className={styles.iconBtn} onClick={() => setSources((current) => (current.length > 1 ? current.filter((_, i) => i !== index) : [emptySource()]))} aria-label={`Remove source ${index + 1}`}>Remove</button>
          </div>
          <label className="sr-only" htmlFor={`src-text-${index}`}>Source {index + 1} text</label>
          <textarea id={`src-text-${index}`} value={source.text} onChange={(event) => updateSource(index, { text: event.target.value })} placeholder="Paste notes. Bullets, numbered lines and sentences are split into candidate lines." />
        </div>)}
        <div className={sf.actions} style={{ marginTop: 0 }}>
          <button type="button" className={`${sf.btn} ${sf.btnQuiet}`} onClick={() => setSources((current) => [...current, emptySource()])}>Add source</button>
          <button type="button" className={`${sf.btn} ${sf.btnPrimary}`} onClick={extract} disabled={!sources.some((s) => s.text.trim())}>{lines ? "Re-extract lines" : "Extract lines →"}</button>
        </div>
        <p className={styles.status}>Text stays in this tab. Nothing is uploaded and no model is called.</p>
      </section>

      <section className={styles.panel} aria-labelledby="lab-review">
        <div className={styles.panelHead}><h2 id="lab-review">Review every line</h2><p role="status">{lines ? `${counts.approved} approved · ${counts.pending} held · ${counts.rejected} rejected` : "waiting for extraction"}</p></div>
        {!lines && <p className={styles.empty}>Extract lines to review them here. Each line keeps its source id. Lines the classifier is unsure about are held with an amber edge until you decide.</p>}
        {lines && <>
          <div className={styles.lineControls}>
            <button type="button" className={styles.toggle} aria-pressed={pendingOnly} onClick={() => setPendingOnly((value) => !value)}>Show held only</button>
            <button type="button" className={styles.toggle} onClick={approveConfident} disabled={counts.pending === 0}>Approve all held ({counts.pending})</button>
            <button type="button" className={styles.toggle} onClick={rejectHeld} disabled={counts.pending === 0}>Reject all held</button>
          </div>
          <ul className={styles.lines}>{visibleLines.map((line) => <li className={styles.line} key={line.id} data-status={line.status}>
            <span className={styles.lineId}><b>{line.sourceId}</b>L{String(line.index + 1).padStart(2, "0")}</span>
            <div className={styles.lineMain}>
              <label className="sr-only" htmlFor={`line-${line.id}`}>Edit line {line.id}</label>
              <input id={`line-${line.id}`} value={line.edited ?? line.text} onChange={(event) => setEdited(line.id, event.target.value)} />
              <div className={styles.lineControls}>
                <button type="button" className={styles.toggle} data-kind="approve" aria-pressed={line.status === "approved"} onClick={() => setStatus(line.id, "approved")}>Approve</button>
                <button type="button" className={styles.toggle} data-kind="reject" aria-pressed={line.status === "rejected"} onClick={() => setStatus(line.id, "rejected")}>Reject</button>
                <label className="sr-only" htmlFor={`section-${line.id}`}>Section for line {line.id}</label>
                <select id={`section-${line.id}`} value={line.section} onChange={(event) => setSection(line.id, event.target.value as BriefSection)}>{briefSections.map((section) => <option key={section} value={section}>{sectionTitles[section]}</option>)}</select>
                <span className={styles.conf} data-held={line.status === "pending"}>{line.status === "pending" ? "held · " : ""}conf {Math.round(line.confidence * 100)}%</span>
              </div>
            </div>
          </li>)}</ul>
          {visibleLines.length === 0 && <p className={styles.empty}>Nothing held. Every line has a decision.</p>}
        </>}
      </section>
    </div>

    {brief && <div className={styles.grid}>
      <section className={styles.panel} aria-labelledby="lab-eval">
        <div className={styles.panelHead}><h2 id="lab-eval">Evaluation</h2><p role="status">{brief.evaluation.passed} of {brief.evaluation.total} checks pass</p></div>
        <ul className={styles.eval}>{brief.evaluation.checks.map((check) => <li key={check.id} data-pass={check.pass}><span aria-hidden="true">{check.pass ? "✓" : "✕"}</span><span>{check.label}<small>{check.detail}</small></span></li>)}</ul>
        {brief.contradictions.length > 0 && <div className={styles.flagged} role="note"><strong>Flagged for a reader</strong><ul>{brief.contradictions.map((pair) => <li key={`${pair.a}-${pair.b}`}><span className={sf.mono}>{pair.a}</span> and <span className={sf.mono}>{pair.b}</span> share “{pair.shared.join(", ")}” and one negates. Check which is current.</li>)}</ul></div>}
        <p className={styles.status}>The same twelve checks ship in the Workflow Edition. A failing check does not block export; it is recorded in the artifact so a reader sees it.</p>
      </section>
      <section className={styles.panel} aria-labelledby="lab-export">
        <div className={styles.panelHead}><h2 id="lab-export">Export the artifact</h2><p>starlight.brief/v1</p></div>
        <div className={styles.exportBar}>
          <button type="button" className={`${sf.btn} ${sf.btnPrimary}`} onClick={() => download("md")}>Download brief.md</button>
          <button type="button" className={`${sf.btn} ${sf.btnQuiet}`} onClick={() => download("json")}>Download brief.json</button>
          <button type="button" className={`${sf.btn} ${sf.btnQuiet}`} onClick={copyMarkdown}>Copy Markdown</button>
        </div>
        {copied && <p className={styles.status} role="status">{copied}</p>}
        <pre className={styles.preview} aria-label="Brief preview in Markdown" tabIndex={0}>{markdown}</pre>
        <p className={styles.status}>Want this over a folder of notes, with a review log, diagnostics and an agent skill? <Link href="/shop/products/source-to-brief-workflow-edition">That is the Workflow Edition.</Link></p>
      </section>
    </div>}
  </div>;
}
