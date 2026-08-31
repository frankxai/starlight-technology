import Link from "next/link";
import styles from "./infrastructure.module.css";

const links = [
  ["Thesis", "/infrastructure"],
  ["Compose", "/infrastructure/compose"],
  ["System", "/infrastructure/system"],
  ["Contracts", "/infrastructure/contracts"],
  ["Operator", "/infrastructure/operator"],
  ["Control room", "/infrastructure/workspace"]
] as const;

export function InfrastructureNav() {
  return (
    <nav className={styles.localNav} aria-label="Infrastructure Partnership OS">
      <Link className={styles.localBrand} href="/infrastructure">
        <span>STARLIGHT</span>
        <b>INFRASTRUCTURE</b>
      </Link>
      <div className={styles.localLinks}>
        {links.map(([label, href]) => <Link href={href} key={href}>{label}</Link>)}
      </div>
      <Link className={styles.localCta} href="/checkout/infrastructure-blueprint">Commission blueprint</Link>
    </nav>
  );
}
