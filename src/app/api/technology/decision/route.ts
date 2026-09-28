import { constraints, decideSystem, environments, workloads, type Constraint, type Environment, type Workload } from "@/lib/technology-decision";

export function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const workload = params.get("workload");
  const environment = params.get("environment");
  const constraint = params.get("constraint") ?? "None";
  if (!workloads.includes(workload as Workload) || !environments.includes(environment as Environment) || !constraints.includes(constraint as Constraint)) {
    return Response.json({ error: "Choose a supported workload, environment and constraint.", allowed: { workloads, environments, constraints } }, { status: 400 });
  }
  const result = decideSystem({ workload: workload as Workload, environment: environment as Environment, constraint: constraint as Constraint, existingAssets: "" });
  return Response.json({ schemaVersion: 1, inputs: { workload, environment, constraint }, result, note: "Research starting point, not a compatibility certification or purchase instruction." }, { headers: { "Cache-Control": "public, max-age=0, s-maxage=300" } });
}
