import type { Metadata } from "next";
import Link from "next/link";
import { AssetLedger } from "@/components/asset-ledger";

export const metadata: Metadata = { title: "Technology Estate", description: "A private local ledger for your machines, displays, phones, spatial devices and research robots, with portable JSON export.", alternates: { canonical: "/shop/estate" }, openGraph: { url: "/shop/estate" } };

export default function EstatePage() { return <div className="studio-page shell"><Link className="atlas-back" href="/shop">← Technology Atlas</Link><header><p className="eyebrow">Starlight / Technology Estate</p><h1>Know what you own.<br /><em>See what it can do.</em></h1><p>Record the capabilities and roles of your equipment. This first version stays on your device and travels as an exportable file.</p></header><AssetLedger /></div>; }
