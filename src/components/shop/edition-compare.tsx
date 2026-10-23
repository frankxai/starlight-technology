import Link from "next/link";
import { editionColumns, editionRows } from "@/lib/catalog/editions";
import styles from "./storefront.module.css";

function Cell({ value }: { value: string | boolean }) {
  if (value === true) return <span className={styles.yes} aria-label="Included">✓</span>;
  if (value === false) return <span className={styles.no} aria-label="Not included">—</span>;
  return <>{value}</>;
}

export function EditionCompare({ compact = false }: { compact?: boolean }) {
  const rows = compact ? editionRows.slice(0, 9) : editionRows;
  return <div className={styles.tableWrap}>
    <table className={`${styles.table} ${styles.compareTable}`}>
      <caption className="sr-only">Capability comparison across the free lab, the Workflow Edition and the planned team licence</caption>
      <thead><tr><th scope="col">Capability</th>{editionColumns.map((column) => <th scope="col" key={column.id}><span className={styles.compareName}>{column.name}</span><span className={styles.compareStatus}>{column.status}</span><span className={styles.comparePrice}>{column.price}</span></th>)}</tr></thead>
      <tbody>{rows.map((row) => <tr key={row.label}><th scope="row">{row.label}</th>{editionColumns.map((column) => <td key={column.id}><Cell value={row.cells[column.id]} /></td>)}</tr>)}</tbody>
      <tfoot><tr><td /><td colSpan={3}><div className={styles.compareActions}>{editionColumns.map((column) => <Link key={column.id} className={`${styles.btn} ${styles.btnSmall} ${column.id === "edition" ? styles.btnPrimary : column.id === "lab" ? styles.btnCyan : styles.btnQuiet}`} href={column.href}>{column.cta}</Link>)}</div></td></tr></tfoot>
    </table>
  </div>;
}
