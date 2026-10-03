import { technology, type TechnologyRecord } from "./technology";

export const workloads = ["Local AI", "Spatial creation", "Robotics research"] as const;
export const environments = ["Desk", "Mobile", "Controlled site"] as const;
export const constraints = ["None", "CUDA required", "Large shared memory", "Unattended operation"] as const;

export type Workload = typeof workloads[number];
export type Environment = typeof environments[number];
export type Constraint = typeof constraints[number];

export interface SystemBrief { workload: Workload; environment: Environment; constraint: Constraint; existingAssets: string; }
export const defaultBrief: SystemBrief = { workload: "Local AI", environment: "Desk", constraint: "None", existingAssets: "" };

export function isSystemBrief(value: unknown): value is SystemBrief {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Record<string, unknown>;
  return workloads.includes(candidate.workload as Workload)
    && environments.includes(candidate.environment as Environment)
    && constraints.includes(candidate.constraint as Constraint)
    && typeof candidate.existingAssets === "string"
    && candidate.existingAssets.length <= 1000;
}

export interface DecisionResult {
  status: "candidate" | "hold";
  headline: string;
  rationale: string;
  candidateSlugs: string[];
  checks: string[];
  reviewedAt: string;
}

export function decideSystem(brief: SystemBrief): DecisionResult {
  const base = { reviewedAt: "2026-09-28", candidateSlugs: [] as string[] };
  if (brief.workload === "Robotics research") {
    if (brief.constraint === "Unattended operation" || brief.environment !== "Controlled site") {
      return { ...base, status: "hold", headline: "Define a supervised site before selecting a robot.", rationale: "The current catalog has no accepted unattended-operation or public-space safety case.", checks: ["Name the site and operator", "Confirm variant SDK and support", "Document physical stop and recovery"] };
    }
    return { ...base, status: "candidate", headline: "Evaluate a supervised research platform.", rationale: "Unitree Go2 is a manufacturer-sourced starting point, not a certified fit or autonomous fleet worker.", candidateSlugs: ["unitree-go2"], checks: ["Confirm exact variant and firmware", "Prove site safety and service path", "Test in a controlled area"] };
  }
  if (brief.workload === "Spatial creation") {
    return { ...base, status: "candidate", headline: "Prototype the experience before scaling the device fleet.", rationale: "A standalone headset can test interaction and content, while host, management and comfort remain workflow-specific.", candidateSlugs: ["meta-quest-3s"], checks: ["Specify the content and host workflow", "Check device policy for shared use", "Budget capture and development time"] };
  }
  if (brief.constraint === "CUDA required") {
    if (brief.environment !== "Desk") return { ...base, status: "hold", headline: "Resolve where CUDA work must run.", rationale: "The current sourced GPU reference is a desktop component, not a complete mobile system.", checks: ["Name the exact CUDA-dependent workload", "Choose desk or remote compute boundary", "Validate host, power and cooling"] };
    return { ...base, status: "candidate", headline: "Start from the CUDA workload and the complete desktop.", rationale: "A 32 GB GPU is justified only by repeated memory pressure; the card alone is not a working system.", candidateSlugs: ["geforce-rtx-5090"], checks: ["Measure required GPU memory", "Validate power, cooling and case", "Reserve budget for memory, storage and backup"] };
  }
  if (brief.environment === "Mobile") return { ...base, status: "hold", headline: "Define the carried system first.", rationale: "The current Atlas does not yet have a verified mobile-computer variant for this workload.", checks: ["Set carried weight and offline workload", "Include charger, capture and backup", "Compare laptop with remote or home compute"] };
  return { ...base, status: "candidate", headline: "Start with the system memory boundary.", rationale: "Framework Desktop is a compact shared-memory reference; a discrete GPU route is a separate architecture with different software support.", candidateSlugs: brief.constraint === "Large shared memory" ? ["framework-desktop-ryzen-ai-max"] : ["framework-desktop-ryzen-ai-max", "geforce-rtx-5090"], checks: ["Test model and software compatibility", "Count display, storage and backup", "Verify the exact regional variant"] };
}

export function decisionCandidates(result: DecisionResult): TechnologyRecord[] {
  return result.candidateSlugs.map((slug) => technology.find((item) => item.slug === slug)).filter((item): item is TechnologyRecord => Boolean(item));
}
