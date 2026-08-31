import type { Metadata } from "next";
import Link from "next/link";
import { InfrastructureFrame } from "@/components/infrastructure/frame";
import { ArrowIcon } from "@/components/infrastructure/icons";
import { SectionHeading, SourceNote } from "@/components/infrastructure/section";
import styles from "@/components/infrastructure/infrastructure.module.css";
import { infrastructureSkills } from "@/lib/infrastructure";

export const metadata: Metadata = {
  title: "Agentic System · Infrastructure Partnership OS",
  description: "A provider-neutral agent, workflow, integration and evidence architecture for operating joint AI infrastructure."
};

const layers = [
  ["L0", "Contracts and delegated authority", "The system begins with principals, entities, agreements, policies, budgets and named approval owners. No agent receives authority through implication."],
  ["L1", "Identity and tenant boundaries", "Separate organisations, service accounts, secrets, memory, budgets, repositories and queues. Shared infrastructure never means shared access."],
  ["L2", "Existing-system connectors", "ERP, shop, CRM, documents, email, finance preparation, facilities and energy enter through read-first, typed interfaces."],
  ["L3", "Canonical operating graph", "Parties, assets, contracts, workloads, orders, approvals, evidence and revenue streams receive stable identifiers and provenance."],
  ["L4", "Workflow and agent runtime", "Deterministic workflows handle repeatable state transitions; agents research, classify, draft and reason inside explicit boundaries."],
  ["L5", "Model and compute routing", "Local inference, cloud frontier models and specialist providers are selected by sensitivity, quality, latency, resilience and measured cost."],
  ["L6", "Control room and evidence ledger", "Owners see decisions, economics, incidents, obligations and proof—rather than a stream of autonomous activity without accountability."]
] as const;

const integration = [
  ["01", "Inventory", "Catalogue systems, data owners, interfaces, identities, manual workarounds and contractual constraints."],
  ["02", "Observe", "Create read-only connectors and event capture. Establish baseline quality before changing production state."],
  ["03", "Normalise", "Map source objects into typed canonical records with source references and freshness policies."],
  ["04", "Shadow", "Run recommendations beside current human workflows. Record disagreement, exceptions and missing evidence."],
  ["05", "Delegate", "Grant narrow write actions only after acceptance tests, rollback and a named authority owner."]
] as const;

const hardware = [
  ["Always-on worker nodes", "Mac mini-class or equivalent", "Browser, repository, scheduling, observability, lightweight services and resilient orchestration."],
  ["Private-memory node", "High-memory AMD / unified-memory class", "Confidential retrieval, embeddings, document intelligence and larger quantised models without default cloud transfer."],
  ["Cloud burst", "Frontier API and hosted accelerators", "Irregular high-quality reasoning, coding, vision and peak throughput paid per use."],
  ["CUDA production node", "NVIDIA workstation or server", "Purchased only when measured queues, media workloads, fine-tuning or cost crossover justify ownership."],
  ["Site foundation", "UPS, encrypted storage, network, metering", "The unglamorous layer that determines recoverability, evidence quality, insurability and total cost."]
] as const;

export default function SystemPage() {
  return (
    <InfrastructureFrame>
      <header className={styles.pageHero}>
        <div><p className={styles.kicker}>Agentic operating architecture</p><h1>Agents are the labour layer. Authority is the product.</h1></div>
        <div className={styles.pageHeroAside}><span>DESIGN RULE</span><p>Provider-neutral skills, deterministic workflows and evidence receipts survive model turnover. Existing ERP and business systems remain authoritative until a controlled write-back gate says otherwise.</p></div>
      </header>

      <section className={styles.section}>
        <div className={styles.sectionInner}>
          <SectionHeading index="01" eyebrow="System layers" title="The control plane begins above the model.">
            <p>The model is replaceable. The durable asset is the operating graph that binds organisations, contracts, identities, assets, workloads, approvals and evidence.</p>
          </SectionHeading>
          <div className={styles.architectureStack}>
            {layers.map(([code, name, description]) => <article className={styles.architectureLayer} key={code}><span>{code}</span><h3>{name}</h3><p>{description}</p></article>)}
          </div>
        </div>
      </section>

      <section className={styles.darkSection}>
        <div className={styles.sectionInner}>
          <SectionHeading index="02" eyebrow="Existing IT estate" title="Integrate by earned authority, not replacement theatre.">
            <p>Initial access is read-only. The system learns the company&apos;s actual object model and exceptions before any agent can change prices, inventory, contracts, finance or customer commitments.</p>
          </SectionHeading>
          <div className={styles.integrationFlow}>
            {integration.map(([code, name, description]) => <article key={code}><span>{code}</span><h3>{name}</h3><p>{description}</p></article>)}
          </div>
        </div>
      </section>

      <section className={styles.paperSection}>
        <div className={styles.sectionInner}>
          <SectionHeading index="03" eyebrow="Reusable skill estate" title="Ten skills turn the deal into an operating discipline.">
            <p>Each skill declares inputs, outputs, authority, stop conditions, proof obligations and handoff. The repository files are executable operating specifications—not loose prompts.</p>
          </SectionHeading>
          <div className={styles.skillGrid}>
            {infrastructureSkills.map((skill, index) => (
              <article className={styles.skillCard} key={skill.slug}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <div><h3>{skill.name}</h3><p><b>Decision.</b> {skill.decision}</p><p><b>Output.</b> {skill.output}</p><strong>{skill.authority}</strong></div>
              </article>
            ))}
          </div>
          <div className={styles.heroActions}>
            <a className={styles.primaryAction} href="https://github.com/frankxai/starlight-technology/tree/feat/infrastructure-exchange-20260831/skills">Inspect the skill source <ArrowIcon /></a>
            <Link className={styles.secondaryAction} href="/api/infrastructure/manifest">Read the machine manifest</Link>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionInner}>
          <SectionHeading index="04" eyebrow="Compute estate" title="Buy each class for a named economic role.">
            <p>Heterogeneous infrastructure is intentional: reliable workers, private high-memory inference, cloud quality and later CUDA throughput solve different constraints.</p>
          </SectionHeading>
          <table className={styles.matrix}>
            <thead><tr><th>Class</th><th>Reference form</th><th>Economic role</th><th>Purchase trigger</th></tr></thead>
            <tbody>{hardware.map(([name, form, role], index) => <tr key={name}><td>{name}</td><td>{form}</td><td>{role}</td><td><strong>{index < 2 ? "Pilot-approved after workload baseline" : index === 2 ? "Metered from day one" : "Measured utilization or revenue crossover"}</strong></td></tr>)}</tbody>
          </table>
          <SourceNote>The architecture aligns with resource-centric zero-trust principles and lifecycle AI risk management. See <a href="https://csrc.nist.gov/publications/detail/sp/800-207/final">NIST SP 800-207</a> and the <a href="https://www.nist.gov/itl/ai-risk-management-framework">NIST AI RMF</a>.</SourceNote>
        </div>
      </section>
    </InfrastructureFrame>
  );
}
