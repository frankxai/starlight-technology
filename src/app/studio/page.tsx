import type { Metadata } from "next";
import Link from "next/link";
import { StudioConfigurator } from "@/components/studio-configurator";
import { partnerRouteProvenance } from "@/lib/decision-graph/partner-links";
import { stalenessReport } from "@/lib/decision-graph/staleness";
import { decisionGraph } from "@/lib/decision-graph/dataset";
import { nodesOfKind } from "@/lib/decision-graph/graph";

export const metadata: Metadata = {
  title: "AI creator studio configurator",
  alternates: { canonical: "/studio" },
  openGraph: { url: "/studio" },
  description:
    "Compare sourced creator-system candidates, preserve an editable plan, and inspect assembly, cost evidence and constraints behind each option.",
};

export default function StudioPage() {
  const today = new Date().toISOString().slice(0, 10);
  const report = stalenessReport(today);
  const priceCount = nodesOfKind(decisionGraph, "PriceObservation").length;
  const verified = priceCount - report.unverifiedPrices.length;
  const relationships = nodesOfKind(decisionGraph, "AffiliateRelationship");
  const commercialCount = relationships.filter((item) => item.hasRelationship).length;

  return (
    <div className="shell page-header dg-page">
      <p className="eyebrow">AI creator studio</p>
      <h1>Plan your creator system.</h1>
      <p className="lede">
        Compare sourced system candidates for your work and constraints. Keep your choices, existing equipment and running-cost
        assumptions in an editable plan you can save on this device and export.
      </p>

      <details className="dg-evidence-summary"><summary>Catalog evidence and commercial disclosures</summary><dl className="dg-ledger">
        <div>
          <dt>{verified} of {priceCount}</dt>
          <dd>price figures cited from reference sources. These are not verified delivered merchant quotes.</dd>
        </div>
        <div>
          <dt>{report.overdueReviews.length}</dt>
          <dd>overdue reviews. A recommendation whose evidence has expired is marked invalid, not quietly re-served.</dd>
        </div>
        <div>
          <dt>{commercialCount} of {relationships.length}</dt>
          <dd>
            relationship records declare a commercial arrangement. Inspect their disclosures and dated registry snapshot; links use{" "}
            <Link href="/disclosure">the governed router</Link>.
          </dd>
        </div>
      </dl></details>

      <StudioConfigurator />

      <section className="dg-footnote">
        <h2>What this cannot tell you yet</h2>
        <ul>
          <li>
            Delivered prices. Dated manufacturer listings and cited MSRP are observations. A matching checkout quote
            still needs VAT, shipping, import costs and expiry before it can establish your delivered budget.
          </li>
          <li>
            Measured throughput. We have run no hands-on inference benchmarks, so the graph uses vendor memory bandwidth
            as the proxy and says so on every line that leans on it.
          </li>
          <li>
            Unified-memory allocation. The share of unified memory a model can address is our own convention, not a
            vendor guarantee.
          </li>
        </ul>
        <p className="dg-hint">
          Partner routes resolved against {partnerRouteProvenance.sourceRepo}/{partnerRouteProvenance.sourceFile},
          snapshot {partnerRouteProvenance.snapshotAt}. Links marked as commercial may earn a commission. This snapshot does not verify current program approval.
        </p>
      </section>
    </div>
  );
}
