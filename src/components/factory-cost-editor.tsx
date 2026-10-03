"use client";
import { useId, useState } from "react";
import { calculateFactoryScenario, factoryComputeRate, factoryModelRates, readFactoryScenario, type FactoryCostScenario, type StageAssumptions } from "@/lib/decision-graph/ai-factory-costs";
import { readFactoryInput } from "@/lib/decision-graph/factory-input";
import styles from "./factory-cost-editor.module.css";

const dollars = (value: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2, maximumFractionDigits: value < 0.01 ? 6 : 2 }).format(value);
const euros = (minor: number | null) => minor === null ? "EUR unknown" : new Intl.NumberFormat("en-NL", { style: "currency", currency: "EUR" }).format(minor / 100);
type Amount = ReturnType<typeof calculateFactoryScenario>["knownSubtotal"];
function Money({ amount }: { amount: Amount }) { return <>{dollars(amount.usd)} <span className={styles.secondary}>{euros(amount.euroMinor)}</span></>; }
function NumberField({ label, current, min, max, changeValue, scale, optional }: { label: string; current: number | null; min: number; max: number; changeValue: (amount: number | null) => boolean; scale: number; optional: boolean }) {
  const id = useId();
  const [edit, setEdit] = useState<{ base: number | null; draft: string | null; error: string }>({ base: current, draft: null, error: "" });
  if (edit.base !== current) setEdit({ base: current, draft: null, error: "" });
  const { draft, error } = edit.base === current ? edit : { draft: null, error: "" };
  function restore() { setEdit({ base: current, draft: null, error: "" }); }
  function commit() {
    if (draft === null) return;
    const parsed = readFactoryInput(draft, { min, max, scale, optional });
    if (!parsed.ok) { setEdit({ base: current, draft, error: parsed.error }); return; }
    if (changeValue(parsed.value)) restore();
    else setEdit({ base: current, draft, error: "These assumptions conflict. The saved value is unchanged." });
  }
  return <div><label><span id={`${id}-label`}>{label}</span><input type="text" inputMode={scale === 1 ? "numeric" : "decimal"} aria-labelledby={`${id}-label`} aria-describedby={`${id}-range${error ? ` ${id}-error` : ""}`} aria-invalid={error ? true : undefined} value={draft ?? (current === null ? "" : current / scale)} placeholder={optional ? "Unknown" : undefined} onBlur={commit} onChange={(event) => setEdit({ base: current, draft: event.target.value, error: "" })} onKeyDown={(event) => {
    if (event.nativeEvent.isComposing) return;
    if (event.key === "Enter") { event.preventDefault(); commit(); }
    if (event.key === "Escape") { event.preventDefault(); restore(); }
  }} /><span id={`${id}-range`} className={styles.secondary}>Range {min} to {max}; {scale === 1 ? "whole numbers" : `up to ${scale === 100 ? 2 : 6} decimal places`}.{optional ? " Blank means unknown." : ""}</span></label><span id={`${id}-error`} role="status">{error}</span>{error && <button type="button" className="button button-quiet" onClick={restore}>Restore saved value for {label.toLowerCase()}</button>}</div>;
}

