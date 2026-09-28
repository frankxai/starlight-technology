"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { coverage, technology, type TechnologyCategory } from "@/lib/technology";
import { searchTechnology } from "@/lib/technology-search";

type Filter = "All" | TechnologyCategory;
const filters: Filter[] = ["All", "Compute", "Mobile", "Display", "Spatial", "Robotics"];

export function TechnologyAtlas() {
  const [filter, setFilter] = useState<Filter>("All");
  const [query, setQuery] = useState("");
  const results = useMemo(() => {
    const ranked = query.trim() ? searchTechnology(query).map(({ item }) => item) : technology;
    return ranked.filter((item) => filter === "All" || item.category === filter);
  }, [filter, query]);

  return <>
    <div className="atlas-controls">
      <label className="atlas-search"><span>FIND A SYSTEM OR DEVICE</span><input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search local AI, spatial, robot…" /></label>
      <div className="atlas-tabs" role="group" aria-label="Filter technology category">{filters.map((value) => <button key={value} type="button" aria-pressed={filter === value} onClick={() => setFilter(value)}>{value}<span>{value === "All" ? technology.length : technology.filter((item) => item.category === value).length}</span></button>)}</div>
    </div>
    <div className="atlas-results-heading"><h2>Decision records</h2><span aria-live="polite">{results.length} of {technology.length} records · local vector search · no live prices</span></div>
    {results.length ? <div className="atlas-grid">{results.map((item, index) => <article className="atlas-card" key={item.slug}>
      <div className="atlas-card-top"><span>{String(index + 1).padStart(2, "0")} / {item.category.toUpperCase()}</span><span>{item.state.replace("-", " ")}</span></div>
      <div className="atlas-card-main"><p className="atlas-maker">{item.maker}</p><h3><Link href={`/shop/${item.slug}`}>{item.name}</Link></h3><p className="atlas-role">{item.role}</p></div>
      <div className="atlas-system-graphic" aria-label={`System boundary: ${item.interfaces[0]}; ${item.systemCosts[0]}`}><div><small>INTERFACE</small><strong>{item.interfaces[0]}</strong></div><span aria-hidden="true">↔</span><div><small>COMPLETE COST</small><strong>{item.systemCosts[0]}</strong></div></div>
      <p className="atlas-decision">{item.decision}</p>
      <div className="atlas-card-bottom"><span>Source checked {item.source.checked}</span><Link href={`/shop/${item.slug}`}>Inspect decision <span aria-hidden="true">↗</span></Link></div>
    </article>)}</div> : <div className="atlas-empty"><h3>No decision record matches.</h3><p>Try another workload or category. The coverage map below shows areas still in research.</p><button type="button" onClick={() => { setFilter("All"); setQuery(""); }}>Clear filters</button></div>}
    <section className="atlas-coverage" aria-labelledby="coverage-heading"><div className="atlas-results-heading"><h2 id="coverage-heading">Coverage map</h2><p>Expansion follows evidence, compatible systems and merchant rights.</p></div><div className="atlas-coverage-grid">{coverage.map((area, index) => <div key={area.name}><span className="atlas-index">{String(index + 1).padStart(2, "0")}</span><div><h3>{area.name}</h3><p>{area.detail}</p></div><span className={area.status === "Open" ? "atlas-open" : "atlas-queued"}>{area.status}</span></div>)}</div></section>
  </>;
}
