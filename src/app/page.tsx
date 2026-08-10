import Link from "next/link";
import { CollectionCard } from "@/components/editorial";
import { RigFinder } from "@/components/rig-finder";
import { builds, comparisons, guides } from "@/lib/content";

export default function HomePage() {
  return <>
    <section className="hero shell"><div className="hero-copy"><p className="eyebrow">Buying intelligence for AI-native studios</p><h1>Build the right system.<br /><em>Not the most expensive one.</em></h1><p className="hero-lede">Decisive comparisons, complete-system blueprints and transparent evidence for creators combining local AI, music, video and mobile work.</p><div className="hero-actions"><Link className="button button-primary" href="/builds">Explore complete builds</Link><Link className="button button-quiet" href="/methodology">Read the evidence standard</Link></div><dl className="hero-proof"><div><dt>09</dt><dd>launch analyses</dd></div><div><dt>04</dt><dd>evidence states</dd></div><div><dt>NL / EU</dt><dd>regional starting point</dd></div></dl></div><RigFinder /></section>
    <section className="signal-strip" aria-label="Editorial commitments"><span>WHO IT FITS</span><span>WHEN IT IS WRONG</span><span>COMPLETE COST</span><span>SOURCE DATES</span><span>DECISIVE VERDICT</span></section>
    <section className="section shell"><div className="section-heading"><div><p className="eyebrow">System, not shopping list</p><h2>Complete builds by objective</h2></div><Link href="/builds">All builds →</Link></div><div className="collection-grid">{builds.map((item) => <CollectionCard key={item.slug} item={item} type="builds" />)}</div></section>
    <section className="section section-contrast"><div className="shell"><div className="section-heading"><div><p className="eyebrow">Resolve the constraint</p><h2>Decisions with an exit condition</h2></div><Link href="/compare">All comparisons →</Link></div><div className="collection-grid">{comparisons.map((item) => <CollectionCard key={item.slug} item={item} type="compare" />)}</div></div></section>
    <section className="section shell"><div className="section-heading"><div><p className="eyebrow">Decision literacy</p><h2>Field guides before checkout</h2></div><Link href="/guides">All guides →</Link></div><div className="collection-grid">{guides.map((item) => <CollectionCard key={item.slug} item={item} type="guides" />)}</div></section>
    <section className="method-callout shell"><div><p className="eyebrow">No fake hands-on voice</p><h2>Every conclusion carries its evidence state.</h2></div><p>Owned and tested, hands-on, source-backed or inferred. Prices require a source and verification time. Commercial links never rewrite the verdict.</p><Link className="button button-primary" href="/methodology">Inspect the method →</Link></section>
  </>;
}
