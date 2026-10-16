import type { Metadata } from "next";
import Link from "next/link";
import { digitalProducts, freeProducts } from "@/lib/catalog";
import { Breadcrumbs } from "@/components/shop/breadcrumbs";
import { Faq } from "@/components/shop/faq";
import { ShopEvent } from "@/components/shop/shop-event";
import styles from "@/components/shop/storefront.module.css";

export const metadata: Metadata = { title: "Licensing and support — Shop", description: "Licence terms, update policy, support scope, refund and consumer-rights boundaries for Starlight Technology digital products.", alternates: { canonical: "/shop/licensing-and-support" }, openGraph: { title: "Licensing and support", description: "What you may do with an edition, how long updates last, what support covers, and how refunds work.", url: "/shop/licensing-and-support" } };

const faq = [
  { question: "Can I use an edition for client work?", answer: "Yes. The single-operator licence covers deliverables you produce for clients. You may not resell or redistribute the edition itself." },
  { question: "What happens to updates after a year?", answer: "You keep every version you received. Updates within the major version continue for twelve months from purchase; a renewal for further updates is planned and will be priced separately before it exists." },
  { question: "Is there a team licence?", answer: "Not yet. One licence per operator until a team licence passes the same gates. Say so on the availability list if you need one." },
  { question: "Can I get a refund after downloading?", answer: "Defects and misdescription are refunded or repaired at any time. The EU withdrawal right lapses once you ask for delivery to begin and acknowledge that; checkout will record that consent explicitly. These terms are finalised before any payment is accepted." }
];

export default function LicensingPage() {
  const product = digitalProducts[0];
  const free = freeProducts[0];
  return <article className={`${styles.storefront} shell`}>
    <ShopEvent name="shop_view" props={{ route: "/shop/licensing-and-support" }} />
    <Breadcrumbs items={[{ name: "Licensing and support", path: "/shop/licensing-and-support" }]} />
    <header className={styles.productHero} style={{ alignItems: "end" }}>
      <div><p className="eyebrow">Licensing and support</p><h1>Clear rights. Bounded support. Honest limits.</h1><p className={styles.lede}>These are the terms each edition page summarises. They are drafts until the merchant-of-record setup is complete, and they will not get worse between now and checkout opening.</p></div>
      <div className={styles.notice}><span>Status: draft terms, published for review. No edition is for sale yet, so no term here has been applied to a purchase.</span></div>
    </header>

    <section className={styles.section} aria-labelledby="licences">
      <div className={styles.sectionHead}><div><p className="eyebrow">Licences</p><h2 id="licences">Two licences exist today.</h2></div><p>Every product page names its licence code. If a page and this table disagree, the product page is wrong and we will fix it.</p></div>
      <div className={styles.tableWrap}><table className={styles.table}><caption className="sr-only">Licence comparison</caption><thead><tr><th scope="col">Licence</th><th scope="col">Applies to</th><th scope="col">Seats</th><th scope="col">You may</th><th scope="col">You may not</th></tr></thead><tbody>
        <tr><th scope="row">{product.licence.name} ({product.licence.code})</th><td>Paid editions</td><td>{product.licence.seats}</td><td><ul style={{ margin: 0, paddingLeft: "1rem" }}>{product.licence.grants.map((g) => <li key={g}>{g}</li>)}</ul></td><td><ul style={{ margin: 0, paddingLeft: "1rem" }}>{product.licence.restrictions.map((r) => <li key={r}>{r}</li>)}</ul></td></tr>
        <tr><th scope="row">{free.licence.name} ({free.licence.code})</th><td>Free lab and its exports</td><td>{free.licence.seats}</td><td><ul style={{ margin: 0, paddingLeft: "1rem" }}>{free.licence.grants.map((g) => <li key={g}>{g}</li>)}</ul></td><td><ul style={{ margin: 0, paddingLeft: "1rem" }}>{free.licence.restrictions.map((r) => <li key={r}>{r}</li>)}</ul></td></tr>
      </tbody></table></div>
    </section>

    <section className={styles.section} aria-labelledby="updates">
      <div className={styles.twoCol}>
        <div><p className="eyebrow">Update policy</p><h2 id="updates" style={{ fontSize: "1.6rem", marginBottom: 18 }}>Versions you keep, updates you receive</h2><ul className={styles.checkList}><li>Semantic versions. Patch releases fix defects; minor releases add capability within the same contract; a major release is a new purchase or an upgrade price.</li><li>{product.updateCadence}</li><li>Every release carries a dated changelog on the product page and on <Link href="/shop/updates">/shop/updates</Link>.</li><li>Download links are re-issuable for any version you were entitled to.</li></ul></div>
        <div><p className="eyebrow">Support scope</p><h2 style={{ fontSize: "1.6rem", marginBottom: 18 }}>{product.support.channel}</h2><dl className={styles.kv}><div><dt>Response target</dt><dd>{product.support.responseTarget}</dd></div><div><dt>Covers</dt><dd>{product.support.covers.join(" · ")}</dd></div><div><dt>Excludes</dt><dd>{product.support.excludes.join(" · ")}</dd></div><div><dt>Free lab</dt><dd>Best-effort. Defect reports are welcome; there is no response target.</dd></div></dl></div>
      </div>
    </section>

    <section className={styles.section} aria-labelledby="refunds">
      <div className={styles.twoCol}>
        <div><p className="eyebrow">Refunds and consumer rights</p><h2 id="refunds" style={{ fontSize: "1.6rem", marginBottom: 18 }}>Planned terms</h2><ul className={styles.checkList}>{product.refund.map((item) => <li key={item}>{item}</li>)}</ul></div>
        <div><p className="eyebrow">Privacy and honest limits</p><h2 style={{ fontSize: "1.6rem", marginBottom: 18 }}>What we will not claim</h2><ul className={styles.checkList} data-tone="warn"><li>No testimonials, ratings, rankings or revenue figures appear in the shop. None exist that we could verify.</li><li>No vendor in the hardware or tooling sections is a partner. Labels state the actual relationship per link.</li><li>No model score or benchmark is attached to an edition. The deterministic path makes no model call.</li><li>Availability requests collect an email and your stated interest, nothing else. See <Link href="/privacy">privacy</Link>.</li></ul></div>
      </div>
    </section>

    <section className={styles.section} aria-labelledby="faq-heading">
      <div className={styles.sectionHead}><div><p className="eyebrow">Questions</p><h2 id="faq-heading">Licensing questions.</h2></div></div>
      <Faq items={faq} />
    </section>
  </article>;
}
