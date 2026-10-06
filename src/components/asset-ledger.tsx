"use client";

import { useEffect, useState } from "react";
import { assetKinds, assetStates, mergeAssets, readAssetImport, type AssetKind, type AssetState, type OwnedAsset } from "@/lib/owned-assets";

const storageKey = "starlight-technology-owned-assets-v1";

export function AssetLedger() {
  const [assets, setAssets] = useState<OwnedAsset[]>([]);
  const [ready, setReady] = useState(false);
  const [canPersist, setCanPersist] = useState(false);
  const [recovery, setRecovery] = useState<string | null>(null);
  const [persistence, setPersistence] = useState<"pending" | "saved" | "unavailable" | "blocked">("pending");
  const [kind, setKind] = useState<AssetKind>("Computer");
  const [name, setName] = useState("");
  const [capabilities, setCapabilities] = useState("");
  const [location, setLocation] = useState("");
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
            const restored = readAssetImport({ schemaVersion: 1, assets: parsed });
            if (!restored) throw new Error("Unsupported saved inventory");
            setAssets(restored); setCanPersist(true);
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
    try { localStorage.setItem(storageKey, JSON.stringify(assets)); }
    catch { status = "unavailable"; }
    queueMicrotask(() => { if (active) setPersistence(status); });
    return () => { active = false; };
  }, [assets, ready, canPersist]);

  function add(event: React.FormEvent) {
    event.preventDefault();
    if (!name.trim() || assets.length >= 100) return;
    setAssets((current) => [{ id: crypto.randomUUID(), kind, name: name.trim(), capabilities: capabilities.trim(), location: location.trim(), state: "Owned", updatedAt: new Date().toISOString() }, ...current]);
    setName(""); setCapabilities(""); setLocation(""); setNotice("Asset added. Export a backup before moving to another browser.");
  }
  function changeState(id: string, state: AssetState) { setAssets((current) => current.map((asset) => asset.id === id ? { ...asset, state, updatedAt: new Date().toISOString() } : asset)); }
  function remove(id: string) { if (window.confirm("Remove this asset from this browser? Export a backup first if needed.")) setAssets((current) => current.filter((asset) => asset.id !== id)); }
  function exportLedger() {
    const url = URL.createObjectURL(new Blob([JSON.stringify({ schemaVersion: 1, exportedAt: new Date().toISOString(), assets }, null, 2)], { type: "application/json" }));
    const anchor = document.createElement("a"); anchor.href = url; anchor.download = "starlight-assets.json"; anchor.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
    setNotice("Ledger exported. Keep the file private.");
  }
  function exportRecovery() {
    if (recovery === null) return;
    const url = URL.createObjectURL(new Blob([recovery], { type: "text/plain" }));
    const anchor = document.createElement("a"); anchor.href = url; anchor.download = "starlight-assets-recovery.txt"; anchor.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setNotice("Original saved data exported unchanged. Keep the recovery file private.");
  }
  function resetRecovery() {
    if (!window.confirm("Replace unreadable saved inventory with an empty ledger? Export a recovery copy first.")) return;
    setAssets([]); setRecovery(null); setCanPersist(true); setPersistence("pending");
    setNotice("Inventory reset. Persistence status is shown below.");
  }
  async function importLedger(file: File | undefined) {
    if (!file) return;
    try {
      if (file.size > 100000) throw new Error("File exceeds 100 KB.");
      const imported = readAssetImport(JSON.parse(await file.text()) as unknown);
      if (!imported) throw new Error("Unsupported or invalid ledger.");
      const merged = mergeAssets(assets, imported);
      setAssets(merged.assets);
      setRecovery(null); setCanPersist(true); setPersistence("pending");
      setNotice(`${merged.added} added; ${merged.skipped} duplicate or over-limit records skipped. Local records were preserved.`);
    } catch (error) { setNotice(error instanceof Error ? error.message : "Could not import ledger."); }
  }

  return <div className="ledger-layout"><form className="ledger-form" onSubmit={add}><div className="studio-form-head"><span>01 / REGISTER</span><strong>Private local ledger</strong></div><label>Device type<select value={kind} onChange={(event) => setKind(event.target.value as AssetKind)}>{assetKinds.map((value) => <option key={value}>{value}</option>)}</select></label><label>Model or asset name<input required maxLength={100} value={name} onChange={(event) => setName(event.target.value)} placeholder="Your model or working name" /></label><label>Capabilities to verify<input maxLength={300} value={capabilities} onChange={(event) => setCapabilities(event.target.value)} placeholder="Ports, memory, SDK, supported formats…" /></label><label>Location or role<input maxLength={80} value={location} onChange={(event) => setLocation(event.target.value)} placeholder="Studio, travel, test site…" /></label><button className="button button-primary" type="submit" disabled={assets.length >= 100}>Add asset</button><p>No serial numbers, credentials or telemetry. This ledger is an inventory draft; entered capabilities are unverified.</p></form>
    <section className="ledger-list"><div className="studio-form-head"><span>02 / ESTATE</span><strong>{assets.length} assets</strong></div><div className="studio-actions"><button type="button" onClick={exportLedger}>Export JSON</button><label className="studio-import">Import JSON<input type="file" accept="application/json,.json" onChange={(event) => { void importLedger(event.target.files?.[0]); event.target.value = ""; }} /></label></div><p className="studio-notice" role="status">{notice}</p>{assets.length ? <div className="ledger-items">{assets.map((asset) => <article key={asset.id}><div><span>{asset.kind} / {asset.location || "Location unset"}</span><h2>{asset.name}</h2><p>{asset.capabilities || "Capabilities not recorded"}</p></div><div className="ledger-item-actions"><label>Status<select value={asset.state} onChange={(event) => changeState(asset.id, event.target.value as AssetState)}>{assetStates.map((state) => <option key={state}>{state}</option>)}</select></label><button type="button" onClick={() => remove(asset.id)}>Remove</button></div></article>)}</div> : <div className="ledger-empty"><h2>Your estate starts here.</h2><p>Add a machine, phone, display, headset or research robot. Export the ledger to move it between devices.</p></div>}{recovery !== null && <div className="studio-actions"><button type="button" onClick={exportRecovery}>Export recovery copy</button><button type="button" onClick={resetRecovery}>Reset unreadable ledger</button></div>}<p className="studio-privacy" role={persistence === "unavailable" || persistence === "blocked" ? "alert" : undefined}>{persistence === "saved" ? "Saved in this browser." : persistence === "unavailable" ? "Browser storage is unavailable. Changes remain in memory for this session; export a backup before leaving." : persistence === "blocked" ? "Saved data could not be read and has been kept unchanged. Changes remain in memory. Export a recovery copy before resetting or importing a supported ledger." : "Restoring your private inventory."} Import merges new IDs and preserves existing local entries. For team sync, roles and telemetry, the private operational layer in the architecture document is required.</p></section></div>;
}
