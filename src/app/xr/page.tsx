import type { Metadata } from "next";
import Link from "next/link";
import { xrDevices } from "@/lib/xr-catalog";
import { XRDecisionStudio, XRAtlasStrip } from "@/components/xr-decision-studio";
import styles from "./xr.module.css";

export const metadata: Metadata = {
  title: "XR devices and creator workflows",
  description: "Source-backed XR and AI glasses decisions for creators and founders: which device fits the workflow, what else you need, and where the evidence ends.",
  alternates: { canonical: "/xr" }
};

const workflows = [
  { goal: "Ship a spatial prototype", start: "Quest 3", why: "Available development path and actual device testing", condition: "Simulator first; validate comfort and input on real hardware before promising a launch." },
  { goal: "Work on a travel display", start: "XREAL One Pro", why: "Wearable screen for a connected host", condition: "Verify your exact laptop or phone, fit, cable, and power before ordering." },
  { goal: "Capture in the field", start: "Ray-Ban Meta (Gen 3)", why: "Point-of-view capture and voice without a headset", condition: "Plan permissions, storage, transcription and editing; it is not a spatial display." },
  { goal: "Explore future spatial work", start: "Meta VR Glasses watchlist", why: "Potentially lighter immersive workspace", condition: "Wait for launch-region details, independent tests and developer support." }
] as const;

export default function XRPage() {
  return <div className={`${styles.page} shell`}>
    <header className={styles.intro}>
      <div><p className="eyebrow">Starlight / field intelligence 01</p><h1>Choose the experience.<br /><span>Then the device.</span></h1><p>A field guide for building spatial worlds, working anywhere and capturing what matters. Tell us the job and see the device, evidence and constraint that follow.</p><div className={styles.actions}><a className="button button-quiet" href="#devices">Explore the device atlas ↓</a></div></div>
      <XRDecisionStudio />
    </header>

    <aside className={styles.launch}><span className="eyebrow">Launch radar · 23 September 2026</span><strong>100 g</strong><p>Meta’s claimed weight for its announced VR glasses. Spring 2027 sales target; US$1,299.99 quoted. Netherlands availability is unverified.</p><a href="https://about.fb.com/news/2026/09/introducing-meta-vr-glasses-3d-movies-immersive-live-sports-100-grams/" target="_blank" rel="noopener noreferrer">Read the original announcement ↗</a></aside>

    <section id="decisions" className={styles.section}><div className={styles.heading}><p className="eyebrow">01 / Decide by objective</p><h2>Four jobs. Four starting points.</h2></div><div className={styles.matrix}>{workflows.map((row, i) => <article key={row.goal} className={styles.row}><span className={styles.index}>0{i + 1}</span><div><h3>{row.goal}</h3><p>{row.why}</p></div><strong>{row.start}</strong><p>{row.condition}</p></article>)}</div><p className={styles.inference}>Workflow matches are Starlight decision-model inferences based on the cited manufacturer and developer materials, not product tests.</p></section>

    <section id="devices" className={styles.section}><div className={styles.heading}><p className="eyebrow">02 / Device register</p><h2>Evidence before checkout.</h2><p>Research snapshot: 24 September 2026. “Released” describes the product, not verified stock in the Netherlands.</p></div><XRAtlasStrip /><div className={styles.cards}>{xrDevices.map(device => <article id={`device-${device.id}`} key={device.id} className={styles.card}><div className={styles.cardTop}><span>{device.class}</span><span>{device.status}</span></div><h3>{device.name}</h3><p className={styles.claim}>{device.makerClaim}</p><dl><div><dt>Use it when</dt><dd>{device.fit}</dd></div><div><dt>Wrong purchase when</dt><dd>{device.avoid}</dd></div><div><dt>Complete system</dt><dd>{device.system}</dd></div></dl><div className={styles.cardLinks}><a href={device.officialUrl} target="_blank" rel="noopener noreferrer">Official product ↗</a><a href={device.source.url} target="_blank" rel="noopener noreferrer">Evidence ↗</a></div><small>Source-backed research · checked {device.source.checked} · {device.source.title}</small></article>)}</div></section>

    <section className={styles.next}><div><p className="eyebrow">03 / From hardware to capability</p><h2>The device is one layer.</h2></div><div><p>For a Starlight Explorer, begin with mobile sky identification and a cited astronomy knowledge layer. Add a spatial viewer only when the learning interaction needs depth. Keep the same content and provenance model across phone, web and XR; do not couple astronomy knowledge to a headset launch.</p><p>For creators: capture → transcribe → classify → draft → publish. For founders: prototype → test on device → measure repeat use → procure. Both paths need permissions, accessibility, hosting and an exit plan.</p><div className={styles.actions}><Link className="button button-primary" href="/methodology">Evidence standard</Link><a className="button button-quiet" href="https://www.frankx.ai/stack">Frank’s working stack ↗</a></div></div></section>

    <p className={styles.disclosure}>All product links here lead to manufacturers and are currently non-affiliate. No Amazon product images, prices, embedded widgets or tracking links are used. Future partner offers will be labelled next to the link and governed by the <Link href="/disclosure">commercial disclosure</Link>.</p>
  </div>;
}
