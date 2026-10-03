import type { Metadata } from "next";
import Link from "next/link";
import { TechnologyAtlas } from "@/components/technology-atlas";
import { TechnologyArt } from "@/components/technology-art";
import { technology } from "@/lib/technology";

export const metadata: Metadata = { title: "Technology Atlas", description: "Source-backed decision records for AI workstations, spatial computing and robotics, with complete-system constraints and transparent commerce.", alternates: { canonical: "/shop" }, openGraph: { url: "/shop" } };

const desktop = technology.find((item) => item.slug === "framework-desktop-ryzen-ai-max")!;
const robot = technology.find((item) => item.slug === "unitree-go2")!;

export default function ShopPage() { return <div className="atlas-page shell">
  <div className="atlas-heading"><div><p className="eyebrow">Starlight / Technology Atlas</p><h1>Choose the system.<br /><em>Then the device.</em></h1></div><div className="atlas-heading-aside"><p>Explore technology by the work it must perform. Each record exposes the purchase boundary, integration needs and the source behind the claim.</p><Link className="atlas-studio-link" href="/shop/studio"><span>WORKLOAD → CONSTRAINT → CANDIDATE</span><strong>Open System Studio <span aria-hidden="true">↗</span></strong></Link><Link className="atlas-estate-link" href="/shop/estate">Map the equipment you own ↗</Link></div></div>
  <section className="atlas-featured" aria-label="Two system decisions">
    <article className="atlas-feature atlas-feature--compute">
      <div className="atlas-feature-head"><span>01 / LOCAL AI</span><span>Source checked {desktop.source.checked}</span></div>
      <TechnologyArt item={desktop} />
      <div className="atlas-feature-copy"><div><p className="eyebrow">The compact compute path</p><h2>Memory changes the shape of the machine.</h2><p>{desktop.decision}</p></div><Link href={`/shop/${desktop.slug}`}>Inspect the decision <span aria-hidden="true">↗</span></Link></div>
      <div className="atlas-feature-boundary"><span>FITS / {desktop.fit[0]}</span><span>HOLD / {desktop.avoid[1]}</span></div>
    </article>
    <article className="atlas-feature atlas-feature--robot">
      <div className="atlas-feature-head"><span>02 / ROBOTICS</span><span>Research platform</span></div>
      <TechnologyArt item={robot} />
      <div className="atlas-feature-copy"><div><p className="eyebrow">The operating boundary</p><h2>A robot is not a deployment.</h2><p>{robot.decision}</p></div><Link href={`/shop/${robot.slug}`}>Inspect the decision <span aria-hidden="true">↗</span></Link></div>
      <div className="atlas-feature-boundary"><span>SITE / controlled test area</span><span>AUTHORITY / human operator</span></div>
    </article>
  </section>
  <TechnologyAtlas />
</div>; }