export function FactoryCostEditor({ value, onChange }: { value: FactoryCostScenario; onChange: (next: FactoryCostScenario) => void }) {
  const id = useId();
  const [notice, setNotice] = useState("");
  const today = new Date().toISOString().slice(0, 10);
  const result = calculateFactoryScenario(value, today);
  const alternativeRate = factoryModelRates.find((rate) => rate.id === (value.maker.rate.id === "glm" ? "opus" : "glm"))!;
  const alternative = { ...value, maker: { ...value.maker, rate: { ...alternativeRate } } };
  const comparison = calculateFactoryScenario(alternative, today);
  function change(next: FactoryCostScenario) {
    const checked = readFactoryScenario(next);
    if (!checked) { setNotice("Enter a nonnegative value within the displayed range. The previous assumptions are kept."); return false; }
    onChange(checked); setNotice(""); return true;
  }
  function number(label: string, current: number | null, min: number, max: number, changeValue: (amount: number | null) => boolean, scale = 1, optional = false) {
    return <NumberField label={label} current={current} min={min} max={max} changeValue={changeValue} scale={scale} optional={optional} />;
  }
  function stageEditor(kind: "maker" | "reviewer", stage: StageAssumptions) {
    const set = (key: keyof Omit<StageAssumptions, "rate">, amount: number | null) => change({ ...value, [kind]: { ...stage, [key]: amount } });
    return <fieldset className={styles.stage}>
      <legend>{kind === "maker" ? "Maker" : "Independent reviewer"}</legend>
      <label>Model<select value={stage.rate.id} onChange={(event) => change({ ...value, [kind]: { ...stage, rate: { ...factoryModelRates.find((rate) => rate.id === event.target.value)! } } })}>{factoryModelRates.map((rate) => <option key={rate.id} value={rate.id}>{rate.label}</option>)}</select></label>
      {number("Fresh input tokens per mission", stage.freshInputTokens, 0, 10_000_000, (amount) => set("freshInputTokens", amount))}
      {number("Output tokens per mission", stage.outputTokens, 0, 10_000_000, (amount) => set("outputTokens", amount))}
      <details><summary>Cache and native subscription assumptions</summary><div className={styles.inputs}>
        {number("Cache-write tokens per mission", stage.cacheWriteTokens, 0, 10_000_000, (amount) => set("cacheWriteTokens", amount))}
        {number("Cache-candidate input tokens", stage.cacheCandidateTokens, 0, 10_000_000, (amount) => set("cacheCandidateTokens", amount))}
        {number("This provider’s cache-hit assumption (%)", stage.cacheHitBps, 0, 100, (amount) => set("cacheHitBps", amount), 100)}
        {number("Missions billed through APIs (%)", stage.apiShareBps, 0, 100, (amount) => set("apiShareBps", amount), 100)}
      </div><p>Cache candidates that miss are billed as fresh input. Each stage has its own cache and API share. Native capacity needs separate entitlement and quota evidence.</p></details>
      <p className={styles.secondary}><a href={stage.rate.sourceUrl} target="_blank" rel="noopener noreferrer">Rate source</a>, snapshot {stage.rate.observedAt}. USD per million tokens: fresh {dollars(stage.rate.inputMicroUsdPerMillion / 1_000_000)}, output {dollars(stage.rate.outputMicroUsdPerMillion / 1_000_000)}. {stage.rate.cacheWriteMicroUsdPerMillion === null ? "Unlisted cache writes use the fresh-input rate in this estimate." : ""}</p>
    </fieldset>;
  }
  function exportCosts() {
    try {
    const text = JSON.stringify({ schema: "StarlightFactoryCostReport.v1", calculatedAt: new Date().toISOString(), assumptions: value, result, alternative: { assumptions: alternative, result: comparison }, privateContextIncluded: false }, null, 2);
    const url = URL.createObjectURL(new Blob([text], { type: "application/json" }));
    const link = document.createElement("a"); link.href = url; link.download = "starlight-factory-costs.json"; link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setNotice("Cost comparison exported. The editable plan export also contains these assumptions and your private context.");
    } catch { setNotice("Cost export failed. Your editable plan and current assumptions are kept; retry the export before leaving."); }
  }
  return <section className={styles.root} aria-labelledby={`${id}-title`}>
    <header className={styles.heading}><div><p className={styles.secondary}>Agent operating scenario</p><h3 id={`${id}-title`}>What would this workload cost?</h3></div><button type="button" className="button button-quiet" onClick={exportCosts}>Export cost comparison</button></header>
    <p className={styles.secondary}>Numeric assumptions save when you leave a field or press Enter. Press Escape to restore the saved value.</p>
    <div className={styles.summary} aria-live="polite">
      <div><span>Modeled increment before tax</span><strong><Money amount={result.knownSubtotal} /></strong><p>{result.missing.length ? "Partial subtotal. Some monthly fees are unknown." : "All entered fees included. Tax, egress and unlisted services remain outside this estimate."}</p></div>
      <div><span>Useful output assumption</span><strong>{result.expectedAccepted.toLocaleString()} accepted missions</strong><p>From {result.plannedMissions} planned missions and {result.expectedAttempts.toLocaleString()} expected attempts. Acceptance is hypothetical.</p></div>
    </div>
    <div className={styles.inputs}>
      {number("Missions per working day", value.missionsPerDay, 0, 1000, (amount) => change({ ...value, missionsPerDay: amount as number }))}
      {number("Working days per month", value.workDays, 1, 31, (amount) => change({ ...value, workDays: amount as number }))}
      {number("Extra repair attempts (%)", value.repairBps, 0, 300, (amount) => change({ ...value, repairBps: amount as number }), 100)}
      {number("Accepted-output assumption (%)", value.acceptanceBps, 0, 100, (amount) => change({ ...value, acceptanceBps: amount as number }), 100)}
    </div>
    <div className={styles.stages}>{stageEditor("maker", value.maker)}{stageEditor("reviewer", value.reviewer)}</div>
    <details className={styles.advanced}><summary>Compute, monthly fees and currency</summary>
      <p>These are reserved-resource assumptions. Active hours stop compute billing in the scenario; retained disks stay billed. Every retained GiB is charged here, with no assumed pooled free allowance.</p>
      <div className={styles.inputs}>
        {number("Worker slots", value.compute.slots, 0, 100, (amount) => change({ ...value, compute: { ...value.compute, slots: amount as number } }))}
        {number("Active hours per slot", value.compute.activeHoursPerSlot, 0, value.compute.retainedHoursPerSlot, (amount) => change({ ...value, compute: { ...value.compute, activeHoursPerSlot: amount as number } }))}
        {number("Retained hours per slot", value.compute.retainedHoursPerSlot, value.compute.activeHoursPerSlot, 744, (amount) => change({ ...value, compute: { ...value.compute, retainedHoursPerSlot: amount as number } }))}
        {number("vCPU per slot", value.compute.vcpu, 1, 64, (amount) => change({ ...value, compute: { ...value.compute, vcpu: amount as number } }))}
        {number("Memory per slot (GiB)", value.compute.memoryGiB, 1, 512, (amount) => change({ ...value, compute: { ...value.compute, memoryGiB: amount as number } }))}
        {number("Retained disk per slot (GiB)", value.compute.diskGiB, 0, 10_000, (amount) => change({ ...value, compute: { ...value.compute, diskGiB: amount as number } }))}
        <label>Worker operating system<select value={value.compute.os} onChange={(event) => change({ ...value, compute: { ...value.compute, os: event.target.value as "linux" | "windows" } })}><option value="linux">Linux</option><option value="windows">Windows, with CPU licence increment</option></select></label>
        {number("Tool usage per month (USD)", value.fees.toolsMicroUsd, 0, 1_000_000, (amount) => change({ ...value, fees: { ...value.fees, toolsMicroUsd: amount } }), 1_000_000, true)}
        {number("Browser service per month (USD)", value.fees.browserMicroUsd, 0, 1_000_000, (amount) => change({ ...value, fees: { ...value.fees, browserMicroUsd: amount } }), 1_000_000, true)}
        {number("Platform increment per month (USD)", value.fees.platformMicroUsd, 0, 1_000_000, (amount) => change({ ...value, fees: { ...value.fees, platformMicroUsd: amount } }), 1_000_000, true)}
        {number("New subscriptions per month (USD)", value.fees.newSubscriptionsMicroUsd, 0, 1_000_000, (amount) => change({ ...value, fees: { ...value.fees, newSubscriptionsMicroUsd: amount } }), 1_000_000, true)}
        {number("EUR per USD (your assumption)", value.eurPerUsdMicros, 0.000001, 100, (amount) => change({ ...value, eurPerUsdMicros: amount }), 1_000_000, true)}
        {number("Incremental monthly cap (EUR)", value.monthlyCapEuroMinor, 0, 1_000_000, (amount) => change({ ...value, monthlyCapEuroMinor: amount }), 100, true)}
      </div>
      <p className={styles.secondary}><a href={value.compute.sourceUrl} target="_blank" rel="noopener noreferrer">Daytona rate source</a>, snapshot {value.compute.observedAt}. Refreshing updates the rate observations only; your workload stays intact. <button type="button" className="button button-quiet" onClick={() => change({ ...value, maker: { ...value.maker, rate: { ...factoryModelRates.find((rate) => rate.id === value.maker.rate.id)! } }, reviewer: { ...value.reviewer, rate: { ...factoryModelRates.find((rate) => rate.id === value.reviewer.rate.id)! } }, compute: { ...value.compute, ...factoryComputeRate } })}>Use bundled dated rates</button></p>
    </details>
    <table className={styles.table}><caption>Same workload, repair allowance, reviewer, compute and fees</caption><thead><tr><th scope="col">Monthly component</th><th scope="col">Your maker: {value.maker.rate.label}</th><th scope="col">Alternative: {alternativeRate.label}</th></tr></thead><tbody>
      {([ ["Maker API", result.makerApi, comparison.makerApi], ["Reviewer API", result.reviewerApi, comparison.reviewerApi], ["Active compute", result.compute, comparison.compute], ["Retained disks", result.retainedStorage, comparison.retainedStorage], ["Known monthly fees", result.fees, comparison.fees], ["Known subtotal", result.knownSubtotal, comparison.knownSubtotal] ] as [string, Amount, Amount][]).map(([label, left, right]) => <tr key={label}><th scope="row">{label}</th><td><Money amount={left} /></td><td><Money amount={right} /></td></tr>)}
    </tbody></table>
    <p>Cost per expected accepted output: {result.costPerExpectedAccepted ? dollars(result.costPerExpectedAccepted.usd) : "unknown"}. Incremental cap: {result.overCap === null ? "incomplete assumptions" : result.overCap ? "exceeded" : "within the entered cap"}. Independent provider: {result.independentProvider ? "different providers selected; a completed review is still required" : "requirement unmet"}.</p>
    <div className={styles.actions}><button type="button" className="button button-quiet" onClick={() => change(alternative)}>Use {alternativeRate.label} as maker</button></div>
    <p className={styles.secondary}>{result.scope}</p>
    {result.warnings.length > 0 && <ul className={styles.warnings}>{result.warnings.map((warning, index) => <li key={`${index}-${warning}`}>{warning}</li>)}</ul>}
    {comparison.independentProvider === false && <p className={styles.warnings}>This alternative uses the same provider as your reviewer. Choose a different reviewer before considering an independent review route.</p>}
    <p role="status">{notice}</p>
  </section>;
}
