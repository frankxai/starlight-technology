export type EvidenceStatus = "research-backed" | "inferred" | "owned-and-tested" | "hands-on";

export type SourceRecord = {
  id: string;
  title: string;
  publisher: string;
  url: string;
  verifiedOn: string;
  primary: boolean;
};

export type Section = { heading: string; body: string[]; bullets?: string[] };

export type Build = {
  slug: string;
  title: string;
  summary: string;
  budget: string;
  objective: string;
  evidenceStatus: EvidenceStatus;
  lastVerified: string;
  fit: string[];
  avoidWhen: string[];
  allocation: { label: string; value: string; rationale: string }[];
  sections: Section[];
  sourceIds: string[];
};

export type Comparison = {
  slug: string;
  title: string;
  summary: string;
  verdict: string;
  evidenceStatus: EvidenceStatus;
  lastVerified: string;
  options: { name: string; bestFor: string; wrongFor: string; keyConstraint: string }[];
  sections: Section[];
  sourceIds: string[];
};

export type Guide = {
  slug: string;
  title: string;
  summary: string;
  evidenceStatus: EvidenceStatus;
  lastVerified: string;
  sections: Section[];
  sourceIds: string[];
};
