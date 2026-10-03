"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { type ConfiguratorInput, type ConfiguredSystem } from "@/lib/decision-graph/configurator";
import { confirmCreatorReplacement, encodeCreatorReport, parseCreatorExport, toCreatorReport, toCreatorReportMarkdown } from "@/lib/decision-graph/creator-report";
import { toBuildSheetJson, toBuildSheetMarkdown } from "@/lib/decision-graph/build-sheet";
import { resolveOutboundLink } from "@/lib/decision-graph/partner-links";
import { decisionGraph } from "@/lib/decision-graph/dataset";
import { indexGraph } from "@/lib/decision-graph/graph";
import type { Region } from "@/lib/decision-graph/schema";
import { assessCreatorPlan, CREATOR_PLAN_MAX_BYTES, encodeCreatorPlan, monthlyScenario, newCreatorPlan, parseCreatorPlan, type CreatorPlan, type MonthlyAssumptions } from "@/lib/decision-graph/creator-plan";
import { stableHash } from "@/lib/decision-graph/graph";
import { saveCreatorDraft, type DraftLock } from "@/lib/decision-graph/draft-storage";
import { assessPurchase } from "@/lib/decision-graph/purchase-review";
import { assessFreshness } from "@/lib/decision-graph/staleness";
import { newFactoryScenario } from "@/lib/decision-graph/ai-factory-costs";
import { FactoryCostEditor } from "./factory-cost-editor";

const workloadOptions = [
  { id: "wl-local-llm-large", label: "Run a 70B-class model locally" },
  { id: "wl-local-llm-mid", label: "Run a 32B-class model locally" },
  { id: "wl-video-4k", label: "Edit and deliver 4K video" },
  { id: "wl-music", label: "Record and mix music" },
  { id: "wl-travel-capture", label: "Capture and publish while travelling" },
];

const constraintOptions = [
  { id: "con-silent", label: "Must stay quiet in a recording room" },
  { id: "con-carry-daily", label: "Must travel in a daily bag" },
  { id: "con-apple", label: "Apple platform only" },
  { id: "con-watts-400", label: "Under 400 W at the wall" },
];

const budgetOptions = [
  { id: "bud-1500", label: "Up to EUR 1,500" },
  { id: "bud-3000", label: "Up to EUR 3,000" },
  { id: "bud-7000", label: "Up to EUR 7,000" },
];

const regionOptions: { code: Region; label: string }[] = [
  { code: "EU-NL", label: "Netherlands" },
  { code: "EU", label: "Rest of the EU" },
  { code: "US", label: "United States" },
];

const graphIndex = indexGraph(decisionGraph);

function merchantUrlFor(nodeId: string): string {
  const node = graphIndex.get(nodeId);
  const sourceId = node && "specs" in node ? Object.values(node.specs)[0]?.source : undefined;
  const source = sourceId ? graphIndex.get(sourceId) : undefined;
  return source && source.kind === "EvidenceSource" ? source.url : "/methodology";
}

