export type AiGoal = "knowledge" | "automation" | "build";
export type AiDataBoundary = "public" | "approved-cloud" | "local";
export type AiStartingPoint = "existing-tools" | "new-setup";

export interface AiSetupInput {
  goal: AiGoal;
  dataBoundary: AiDataBoundary;
  startingPoint: AiStartingPoint;
}

export interface AiSetupPlan {
  title: string;
  result: string;
  runtime: string;
  constraint: string;
  steps: string[];
  links: { label: string; href: string }[];
}

export const aiKit = {
  name: "AI System Brief Kit",
  version: "1.0",
  releasedOn: "2026-10-07",
  status: "Free download · available now",
  files: [
    { name: "System brief", format: "Markdown", href: "/downloads/ai-system-brief.md", description: "Define the job, data boundary, authority, cost and exit condition." },
    { name: "Worked example", format: "Markdown", href: "/downloads/ai-system-brief-example.md", description: "A fictional studio turns approved source notes into a reviewed project brief." },
    { name: "Acceptance worksheet", format: "CSV", href: "/downloads/ai-acceptance-worksheet.csv", description: "Record quality, spend, recovery and permission checks on the same run." },
    { name: "Agent handoff", format: "Markdown", href: "/downloads/ai-agent-handoff.md", description: "Give an implementation agent a bounded task and a reviewable delivery contract." }
  ]
} as const;

// These are provider documentation links, not partner appointments or offers.
// Capability facts are source-backed. Fit and stop conditions are editorial inference.
export const aiSoftware = [
  {
    id: "ollama", name: "Ollama", role: "Local model runtime", marker: "01 / RUN",
    summary: "A local model runtime with a terminal and API path for your own applications.",
    fit: "You want a scriptable local model endpoint and can validate your machine against the exact model.",
    constraint: "Choose a local model explicitly. Cloud models use a different data boundary. Check each model licence.",
    cost: "Plan for host memory, storage and power; cloud use has separate provider terms.",
    sourceUrl: "https://docs.ollama.com/quickstart", sourceLabel: "Official quickstart", checkedOn: "2026-10-07"
  },
  {
    id: "lm-studio", name: "LM Studio", role: "Desktop local AI", marker: "02 / EXPLORE",
    summary: "A desktop environment for downloading local models, reviewing prompts and using a local API.",
    fit: "You want to evaluate a local chat workflow before engineering an application around it.",
    constraint: "Verify OS and runtime requirements. Local execution still needs suitable model rights and trusted extensions.",
    cost: "Check current app terms and include the host, model storage and any connected services.",
    sourceUrl: "https://lmstudio.ai/docs/app", sourceLabel: "Official app documentation", checkedOn: "2026-10-07"
  },
  {
    id: "n8n", name: "n8n", role: "Workflow automation", marker: "03 / CONNECT",
    summary: "A workflow platform for connecting your approved tools and making repeated work inspectable.",
    fit: "You have a repeated task, authorised connectors and an owner for failures and retries.",
    constraint: "Review the licence for your exact hosting and customer-access model before packaging or reselling access.",
    cost: "Include hosting or subscription, model/API usage, maintenance and support.",
    sourceUrl: "https://support.n8n.io/article/can-i-use-your-license-for-my-use-case", sourceLabel: "Official use-case and licence guidance", checkedOn: "2026-10-07"
  },
  {
    id: "hugging-face", name: "Hugging Face", role: "Model discovery & evidence", marker: "04 / VERIFY",
    summary: "Use model cards to inspect intended use, limitations, licence and published evaluation information.",
    fit: "You need to identify and document a model before committing it to a system.",
    constraint: "A model listing or card does not prove suitability, commercial permission or your own benchmark performance.",
    cost: "Model terms, downloads, storage and hosted inference vary; confirm the chosen path.",
    sourceUrl: "https://huggingface.co/docs/hub/model-cards", sourceLabel: "Official model-card documentation", checkedOn: "2026-10-07"
  }
] as const;

