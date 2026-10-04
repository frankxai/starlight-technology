import type { Metadata } from "next";
import styles from "@/components/compute/compute.module.css";
import { BrandCards, CapacityTable, EvidencePanel, PriceLadder } from "@/components/compute/compute-sections";
import { researchDate } from "@/lib/compute";

export const metadata: Metadata = {
  title: "Local AI compute atlas",
  description: "Mini PCs and unified-memory machines for local AI and agent fleets: dated prices, who builds each one, and what each can run.",
  alternates: { canonical: "/compute" },
  robots: { index: false, follow: false }
};

export default function ComputePage() {
  return (
    <div className={`shell ${styles.page}`}>
      <header className={styles.hero}>
        <p className="eyebrow">Compute atlas</p>
        <h1 className={styles.title}>What a 128 GB local AI machine costs today, and who builds it.</h1>
        <p className={styles.lede}>
          Dated prices for 64 GB and larger mini PCs, the memory each workload needs, and the parts and platforms behind GMKtec, Minisforum, Framework and others. Every figure carries its source and evidence level.
        </p>
        <ul className={styles.status}>
          <li><span className={styles.dot} /> Research only, {researchDate}</li>
          <li>Buyer region assumed NL/EU</li>
          <li>Not yet linked from the site</li>
        </ul>
      </header>

      <section className={styles.block} aria-labelledby="ladder">
        <div className={styles.blockHead}>
          <h2 id="ladder">Memory price ladder</h2>
          <p>Machines with 64 GB or more, cheapest first. A bar is the cheapest EUR price read from a page. Tax status is stated where the page states it.</p>
        </div>
        <PriceLadder />
      </section>

      <section className={styles.block} aria-labelledby="capacity">
        <div className={styles.blockHead}>
          <h2 id="capacity">What fits in which memory class</h2>
          <p>Model memory competes with the operating system and agent sessions on the same box. Speed is a separate question: 70B dense models stay at single-digit tokens/s on every 256-273 GB/s machine in the data.</p>
        </div>
        <CapacityTable />
      </section>

      <section className={styles.block} aria-labelledby="builders">
        <div className={styles.blockHead}>
          <h2 id="builders">How each brand builds and sells</h2>
          <p>Dots show evidence: filled green is documented, amber is inferred, hollow is rumor. Hover a chip for the note.</p>
        </div>
        <BrandCards />
      </section>

      <section className={styles.block} aria-labelledby="evidence">
        <div className={styles.blockHead}>
          <h2 id="evidence">Evidence behind the page</h2>
          <p>The records are validated before they build: a price needs a date, a merchant and a memory size that matches the machine.</p>
        </div>
        <EvidencePanel />
      </section>
    </div>
  );
}
