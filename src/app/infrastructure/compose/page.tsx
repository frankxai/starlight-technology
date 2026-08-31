import type { Metadata } from "next";
import { DealComposer } from "@/components/infrastructure/deal-composer";
import { InfrastructureFrame } from "@/components/infrastructure/frame";
import { SectionHeading } from "@/components/infrastructure/section";
import styles from "@/components/infrastructure/infrastructure.module.css";

export const metadata: Metadata = {
  title: "Deal Composer · Infrastructure Partnership OS",
  description: "Compile a starting transaction model from contribution, demand, capital, control and data sensitivity."
};

const underwriting = [
  ["Counterparty", "Who can bind each organisation, and what existing obligations or lender restrictions constrain the deal?", "Corporate records, delegated authority, facilities, liens and conflicts."],
  ["Demand", "Which internal workflow or external customer creates the economic need?", "Volume, latency, quality, data and service-level baseline."],
  ["Site", "Can the building safely and economically host the intended estate?", "Power, network, access, cooling, fire, insurance, metering and removal."],
  ["Capital", "Which cost is operating expense, durable equipment, energy infrastructure or venture risk?", "Sources-and-uses, asset life, quotations, tax and finance review."],
  ["Control", "Who owns each asset, account, dataset, skill, approval and failure mode?", "Rights matrix, reserved matters, step-in, portability and exit."],
  ["Proof", "What evidence makes the next gate rational?", "Accepted baseline, receipts, benchmarks, contracts, decisions and measured outcomes."]
] as const;

export default function ComposePage() {
  return (
    <InfrastructureFrame>
      <header className={styles.pageHero}>
        <div><p className={styles.kicker}>Deal composer</p><h1>Resolve the bargain before negotiating the percentage.</h1></div>
        <div className={styles.pageHeroAside}><span>DECISION OBJECT</span><p>Contribution, demand, capital, control and data sensitivity determine the viable first structure. A JV is not an answer to unclear pricing or ownership.</p></div>
      </header>
      <DealComposer />
      <section className={styles.paperSection}>
        <div className={styles.sectionInner}>
          <SectionHeading index="01" eyebrow="Underwriting scope" title="Six dimensions must close together.">
            <p>A technically plausible node can still be commercially irrational, legally fragile or impossible to integrate. Phase 0 produces one decision system across all six.</p>
          </SectionHeading>
          <table className={styles.matrix}>
            <thead><tr><th>Dimension</th><th>Question</th><th>Evidence required</th><th>Decision owner</th></tr></thead>
            <tbody>{underwriting.map(([name, question, evidence]) => <tr key={name}><td>{name}</td><td>{question}</td><td>{evidence}</td><td><strong>Named principal + specialist sign-off</strong></td></tr>)}</tbody>
          </table>
        </div>
      </section>
    </InfrastructureFrame>
  );
}
