"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { configuratorArchetypes, type ConfiguredSystem, type ConfiguratorOutput } from "@/lib/decision-graph/configurator";
import { decisionGraph } from "@/lib/decision-graph/dataset";
import { indexGraph } from "@/lib/decision-graph/graph";
import { productVisualFor } from "@/lib/decision-graph/product-visuals";
import { resolveOutboundLink } from "@/lib/decision-graph/partner-links";
import type { CreatorPlan } from "@/lib/decision-graph/creator-plan";
import styles from "./studio-system-explorer.module.css";

const graph = indexGraph(decisionGraph);

function systemTitle(system: ConfiguredSystem) {
  return ({
    "dev-framework-desktop-395": "Framework Desktop",
    "dev-gmktec-evox2-128-2tb": "GMKtec EVO-X2",
    "cmp-rtx-5090": "RTX 5090 build",
    "dev-mac-mini-m4": "Mac mini M4",
  } as Record<string, string>)[system.lines[0].nodeId] ?? system.label;
}

function officialUrl(nodeId: string) {
  const visual = productVisualFor(nodeId);
  if (visual) return visual.officialUrl;
  const node = graph.get(nodeId);
  const sourceId = node && "specs" in node ? Object.values(node.specs)[0]?.source : undefined;
  const source = sourceId ? graph.get(sourceId) : undefined;
  return source?.kind === "EvidenceSource" ? source.url : "/methodology";
}

function ProductFigure({ system }: { system: ConfiguredSystem }) {
  const primary = system.lines[0];
  const visual = productVisualFor(primary.nodeId);
  const [failed, setFailed] = useState(false);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const archetype = configuratorArchetypes.find((item) => item.id === system.archetypeId);
  if (visual) {
    const image = visual.image;
    const video = visual.video;
    const watchUrl = video ? `https://www.youtube.com/watch?v=${video.id}` : undefined;
    return <figure className={styles.productMedia} data-product-media={primary.nodeId}>
      <p className={styles.kicker}>{image?.official ? "Official product photograph" : image ? "Product photograph" : `${video?.publisher ?? "Manufacturer"} · Product demonstration`}</p>
      {image && !failed && !videoLoaded && <>
        <a className={styles.photo} href={image.src} target="_blank" rel="noopener noreferrer" aria-label={`Enlarge photograph of ${primary.label}`}>
          <Image src={image.src} alt={image.alt} width={image.width} height={image.height} sizes="(max-width: 760px) 90vw, 580px" priority onError={() => setFailed(true)} />
        </a>
      </>}
      {video?.embed && <>
        {(!image || failed || videoLoaded) &&
        <div className={styles.mediaWindow}>
          {videoLoaded ? <iframe
            src={`https://www.youtube-nocookie.com/embed/${video.id}?cc_load_policy=1`}
            title={`${video.publisher}: ${video.title}`}
            referrerPolicy="strict-origin-when-cross-origin"
            allow="encrypted-media; picture-in-picture; fullscreen" allowFullScreen
          /> : <div className={styles.mediaIntro}>
            <span className={styles.playMark} aria-hidden="true">▶</span>
            <strong>{primary.label}</strong><span>{failed ? "Photograph unavailable. You can still load the official demonstration or open the product gallery." : video.title}</span>
          </div>}
        </div>}
        <button type="button" className={styles.mediaButton} aria-expanded={videoLoaded}
          onClick={() => setVideoLoaded(!videoLoaded)}>{videoLoaded ? "Close official video" : "Load official video"}</button>
        <p className={styles.mediaPrivacy}>Loads YouTube on request. Your plan is not sent. No autoplay. <a href={watchUrl} target="_blank" rel="noopener noreferrer">Playback blocked? Open on YouTube ↗</a></p>
        <details className={styles.mediaDetails}><summary>About this demonstration</summary><p>{video.scope}</p><p>Close the video to disconnect the player. If playback is unavailable, use Watch on YouTube.</p><a href={video.channelUrl} target="_blank" rel="noopener noreferrer">{video.publisher} channel ↗</a></details>
      </>}
      {!video?.embed && (!image || failed) && <p className={styles.mediaIntro}>{failed ? "Photo unavailable. " : ""}Open the manufacturer&apos;s gallery to inspect the enclosure, ports and exact model.</p>}
      <div className={styles.mediaLinks}>
        {watchUrl && <a href={watchUrl} target="_blank" rel="noopener noreferrer">Watch on YouTube ↗</a>}
        <a href={visual.gallery.url} target="_blank" rel="noopener noreferrer">{visual.gallery.label} ↗</a>
      </div>
      {video && !video.embed && <p className={styles.mediaPrivacy}>{video.scope}</p>}
      {image && !failed && !videoLoaded && <figcaption>Photo: {image.author} · <a href={image.licenseUrl} target="_blank" rel="noopener noreferrer">{image.license}</a> · <a href={image.sourceUrl} target="_blank" rel="noopener noreferrer">Source ↗</a><span>Enclosure and components shown. Your configuration may differ.</span></figcaption>}
    </figure>;
  }
  return <figure className={styles.diagram}>
    <svg viewBox="0 0 420 230" role="img" aria-label={`Capacity diagram for ${system.label}, not a product photograph`}>
      <rect x="42" y="28" width="336" height="168" rx="16" fill="var(--ink-2)" stroke="var(--line-bright)" strokeWidth="2" />
      <rect x="64" y="52" width="115" height="98" rx="8" fill="var(--panel)" stroke="var(--signal)" />
      <text x="121" y="88" textAnchor="middle" fill="var(--muted)" fontSize="13">Model allocation</text>
      <text x="121" y="122" textAnchor="middle" fill="var(--paper)" fontSize="28">{archetype?.usableVramGb ?? "?"} GB</text>
      <rect x="203" y="52" width="149" height="43" rx="6" fill="var(--panel)" stroke="var(--line-bright)" />
      <text x="277" y="79" textAnchor="middle" fill="var(--paper)" fontSize="15">{archetype?.systemRamGb ?? "?"} GB system RAM</text>
      <rect x="203" y="108" width="149" height="42" rx="6" fill="var(--panel)" stroke="var(--line-bright)" />
      <text x="277" y="135" textAnchor="middle" fill="var(--paper)" fontSize="15">{archetype?.fastStorageTb ?? "?"} TB base storage</text>
      <circle cx="70" cy="175" r="4" fill="var(--signal)" /><path d="M 89 175 H 352" stroke="var(--line-bright)" />
    </svg>
    <figcaption>{failed ? "Photo unavailable. " : ""}Original capacity diagram, not product imagery. Planning figures; exact configuration needs verification.</figcaption>
  </figure>;
}

