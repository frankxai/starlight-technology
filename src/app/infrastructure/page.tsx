import type { Metadata } from "next";
import Link from "next/link";
import { DealGraph } from "@/components/infrastructure/deal-graph";
import { InfrastructureFrame } from "@/components/infrastructure/frame";
import { ArrowIcon, BankIcon, BuildingIcon, ComputeIcon, NetworkIcon, ShieldIcon, WarehouseIcon } from "@/components/infrastructure/icons";
import { SectionHeading, SourceNote } from "@/components/infrastructure/section";
import styles from "@/components/infrastructure/infrastructure.module.css";
import { dealModels, executionGates } from "@/lib/infrastructure";

export const metadata: Metadata = {
  title: "Infrastructure Partnership OS",
  description: "Structure, finance, deploy and operate joint AI infrastructure across asset owners, AI operators, banks, energy providers and technology partners.",
  alternates: { canonical: "/infrastructure" },
  openGraph: {
    title: "Starlight Infrastructure Partnership OS",
    description: "The transaction and operating system for turning sites, power, capital and workloads into governed AI infrastructure.",
    url: "/infrastructure"
  }
};

const valueLayers = [
  { number: "01", title: "Operating intelligence", text: "Attach to ERP, shop, CRM, documents and facilities without replacing the systems that already run the business.", items: ["margin and inventory exceptions", "lead-to-offer workflows", "owner decision briefs"] },
  { number: "02", title: "Physical productivity", text: "Treat buildings, energy, storage, network and compute as one governed productive estate rather than unrelated purchases.", items: ["metered site economics", "asset acceptance and warranty", "capacity allocation"] },
  { number: "03", title: "Financeable evidence", text: "Translate the operating programme into a lender-readable sources-and-uses model, implementation plan and proof trail.", items: ["baseline and downside case", "supplier quotations", "approval and contract map"] },
  { number: "04", title: "Repeatable expansion", text: "Scale only when one node proves utilization, value, controls and exit mechanics. The second node is an evidence decision.", items: ["offtake before expansion", "portfolio control plane", "operator licensing"] }
] as const;

const principles = [
  ["01", "Workload before hardware", "A server is not demand. Name the workflow, data owner, service envelope and value baseline before selecting equipment."],
  ["02", "Contracts before assumptions", "Who owns the machine, software, output, uptime obligation, residual value and failure is written before family trust or enthusiasm is tested."],
  ["03", "Evidence before debt", "Debt belongs behind accepted business value or contracted offtake—not ahead of an unpriced experiment."],
  ["04", "Shared primitives, isolated organisations", "Runtime standards can be common while identity, data, memory, budgets, queues and authority remain tenant-specific."],
  ["05", "Local where it changes control", "Private inference is purchased for confidentiality, latency, resilience or measured cost—not as a symbolic claim of sovereignty."],
  ["06", "Rights decay with exposure", "Guarantees, priorities, reserved capacity and special approvals expire when the corresponding risk or capital exposure ends."]
] as const;

