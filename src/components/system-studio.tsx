"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { constraints, decideSystem, decisionCandidates, defaultBrief, environments, isSystemBrief, readSystemBriefImport, workloads, type SystemBrief } from "@/lib/technology-decision";

const storageKey = "starlight-technology-system-brief-v1";

export function SystemStudio() {
  const [brief, setBrief] = useState<SystemBrief>(defaultBrief);
  const [ready, setReady] = useState(false);
  const [canPersist, setCanPersist] = useState(false);
  const [recovery, setRecovery] = useState<string | null>(null);
  const [persistence, setPersistence] = useState<"pending" | "saved" | "unavailable" | "blocked">("pending");
  const [notice, setNotice] = useState("");
  useEffect(() => {
    let active = true;
    queueMicrotask(() => {
      if (!active) return;
      try {
        const saved = localStorage.getItem(storageKey);
        if (saved) {
          try {
            const parsed: unknown = JSON.parse(saved);
            if (!isSystemBrief(parsed)) throw new Error("Unsupported saved brief");
            setBrief(parsed); setCanPersist(true);
          } catch { setRecovery(saved); setPersistence("blocked"); }
        } else setCanPersist(true);
      } catch { setPersistence("unavailable"); }
      setReady(true);
    });
    return () => { active = false; };
  }, []);
  useEffect(() => {
    if (!ready || !canPersist) return;
    let active = true;
    let status: "saved" | "unavailable" = "saved";
    try { localStorage.setItem(storageKey, JSON.stringify(brief)); }
    catch { status = "unavailable"; }
    queueMicrotask(() => { if (active) setPersistence(status); });
    return () => { active = false; };
  }, [brief, ready, canPersist]);

  const result = decideSystem(brief);
  const candidates = decisionCandidates(result);
  function update<K extends keyof SystemBrief>(key: K, value: SystemBrief[K]) { setBrief((current) => ({ ...current, [key]: value })); setNotice(""); }
  function download() {
    const payload = { schemaVersion: 1, exportedAt: new Date().toISOString(), brief };
    const url = URL.createObjectURL(new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" }));
    const anchor = document.createElement("a"); anchor.href = url; anchor.download = "starlight-system-brief.json"; anchor.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setNotice("Brief exported. Keep the file private if it names your equipment.");
  }
  function downloadRecovery() {
    if (recovery === null) return;
    const url = URL.createObjectURL(new Blob([recovery], { type: "text/plain" }));
    const anchor = document.createElement("a"); anchor.href = url; anchor.download = "starlight-system-brief-recovery.txt"; anchor.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setNotice("Original saved data exported unchanged. Keep the recovery file private.");
  }
  async function importFile(file: File | undefined) {
    if (!file) return;
    try {
      if (file.size > 32768) throw new Error("File exceeds 32 KB.");
      const parsed: unknown = JSON.parse(await file.text());
      const candidate = readSystemBriefImport(parsed);
      if (!candidate) throw new Error("Unsupported brief format or schema version.");
      setBrief(candidate); setRecovery(null); setCanPersist(true); setPersistence("pending");
      setNotice("Brief imported. Export a backup to transfer it between browsers.");
    } catch (error) { setNotice(error instanceof Error ? error.message : "Could not import brief."); }
  }
  function clear() {
    if (recovery !== null && !window.confirm("Replace unreadable saved data with a new brief? Export a recovery copy first.")) return;
    setBrief({ ...defaultBrief }); setRecovery(null); setCanPersist(true); setPersistence("pending");
    setNotice("Brief reset. Persistence status is shown below.");
  }

  return <div className="studio-layout">
    <form className="studio-form" onSubmit={(event) => event.preventDefault()}>
      <div className="studio-form-head"><span>01 / SYSTEM INPUT</span><strong>Define the actual work</strong></div>
      <label>Primary workload<select value={brief.workload} onChange={(event) => update("workload", event.target.value as SystemBrief["workload"])}>{workloads.map((value) => <option key={value}>{value}</option>)}</select></label>
      <label>Where it operates<select value={brief.environment} onChange={(event) => update("environment", event.target.value as SystemBrief["environment"])}>{environments.map((value) => <option key={value}>{value}</option>)}</select></label>
      <label>Hard constraint<select value={brief.constraint} onChange={(event) => update("constraint", event.target.value as SystemBrief["constraint"])}>{constraints.map((value) => <option key={value}>{value}</option>)}</select></label>
      <label>Equipment you already own <span className="studio-optional">Private to this browser</span><textarea rows={3} maxLength={1000} value={brief.existingAssets} onChange={(event) => update("existingAssets", event.target.value)} placeholder="Optional: machine, display, headset, network or robot variant" /></label>
      <div className="studio-actions"><button type="button" onClick={download}>Export brief</button><label className="studio-import">Import JSON<input type="file" accept="application/json,.json" onChange={(event) => { void importFile(event.target.files?.[0]); event.target.value = ""; }} /></label><button type="button" onClick={clear}>Reset</button></div>
      {recovery !== null && <button type="button" onClick={downloadRecovery}>Export recovery copy</button>}
      <p className="studio-privacy" role={persistence === "unavailable" || persistence === "blocked" ? "alert" : undefined}>{persistence === "saved" ? "Autosaved on this device." : persistence === "unavailable" ? "Browser storage is unavailable. Changes remain in memory for this session; export a backup before leaving." : persistence === "blocked" ? "Saved data could not be read and has been kept unchanged. Changes remain in memory. Export a recovery copy before resetting or importing a supported brief." : "Restoring your private brief."} The equipment note is never sent to the public decision API. Export/import transfers it only when you choose.</p>
      <p className="studio-notice" role="status">{notice}</p>
    </form>
    <section className="studio-output" aria-live="polite"><div className="studio-form-head"><span>02 / DECISION</span><strong>{result.status === "hold" ? "Hold selection" : "Research candidates"}</strong></div>
      <div className="studio-status"><span className={result.status}>{result.status.toUpperCase()}</span><span>Model reviewed {result.reviewedAt}</span></div>
      <h2>{result.headline}</h2><p className="studio-rationale">{result.rationale}</p>
      {candidates.length > 0 && <div className="studio-candidates">{candidates.map((item) => <Link href={`/shop/${item.slug}`} key={item.slug}><span>{item.category} / {item.maker}</span><strong>{item.name}</strong><small>Inspect source and wrong-fit conditions ↗</small></Link>)}</div>}
      <div className="studio-checks"><h3>Before a purchase decision</h3><ol>{result.checks.map((check) => <li key={check}>{check}</li>)}</ol></div>
      {brief.existingAssets.trim() && <p className="studio-assets-note">Your equipment note is saved in the brief. Its compatibility has <strong>not been verified</strong>; check exact model and interface versions against the candidate.</p>}
      <p className="studio-disclaimer">A deterministic starting point over the sourced catalog. Unknown compatibility remains unknown; no live stock or merchant offers.</p>
    </section>
  </div>;
}
