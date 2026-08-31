import type { Metadata } from "next";
import Link from "next/link";
import { InfrastructureFrame } from "@/components/infrastructure/frame";
import { ArrowIcon } from "@/components/infrastructure/icons";
import { SectionHeading, SourceNote } from "@/components/infrastructure/section";
import styles from "@/components/infrastructure/infrastructure.module.css";

export const metadata: Metadata = {
  title: "Operator Model · Infrastructure Partnership OS",
  description: "A repeatable commercial and execution model for AI operators partnering with asset-rich operating companies.",
  alternates: { canonical: "/infrastructure/operator" },
  openGraph: {
    title: "AI Infrastructure Operator Business System",
    description: "Qualify, underwrite, contract, procure, integrate, operate and prove infrastructure partnerships without becoming captive to one client.",
    url: "/infrastructure/operator"
  }
};

const sequence = [
  ["01", "Qualify", "Reject partners without a real decision owner, accessible evidence or a named operating problem."],
  ["02", "Sell Phase 0", "A fixed-fee Blueprint buys diligence and a decision pack—not unlimited strategy access."],
  ["03", "Underwrite", "Map assets, workflows, IT, data, contracts, capital and the downside case."],
  ["04", "Validate", "Counsel, tax adviser, insurer, bank and energy specialists validate their own domains."],
  ["05", "Close pilot", "Separate MSA, SOW, authority, security, ownership and acceptance documents."],
  ["06", "Procure", "Buy only accepted assets with quotes, warranties, serials, tests and accountable owners."],
  ["07", "Integrate", "Read-first connectors, canonical records, shadow operation and controlled write-back."],
  ["08", "Operate", "Run workers, incidents, maintenance, model routing, cost controls and owner briefs."],
  ["09", "Prove", "Bind every value claim to a baseline, evidence receipt, approval and accounting treatment."],
  ["10", "Expand", "Second workload, second department or second site only after a passed expansion gate."]
] as const;

const commercial = [
  ["Partnership Blueprint", "€6.5k fixed", "Diligence, architecture, deal structures and pilot mandate."],
  ["Pilot implementation", "€24k–€75k", "Three bounded workstreams; hardware and third-party costs separated."],
  ["Managed operator", "€3.5k–€15k / month", "Run, monitor, report, improve and coordinate vendors under an agreed envelope."],
  ["Performance component", "Selective and capped", "Only against a baseline the parties can measure and audit."],
  ["Capacity / infrastructure", "Separate commercial instrument", "Never smuggled into a services retainer or family understanding."]
] as const;

const boundaries = [
  ["Starlight / operator owns", "General runtime, delivery method, reusable skills, reference architectures, generic connectors and cross-client improvements."],
  ["Client owns", "Business data, customer relationships, purchased hardware, company accounts, accepted client-specific records and contract-defined deliverables."],
  ["Custom work", "Priced by SOW. A one-off ERP oddity cannot silently consume the product roadmap."],
  ["Founder attention", "Named capacity ceiling, office hours and escalation path. The operator is not an unbounded internal IT employee."],
  ["Expansion rights", "No automatic equity, exclusivity, first refusal, board right or claim over unrelated brands and future ventures."]
] as const;

export default function OperatorPage() {
  return (
    <InfrastructureFrame>
      <header className={styles.pageHero}>
        <div><p className={styles.kicker}>Operator business system</p><h1>Sell the decision, then operate the proof.</h1></div>
        <div className={styles.pageHeroAside}><span>COMMERCIAL POSTURE</span><p>Do not ask an asset-rich company to “fund your AI vision.” Sell a bounded productivity mandate that benefits its own operations, then contract access to the shared primitives required to deliver it.</p></div>
      </header>

      <section className={styles.section}>
        <div className={styles.sectionInner}>
          <SectionHeading index="01" eyebrow="Repeatable motion" title="Ten transitions from relationship to productive node.">
            <p>Every transition has a purchase, an artefact, an approval owner and a stop condition. That converts informal trust into a scalable B2B operating motion.</p>
          </SectionHeading>
          <div className={styles.operatorSequence}>
            {sequence.map(([code, name, description]) => <article key={code}><span>{code}</span><h3>{name}</h3><p>{description}</p></article>)}
          </div>
        </div>
      </section>

      <section className={styles.darkSection}>
        <div className={styles.sectionInner}>
          <SectionHeading index="02" eyebrow="Revenue architecture" title="Monetise accountability, not access to tools.">
            <p>The operator earns across underwriting, implementation and managed execution. Asset or capacity economics remain separate so neither side can later reinterpret what a payment purchased.</p>
          </SectionHeading>
          <div className={styles.economicsGrid}>
            <dl className={styles.economicsModel}>
              {commercial.map(([offer, price, purpose]) => <div key={offer}><dt><strong>{offer}</strong><br />{purpose}</dt><dd>{price}</dd></div>)}
            </dl>
            <div className={styles.economicsNarrative}>
              <h3>The first €6,500 protects the next €100,000.</h3>
              <p>The Blueprint is not discovery theatre. It decides whether a purchase should happen, which entity should own it, which contracts are triggered, how it attaches to the current IT estate, what the downside case is and how the result will be proven.</p>
              <p>Quoted ranges are product architecture, not promises. Final pricing follows scope, geography, systems, data sensitivity and specialist requirements.</p>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.paperSection}>
        <div className={styles.sectionInner}>
          <SectionHeading index="03" eyebrow="Boundary system" title="Keep the client valuable without becoming captive.">
            <p>The reusable system compounds only when general primitives remain portable and company-specific work is clearly owned, priced and supported.</p>
          </SectionHeading>
          <table className={styles.matrix}>
            <thead><tr><th>Boundary</th><th>Operating rule</th><th>Contract location</th><th>Failure prevented</th></tr></thead>
            <tbody>{boundaries.map(([boundary, rule], index) => <tr key={boundary}><td>{boundary}</td><td>{rule}</td><td>{index < 2 ? "IP + data schedule" : index === 2 ? "Change order" : index === 3 ? "Service envelope" : "Reserved-rights clause"}</td><td><strong>{index === 3 ? "Founder capture" : "Unpriced control transfer"}</strong></td></tr>)}</tbody>
          </table>
          <div className={styles.heroActions}>
            <Link className={styles.primaryAction} href="/checkout/infrastructure-blueprint">Start with a paid Blueprint <ArrowIcon /></Link>
            <Link className={styles.secondaryAction} href="/infrastructure/workspace">Inspect the post-sale control room</Link>
          </div>
          <SourceNote>German digitalisation and renewable-energy financing may be relevant to qualifying client-side investments, subject to the client&apos;s bank and advisers. Official starting points: <a href="https://www.kfw.de/inlandsfoerderung/Unternehmen/Innovation-und-Digitalisierung/F%C3%B6rderprodukte/ERP-F%C3%B6rderkredit-Digitalisierung-%28511-512%29/">KfW 511/512</a> and <a href="https://www.kfw.de/inlandsfoerderung/%C3%96ffentliche-Einrichtungen/Energie-Versorgung-und-Netze/F%C3%B6rderprodukte/Erneuerbare-Energien-%E2%80%93-Standard-%28270%29/">KfW 270</a>.</SourceNote>
        </div>
      </section>
    </InfrastructureFrame>
  );
}