export default function InfrastructurePage() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: "Starlight Infrastructure Partnership Blueprint",
    provider: { "@type": "Organization", name: "Starlight Intelligence" },
    description: "A fixed-scope underwriting and operating architecture for joint AI infrastructure partnerships.",
    offers: { "@type": "Offer", price: "6500", priceCurrency: "EUR", url: "https://starlight.technology/checkout/infrastructure-blueprint" }
  };

  return (
    <InfrastructureFrame>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <section className={styles.hero}>
        <div className={styles.heroCopy}>
          <p className={styles.kicker}>Infrastructure Partnership OS</p>
          <h1>Make the operating agreement <em>the first machine.</em></h1>
          <p className={styles.heroLede}>A transaction and execution system for companies combining sites, solar, storage, balance-sheet capacity, AI engineering and real workloads. Structure the bargain, prove the economics, then buy the estate.</p>
          <div className={styles.heroActions}>
            <Link className={styles.primaryAction} href="/infrastructure/compose">Compose a deal <ArrowIcon /></Link>
            <Link className={styles.secondaryAction} href="/infrastructure/workspace">Inspect the control room</Link>
          </div>
          <dl className={styles.heroProof}>
            <div><dt>€6,500</dt><dd>fixed Phase 0 Partnership Blueprint</dd></div>
            <div><dt>15 days</dt><dd>target decision cycle after complete inputs</dd></div>
            <div><dt>G0 → G6</dt><dd>stage gates from mandate to expansion</dd></div>
          </dl>
        </div>
        <DealGraph />
      </section>

      <section className={styles.signalBar} aria-label="Operating doctrine">
        <div><span>01 / OBJECT</span><strong>Productive capability</strong></div>
        <div><span>02 / UNIT</span><strong>Contracted workload</strong></div>
        <div><span>03 / CONTROL</span><strong>Explicit authority</strong></div>
        <div><span>04 / PROOF</span><strong>Reconstructable evidence</strong></div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionInner}>
          <SectionHeading index="01" eyebrow="What is being built" title="One economic system across software, buildings and capital.">
            <p>The opportunity is not “a GPU farm.” It is a governed capability that improves the host company first, creates a reusable operating asset second and becomes externally sellable only when demand and responsibility are legible.</p>
          </SectionHeading>
          <div className={styles.valueArchitecture}>
            {valueLayers.map((layer) => (
              <article key={layer.number}>
                <span className={styles.valueNumber}>{layer.number}</span>
                <h3>{layer.title}</h3>
                <p>{layer.text}</p>
                <ul>{layer.items.map((item) => <li key={item}>{item}</li>)}</ul>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.darkSection}>
        <div className={styles.sectionInner}>
          <SectionHeading index="02" eyebrow="Transaction architecture" title="Five structures. Only one should be first.">
            <p>The default is a customer-funded productivity node: the operating company buys capability for named workflows. More complex structures enter only when utilization, offtake and governance can carry them.</p>
          </SectionHeading>
          <table className={styles.dealTable}>
            <thead><tr><th>#</th><th>Structure</th><th>Economic bargain</th><th>Entry evidence</th><th>Failure condition</th></tr></thead>
            <tbody>
              {dealModels.map((model, index) => (
                <tr key={model.id}>
                  <td>0{index + 1}</td>
                  <td>{model.name}</td>
                  <td>{model.revenueLogic}</td>
                  <td>{model.entryGate}</td>
                  <td>{model.wrongWhen}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className={styles.heroActions}>
            <Link className={styles.primaryAction} href="/infrastructure/compose">Compile the starting structure <ArrowIcon /></Link>
            <Link className={styles.secondaryAction} href="/infrastructure/contracts">Inspect the contract stack</Link>
          </div>
        </div>
      </section>

      <section className={styles.paperSection}>
        <div className={styles.sectionInner}>
          <SectionHeading index="03" eyebrow="Why each party enters" title="The bargain must survive six different balance sheets.">
            <p>Partnership language is cheap. The system becomes real when each participant can state what it contributes, receives, controls, proves and can exit.</p>
          </SectionHeading>
          <div className={styles.partyValue}>
            <article><WarehouseIcon /><h3>Asset and operating company</h3><p>Turns underused site, roof, energy, data and existing workflows into higher asset productivity—without becoming an AI lab.</p><ul><li>Business-owned hardware and data</li><li>Margin, inventory and sales intelligence</li><li>Bounded implementation and exit</li></ul></article>
            <article><NetworkIcon /><h3>AI operator</h3><p>Earns fixed underwriting, implementation and managed-service revenue while retaining reusable platform and skill IP.</p><ul><li>Anchor customer and reference node</li><li>Contracted capacity rather than implied access</li><li>Reusable delivery system for the next client</li></ul></article>
            <article><BankIcon /><h3>Bank and finance partners</h3><p>Underwrite a defined operating programme with assets, quotations, implementation controls and observable cashflow—not an AI narrative.</p><ul><li>Sources-and-uses by asset life</li><li>Accepted baseline and downside case</li><li>Clear borrower, security and repayment logic</li></ul></article>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionInner}>
          <SectionHeading index="04" eyebrow="Execution control" title="Capital unlocks one gate at a time.">
            <p>Each gate has a named question and required proof. The next purchase is unavailable until the current evidence has an owner and an acceptance state.</p>
          </SectionHeading>
          <div className={styles.gateRail}>
            {executionGates.map((gate) => (
              <article key={gate.code}><span className={styles.gateCode}>{gate.code}</span><h3>{gate.name}</h3><p>{gate.question}</p><small>{gate.proof}</small></article>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.darkSection}>
        <div className={styles.sectionInner}>
          <SectionHeading index="05" eyebrow="Non-negotiable doctrine" title="Prevent the expensive category errors.">
            <p>Most infrastructure failures begin before installation: demand is inferred, roles remain social, asset life is mismatched to finance and automation receives authority it has not earned.</p>
          </SectionHeading>
          <div className={styles.principleGrid}>
            {principles.map(([number, title, text]) => <article key={number}><span>{number}</span><div><h3>{title}</h3><p>{text}</p></div></article>)}
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionInner}>
          <SectionHeading index="06" eyebrow="Reference architecture" title="Attach to the existing company before replacing anything.">
            <p>Read-first connectors map ERP, shop, CRM, identity, documents, finance preparation and facilities. Agents operate in shadow mode; production write-back is earned by accepted evidence.</p>
          </SectionHeading>
          <div className={styles.partyValue}>
            <article><BuildingIcon /><h3>Physical estate</h3><p>Warehouse, power, PV, storage, meter, network, access, cooling, equipment, warranty and insurance become one asset graph.</p><ul><li>serialised asset register</li><li>energy and capacity ledger</li><li>maintenance and incident evidence</li></ul></article>
            <article><ComputeIcon /><h3>Intelligence estate</h3><p>Persistent workers, deterministic workflows, local inference and metered cloud models are routed by workload and authority.</p><ul><li>tenant-separated identity and memory</li><li>model and tool version receipts</li><li>reversible automation first</li></ul></article>
            <article><ShieldIcon /><h3>Control estate</h3><p>Contracts, policies, approvals, SLAs and evidence receipts determine what the system may observe, recommend, prepare or execute.</p><ul><li>human approval for consequential action</li><li>append-only decision history</li><li>portable data and explicit exit</li></ul></article>
          </div>
          <div className={styles.heroActions}>
            <Link className={styles.primaryAction} href="/infrastructure/system">Inspect the system and skills <ArrowIcon /></Link>
            <Link className={styles.secondaryAction} href="/infrastructure/operator">See the operator model</Link>
          </div>
          <SourceNote>Reference frameworks: <a href="https://www.nist.gov/itl/ai-risk-management-framework">NIST AI RMF</a>, <a href="https://www.nist.gov/publications/artificial-intelligence-risk-management-framework-generative-artificial-intelligence">NIST Generative AI Profile</a>, and <a href="https://csrc.nist.gov/publications/detail/sp/800-207/final">NIST Zero Trust Architecture</a>.</SourceNote>
        </div>
      </section>

      <section className={styles.offerBand}>
        <div>
          <p className={styles.kicker}>Phase 0 · fixed decision product</p>
          <h2>Partnership Blueprint</h2>
        </div>
        <div>
          <p>Commission the underwriting before the machines: asset and workload map, IT integration design, three viable deal structures, contract matrix, sources-and-uses model, procurement sequence, risk register and 90-day pilot mandate.</p>
          <dl className={styles.offerTerms}>
            <div><dt>Professional fee</dt><dd>€6,500 ex VAT</dd></div>
            <div><dt>Target cycle</dt><dd>15 business days after complete inputs</dd></div>
            <div><dt>Purchase exposure</dt><dd>No hardware, debt or production access included</dd></div>
            <div><dt>Acceptance</dt><dd>Decision pack + executive review</dd></div>
          </dl>
          <div className={styles.heroActions}>
            <Link className={styles.primaryAction} href="/checkout/infrastructure-blueprint">Commission the Blueprint <ArrowIcon /></Link>
            <Link className={styles.secondaryAction} href="/infrastructure/contracts">Review boundaries first</Link>
          </div>
        </div>
      </section>
    </InfrastructureFrame>
  );
}
