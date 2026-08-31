import type { Metadata } from "next";
import Link from "next/link";
import { InfrastructureFrame } from "@/components/infrastructure/frame";
import { ArrowIcon } from "@/components/infrastructure/icons";
import { SectionHeading, SourceNote } from "@/components/infrastructure/section";
import styles from "@/components/infrastructure/infrastructure.module.css";
import { contractStack } from "@/lib/infrastructure";

export const metadata: Metadata = {
  title: "Contract Architecture · Infrastructure Partnership OS",
  description: "The contract, authority, ownership and exit architecture for joint AI infrastructure between operating companies, operators, banks and energy partners."
};

const authority = [
  ["Research, classify and draft", "Permitted", "Permitted", "Versioned source and output receipt"],
  ["Read approved operational systems", "Conditional", "Conditional", "Named system owner + scoped credential"],
  ["Change catalogue, price or inventory", "No", "Approval-gated", "Commercial owner acceptance + rollback"],
  ["Commit customer terms or service levels", "No", "No", "Authorised human signature"],
  ["Purchase equipment or software", "Prepare only", "No", "Budget owner + procurement authority"],
  ["Move money, borrow or grant security", "No", "No", "Directors, bank and counsel as required"],
  ["Execute reversible runbook action", "Conditional", "Conditional", "Accepted runbook + logged outcome"],
  ["Suspend unsafe automation", "Permitted", "Permitted", "Incident receipt + human escalation"]
] as const;

const ownership = [
  ["Business data and customer relationships", "Client organisation", "Export and deletion rights remain explicit."],
  ["Physical equipment purchased by client", "Client organisation", "Serials, warranties, liens and removal rights recorded."],
  ["Client-specific accepted workflows", "As stated in SOW", "Licence or assignment is priced and named, never implied."],
  ["Reusable runtime, methods and general skills", "Starlight / operator", "Client receives bounded use rights and portability artefacts."],
  ["Agent outputs", "Contract-defined by output class", "Drafts, code, decisions and generated content may require different treatment."],
  ["Operational evidence ledger", "Client-controlled record with operator access", "Retention and post-exit access are part of the exit schedule."]
] as const;

export default function ContractsPage() {
  return (
    <InfrastructureFrame>
      <header className={styles.pageHero}>
        <div><p className={styles.kicker}>Contract architecture</p><h1>Family trust is not a substitute for transaction design.</h1></div>
        <div className={styles.pageHeroAside}><span>CONTROL THESIS</span><p>Money does not create unstated governance rights. Every priority, guarantee, licence, capacity allocation, veto, step-in right and exit obligation is explicit, priced and time-bounded.</p></div>
      </header>

      <section className={styles.section}>
        <div className={styles.sectionInner}>
          <SectionHeading index="01" eyebrow="Document system" title="Twelve instruments, staged by actual exposure.">
            <p>The early documents buy clarity. Asset finance, guarantees, collateral and project-company governance appear only when the business case and counterparties have earned that complexity.</p>
          </SectionHeading>
          <div className={styles.contractMap}>
            {contractStack.map(([code, name, purpose], index) => (
              <article className={styles.contractCard} key={code}>
                <span>{code}</span><h3>{name}</h3><p>{purpose}</p><small>{index < 4 ? "Phase 0 / pilot core" : index < 10 ? "Triggered by physical deployment" : "Expansion-only specialist review"}</small>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.darkSection}>
        <div className={styles.sectionInner}>
          <SectionHeading index="02" eyebrow="Delegated authority" title="Observe broadly. Act narrowly. Bind never by accident.">
            <p>The authority matrix is attached to identities, workflows and contracts. The same task may be permitted in shadow mode and prohibited in production.</p>
          </SectionHeading>
          <table className={styles.authorityTable}>
            <thead><tr><th>Action class</th><th>Agent</th><th>Workflow</th><th>Required evidence</th></tr></thead>
            <tbody>
              {authority.map(([action, agent, workflow, evidence]) => (
                <tr key={action}><td>{action}</td><td className={agent === "Permitted" ? styles.yes : agent === "No" ? styles.no : styles.conditional}>{agent}</td><td className={workflow === "Permitted" ? styles.yes : workflow === "No" ? styles.no : styles.conditional}>{workflow}</td><td>{evidence}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className={styles.paperSection}>
        <div className={styles.sectionInner}>
          <SectionHeading index="03" eyebrow="Ownership ledger" title="Separate assets, data, capability and output.">
            <p>“We built it together” is not an ownership regime. Every class receives an owner, licence, portability treatment and post-termination state.</p>
          </SectionHeading>
          <table className={styles.matrix}>
            <thead><tr><th>Object</th><th>Default owner</th><th>Required clarification</th><th>Evidence</th></tr></thead>
            <tbody>{ownership.map(([object, owner, clarification]) => <tr key={object}><td>{object}</td><td>{owner}</td><td>{clarification}</td><td><strong>Contract version + asset / data record</strong></td></tr>)}</tbody>
          </table>
          <div className={styles.heroActions}>
            <Link className={styles.primaryAction} href="/checkout/infrastructure-blueprint">Commission the contract issue map <ArrowIcon /></Link>
            <Link className={styles.secondaryAction} href="/infrastructure/compose">Return to deal composer</Link>
          </div>
          <SourceNote>Electronic signatures and validation should use the parties' accepted qualified providers and jurisdiction-specific counsel. EU trust-service context: <a href="https://digital-strategy.ec.europa.eu/en/policies/eidas-regulation">European Commission eIDAS policy</a>.</SourceNote>
        </div>
      </section>
    </InfrastructureFrame>
  );
}
