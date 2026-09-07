/**
 * Staleness. The point of this file is that a changed price or spec cannot silently keep an
 * old recommendation alive: a recommendation carries the hashes it was computed from, and any
 * drift invalidates it rather than quietly re-rendering yesterday's answer.
 */

import { dependencyHash, indexGraph, nodesOfKind } from "./graph";
import { decisionGraph } from "./dataset";
import type { ConfiguredSystem } from "./configurator";
import type { DecisionGraph } from "./schema";

export const DEFAULT_MAX_PRICE_AGE_DAYS = 30;

export type FreshnessVerdict = {
  valid: boolean;
  reasons: string[];
  /** Ids whose recorded hash no longer matches the live graph. */
  drifted: string[];
  stalePriceIds: string[];
  overdueReviewIds: string[];
};

function daysBetween(fromIso: string, toIso: string): number {
  const from = Date.parse(`${fromIso}T00:00:00Z`);
  const to = Date.parse(`${toIso}T00:00:00Z`);
  if (Number.isNaN(from) || Number.isNaN(to)) return Number.POSITIVE_INFINITY;
  return Math.floor((to - from) / 86_400_000);
}

export function assessFreshness(
  system: Pick<ConfiguredSystem, "lines" | "dependencyHashes">,
  options: { now: string; graph?: DecisionGraph; maxPriceAgeDays?: number },
): FreshnessVerdict {
  const graph = options.graph ?? decisionGraph;
  const maxAge = options.maxPriceAgeDays ?? DEFAULT_MAX_PRICE_AGE_DAYS;
  const index = indexGraph(graph);

  const drifted: string[] = [];
  const stalePriceIds: string[] = [];
  const overdueReviewIds: string[] = [];
  const reasons: string[] = [];

  for (const [nodeId, recordedHash] of Object.entries(system.dependencyHashes)) {
    const node = index.get(nodeId);
    if (!node) {
      drifted.push(nodeId);
      reasons.push(`${nodeId} has been removed from the graph since this recommendation was generated.`);
      continue;
    }
    if (dependencyHash(graph, nodeId) !== recordedHash) {
      drifted.push(nodeId);
      reasons.push(`${node.label} has a different specification or price than when this recommendation was generated.`);
    }
  }

  for (const line of system.lines) {
    const node = index.get(line.nodeId);
    if (!node || !("priceObservationIds" in node)) continue;
    for (const priceId of node.priceObservationIds) {
      const observation = index.get(priceId);
      if (!observation || observation.kind !== "PriceObservation") continue;
      if (observation.basis === "unverified") continue;
      const age = daysBetween(observation.observedAt, options.now);
      if (age > maxAge) {
        stalePriceIds.push(priceId);
        reasons.push(`Price for ${node.label} was observed ${age} days ago; the ceiling is ${maxAge}.`);
      }
    }
    if (node.reviewDateId) {
      const review = index.get(node.reviewDateId);
      if (review && review.kind === "ReviewDate" && daysBetween(review.reviewBy, options.now) > 0) {
        overdueReviewIds.push(review.id);
        reasons.push(`${node.label} passed its review date of ${review.reviewBy}.`);
      }
    }
  }

  return {
    valid: reasons.length === 0,
    reasons,
    drifted,
    stalePriceIds,
    overdueReviewIds: [...new Set(overdueReviewIds)],
  };
}

export type StalenessReport = {
  checkedAt: string;
  stalePrices: { id: string; subjectId: string; observedAt: string; ageDays: number }[];
  unverifiedPrices: { id: string; subjectId: string }[];
  overdueReviews: { id: string; appliesTo: string; reviewBy: string }[];
  ok: boolean;
};

/**
 * The job a scheduled task runs. It reports; it never rewrites the dataset, because a price
 * this repository did not observe is not a price it may write down.
 */
export function stalenessReport(
  now: string,
  graph: DecisionGraph = decisionGraph,
  maxPriceAgeDays: number = DEFAULT_MAX_PRICE_AGE_DAYS,
): StalenessReport {
  const prices = nodesOfKind(graph, "PriceObservation");
  const stalePrices = prices
    .filter((price) => price.basis !== "unverified" && daysBetween(price.observedAt, now) > maxPriceAgeDays)
    .map((price) => ({
      id: price.id,
      subjectId: price.subjectId,
      observedAt: price.observedAt,
      ageDays: daysBetween(price.observedAt, now),
    }));

  const unverifiedPrices = prices
    .filter((price) => price.basis === "unverified")
    .map((price) => ({ id: price.id, subjectId: price.subjectId }));

  const overdueReviews = nodesOfKind(graph, "ReviewDate")
    .filter((review) => daysBetween(review.reviewBy, now) > 0)
    .map((review) => ({ id: review.id, appliesTo: review.appliesTo, reviewBy: review.reviewBy }));

  return {
    checkedAt: now,
    stalePrices,
    unverifiedPrices,
    overdueReviews,
    ok: stalePrices.length === 0 && overdueReviews.length === 0,
  };
}
