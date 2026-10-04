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
import { getTechnology } from "@/lib/technology";
import { TechnologyArt } from "./technology-art";
import styles from "./studio-system-explorer.module.css";

const graph = indexGraph(decisionGraph);

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
  const atlas = visual?.atlasSlug ? getTechnology(visual.atlasSlug) : undefined;
  const archetype = configuratorArchetypes.find((item) => item.id === system.archetypeId);
  if (visual?.image && !failed) {
    const image = visual.image;
    return <figure className={styles.photo}>
      <a href={image.src} target="_blank" rel="noopener noreferrer" aria-label={`Enlarge photograph of ${primary.label}`}>
        <Image src={image.src} alt={image.alt} width={image.width} height={image.height} sizes="(max-width: 760px) 90vw, 380px" onError={() => setFailed(true)} />
      </a>
      <figcaption>Photograph: {image.author} · <a href={image.licenseUrl} target="_blank" rel="noopener noreferrer">{image.license}</a> · <a href={image.sourceUrl} target="_blank" rel="noopener noreferrer">Source</a>. {image.changes} Configuration is not visible.</figcaption>
    </figure>;
  }
  if (atlas) return <div className={styles.art}><TechnologyArt item={atlas} /></div>;
  return <figure className={styles.diagram}>
    <svg viewBox="0 0 420 230" role="img" aria-label={`Capacity diagram for ${system.label}, not a product photograph`}>
      <rect x="42" y="28" width="336" height="168" rx="16" fill="var(--ink-2)" stroke="var(--line-bright)" strokeWidth="2" />
      <rect x="64" y="52" width="115" height="98" rx="8" fill="var(--panel)" stroke="var(--signal)" />
      <text x="121" y="88" textAnchor="middle" fill="var(--muted)" fontSize="13">Model allocation</text>
      <text x="121" y="122" textAnchor="middle" fill="var(--paper)" fontSize="28">{archetype?.usableVramGb ?? "?"} GB</text>
      <rect x="203" y="52" width="149" height="43" rx="6" fill="var(--panel)" stroke="var(--line-bright)" />
      <text x="277" y="79" textAnchor="middle" fill="var(--paper)" fontSize="15">{archetype?.systemRamGb ?? "?"} GB system RAM</text>
      <rect x="203" y="108" width="149" height="42" rx="6" fill="var(--panel)" stroke="var(--line-bright)" />
      <text x="277" y="135" textAnchor="middle" fill="var(--paper)" fontSize="15">{archetype?.fastStorageTb ?? "?"} TB fast storage</text>
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
  const featured = selected ?? output.systems.find((system) => system.tier === "recommended") ?? output.systems[0];
  const workloads = plan.input.workloadIds.map((id) => graph.get(id)?.label ?? id);
  return <section className={styles.explorer} aria-label="Current system alternatives">
    <div className={styles.heading}>
      <div><p className={styles.kicker}>Your system, assembled</p><h3>{output.systems.length ? "Compare the machines. See the whole workflow." : "No candidate fits these constraints."}</h3></div>
      <a href="#studio-requirements" className={styles.textLink}>Edit the work and constraints <span aria-hidden="true">↗</span></a>
    </div>
    <div className={styles.comparison}>
    {featured && <ProductFigure key={featured.archetypeId} system={featured} />}
    <div className={styles.candidates}>
      {output.systems.map((system) => {
        const active = plan.selectedArchetypeId === system.archetypeId;
        const specs = configuratorArchetypes.find((item) => item.id === system.archetypeId);
        const dates = [...new Set(system.lines.flatMap((line) => {
          const price = line.priceObservationId ? graph.get(line.priceObservationId) : undefined;
          return price?.kind === "PriceObservation" ? [price.observedAt] : [];
        }))];
        return <button type="button" key={system.tier} data-archetype-id={system.archetypeId} aria-pressed={active} aria-label={`Use ${system.label} (${system.tier.replaceAll("-", " ")})`} className={`${styles.candidate} ${active ? styles.selected : ""}`} onClick={() => onSelect(system.archetypeId)}>
          <span className={styles.tier}>{system.tier.replaceAll("-", " ")}</span>
          <strong>{system.label}</strong>
          <span>{specs?.systemRamGb} GB RAM · {specs?.fastStorageTb} TB storage</span>
          <span className={styles.price}>{Object.entries(system.cost.pricedTotalsMinor).map(([currency, minor]) => `${currency} ${(minor / 100).toLocaleString("en", { maximumFractionDigits: 2 })}`).join(" + ") || "Part prices unknown"}</span>
          <span>Parts observed {dates.join(", ") || "date unknown"} · delivered total unknown</span>
          <span className={styles.selection}>{active ? "✓ Selected in your plan" : "Choose this candidate →"}</span>
        </button>;
      })}
    </div>
    </div>
    <p className={styles.status} role="status">{selected ? `Selected: ${selected.label}.` : featured ? `Inspecting ${featured.label}. Choose a candidate to save a preference.` : "Change a requirement to explore alternatives."} Selection does not place an order.</p>
    {featured && <>
      <div className={styles.system}>
        <div className={styles.assembly}>
          <div className={styles.assemblyHeading}><h4>{featured.label}</h4><a className={styles.textLink} href={`#${comparisonId}`}>Full comparison ↓</a></div>
          <Capacity system={featured} output={output} />
          {productVisualFor(featured.lines[0].nodeId)?.notice && <p className={styles.notice}>{productVisualFor(featured.lines[0].nodeId)!.notice}</p>}
          <ul className={styles.parts}>{featured.lines.map((line) => {
            const link = resolveOutboundLink(decisionGraph, line.nodeId, officialUrl(line.nodeId));
            const visual = productVisualFor(line.nodeId);
            return <li key={line.nodeId}><div><span>{line.role}{line.quantity > 1 ? ` × ${line.quantity}` : ""}</span><a href={link.href} rel={link.rel} target="_blank">{line.label} <span aria-hidden="true">↗</span></a></div>
              <details><summary>Why this part and where the link goes</summary><p>{line.justification}</p><p>{link.disclosure}</p>{visual?.notice && <p>{visual.notice}</p>}{visual?.atlasSlug && <Link href={`/shop/${visual.atlasSlug}`}>Explore the product in the Technology Atlas →</Link>}</details>
            </li>;
          })}</ul>
          <p className={styles.hint}>Product links open official specifications and galleries unless a disclosed partner route applies. Diagrams are labeled; photo credits stay with the image.</p>
        </div>
      </div>
      <details className={styles.workflow} open>
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
