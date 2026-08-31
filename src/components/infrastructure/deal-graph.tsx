import styles from "./infrastructure.module.css";
import { BankIcon, ComputeIcon, ContractIcon, EnergyIcon, NetworkIcon, WarehouseIcon } from "./icons";

const relationships = [
  { label: "AssetCo", detail: "site · power · equipment", icon: WarehouseIcon, instrument: "Host + asset schedule" },
  { label: "OperatorCo", detail: "runtime · skills · operations", icon: NetworkIcon, instrument: "MSA + licence" },
  { label: "House bank", detail: "term debt · lease · diligence", icon: BankIcon, instrument: "Finance documents" },
  { label: "Energy partner", detail: "PV · storage · metering", icon: EnergyIcon, instrument: "EPC / O&M / supply" },
  { label: "Technology estate", detail: "compute · network · warranty", icon: ComputeIcon, instrument: "Purchase / lease" },
  { label: "Counsel + tax", detail: "rights · tax · compliance", icon: ContractIcon, instrument: "Issue opinions" }
] as const;

export function DealGraph() {
  return (
    <figure className={styles.dealObject} aria-labelledby="deal-object-title">
      <figcaption className={styles.dealObjectHeader}>
        <span>REFERENCE TRANSACTION · GATE 0</span>
        <span className={styles.status}><i /> mandate design</span>
      </figcaption>
      <div className={styles.dealCore}>
        <div>
          <span className={styles.microLabel}>Economic object</span>
          <h2 id="deal-object-title">Governed AI infrastructure node</h2>
        </div>
        <dl>
          <div><dt>Purchase rule</dt><dd>Workload before hardware</dd></div>
          <div><dt>Control rule</dt><dd>Rights before relationships</dd></div>
          <div><dt>Scale rule</dt><dd>Evidence before debt</dd></div>
        </dl>
      </div>
      <div className={styles.relationshipGrid}>
        {relationships.map(({ label, detail, icon: Icon, instrument }) => (
          <article key={label} className={styles.relationship}>
            <Icon className={styles.graphIcon} />
            <div>
              <strong>{label}</strong>
              <span>{detail}</span>
            </div>
            <small>{instrument}</small>
          </article>
        ))}
      </div>
      <div className={styles.dealFooter}>
        <span>Capital</span><b>→</b><span>Assets</span><b>→</b><span>Workloads</span><b>→</b><span>Evidence</span><b>→</b><span>Expansion</span>
      </div>
    </figure>
  );
}
