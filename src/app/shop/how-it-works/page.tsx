import type { Metadata } from "next";
import Link from "next/link";
import { digitalProducts } from "@/lib/catalog";
import { Breadcrumbs } from "@/components/shop/breadcrumbs";
import { WorkflowPipeline } from "@/components/shop/media-module";
import { ReadinessBoard } from "@/components/shop/readiness-board";
import { ShopEvent } from "@/components/shop/shop-event";
import styles from "@/components/shop/storefront.module.css";

export const metadata: Metadata = { title: "How it works — Shop", description: "From the free lab to a licensed edition: what you get, how it is delivered, and what has to be true before paid checkout opens.", alternates: { canonical: "/shop/how-it-works" }, openGraph: { title: "How the Starlight shop works", description: "Free lab, licensed editions, private delivery, and a public readiness board.", url: "/shop/how-it-works" } };

const journey = [
  { id: "lab", label: "Try", detail: "Run the free lab on your own notes. Export a real brief. No account." },
  { id: "inspect", label: "Inspect", detail: "Read the edition page: manifest, licence, limitations, support, refund terms." },
  { id: "list", label: "Request", detail: "Join the availability list. No payment, no reservation, one email when checkout opens." },
  { id: "pay", label: "Pay", detail: "When every gate passes: merchant-of-record checkout with VAT and consumer consent recorded." },
  { id: "deliver", label: "Receive", detail: "Signed, expiring download of the entitled version plus a licence key, by email and in the portal." }
];

const fulfilment = [
  ["Catalogue / SKU", "Typed records in the repository. One SKU per edition; versions are immutable once released."],
  ["Checkout session", "Created by the merchant of record from the SKU and verified price. The site never holds card data."],
  ["Payment webhook", "Signature verified with a timing-safe compare and a timestamp tolerance; unsigned or stale events are rejected."],
  ["Idempotent entitlement", "One entitlement per provider event id. Replays return the existing record and write an audit row."],
  ["Private versioned delivery", "Signed, expiring link to the exact version purchased; re-issuable from the entitlement."],
  ["Delivery email", "Transactional provider with delivery status logged; failures queue a replay and alert support."],
  ["Recovery paths", "Failure, duplicate, delayed, declined, replay, refund, revocation and support cases each have a documented path and a test."],
  ["Reconciliation and audit", "Provider report reconciled to entitlements, deliveries and refunds; every state change has an actor and a reason."],
  ["Licence portal", "Customers re-download the entitled version and see licence state without emailing support."]
];

export default function HowItWorksPage() {
  const product = digitalProducts[0];
  return <article className={`${styles.storefront} shell`}>
    <ShopEvent name="shop_view" props={{ route: "/shop/how-it-works" }} />
    <Breadcrumbs items={[{ name: "How it works", path: "/shop/how-it-works" }]} />
    <header className={styles.productHero} style={{ alignItems: "end" }}>
      <div>
        <p className="eyebrow">How it works</p>
        <h1>Try it free. Inspect everything. Pay only when the path is proven.</h1>
        <p className={styles.lede}>The shop sells native digital products first and recommends third-party tools second. Nothing is sold until the fulfilment path below has passed every gate, and the board that says so is public.</p>
      </div>
      <div className={styles.notice}><span>Current state: paid checkout is closed for every edition. The <Link href="/shop/availability">availability list</Link> is the only commercial action. The <Link href="/shop/free/source-to-brief-lab">free lab</Link> is live, on its own page and inside the storefront. Requests are stored in a private store only when one is configured; the form says so when it is not.</span></div>
    </header>

    <section className={styles.section} aria-labelledby="journey">
      <div className={styles.sectionHead}><div><p className="eyebrow">Customer journey</p><h2 id="journey">Five steps, two of them live today.</h2></div><p>Try and inspect work now. Request is live and takes no payment. Pay and receive open together when the readiness board is fully satisfied.</p></div>
      <WorkflowPipeline stages={journey} gateIds={["pay"]} />
    </section>

    <section className={styles.section} aria-labelledby="delivery">
      <div className={styles.sectionHead}><div><p className="eyebrow">Delivery method</p><h2 id="delivery">What you receive and how.</h2></div><p>For {product.name} {product.edition}: {product.delivery}</p></div>
      <div className={styles.twoCol}>
        <dl className={styles.kv}>
          <div><dt>Format</dt><dd>{product.format}</dd></div>
          <div><dt>Runtime</dt><dd>{product.runtime}</dd></div>
          <div><dt>Licence</dt><dd>{product.licence.name} · {product.licence.seats}</dd></div>
          <div><dt>Updates</dt><dd>{product.updateCadence}</dd></div>
          <div><dt>Support</dt><dd>{product.support.channel} · {product.support.responseTarget}</dd></div>
        </dl>
        <div className={styles.prose}>
          <h3>Install and run</h3>
          <ol>
            <li>Unzip the download; run <code className={styles.mono}>node bin/doctor.mjs</code> to confirm Node, paths and permissions.</li>
            <li>Point the workflow at a folder of approved notes. It never searches for sources itself.</li>
            <li>Resolve the review gate. Lines the classifier held wait for you in <code className={styles.mono}>out/review.md</code>.</li>
            <li>Export. <code className={styles.mono}>brief.md</code> for people, <code className={styles.mono}>brief.json</code> for agents, same citations.</li>
          </ol>
          <p>The free lab runs steps 2 to 4 on pasted text so the transformation is testable before purchase.</p>
        </div>
      </div>
    </section>

    <section className={styles.section} aria-labelledby="fulfilment">
      <div className={styles.sectionHead}><div><p className="eyebrow">Fulfilment architecture</p><h2 id="fulfilment">Designed end to end. Activated only when proven.</h2></div><p>The paid path is built to fail closed: if any required component is missing, checkout stays disabled and the page says what is still open. Full design in the repository under <code className={styles.mono}>docs/shop/FULFILMENT_ARCHITECTURE.md</code>.</p></div>
      <dl className={styles.kv}>{fulfilment.map(([term, detail]) => <div key={term}><dt>{term}</dt><dd>{detail}</dd></div>)}</dl>
    </section>

    <section className={styles.section} aria-labelledby="readiness-heading">
      <div className={styles.sectionHead}><div><p className="eyebrow">Readiness board</p><h2 id="readiness-heading">What has to be true before checkout opens.</h2></div><p>Each gate needs dated evidence to count. The board is rendered from the same record the checkout resolver reads, so the page cannot say one thing while the code does another.</p></div>
      <ReadinessBoard />
    </section>

    <section className={styles.section} aria-labelledby="measure">
      <div className={styles.sectionHead}><div><p className="eyebrow">What we measure</p><h2 id="measure">Seven events, none of them inflated.</h2></div><p>Shop views, product views, lab starts, lab exports, availability requests started and completed, and affiliate link clicks. Collection is off until the measurement contract is switched on, and even then a lab export is never counted as activation, demand, conversion or revenue.</p></div>
      <p className={styles.prose}><Link href="/privacy">Privacy posture</Link> · <Link href="/disclosure">Commercial disclosure</Link> · <Link href="/shop/licensing-and-support">Licensing and support</Link></p>
    </section>
  </article>;
}
