import { fulfilmentContract, gateSummary, type FulfilmentContract } from "@/lib/commerce/fulfilment-gates";
import styles from "./storefront.module.css";

export function ReadinessBoard({ contract = fulfilmentContract, compact = false }: { contract?: FulfilmentContract; compact?: boolean }) {
  const summary = gateSummary(contract);
  return <div className={styles.board} id="readiness">
    <div className={styles.boardHead}><h3>Checkout readiness</h3><p>{summary.satisfied} of {summary.total} gates satisfied · contract {summary.contractVersion}</p></div>
    <ol className={styles.gateList}>
      {contract.gates.map((gate) => <li key={gate.id}>
        <span className={styles.gateDot} data-status={gate.status} aria-hidden="true" />
        <div><strong>{gate.label}</strong>{!compact && <p>{gate.requirement}</p>}</div>
        <small>{gate.status === "satisfied" && gate.evidence ? `Satisfied · ${gate.evidence.verifiedOn}` : `Open · ${gate.owner}`}</small>
      </li>)}
    </ol>
  </div>;
}
