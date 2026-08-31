export type PartnerRole =
  | "asset-owner"
  | "ai-operator"
  | "finance-partner"
  | "energy-partner"
  | "technology-partner"
  | "professional-advisor";

export type DealModelId =
  | "productivity-node"
  | "hosted-capacity"
  | "financed-transformation"
  | "offtake-backed-node"
  | "nodeco";

export type EvidenceState = "declared" | "documented" | "verified" | "accepted";

export interface DealModel {
  id: DealModelId;
  name: string;
  stage: string;
  thesis: string;
  assetOwner: string;
  operator: string;
  finance: string;
  revenueLogic: string;
  entryGate: string;
  wrongWhen: string;
}

export interface DealComposerInput {
  contribution: "site-power" | "capital" | "workload" | "operator-capability";
  demand: "exploratory" | "internal" | "contracted" | "external-offtake";
  capital: "operating-cash" | "leasing" | "bank" | "mixed";
  control: "owner-led" | "split" | "operator-led";
  sensitivity: "standard" | "confidential" | "regulated";
}

export interface ComposedDeal {
  model: DealModel;
  architecture: string;
  firstPurchase: string;
  contractFocus: string[];
  proofRequired: string[];
  riskPosture: string;
}

export interface InfrastructureSkill {
  slug: string;
  name: string;
  decision: string;
  output: string;
  authority: string;
}

export const dealModels: DealModel[] = [
  {
    id: "productivity-node",
    name: "Customer-funded productivity node",
    stage: "Default first transaction",
    thesis: "The operating company buys productive capability for its own workflows; the operator installs and manages the intelligence layer.",
    assetOwner: "Owns site, equipment, business data and accepted company-specific workflows.",
    operator: "Owns the reusable runtime, skills, architecture and delivery method.",
    finance: "Operating cash, equipment lease or digitalisation facility after underwriting.",
    revenueLogic: "Implementation fee + managed operations; optional capacity allocation priced separately.",
    entryGate: "Named internal workloads with accountable owners and a measurable baseline.",
    wrongWhen: "The only demand is speculative third-party GPU rental or the buyer cannot name an operating problem."
  },
  {
    id: "hosted-capacity",
    name: "Hosted capacity agreement",
    stage: "After site diligence",
    thesis: "The site contributes secured space, power and operations while the operator owns or leases the compute estate.",
    assetOwner: "Provides site services under a bounded host or colocation agreement.",
    operator: "Carries utilization risk and sells or consumes the capacity.",
    finance: "Operator equity, equipment lease or contracted workload finance.",
    revenueLogic: "Fixed host fee + metered energy + optional upside share above a defined utilization hurdle.",
    entryGate: "Metered power economics, network resilience, insurance position and committed workload.",
    wrongWhen: "The operator expects the property company to underwrite venture demand without minimum commitments."
  },
  {
    id: "financed-transformation",
    name: "Financed digital transformation",
    stage: "Bank-ready operating project",
    thesis: "The operating company finances a defined digital, energy and infrastructure programme because the assets improve its own productivity.",
    assetOwner: "Borrower and economic beneficiary; retains purchased assets.",
    operator: "Implementation vendor and managed-service provider, not lender or shadow owner.",
    finance: "House bank, promotional loan, leasing and retained earnings matched to asset life.",
    revenueLogic: "Milestone implementation revenue + recurring operations; debt serviced by company cashflow.",
    entryGate: "Approved business case, supplier quotations, implementation plan and debt-service headroom.",
    wrongWhen: "Property-backed or subsidised debt is being used to finance unbounded product experimentation."
  },
  {
    id: "offtake-backed-node",
    name: "Offtake-backed infrastructure node",
    stage: "Scale transaction",
    thesis: "Contracted internal or external workload supports the equipment and operating commitments before expansion capital is deployed.",
    assetOwner: "May own the site, energy assets or a portion of the equipment.",
    operator: "Schedules workloads, manages tenants and proves delivery against service levels.",
    finance: "Lease or term debt sized against contracted cashflow, not theoretical utilization.",
    revenueLogic: "Reserved capacity + usage + managed services with minimum commitments.",
    entryGate: "Bankable offtake, clear service boundary, tested unit economics and redundancy plan.",
    wrongWhen: "Revenue depends on spot-market compute prices or a single revocable customer."
  },
  {
    id: "nodeco",
    name: "NodeCo / project company",
    stage: "Only after repeatable proof",
    thesis: "A dedicated entity owns a portfolio of infrastructure assets once utilization, governance and expansion economics are independently legible.",
    assetOwner: "Contributes or leases site and energy rights under explicit long-term contracts.",
    operator: "Licenses the operating system and manages the node under performance obligations.",
    finance: "Project equity plus senior asset finance; security remains ring-fenced to the project where possible.",
    revenueLogic: "Multi-customer capacity, enterprise services, energy optimisation and asset-management fees.",
    entryGate: "At least one proven node, diversified demand, audited economics and professional governance.",
    wrongWhen: "The parties are using a JV to avoid defining price, ownership, liability or exit rights."
  }
];

