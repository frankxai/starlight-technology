import styles from "./infrastructure.module.css";
import { AgentIcon, BuildingIcon, ContractIcon, EnergyIcon, EvidenceIcon, MeterIcon, ShieldIcon } from "./icons";

const headlineMetrics = [
  ["Gate", "G4 · shadow operation", "On plan"],
  ["Verified annualised value", "€84.2k", "+€9.2k above gate"],
  ["Productive utilization", "43%", "Within pilot envelope"],
  ["Founder attention", "5.5h / week", "Below 8h ceiling"]
] as const;

const decisions = [
  ["Approve catalogue write-back", "Commercial", "Alexander / Sales", "€18.4k margin exposure"],
  ["Replace cloud embedding batch", "Infrastructure", "Starlight Ops", "€630 annual run-rate"],
  ["Renew energy metering service", "Asset", "Property owner", "Contract expires in 19 days"],
  ["Accept quotation workflow v2", "Product", "Sales owner", "Dual-run accuracy 97.8%"]
] as const;

const workers = [
  ["Offer Compiler", "Shadow", "142 runs", "98.6% accepted inputs"],
  ["Margin Sentinel", "Read-only", "31 exceptions", "€22.7k value reviewed"],
  ["Asset Steward", "Observe", "8 assets", "2 maintenance items"],
  ["Evidence Auditor", "Append-only", "486 receipts", "0 missing approvals"]
] as const;

export function ReferenceWorkspace() {
  return (
    <div className={styles.workspace}>
      <header className={styles.workspaceHeader}>
        <div>
          <p className={styles.kicker}>Reference workspace · sample data</p>
          <h1>Industrial Partner 01</h1>
        </div>
        <div className={styles.workspaceState}><i /> Controlled pilot · 24 days remaining</div>
      </header>

      <nav className={styles.workspaceTabs} aria-label="Reference workspace sections">
        {['Overview', 'Deals', 'Assets', 'Workloads', 'Agents', 'Contracts', 'Finance', 'Energy', 'Evidence'].map((item, index) => <span className={index === 0 ? styles.activeTab : undefined} key={item}>{item}</span>)}
      </nav>

      <section className={styles.metricGrid} aria-label="Pilot metrics">
        {headlineMetrics.map(([label, value, note]) => (
          <article key={label}><span>{label}</span><strong>{value}</strong><small>{note}</small></article>
        ))}
      </section>

      <section className={styles.workspaceGrid}>
        <article className={styles.workspacePanel}>
          <div className={styles.panelHeading}><div><p>Decision queue</p><h2>Human authority, compressed.</h2></div><ShieldIcon /></div>
          <div className={styles.decisionList}>
            {decisions.map(([decision, type, owner, evidence]) => (
              <div key={decision}>
                <span className={styles.decisionType}>{type}</span>
                <strong>{decision}</strong>
                <small>{owner}</small>
                <em>{evidence}</em>
              </div>
            ))}
          </div>
        </article>

        <article className={`${styles.workspacePanel} ${styles.darkPanel}`}>
          <div className={styles.panelHeading}><div><p>Value ledger</p><h2>Do not blend P&amp;L, liquidity and narrative.</h2></div><MeterIcon /></div>
          <dl className={styles.valueLedger}>
            <div><dt>Contribution margin protected</dt><dd>€32,800</dd><small>Accepted pricing and purchasing exceptions</small></div>
            <div><dt>Operating cost avoided</dt><dd>€17,400</dd><small>Annualised from measured process baselines</small></div>
            <div><dt>Capacity released</dt><dd>€34,000</dd><small>Reported separately; not booked as cash profit</small></div>
            <div><dt>Working capital released</dt><dd>€41,600</dd><small>Liquidity value; excluded from EBITDA claim</small></div>
          </dl>
        </article>
      </section>

      <section className={styles.workspaceGridThree}>
        <article className={styles.workspacePanel}>
          <div className={styles.panelHeading}><div><p>Worker estate</p><h2>Agents operate inside explicit authority.</h2></div><AgentIcon /></div>
          <div className={styles.workerList}>{workers.map(([name, mode, runs, quality]) => <div key={name}><strong>{name}</strong><span>{mode}</span><small>{runs}</small><em>{quality}</em></div>)}</div>
        </article>
        <article className={styles.workspacePanel}>
          <div className={styles.panelHeading}><div><p>Physical estate</p><h2>One graph for assets and obligations.</h2></div><BuildingIcon /></div>
          <ul className={styles.assetList}>
            <li><EnergyIcon /><span><strong>PV + storage</strong><small>Meter evidence current · tariff review due</small></span></li>
            <li><BuildingIcon /><span><strong>Warehouse node</strong><small>Access register current · insurance verified</small></span></li>
            <li><ContractIcon /><span><strong>Equipment estate</strong><small>6 serialised assets · 2 warranty events</small></span></li>
          </ul>
        </article>
        <article className={styles.workspacePanel}>
          <div className={styles.panelHeading}><div><p>Evidence health</p><h2>Reconstruct every consequential decision.</h2></div><EvidenceIcon /></div>
          <div className={styles.evidenceScore}><strong>96</strong><span>/ 100</span></div>
          <ul className={styles.evidenceChecks}>
            <li><i /> All agent runs versioned</li>
            <li><i /> All approvals bound to artefacts</li>
            <li><i /> Source freshness within policy</li>
            <li className={styles.warning}><i /> Two supplier quotes expire this week</li>
          </ul>
        </article>
      </section>

      <p className={styles.workspaceDisclaimer}>This is a reference control room with illustrative data. A production tenant is generated only from accepted company data, contracts, identities and delegated authority.</p>
    </div>
  );
}
