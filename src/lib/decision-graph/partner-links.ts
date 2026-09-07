import routes from "@/data/partner-routes.json";
import { indexGraph } from "./graph";
import type { DecisionGraph } from "./schema";

const ROUTER_ORIGIN = "https://go.agenticincome.ai";
const knownSlugs = new Set<string>(routes.slugs.map((slug: string) => slug.toLowerCase()));

export type OutboundLink = {
  href: string;
  routed: boolean;
  /** Printed next to the link, every time, without a hover or a footnote. */
  disclosure: string;
  rel: string;
};

/**
 * Outbound link policy, in one function so it cannot drift page to page.
 *
 * A link goes through the governed router only when BOTH are true: the graph declares a
 * commercial relationship, and the router registry actually serves that slug. A declared
 * relationship with no route is a configuration error, not a reason to invent a URL — it
 * degrades to the plain merchant link with the honest disclosure.
 */
export function resolveOutboundLink(
  graph: DecisionGraph,
  subjectId: string,
  merchantUrl: string,
): OutboundLink {
  const index = indexGraph(graph);
  const relationship = index.get(`aff-${subjectId}`);

  const plain: OutboundLink = {
    href: merchantUrl,
    routed: false,
    disclosure: "no commercial relationship",
    rel: "noopener noreferrer",
  };

  if (!relationship || relationship.kind !== "AffiliateRelationship") return plain;
  if (!relationship.hasRelationship || !relationship.routerSlug) return plain;
  if (!knownSlugs.has(relationship.routerSlug.toLowerCase())) return plain;

  return {
    href: `${ROUTER_ORIGIN}/${relationship.routerSlug}`,
    routed: true,
    disclosure: relationship.disclosure,
    rel: "sponsored noopener noreferrer",
  };
}

export const partnerRouteProvenance = {
  sourceRepo: routes.sourceRepo,
  sourceFile: routes.sourceFile,
  sourceUpdatedAt: routes.sourceUpdatedAt,
  snapshotAt: routes.snapshotAt,
  disclosure: routes.disclosure,
};
