// Edition comparison. Three columns: the free lab (live), the Workflow
// Edition (release candidate, proposed price) and the team licence (planned,
// never priced). Values are capability facts, not marketing tiers.

export type EditionCell = string | boolean;

export interface EditionColumn {
  id: "lab" | "edition" | "team";
  name: string;
  status: string;
  price: string;
  href: string;
  cta: string;
}

export interface EditionRow {
  label: string;
  cells: Record<EditionColumn["id"], EditionCell>;
}

export const editionColumns: EditionColumn[] = [
  { id: "lab", name: "Source-to-Brief Lab", status: "Free · live", price: "€0", href: "/shop/free/source-to-brief-lab", cta: "Open the lab" },
  { id: "edition", name: "Workflow Edition", status: "Release candidate", price: "€149 proposed", href: "/shop/products/source-to-brief-workflow-edition", cta: "Inspect the edition" },
  { id: "team", name: "Team licence", status: "Planned · not for sale", price: "No price set", href: "/shop/availability", cta: "Register interest" }
];

export const editionRows: EditionRow[] = [
  { label: "Input", cells: { lab: "Pasted text, in the browser", edition: "A folder of notes on your machine", team: "Shared folder per team" } },
  { label: "Extraction", cells: { lab: "Deterministic", edition: "Deterministic, or assisted with your own model key", team: "Same as the edition" } },
  { label: "Review gate", cells: { lab: true, edition: true, team: true } },
  { label: "Review log kept with the brief", cells: { lab: "Summary counts only", edition: true, team: true } },
  { label: "Twelve-check evaluation", cells: { lab: true, edition: true, team: true } },
  { label: "Export brief.md + starlight.brief/v1", cells: { lab: true, edition: true, team: true } },
  { label: "Templates and worked example", cells: { lab: false, edition: true, team: true } },
  { label: "Installation diagnostics", cells: { lab: false, edition: true, team: true } },
  { label: "Agent skill wrapper", cells: { lab: false, edition: true, team: true } },
  { label: "Seats", cells: { lab: "Anyone", edition: "One named operator", team: "To be defined" } },
  { label: "Support", cells: { lab: "Best effort", edition: "Email, two business days", team: "To be defined" } },
  { label: "Updates", cells: { lab: "Continuous", edition: "One year within 1.x", team: "To be defined" } },
  { label: "Licence", cells: { lab: "FREE-USE", edition: "SOL-1", team: "Not drafted" } }
];
