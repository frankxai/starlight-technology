export type FinderInput = {
  workload: "local-ai" | "travel" | "studio";
  budget: "1500" | "3000" | "7000";
  priority: "performance" | "mobility" | "balance";
};

export type FinderResult = { title: string; summary: string; href: string; constraint: string };

export function recommendBuild(input: FinderInput): FinderResult {
  if (input.workload === "travel" || input.priority === "mobility") {
    return {
      title: "Portable AI + music studio",
      summary: "Protect carried-system weight, battery and capture; route heavy inference to a governed home or cloud system.",
      href: "/builds/portable-ai-music-studio-under-4kg",
      constraint: "Total carried mass—not laptop weight alone."
    };
  }
  if (input.budget === "7000" && input.priority === "performance") {
    return {
      title: "Hybrid desktop + travel system",
      summary: "Put sustained compute at the desk and keep mobile work calm, then govern project, model and backup handoff.",
      href: "/builds/hybrid-desktop-travel-system",
      constraint: "Coordination and recovery are part of the system."
    };
  }
  return {
    title: "Balanced AI creator studio",
    summary: "Allocate around the recurring bottleneck and preserve budget for memory, storage, monitoring and recovery.",
    href: "/builds/balanced-ai-creator-studio-3000",
    constraint: "The workload must justify the headline component."
  };
}
