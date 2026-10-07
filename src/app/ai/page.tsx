import type { Metadata } from "next";
import Link from "next/link";
import { AiSetupPlanner } from "@/components/ai-setup-planner";
import { aiKit, aiSoftware } from "@/lib/ai-shop";
import styles from "@/components/ai-shop.module.css";

export const metadata: Metadata = {
  title: "AI Shop — system briefs, workflow tools and local AI setups",
  description: "Download the free Starlight AI System Brief Kit. Plan a useful AI workflow, inspect software constraints and connect the right hardware to a real job.",
  alternates: { canonical: "/ai" },
  openGraph: { title: "Put intelligence to work.", description: "A useful first job. A clear system brief. Tools chosen around the work.", url: "/ai" }
};

export default function AiShopPage() {
  const structuredData = {
    "@context": "https://schema.org", "@type": "CollectionPage", "@id": "https://starlight.technology/ai#page",
    name: "Starlight AI Shop", url: "https://starlight.technology/ai",
    description: "Free AI system planning materials and source-backed software references.",
    mainEntity: { "@type": "CreativeWork", "@id": "https://starlight.technology/ai#kit", name: aiKit.name, version: aiKit.version,
      datePublished: aiKit.releasedOn, isAccessibleForFree: true, license: "https://creativecommons.org/licenses/by/4.0/",
      creator: { "@type": "Organization", name: "Starlight Technology", url: "https://starlight.technology" },
      hasPart: aiKit.files.map(file => ({ "@type": "DigitalDocument", name: file.name, url: `https://starlight.technology${file.href}`, encodingFormat: file.format === "CSV" ? "text/csv" : "text/markdown", isAccessibleForFree: true })) }
  };
  return <div className={`${styles.aiShop} shell`} data-testid="ai-shop-ready">
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }} />
    <section className={styles.hero}>
      <div><p className="eyebrow">Starlight Technology / The AI Shop</p><h1>Put intelligence<br />to <em>work.</em></h1><p className={styles.lede}>A useful first job. A clear system brief. Tools chosen around the work. Build an AI setup you can understand, test and own.</p><div className={styles.actions}><a className="button button-primary" href="#kit">Get the free brief kit ↓</a><a className="button button-quiet" href="#setup">Find my starting point</a></div><p className={styles.heroNote}>Available today: original planning kit and setup planner. Software links go to official sources. <Link href="/disclosure">Our commercial commitments →</Link></p></div>
      <aside className={styles.briefObject} aria-labelledby="brief-object-title"><div className={styles.objectHead}><span>BRIEF / 001</span><span>EDITABLE · V1.0</span></div><div className={styles.objectBody}><p className={styles.objectKicker}>THE FIRST SYSTEM ARTIFACT</p><h2 id="brief-object-title">From intention<br />to a working brief.</h2><dl><div><dt>01 / THE JOB</dt><dd>Source notes → reviewed brief</dd></div><div><dt>02 / THE BOUNDARY</dt><dd>Approved inputs. Scoped tools.</dd></div><div><dt>03 / THE PROOF</dt><dd>Sources checked. Output saved.</dd></div></dl><div className={styles.artifactStamp}><span>AI SYSTEM BRIEF KIT</span><strong>Free.<br />Yours to adapt.</strong><span>04 FILES / NO ACCOUNT</span></div></div><p className={styles.objectFoot}>Illustrative brief fields. Download includes a complete fictional example.</p></aside>
    </section>

    <div className={styles.indexStrip} aria-label="Explore the AI shop"><a href="#kit">01 / BRIEF KIT</a><a href="#setup">02 / SETUP PLANNER</a><a href="#software">03 / SOFTWARE</a><a href="#local-ai">04 / LOCAL AI</a></div>

    <section id="kit" className={styles.kitSection} aria-labelledby="kit-title"><div className={styles.sectionHead}><div><p className="eyebrow">01 / An original Starlight release</p><h2 id="kit-title">The AI System<br />Brief Kit.</h2></div><p>{aiKit.status}<br />Version {aiKit.version} / 7 October 2026</p></div><div className={styles.kitIntro}><p>Make the first workflow concrete: what goes in, what comes out, who reviews it and how to know it worked. Four editable files take you from an idea to a bounded implementation brief.</p><p>Use it with the assistant or runtime you already have. The kit is planning material; software, model access and an installed automation are separate.</p></div><div className={styles.fileGrid}>{aiKit.files.map((file, index) => <article className={styles.file} key={file.href}><div className={styles.fileMeta}><span>0{index + 1}</span><span>{file.format}</span></div><h3>{file.name}</h3><p>{file.description}</p><a href={file.href} download>Download file ↓<span className="sr-only">: {file.name}, {file.format}</span></a></article>)}</div><p className={styles.smallPrint}>Original Starlight template text: <a href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a>. Use, adapt and share with attribution. Third-party software and models retain their own terms.</p></section>

    <AiSetupPlanner />

    <section id="software" className={styles.softwareSection} aria-labelledby="software-title"><div className={styles.sectionHead}><div><p className="eyebrow">03 / Software by its job</p><h2 id="software-title">Choose the role.<br />Then choose the tool.</h2></div><p>Source-backed documentation<br />Buying fit: editorial inference</p></div><p className={styles.sectionIntro}>These are starting points for a trial. No vendor relationship, independent benchmark or compatibility certification is implied. There are no commission links in this software collection.</p><div className={styles.softwareGrid}>{aiSoftware.map(tool => <article className={styles.software} key={tool.id}><p className={styles.marker}>{tool.marker}</p><p className={styles.role}>{tool.role}</p><h3>{tool.name}</h3><p>{tool.summary}</p><dl><div><dt>WHEN IT FITS</dt><dd>{tool.fit}</dd></div><div><dt>BEFORE YOU COMMIT</dt><dd>{tool.constraint}</dd></div><div><dt>COMPLETE COST</dt><dd>{tool.cost}</dd></div></dl><a href={tool.sourceUrl}>{tool.sourceLabel} ↗</a><p className={styles.sourceNote}>Official source checked 7 October 2026. Confirm current terms at the provider.</p></article>)}</div></section>

    <section id="local-ai" className={styles.localSection} aria-labelledby="local-title"><div><p className="eyebrow">04 / Local AI, complete</p><h2 id="local-title">Give the model<br />a proper home.</h2><p>The runtime, model, memory and recovery path belong in the same decision. Begin with the machine you have; let a measured workload justify the next one.</p><div className={styles.actions}><Link className="button button-primary" href="/shop">Inspect AI hardware →</Link><Link className="button button-quiet" href="/compare">Compare the constraints</Link></div></div><ol className={styles.localChecks}><li><span>01 / RUNTIME</span><p>Confirm exact model format, host OS, accelerator support and context size.</p></li><li><span>02 / MEASURE</span><p>Run your own representative task. Record quality, latency, memory and energy where measured.</p></li><li><span>03 / RECOVER</span><p>Export the project, configuration and records. Restore a known-good version before relying on it.</p></li></ol></section>

    <section className={styles.releaseSection} aria-labelledby="release-title"><div><p className="eyebrow">The next editions</p><h2 id="release-title">Earn the right<br />to become a product.</h2></div><div><p>Workflow Edition, Local AI Lab and maintained agent kits are proposed releases. They become purchasable after installation, delivery, support and recovery have been demonstrated for a declared environment.</p><p>The free kit and planner are available now. This page takes no payments and promises no future release date. <Link href="/partners">See how we build partnerships →</Link></p></div></section>
  </div>;
}
