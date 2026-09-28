import type { Metadata } from "next";
import { TechnologyAtlas } from "@/components/technology-atlas";

export const metadata: Metadata = { title: "Technology Atlas | Starlight Technology", description: "Source-backed decision records for AI workstations, spatial computing and robotics, with complete-system constraints and transparent commerce." };

export default function ShopPage() { return <main className="atlas-page shell">
  <div className="atlas-heading"><div><p className="eyebrow">Starlight / Technology Atlas</p><h1>Choose the system.<br /><em>Then the device.</em></h1></div><p>Explore technology by the work it must perform. Each record exposes the purchase boundary, integration needs and the source behind the claim. Offers appear only after merchant and price verification.</p></div>
  <TechnologyAtlas />
</main>; }
