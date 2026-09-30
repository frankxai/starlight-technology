type Recommendation = {
  title: string;
  reason: string;
  url: string;
  label: string;
  partner?: { status: "active"; url: string; verifiedOn: string };
};

// Add partner only after the account, destination and programme terms are verified.
// Official sources remain useful when there is no approved commercial relationship.
export const editorialRecommendations: Record<string, Recommendation> = {
  "gpu-comparison": {
    title: "Compare two memory capacities",
    reason: "Use the RTX 5080 and RTX 5090 comparison to evaluate the capacity constraint, alternatives and gaps in our evidence.",
    url: "/compare/rtx-5080-vs-5090-local-ai",
    label: "Read the GPU comparison",
  },
  "studio-build": {
    title: "Apply the cost model to a complete build",
    reason: "The balanced creator studio shows how compute, storage, audio and ergonomics compete for the same budget.",
    url: "/builds/balanced-ai-creator-studio-3000",
    label: "Explore the studio build",
  },
};

export function recommendationDestination(item: Recommendation) {
  const partner = item.partner;
  if (partner?.status === "active" && /^\d{4}-\d{2}-\d{2}$/.test(partner.verifiedOn)) {
    try {
      const url = new URL(partner.url);
      if (url.protocol === "https:" && !url.username && !url.password) return { href: partner.url, sponsored: true };
    } catch { /* Fall back to the editorial destination. */ }
  }
  return { href: item.url, sponsored: false };
}
