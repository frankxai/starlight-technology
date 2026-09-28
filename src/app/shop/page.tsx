import type { Metadata } from "next";
import Link from "next/link";
import { TechnologyAtlas } from "@/components/technology-atlas";

export const metadata: Metadata = { title: "Technology Atlas", description: "Source-backed decision records for AI workstations, spatial computing and robotics, with complete-system constraints and transparent commerce.", alternates: { canonical: "/shop" }, openGraph: { url: "/shop" } };

export default function ShopPage() { return <div className="atlas-page shell">
  <div className="atlas-heading"><div><p className="eyebrow">Starlight / Technology Atlas</p><h1>Choose the system.<br /><em>Then the device.</em></h1></div><div className="atlas-heading-aside"><p>Explore technology by the work it must perform. Each record exposes the purchase boundary, integration needs and the source behind the claim.</p><Link className="atlas-studio-link" href="/shop/studio"><span>WORKLOAD → CONSTRAINT → CANDIDATE</span><strong>Open System Studio <span aria-hidden="true">↗</span></strong></Link><Link className="atlas-estate-link" href="/shop/estate">Map the equipment you own ↗</Link></div></div>
  <TechnologyAtlas />
</div>; }