export const infrastructureSkills: InfrastructureSkill[] = [
  {
    slug: "partner-underwriter",
    name: "Partner Underwriter",
    decision: "Is this counterparty, asset base and mandate worth entering?",
    output: "Partner score, red flags, data-room request and stop/go memo.",
    authority: "Recommend only. Legal, credit and investment approval remain human."
  },
  {
    slug: "workload-underwriter",
    name: "Workload Underwriter",
    decision: "Which workloads justify local, cloud or hybrid capacity?",
    output: "Demand baseline, data classification, latency profile and utilization envelope.",
    authority: "May classify and model; cannot buy capacity or promise savings."
  },
  {
    slug: "deal-architect",
    name: "Deal Architect",
    decision: "Which commercial structure separates value, control and risk cleanly?",
    output: "Deal memo, party graph, consideration map and stage gates.",
    authority: "Produces options; principals approve economics and control rights."
  },
  {
    slug: "contract-pack-composer",
    name: "Contract Pack Composer",
    decision: "Which agreements and schedules make the operating bargain explicit?",
    output: "Clause issue list, document matrix, dependencies and counsel brief.",
    authority: "Never issues legal advice or executable agreements without counsel review."
  },
  {
    slug: "it-integration-mapper",
    name: "IT Integration Mapper",
    decision: "How does the system attach to the existing estate without destabilising it?",
    output: "System inventory, trust boundaries, connector plan and write-back gates.",
    authority: "Read-only discovery by default; production writes require named approval."
  },
  {
    slug: "capital-stack-planner",
    name: "Capital Stack Planner",
    decision: "Which cost belongs to operating cash, lease, debt, subsidy review or equity?",
    output: "Sources-and-uses model, financing pack and covenant questions.",
    authority: "Planning support only; lenders, tax advisers and principals decide."
  },
  {
    slug: "procurement-conductor",
    name: "Procurement Conductor",
    decision: "What is purchased now, deferred or rented?",
    output: "Bill of materials, quote comparison, warranties, acceptance tests and asset register.",
    authority: "May prepare orders; cannot bind a company without delegated authority."
  },
  {
    slug: "node-operations",
    name: "Node Operations",
    decision: "Is the physical and digital estate healthy, secure and within its service envelope?",
    output: "Runbook, health state, incident record, capacity ledger and maintenance queue.",
    authority: "May execute reversible runbook actions; consequential actions escalate."
  },
  {
    slug: "revenue-operator",
    name: "Revenue Operator",
    decision: "Which verified capability becomes an internal saving, service or external offer?",
    output: "Offer design, pricing evidence, pipeline and contribution-margin view.",
    authority: "Drafts and analyses; pricing and customer commitments require approval."
  },
  {
    slug: "provenance-auditor",
    name: "Provenance Auditor",
    decision: "Can every material claim, action and payment be reconstructed?",
    output: "Evidence receipts, exceptions, missing approvals and audit-ready timeline.",
    authority: "Append and flag; never rewrites source records."
  }
];

export const executionGates = [
  {
    code: "G0",
    name: "Mandate",
    question: "Are the parties, objectives, authority and protected boundaries explicit?",
    proof: "Signed Phase 0 scope, data-room protocol, decision owners and exclusions."
  },
  {
    code: "G1",
    name: "Baseline",
    question: "Can the value pools and operational pain be evidenced from current systems?",
    proof: "ERP/shop/finance extracts, workload logs, energy data and accepted baseline."
  },
  {
    code: "G2",
    name: "Underwriting",
    question: "Does one structure dominate on economics, control and downside?",
    proof: "Sources-and-uses, sensitivity model, contract matrix and risk register."
  },
  {
    code: "G3",
    name: "Pilot authority",
    question: "Is the pilot bounded enough to buy, integrate and stop without ambiguity?",
    proof: "Approved SOW, budget ceiling, acceptance tests and human approval matrix."
  },
  {
    code: "G4",
    name: "Shadow operation",
    question: "Does the system produce reliable recommendations before production write access?",
    proof: "Dual-run results, exceptions, model/tool receipts and operator sign-off."
  },
  {
    code: "G5",
    name: "Production acceptance",
    question: "Has the node created verified value without violating its authority boundary?",
    proof: "Acceptance report, measured economics, incident review and ownership register."
  },
  {
    code: "G6",
    name: "Expansion",
    question: "Is additional debt, hardware or another site justified by contracted demand?",
    proof: "Utilization history, offtake, DSCR case, supplier terms and exit plan."
  }
] as const;

