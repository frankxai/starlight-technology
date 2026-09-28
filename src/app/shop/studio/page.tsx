import type { Metadata } from "next";
import Link from "next/link";
import { SystemStudio } from "@/components/system-studio";

export const metadata: Metadata = { title: "System Studio", description: "Build a local, exportable technology brief and inspect conservative, source-backed system starting points." };

export default function SystemStudioPage() { return <div className="studio-page shell"><Link className="atlas-back" href="/shop">← Technology Atlas</Link><header><p className="eyebrow">Starlight / System Studio</p><h1>Map the work.<br /><em>Expose the constraint.</em></h1><p>Turn a workload, environment and hard constraint into an inspectable research brief. Save it on your device or move it as a JSON file.</p></header><SystemStudio /></div>; }
