"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { composeDeal, type DealComposerInput } from "@/lib/infrastructure";
import styles from "./infrastructure.module.css";
import { ArrowIcon, ContractIcon, EvidenceIcon, ShieldIcon } from "./icons";

const defaults: DealComposerInput = {
  contribution: "site-power",
  demand: "internal",
  capital: "operating-cash",
  control: "owner-led",
  sensitivity: "confidential"
};

export function DealComposer() {
  const [input, setInput] = useState<DealComposerInput>(defaults);
  const result = useMemo(() => composeDeal(input), [input]);
  const set = <K extends keyof DealComposerInput>(key: K, value: DealComposerInput[K]) => setInput((current) => ({ ...current, [key]: value }));
  const memo = [
    `Recommended model: ${result.model.name}`,
    `Demand: ${input.demand}`,
    `Capital: ${input.capital}`,
    `Control: ${input.control}`,
    `Data: ${input.sensitivity}`
  ].join("\n");

  return (
    <div className={styles.composer}>
      <form className={styles.composerInputs} onSubmit={(event) => event.preventDefault()}>
        <div className={styles.composerHeader}>
          <p className={styles.kicker}>Deterministic deal compiler</p>
          <h2>Compose the transaction before composing the technology.</h2>
          <p>Five inputs select a viable starting structure. The result is an underwriting hypothesis, not a substitute for legal, tax or credit approval.</p>
        </div>

        <label>
          <span>Primary contribution</span>
          <select value={input.contribution} onChange={(event) => set("contribution", event.target.value as DealComposerInput["contribution"])}>
            <option value="site-power">Site, power or existing assets</option>
            <option value="capital">Liquidity or borrowing capacity</option>
            <option value="workload">Internal or external workload</option>
            <option value="operator-capability">AI engineering and operations</option>
          </select>
        </label>
        <label>
          <span>Demand quality</span>
          <select value={input.demand} onChange={(event) => set("demand", event.target.value as DealComposerInput["demand"])}>
            <option value="exploratory">Exploratory demand only</option>
            <option value="internal">Named internal workflows</option>
            <option value="contracted">Budgeted or contracted internal demand</option>
            <option value="external-offtake">External minimum commitment / offtake</option>
          </select>
        </label>
        <label>
          <span>Capital posture</span>
          <select value={input.capital} onChange={(event) => set("capital", event.target.value as DealComposerInput["capital"])}>
            <option value="operating-cash">Operating cash</option>
            <option value="leasing">Equipment leasing</option>
            <option value="bank">Bank or promotional finance</option>
            <option value="mixed">Mixed capital stack</option>
          </select>
        </label>
        <label>
          <span>Control preference</span>
          <select value={input.control} onChange={(event) => set("control", event.target.value as DealComposerInput["control"])}>
            <option value="owner-led">Asset / operating company led</option>
            <option value="split">Reserved matters split between parties</option>
            <option value="operator-led">AI operator led</option>
          </select>
        </label>
        <label>
          <span>Data sensitivity</span>
          <select value={input.sensitivity} onChange={(event) => set("sensitivity", event.target.value as DealComposerInput["sensitivity"])}>
            <option value="standard">Standard business data</option>
            <option value="confidential">Confidential commercial data</option>
            <option value="regulated">Regulated or high-consequence data</option>
          </select>
        </label>
      </form>

      <section className={styles.composerResult} aria-live="polite">
        <div className={styles.resultTopline}>
          <span>Compiled structure</span>
          <span>{result.model.stage}</span>
        </div>
        <p className={styles.resultNumber}>0{["productivity-node", "hosted-capacity", "financed-transformation", "offtake-backed-node", "nodeco"].indexOf(result.model.id) + 1}</p>
        <h2>{result.model.name}</h2>
        <p className={styles.resultThesis}>{result.model.thesis}</p>

        <div className={styles.resultRule}>
          <ShieldIcon />
          <div><span>First purchase</span><strong>{result.firstPurchase}</strong></div>
        </div>
        <div className={styles.resultRule}>
          <EvidenceIcon />
          <div><span>Architecture posture</span><strong>{result.architecture}</strong></div>
        </div>

        <div className={styles.resultColumns}>
          <div>
            <h3>Contract focus</h3>
            <ol>{result.contractFocus.map((item) => <li key={item}>{item}</li>)}</ol>
          </div>
          <div>
            <h3>Proof before approval</h3>
            <ol>{result.proofRequired.map((item) => <li key={item}>{item}</li>)}</ol>
          </div>
        </div>

        <p className={styles.riskLine}><ContractIcon />{result.riskPosture}</p>
        <div className={styles.resultActions}>
          <Link className={styles.primaryAction} href="/checkout/infrastructure-blueprint">Commission the Blueprint <ArrowIcon /></Link>
          <a className={styles.secondaryAction} href={`mailto:hello@frankx.ai?subject=${encodeURIComponent("Infrastructure Partnership Blueprint")}&body=${encodeURIComponent(memo)}`}>Send structure for review</a>
        </div>
      </section>
    </div>
  );
}
