import type { Metadata } from "next";
import Link from "next/link";
import { StudioConfigurator } from "@/components/studio-configurator";
import { partnerRouteProvenance } from "@/lib/decision-graph/partner-links";
import { stalenessReport } from "@/lib/decision-graph/staleness";
import { decisionGraph } from "@/lib/decision-graph/dataset";
import { nodesOfKind } from "@/lib/decision-graph/graph";

export const metadata: Metadata = {
  title: "AI creator studio configurator",
  description:
    "Three complete systems for the work you actually do, with bottlenecks, total cost, upgrade path and the conditions under which you should not buy at all.",
};

export default function StudioPage() {
  const today = new Date().toISOString().slice(0, 10);
  const report = stalenessReport(today);
  const priceCount = nodesOfKind(decisionGraph, "PriceObservation").length;
  const verified = priceCount - report.unverifiedPrices.length;

  return (
    <div className="shell page-header">
      <p className="eyebrow">Decision object</p>
      <h1>Three systems, one honest answer.</h1>
      <p className="lede">
        Tell it the work and the things you will not compromise on. It returns the least you can buy and still do the job,
        what we would buy, and what the ceiling costs — with the part that breaks first named in each.
      </p>

      <dl className="dg-ledger">
        <div>
          <dt>{verified} of {priceCount}</dt>
          <dd>price observations verified. The rest are printed as unverified rather than guessed.</dd>
        </div>
        <div>
          <dt>{report.overdueReviews.length}</dt>
          <dd>overdue reviews. A recommendation whose evidence has expired is marked invalid, not quietly re-served.</dd>
        </div>
        <div>
          <dt>3 of 16</dt>
          <dd>
            products carry a commercial relationship, all of them software, all routed through{" "}
            <Link href="/disclosure">the governed router</Link>.
          </dd>
        </div>
      </dl>

      <StudioConfigurator />

      <section className="dg-footnote">
        <h2>What this cannot tell you yet</h2>
        <ul>
          <li>
            Street prices. We publish the figure the vendor published and label it as MSRP. Nothing on this page is a
            price a shop is obliged to honour.
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
          snapshot {partnerRouteProvenance.snapshotAt}. {partnerRouteProvenance.disclosure}
        </p>
      </section>
    </div>
  );
}