export function planAiSetup(input: AiSetupInput): AiSetupPlan {
  const local = input.dataBoundary === "local";
  const runtime = local
    ? "Evaluate a local runtime against the exact model, OS, memory and context size. Keep inputs and outputs on an approved host."
    : input.dataBoundary === "approved-cloud"
      ? "Use an approved provider account with an explicit data-processing boundary, retention decision and usage limit."
      : "Start in a tool you already use with public or synthetic examples. Record the provider and model used.";
  const firstStep = input.startingPoint === "existing-tools"
    ? "Inventory your existing tools and run the smallest useful example before buying another subscription or machine."
    : "Fill the system brief and trial the workflow on public or synthetic inputs before committing to a new setup.";
  const boundary = local
    ? "Local means the complete workflow: check extensions, telemetry, retrieval and backups as well as inference."
    : "Keep sensitive or restricted inputs out until the chosen provider and workflow have explicit approval.";
  const common = [firstStep, "Set a per-run and monthly cost ceiling. Record actual usage, including failed attempts.", "Save the output and run record outside the tool. Exercise the recovery path before relying on automation."];
  const links = local
    ? [{ label: "Inspect local runtime docs", href: "https://docs.ollama.com/quickstart" }, { label: "Compare compute decisions", href: "/shop" }]
    : [{ label: "Inspect model evidence", href: "https://huggingface.co/docs/hub/model-cards" }, { label: "Explore system builds", href: "/builds" }];

  if (input.goal === "automation") return {
    title: "One task. A recoverable workflow.",
    result: "A draft workflow that prepares one useful artifact for review and records what happened.",
    runtime, constraint: `${boundary} External writes start as drafts; retries must not duplicate an action.`,
    steps: [common[0], "Choose one repeated input and output. Add a manual trigger, schema check and approval before any external write.", common[1], common[2]],
    links: [{ label: "Review workflow licensing", href: "https://support.n8n.io/article/can-i-use-your-license-for-my-use-case" }, ...links]
  };
  if (input.goal === "build") return {
    title: "A bounded AI build environment.",
    result: "One isolated change with inspectable code, checks and a rollback path.",
    runtime, constraint: `${boundary} The build agent receives scoped access; a passing test is not release authority.`,
    steps: [common[0], "Work in an isolated branch. Name the acceptance checks, permitted tools and deployment owner in the agent handoff.", common[1], common[2]], links
  };
  return {
    title: "Source notes into a useful brief.",
    result: "One project brief with sources, unresolved questions and a human-reviewed next action.",
    runtime, constraint: `${boundary} Every factual claim needs a source or an explicit uncertainty label.`,
    steps: [common[0], "Choose a small authorised source set and a known-answer example. Compare the draft with the sources before using it.", common[1], common[2]], links
  };
}

const goalLabels: Record<AiGoal, string> = { knowledge: "Knowledge to a brief", automation: "Automate one repeated task", build: "Build with an AI agent" };
const boundaryLabels: Record<AiDataBoundary, string> = { public: "Public or synthetic data", "approved-cloud": "Approved cloud provider", local: "Local-only workflow" };

export function setupPlanMarkdown(input: AiSetupInput): string {
  const plan = planAiSetup(input);
  return [
    "# Starlight AI Setup Plan", "", `Generated from deterministic planning rules · kit ${aiKit.version}`, "",
    `Goal: ${goalLabels[input.goal]}`, `Data boundary: ${boundaryLabels[input.dataBoundary]}`,
    `Starting point: ${input.startingPoint === "existing-tools" ? "Existing tools" : "New setup"}`, "",
    `## ${plan.title}`, "", plan.result, "", "## Runtime boundary", "", plan.runtime,
    "", "## Decisive constraint", "", plan.constraint, "", "## First validation run", "",
    ...plan.steps.map((step, i) => `${i + 1}. ${step}`), "", "## Fill before implementation", "",
    "Owner:", "Permitted source set:", "Success check:", "Per-run cost ceiling:", "Monthly cost ceiling:", "Recovery owner:",
    "", "## Decision references", "", ...plan.links.map(link => `- ${link.label}: ${link.href.startsWith("/") ? `https://starlight.technology${link.href}` : link.href}`),
    "", "Planning guidance, not a compatibility certification or installed workflow. No provider account or hardware purchase is included.",
    "Original template text: CC BY 4.0 · Starlight Technology · https://starlight.technology/ai", ""
  ].join("\n");
}
