import type { ReactNode } from "react";
import styles from "./infrastructure.module.css";
import { InfrastructureNav } from "./infrastructure-nav";

export function InfrastructureFrame({ children }: { children: ReactNode }) {
  return (
    <div className={styles.infrastructurePage}>
      <InfrastructureNav />
      {children}
      <footer className={styles.disclaimer}>
        <strong>Boundary.</strong> Starlight supplies operating architecture, evidence systems and implementation services. Financing, legal, tax, energy-market, insurance and regulated investment decisions remain with licensed counterparties and the contracting principals. Public structures are decision frameworks, not executable legal or credit advice.
      </footer>
    </div>
  );
}