export const contractStack = [
  ["01", "Mutual NDA + data-room protocol", "Discovery access, permitted use, retention, representatives and clean exit."],
  ["02", "Phase 0 fixed-fee SOW", "Questions, inputs, deliverables, exclusions, acceptance and a hard spend ceiling."],
  ["03", "Master services agreement", "Commercial baseline for implementation, operations, liability, IP and change control."],
  ["04", "Data processing + security schedules", "Roles, subprocessors, residency, access, incidents, deletion and audit evidence."],
  ["05", "Site / host / colocation agreement", "Space, power, cooling, network, access, metering, insurance and removal rights."],
  ["06", "Equipment purchase or lease", "Title, warranty, acceptance, maintenance, serials, liens and end-of-term treatment."],
  ["07", "Energy EPC / O&M / supply instrument", "Generation, storage, metering, curtailment, maintenance and tariff logic."],
  ["08", "Capacity / offtake / managed service", "Reserved capacity, usage, service levels, minimums, priority and suspension."],
  ["09", "Software and skill licence", "Reusable platform IP, client-specific artefacts, updates, portability and escrow questions."],
  ["10", "Operations, incident and exit schedule", "Runbooks, approvals, recovery, step-in, transition support and data export."],
  ["11", "Finance and security documents", "Only after underwriting: loan, lease, guarantees, collateral and covenants."],
  ["12", "Related-party / tax memorandum", "Where relevant: arm's-length rationale, VAT, cross-border services and ownership."]
] as const;

export const proofFields = [
  "source identity and immutable reference",
  "observed or effective timestamp",
  "record owner and affected organisation",
  "evidence state and confidence",
  "input snapshot or content hash",
  "model, tool, workflow and skill version",
  "human approval, rejection or exception",
  "contract, purchase order or policy relevance",
  "output artefact and downstream decision",
  "retention, access and deletion class"
] as const;

export function getDealModel(id: DealModelId): DealModel {
  const model = dealModels.find((candidate) => candidate.id === id);
  if (!model) throw new Error(`Unknown deal model: ${id}`);
  return model;
}

export function composeDeal(input: DealComposerInput): ComposedDeal {
  let modelId: DealModelId = "productivity-node";

  if (input.demand === "external-offtake") {
    modelId = "offtake-backed-node";
  } else if (input.contribution === "capital" && input.control === "split" && input.demand === "contracted") {
    modelId = "nodeco";
  } else if (input.contribution === "site-power" && input.demand === "exploratory") {
    modelId = "hosted-capacity";
  } else if ((input.capital === "bank" || input.capital === "mixed") && input.demand !== "exploratory") {
    modelId = "financed-transformation";
  }

  const model = getDealModel(modelId);
  const sensitive = input.sensitivity !== "standard";
  const firstPurchase =
    modelId === "hosted-capacity"
      ? "Do not buy compute yet. Buy site, energy, network and workload diligence first."
      : modelId === "nodeco"
        ? "Do not form the project company yet. Buy an independent underwriting and governance pack first."
        : "Buy the fixed-scope Partnership Blueprint before hardware, debt or production access.";

  const architecture = sensitive
    ? "Private-data workloads stay inside the governed tenant or local node; frontier models receive only approved, minimised context."
    : "Use a hybrid model: local control and repeatable workers, with metered cloud burst for frontier quality and peak demand.";

  const contractFocus = [
    "Phase 0 SOW and data-room protocol",
    modelId === "hosted-capacity" ? "Site / host agreement" : "Implementation MSA + SOW",
    modelId === "financed-transformation" ? "Finance-ready sources-and-uses schedule" : "Asset and capacity ownership schedule",
    input.control === "split" ? "Reserved matters and deadlock / exit mechanism" : "Authority and acceptance matrix"
  ];

  const proofRequired = [
    input.demand === "exploratory" ? "Named workloads and accountable process owners" : "Demand baseline or signed offtake evidence",
    "Current IT, network, identity and data map",
    "Metered power, site and supplier assumptions",
    "Downside case with an executable stop or removal path"
  ];

  const riskPosture =
    modelId === "nodeco"
      ? "High structural complexity. Proceed only after a proven operating node and independent legal, tax and credit review."
      : "Stage-gated. No equity, uncapped guarantee, property collateral or production write access in Phase 0.";

  return { model, architecture, firstPurchase, contractFocus, proofRequired, riskPosture };
}