function Capacity({ system, output }: { system: ConfiguredSystem; output: ConfiguratorOutput }) {
  const archetype = configuratorArchetypes.find((item) => item.id === system.archetypeId);
  if (!archetype) return null;
  const capacity = archetype.usableVramGb;
  const demand = output.requirement.vramGb;
  return <div className={styles.capacity}>
    <div><span>Model memory</span><strong>{demand} GB needed / {capacity} GB allocated</strong></div>
    <meter min={0} max={Math.max(capacity, 1)} value={Math.min(demand, capacity)} aria-label="Required model memory against the planning allocation">{demand} of {capacity} GB</meter>
    <p>{archetype.usableVramBasis} Model context and concurrent tools still need a real runtime test.</p>
  </div>;
}

export function StudioSystemExplorer({ output, plan, comparisonId, onSelect }: {
  output: ConfiguratorOutput; plan: CreatorPlan; comparisonId: string; onSelect: (id: string) => void;
}) {
  const selected = output.systems.find((system) => system.archetypeId === plan.selectedArchetypeId);
  // Inspect alternatives in their displayed order. This does not change the engine's
  // recommendation or save a preference before the user chooses one.
  const featured = selected ?? output.systems[0];
  const workloads = plan.input.workloadIds.map((id) => graph.get(id)?.label ?? id);
  const specs = featured && configuratorArchetypes.find((item) => item.id === featured.archetypeId);
  const selectedPriceDates = [...new Set(featured?.lines.flatMap((line) => {
    const price = line.priceObservationId ? graph.get(line.priceObservationId) : undefined;
    return price?.kind === "PriceObservation" ? [price.observedAt] : [];
  }) ?? [])];
  return <section className={styles.explorer} id="studio-systems" aria-label="Current system alternatives">
    <div className={styles.heading}>
      <div><h3>{output.systems.length ? "Compare creator systems" : "No candidate fits these constraints."}</h3><p className={styles.workloadSummary}>Work: {workloads.join(" · ") || "Choose your requirements"}</p></div>
      <a href="#studio-requirements" className={styles.textLink}>Change the work <span aria-hidden="true">↗</span></a>
    </div>
    <div className={styles.candidates}>
      {output.systems.map((system) => {
        const active = featured?.archetypeId === system.archetypeId;
        const specs = configuratorArchetypes.find((item) => item.id === system.archetypeId);
        return <button type="button" key={system.tier} data-archetype-id={system.archetypeId} aria-pressed={active} aria-label={`Use ${system.label} (${system.tier.replaceAll("-", " ")})`} className={`${styles.candidate} ${active ? styles.selected : ""}`} onClick={() => onSelect(system.archetypeId)}>
          <span className={styles.tier}>{system.tier.replaceAll("-", " ")}</span>
          <strong>{systemTitle(system)}</strong>
          <span>{specs?.systemRamGb} GB RAM</span>
          <span className={styles.selection}>{active ? selected ? "✓ Saved choice" : "✓ In view" : "Compare →"}</span>
        </button>;
      })}
    </div>
    <p className={styles.status} role="status">{selected ? `Saved: ${systemTitle(selected)} · Planning only.` : featured ? `Inspecting ${systemTitle(featured)}. Select a system to save.` : "Change a requirement to explore alternatives."}</p>
    {featured && <>
      <div className={styles.system}>
        <ProductFigure key={featured.archetypeId} system={featured} />
        <div className={styles.assembly}>
          <p className={styles.kicker}>{featured.tier.replaceAll("-", " ")} · Planning candidate</p>
          <div className={styles.assemblyHeading}><h4>{systemTitle(featured)}</h4></div>
          <p className={styles.configuration}>{featured.label}</p>
          <p className={styles.selectedPrice}>Cited part costs
            <strong>{Object.entries(featured.cost.pricedTotalsMinor).map(([currency, minor]) => `${currency} ${(minor / 100).toLocaleString("en", { maximumFractionDigits: 2 })}`).join(" + ") || "Part prices unknown"}</strong>
            {selectedPriceDates.length ? `Parts observed ${selectedPriceDates.join(", ")}. ` : "No dated prices. "}
            {featured.cost.unpricedLines.length ? `${featured.cost.unpricedLines.length} unpriced lines. ` : ""}Delivered total unknown. Refresh price and delivery evidence before buying.
          </p>
          <dl className={styles.specGrid}>
            <div><dt>System memory</dt><dd>{specs?.systemRamGb}<small> GB</small></dd></div>
            <div><dt>Model allocation</dt><dd>{specs?.usableVramGb}<small> GB</small></dd></div>
            <div><dt>Base storage</dt><dd>{specs?.fastStorageTb}<small> TB</small></dd></div>
          </dl>
          <Capacity system={featured} output={output} />
          <details className={styles.tradeoff}><summary>First bottleneck</summary><p>{featured.bottleneck.explanation}</p></details>
          <a className={styles.textLink} href={`#${comparisonId}`} onClick={() => {
            const comparison = document.getElementById(comparisonId);
            if (comparison instanceof HTMLDetailsElement) comparison.open = true;
          }}>Inspect parts and purchase checks ↓</a>
          {productVisualFor(featured.lines[0].nodeId)?.notice && <p className={styles.notice}>{productVisualFor(featured.lines[0].nodeId)!.notice}</p>}
          <details className={styles.sourceDetails}><summary>Sources and assembly · {featured.lines.length} parts</summary><ul className={styles.parts}>{featured.lines.map((line) => {
            const link = resolveOutboundLink(decisionGraph, line.nodeId, officialUrl(line.nodeId));
            const visual = productVisualFor(line.nodeId);
            return <li key={line.nodeId}><div><span>{line.role}{line.quantity > 1 ? ` × ${line.quantity}` : ""}</span><a href={link.href} rel={link.rel} target="_blank">{line.label} <span aria-hidden="true">↗</span></a></div>
              <details><summary>Why this part and where the link goes</summary><p>{line.justification}</p><p>{link.disclosure}</p>{visual?.notice && <p>{visual.notice}</p>}{visual?.atlasSlug && <Link href={`/shop/${visual.atlasSlug}`}>Explore the product in the Technology Atlas →</Link>}</details>
            </li>;
          })}</ul></details>
        </div>
      </div>
      <details className={styles.workflow}>
        <summary>How this system works</summary>
        <ol className={styles.steps}>
          <li><span className={styles.number}>01</span><h4>Your work</h4><p>{workloads.join(" · ") || "Choose a workload"}</p><a href="#studio-requirements">Change requirements →</a></li>
          <li><span className={styles.number}>02</span><h4>Local capacity</h4><p>{featured.label}</p><p>Models and project files must fit the memory and storage above. Inference speed is unmeasured.</p></li>
          <li><span className={styles.number}>03</span><h4>{plan.factory ? "Maker and reviewer" : "Optional agent work"}</h4>{plan.factory ? <p>{plan.factory.maker.rate.label}: {plan.factory.maker.apiShareBps / 100}% API share.<br />{plan.factory.reviewer.rate.label}: {plan.factory.reviewer.apiShareBps / 100}% API share.</p> : <p>Add an operating-cost scenario below to compare native subscription use, API work and compute.</p>}<p>Routing assumptions only. No workers are started.</p></li>
          <li><span className={styles.number}>04</span><h4>Your portable plan</h4><p>Save on this device. Export the complete report, or share hardware only without your private notes.</p><a href="#studio-export">Save and export →</a></li>
        </ol>
      </details>
    </>}
  </section>;
}