function download(filename: string, contents: string, type: string) {
  const url = URL.createObjectURL(new Blob([contents], { type }));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function toggle(list: string[], value: string): string[] {
  return list.includes(value) ? list.filter((entry) => entry !== value) : [...list, value];
}

function SystemPanel({ system, input, selected, onSelect }: { system: ConfiguredSystem; input: ConfiguratorInput; selected: boolean; onSelect: () => void }) {
  const purchase = assessPurchase(system, input, decisionGraph, new Date().toISOString().slice(0, 10));
  const freshness = assessFreshness(system, { now: new Date().toISOString().slice(0, 10) });
  return (
    <article className="dg-system">
      <header className="dg-system-head">
        <span className="dg-tier">{system.tier.replace("-", " ")}</span>
        <h3>{system.label}</h3>
      </header>
      <button type="button" className="button button-quiet" aria-pressed={selected} onClick={onSelect}>{selected ? "Selected in your plan" : "Select this system"}</button>
      {!freshness.valid && <p className="dg-plan-warning">Evidence needs refresh: {freshness.reasons.join(" ")} Selection is a planning preference; price, compatibility and delivery still require verification.</p>}

      <details className="dg-purchase">
        <summary>Purchase check: {purchase.deliveredTotalMinor === null ? "needs verification" : "delivered quote recorded"}</summary>
        <p>{purchase.scope}</p>
        <p>Delivered cost: {purchase.deliveredTotalMinor === null ? "unknown" : `${(purchase.deliveredTotalMinor / 100).toFixed(2)} ${purchase.currency}`}. Delivered-budget verdict: {purchase.budgetVerdict}.</p>
        {purchase.unresolved.length > 0 && <ul>{purchase.unresolved.map((reason) => <li key={reason}>{reason}</li>)}</ul>}
        {purchase.quotes.map((quote) => <p key={quote.observationId}>Observed {quote.observedAt}: {quote.merchantSku ?? quote.subjectId}. {quote.kind}. VAT: {quote.vatIncluded === null ? "unknown" : quote.vatIncluded ? "included" : "excluded"}; shipping/import costs require the matching quote.</p>)}
        <button type="button" className="button button-quiet" onClick={() => download(`starlight-purchase-review-${system.archetypeId}.json`, JSON.stringify(purchase, null, 2), "application/json")}>Export purchase review</button>
      </details>

      <table className="dg-table">
        <caption className="dg-caption">Every line carries its price basis and where the link goes.</caption>
        <thead>
          <tr>
            <th scope="col">Part</th>
            <th scope="col">Role</th>
            <th scope="col">Price</th>
            <th scope="col">Why this one</th>
          </tr>
        </thead>
        <tbody>
          {system.lines.map((line) => {
            const link = resolveOutboundLink(decisionGraph, line.nodeId, merchantUrlFor(line.nodeId));
            return (
              <tr key={line.nodeId}>
                <th scope="row">
                  <a href={link.href} rel={link.rel} target="_blank">
                    {line.label}
                  </a>
                  <span className="dg-disclosure">{link.disclosure}</span>
                </th>
                <td>{line.role}</td>
                <td>
                  {line.priceMinor === null || !line.currency
                    ? "unverified"
                    : `${(line.priceMinor / 100).toFixed(2)} ${line.currency}`}
                  <span className="dg-basis">{line.priceBasis}</span>
                </td>
                <td>{line.justification}</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <dl className="dg-facts">
        <div>
          <dt>Known part costs</dt>
          <dd>
            {Object.entries(system.cost.pricedTotalsMinor).length
              ? Object.entries(system.cost.pricedTotalsMinor).map(([currency, minor]) => `${(minor / 100).toFixed(2)} ${currency}`).join("; ")
              : "No priced parts observed"}.
            {system.cost.unpricedLines.length > 0 ? ` ${system.cost.unpricedLines.length} unpriced lines.` : ""}
            {purchase.deliveredTotalMinor === null ? " Delivered cost remains unknown." : ` Delivered quote: ${(purchase.deliveredTotalMinor / 100).toFixed(2)} ${purchase.currency}.`}
            {" "}See the purchase check for assembly, dates and delivery terms.
          </dd>
        </div>
        <div>
          <dt>First bottleneck</dt>
          <dd>
            <strong>{system.bottleneck.resource}</strong> — {system.bottleneck.explanation}
          </dd>
        </div>
        <div>
          <dt>Upgrade path</dt>
          <dd>
            <ul>
              {system.upgradePath.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ul>
          </dd>
        </div>
        <div>
          <dt>Power, noise, mobility</dt>
          <dd>
            {system.tradeoffs.power} {system.tradeoffs.noise} {system.tradeoffs.mobility}
          </dd>
        </div>
      </dl>

      {system.wrongPurchaseConditions.length > 0 && (
        <section className="dg-warnings">
          <h4>Do not buy this if</h4>
          <ul>
            {system.wrongPurchaseConditions.map((condition) => (
              <li key={condition.id}>
                <strong>{condition.condition}</strong> {condition.instead}
              </li>
            ))}
          </ul>
        </section>
      )}
    </article>
  );
}

export function StudioConfigurator() {
  const contextLabelId = useId();
  const comparisonId = useId();
  const [plan, setPlan] = useState<CreatorPlan>(() => newCreatorPlan());
  const [loaded, setLoaded] = useState(false);
  const [persistence, setPersistence] = useState<"pending" | "saved" | "unavailable" | "blocked" | "conflict">("pending");
  const [recovery, setRecovery] = useState<string | null>(null);
  const [notice, setNotice] = useState("");
  const observedRaw = useRef<string | null>(null);
  const [conflict, setConflict] = useState<{ raw: string | null } | null>(null);
  const storageKey = "starlight-creator-plan-v1";
  useEffect(() => {
    let active = true;
    let restored: CreatorPlan | null = null, original: string | null = null, unavailable = false;
    try { original = localStorage.getItem(storageKey); if (original !== null) restored = parseCreatorPlan(original); }
    catch { unavailable = original === null; }
    queueMicrotask(() => {
      if (!active) return;
      observedRaw.current = original;
      if (restored) setPlan(restored);
      if (original !== null && !restored) { setRecovery(original); setPersistence("blocked"); }
      else if (unavailable) setPersistence("unavailable");
      setLoaded(true);
    });
    return () => { active = false; };
  }, []);
  useEffect(() => {
    if (!loaded || recovery !== null || conflict !== null) return;
    let active = true;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);
    const lock: DraftLock | null = navigator.locks ? async (operation) => await navigator.locks.request(storageKey, { signal: controller.signal }, operation) : null;
    void (async () => {
      try {
        const result = await saveCreatorDraft(localStorage, storageKey, () => observedRaw.current, encodeCreatorPlan(plan, new Date().toISOString()), lock, () => active, (raw) => { observedRaw.current = raw; });
        if (!active || result.status === "cancelled") return;
        if (result.status === "saved") observedRaw.current = result.raw;
        if (result.status === "conflict") setConflict({ raw: result.raw });
        setPersistence(result.status);
      } catch { if (active) setPersistence("unavailable"); }
      finally { clearTimeout(timeout); }
    })();
    return () => { active = false; controller.abort(); clearTimeout(timeout); };
  }, [plan, loaded, recovery, conflict]);
  useEffect(() => {
    if (!loaded) return;
    function changed(event: StorageEvent) {
      if (event.key !== storageKey && event.key !== null) return;
      // Read current data: a queued event's newValue may already have been superseded.
      try {
        if (event.storageArea !== localStorage) return;
        const raw = localStorage.getItem(storageKey);
        if (raw !== observedRaw.current) { setConflict({ raw }); setPersistence("conflict"); }
      } catch { setPersistence("unavailable"); }
    }
    window.addEventListener("storage", changed);
    return () => window.removeEventListener("storage", changed);
  }, [loaded]);
  function useSavedPlan() {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw === null) { setNotice("The saved plan was removed. Your current draft stays in memory; export it or explicitly save it again."); return; }
      const imported = parseCreatorPlan(raw);
      if (!window.confirm("Load the saved plan and replace this tab's draft? Export this draft first if you want to keep both.")) return;
      observedRaw.current = raw; setPlan(imported); setRecovery(null); setConflict(null);
      setNotice("Saved plan loaded. Current catalog evidence is checked again.");
    } catch { setNotice("The saved copy could not be loaded. Both copies are kept; export them before choosing a replacement."); }
  }
  function keepCurrentDraft() {
    try {
      const raw = localStorage.getItem(storageKey);
      if (!confirmCreatorReplacement("replace", recovery !== null, (message) => window.confirm(message))) return;
      observedRaw.current = raw; setConflict(null); setRecovery(null); setPlan((current) => ({ ...current }));
      setNotice("Saving this draft if the acknowledged saved copy is still unchanged.");
    } catch { setNotice("Storage is unavailable. Export this draft before leaving."); }
  }
  function exportOtherCopy() {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw === null) { setNotice("There is no other saved copy to export. This tab's draft is unchanged."); return; }
      download("starlight-other-saved-plan.txt", raw, "text/plain");
      setNotice("Other saved copy exported unchanged. It can contain private context.");
    } catch { setNotice("The other saved copy is unavailable. This tab's draft is unchanged."); }
  }
  const input = plan.input;
  const setInput = (update: (current: ConfiguratorInput) => ConfiguratorInput) => setPlan((current) => ({ ...current, input: update(current.input) }));
  const assessment = useMemo(() => assessCreatorPlan(plan), [plan]);
  const output = assessment.output;
  const monthly = monthlyScenario(plan.monthly, plan.factory);

  async function importPlan(file?: File) {
    if (!file) return;
    try {
      if (file.size > CREATOR_PLAN_MAX_BYTES) throw new Error("Plan exceeds 64 KiB.");
      const imported = parseCreatorExport(await file.text());
      if (!confirmCreatorReplacement("import", recovery !== null, (message) => window.confirm(message))) { setNotice("Import cancelled. Your current draft and recovery copy are unchanged."); return; }
      setPlan(imported); setRecovery(null); setNotice("Editable inputs imported. Comparisons and costs are recalculated; persistence status is shown below.");
    } catch (error) { setNotice(error instanceof Error ? error.message : "Import failed. Your current draft is unchanged."); }
  }
  function resetPlan() {
    if (!confirmCreatorReplacement("reset", recovery !== null, (message) => window.confirm(message))) return;
    setPlan(newCreatorPlan()); setRecovery(null); setNotice("Plan reset. Persistence status is shown below.");
  }
  function exportPlan() {
    try { download("starlight-creator-plan.json", encodeCreatorPlan(plan, new Date().toISOString()), "application/json"); setNotice("Plan exported. It includes your private context; share it only when you choose."); }
    catch (error) { setNotice(error instanceof Error ? error.message : "Export failed."); }
  }
  function changeMonthly(key: keyof MonthlyAssumptions, value: string, minor = false) {
    const number = value === "" ? null : Number(value);
    const next = { ...plan.monthly, [key]: number === null ? null : minor ? Math.round(number * 100) : number };
    try { monthlyScenario(next); }
    catch { setNotice("Enter a nonnegative value within the field's range. The previous assumptions are unchanged."); return; }
    setPlan((current) => ({ ...current, monthly: { ...current.monthly, [key]: number === null ? null : minor ? Math.round(number * 100) : number } }));
  }

  const exportSheet = (format: "md" | "json") => {
    try {
      const generatedAt = new Date().toISOString();
      const text = format === "json" ? encodeCreatorReport(plan, generatedAt) : toCreatorReportMarkdown(toCreatorReport(plan, generatedAt));
      download(`starlight-creator-report-${output.inputsHash}.${format}`, text, format === "json" ? "application/json" : "text/markdown");
      setNotice("Complete plan exported with your private context, cost assumptions and dated evidence. Share it only when you choose.");
    } catch (error) { setNotice(error instanceof Error ? error.message : "Report export failed. Your draft is unchanged."); }
  };
  function exportHardwareSheet() {
    const sheet = toBuildSheetJson(output, { now: new Date().toISOString().slice(0, 10) });
    download(`starlight-build-sheet-${output.inputsHash}.md`, toBuildSheetMarkdown(sheet), "text/markdown");
    setNotice("Hardware-only sheet exported without your private work notes or factory assumptions.");
  }

  return (
    <section className="dg" aria-labelledby="dg-title">
      <div className="finder-head">
        <span>AI creator studio configurator</span>
        <span>Your private plan stays in this browser</span>
      </div>

      <h2 id="dg-title" className="dg-title">
        Choose the work and constraints.
      </h2>

      <section className="dg-plan-summary" aria-label="Current system alternatives" aria-live="polite">
        <h3>{output.systems.length ? `${output.systems.length} system ${output.systems.length === 1 ? "candidate" : "candidates"} for this plan` : "No system candidate meets these constraints"}</h3>
        {output.systems.length > 0 && <ul>{output.systems.map((system) => <li key={system.archetypeId}><a href={`#${comparisonId}`}>{system.label}</a><span>{plan.selectedArchetypeId === system.archetypeId ? "Selected in your plan. " : ""}{system.cost.budgetVerdict === "unknown" ? "Delivered cost needs verification." : system.cost.budgetNote}</span></li>)}</ul>}
        <p>Compare the parts, bottlenecks and source evidence below. A selection records your preference; it does not place an order.</p>
      </section>

      <fieldset className="dg-plan">
        <legend>Your editable plan</legend>
        <label>Plan title<input maxLength={120} value={plan.title} onChange={(event) => setPlan((current) => ({ ...current, title: event.target.value }))} /></label>
        <label><span id={contextLabelId}>Existing equipment and intended work</span><textarea aria-labelledby={contextLabelId} rows={4} maxLength={4000} value={plan.privateContext} onChange={(event) => setPlan((current) => ({ ...current, privateContext: event.target.value }))} placeholder="Keep private repo names and equipment notes on this device. Describe the work this system must finish." /></label>
        <div className="dg-plan-actions">
          <button type="button" className="button button-quiet" onClick={exportPlan}>Export editable plan</button>
          <label className="button button-quiet dg-plan-import">Import editable plan<input type="file" accept="application/json,.json" onChange={(event) => { void importPlan(event.target.files?.[0]); event.target.value = ""; }} /></label>
          <button type="button" className="button button-quiet" onClick={resetPlan}>Reset plan</button>
          {persistence === "unavailable" && <button type="button" className="button button-quiet" onClick={() => setPlan((current) => ({ ...current }))}>Retry saving</button>}
          {recovery !== null && <button type="button" className="button button-quiet" onClick={() => download("starlight-plan-recovery.txt", recovery, "text/plain")}>Export recovery copy</button>}
        </div>
        <p role={persistence === "blocked" || persistence === "unavailable" || persistence === "conflict" ? "alert" : undefined}>{persistence === "saved" ? "Autosaved on this device." : persistence === "conflict" ? "Autosave paused to preserve another saved copy. Your draft stays in memory; export it before leaving." : persistence === "blocked" ? "Unreadable saved data is kept unchanged. Edits remain in memory; export a recovery copy before replacement." : persistence === "unavailable" ? "Safe browser saving is unavailable or busy. Edits remain in memory for this session; export a backup before leaving." : "Restoring your private plan."} Editable exports contain your context. No plan data is sent to a server.</p>
        <p role="status">{notice}</p>
        {conflict !== null && <section aria-label="Plan save conflict">
          <p role="alert">The saved plan changed in another tab or was removed. Autosave is paused; edits in this tab and the other saved copy are kept separately. Export both before choosing which to keep.</p>
          <div className="dg-plan-actions">
            <button type="button" className="button button-quiet" onClick={exportOtherCopy}>Export other saved copy</button>
            <button type="button" className="button button-quiet" onClick={useSavedPlan}>Load saved plan</button>
            <button type="button" className="button button-quiet" onClick={keepCurrentDraft}>Save this draft instead</button>
          </div>
        </section>}
        {assessment.catalogChanged && <p className="dg-plan-warning">The catalog changed since this plan was saved. Systems have been recalculated; refresh dated evidence before buying. <button type="button" onClick={() => setPlan((current) => ({ ...current, catalogHash: stableHash(decisionGraph) }))}>Acknowledge current catalog</button></p>}
        {assessment.selectionInvalidated && <p className="dg-plan-warning">Your previous selected system no longer satisfies these requirements. Choose an eligible alternative or revise the constraints.</p>}
      </fieldset>

      <div className="dg-inputs">
        <fieldset>
          <legend>Workloads</legend>
          {workloadOptions.map((option) => (
            <label key={option.id}>
              <input
                type="checkbox"
                checked={input.workloadIds.includes(option.id)}
                onChange={() => setInput((current) => ({ ...current, workloadIds: toggle(current.workloadIds, option.id) }))}
              />
              {option.label}
            </label>
          ))}
        </fieldset>

        <fieldset>
          <legend>Non-negotiables</legend>
          {constraintOptions.map((option) => (
            <label key={option.id}>
              <input
                type="checkbox"
                checked={input.constraintIds.includes(option.id)}
                onChange={() =>
                  setInput((current) => ({ ...current, constraintIds: toggle(current.constraintIds, option.id) }))
                }
              />
              {option.label}
            </label>
          ))}
          <p className="dg-hint">A non-negotiable disqualifies a system outright. It never quietly costs it points.</p>
        </fieldset>

        <fieldset>
          <legend>Budget and region</legend>
          <label className="dg-select">
            Budget
            <select value={input.budgetId} onChange={(event) => setInput((current) => ({ ...current, budgetId: event.target.value }))}>
              {budgetOptions.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <label className="dg-select">
            Region
            <select
              value={input.regionCode}
              onChange={(event) => setInput((current) => ({ ...current, regionCode: event.target.value as Region }))}
            >
              {regionOptions.map((option) => (
                <option key={option.code} value={option.code}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </fieldset>
      </div>

      <div className="dg-requirement" aria-live="polite">
        <span>Sized against</span>
        <strong>
          {output.requirement.vramGb} GB model memory · {output.requirement.systemRamGb} GB system memory ·{" "}
          {output.requirement.cpuThreads} threads · {output.requirement.fastStorageTb} TB fast storage ·{" "}
          {output.requirement.portability}
        </strong>
      </div>

      {output.unmet.length > 0 && (
        <div className="dg-unmet">
          {output.unmet.map((note) => (
            <p key={note}>{note}</p>
          ))}
        </div>
      )}

      <div className="dg-systems" id={comparisonId}>
        {output.systems.map((system) => (
          <SystemPanel key={system.tier} system={system} input={input} selected={plan.selectedArchetypeId === system.archetypeId} onSelect={() => setPlan((current) => ({ ...current, selectedArchetypeId: system.archetypeId }))} />
        ))}
      </div>

      {plan.factory === null ? <p><button type="button" className="button button-quiet" onClick={() => setPlan((current) => ({ ...current, factory: newFactoryScenario() }))}>Estimate agent operating costs</button></p> : <>
        <FactoryCostEditor value={plan.factory} onChange={(factory) => setPlan((current) => ({ ...current, factory }))} />
        <p><button type="button" className="button button-quiet" onClick={() => { if (window.confirm("Remove the agent cost scenario? Export your editable plan first to retain these assumptions.")) setPlan((current) => ({ ...current, factory: null })); }}>Remove agent cost scenario</button></p>
      </>}
      <fieldset className="dg-plan">
        <legend>Recurring-cost scenario</legend>
        <p>Enter your assumptions in EUR. Empty values remain unknown. The estimate uses 30 days; it does not establish an invoice or measured power draw.</p>
        {plan.factory !== null && <p>The total below adds the modeled agent increment to your existing software, cloud and electricity assumptions. Keep the new costs out of these existing amounts to avoid counting them twice. Tax, egress and hardware financing remain separate.</p>}
        <div className="dg-plan-costs">
          <label>Software per month (EUR)<input type="number" min="0" max="1000000" step="0.01" value={plan.monthly.softwareMinor === null ? "" : plan.monthly.softwareMinor / 100} onChange={(event) => changeMonthly("softwareMinor", event.target.value, true)} /></label>
          <label>Cloud per month (EUR)<input type="number" min="0" max="1000000" step="0.01" value={plan.monthly.cloudMinor === null ? "" : plan.monthly.cloudMinor / 100} onChange={(event) => changeMonthly("cloudMinor", event.target.value, true)} /></label>
          <label>Average machine power (W)<input type="number" min="0" max="10000" step="0.1" value={plan.monthly.averageWatts ?? ""} onChange={(event) => changeMonthly("averageWatts", event.target.value)} /></label>
          <label>Hours per day<input type="number" min="0" max="24" step="0.1" value={plan.monthly.hoursPerDay ?? ""} onChange={(event) => changeMonthly("hoursPerDay", event.target.value)} /></label>
          <label>Electricity per kWh (EUR)<input type="number" min="0" max="100" step="0.001" value={plan.monthly.euroPerKwh ?? ""} onChange={(event) => changeMonthly("euroPerKwh", event.target.value)} /></label>
        </div>
        <p aria-live="polite">Electricity: {monthly.electricityMinor === null ? "unknown" : `EUR ${(monthly.electricityMinor / 100).toFixed(2)}/month`}. Total recurring scenario: {monthly.totalMinor === null ? "incomplete assumptions" : `EUR ${(monthly.totalMinor / 100).toFixed(2)}/month`}. Hardware cost and financing remain separate.</p>
      </fieldset>

      {output.disqualified.length > 0 && (
        <section className="dg-ruled-out">
          <h3>Ruled out, and why</h3>
          <ul>
            {output.disqualified.map((item) => (
              <li key={item.archetypeId}>
                <strong>{item.label}</strong> {item.reason}
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="dg-export">
        <button type="button" className="button button-primary" onClick={() => exportSheet("md")}>
          Export complete plan
        </button>
        <button type="button" className="button button-quiet" onClick={() => exportSheet("json")}>
          Export report JSON
        </button>
        <button type="button" className="button button-quiet" onClick={exportHardwareSheet}>Export hardware only</button>
        <p className="dg-hint">
          The report includes your private work notes, hardware alternatives, recurring costs and factory assumptions.
          Import its JSON to restore editable inputs and recalculate against current evidence. Hardware earns us nothing;
          software partner links are disclosed.
        </p>
      </div>
    </section>
  );
}
