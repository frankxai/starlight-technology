"use client";

import { useMemo, useState } from "react";
import { configure, type ConfiguratorInput, type ConfiguredSystem } from "@/lib/decision-graph/configurator";
import { toBuildSheetJson, toBuildSheetMarkdown } from "@/lib/decision-graph/build-sheet";
import { resolveOutboundLink } from "@/lib/decision-graph/partner-links";
import { decisionGraph } from "@/lib/decision-graph/dataset";
import { indexGraph } from "@/lib/decision-graph/graph";
import type { Region } from "@/lib/decision-graph/schema";

const workloadOptions = [
  { id: "wl-local-llm-large", label: "Run a 70B-class model locally" },
  { id: "wl-local-llm-mid", label: "Run a 32B-class model locally" },
  { id: "wl-video-4k", label: "Edit and deliver 4K video" },
  { id: "wl-music", label: "Record and mix music" },
  { id: "wl-travel-capture", label: "Capture and publish while travelling" },
];

const constraintOptions = [
  { id: "con-silent", label: "Must stay quiet in a recording room" },
  { id: "con-carry-daily", label: "Must travel in a daily bag" },
  { id: "con-apple", label: "Apple platform only" },
  { id: "con-watts-400", label: "Under 400 W at the wall" },
];

const budgetOptions = [
  { id: "bud-1500", label: "Up to EUR 1,500" },
  { id: "bud-3000", label: "Up to EUR 3,000" },
  { id: "bud-7000", label: "Up to EUR 7,000" },
];

const regionOptions: { code: Region; label: string }[] = [
  { code: "EU-NL", label: "Netherlands" },
  { code: "EU", label: "Rest of the EU" },
  { code: "US", label: "United States" },
];

const graphIndex = indexGraph(decisionGraph);

function merchantUrlFor(nodeId: string): string {
  const node = graphIndex.get(nodeId);
  const sourceId = node && "specs" in node ? Object.values(node.specs)[0]?.source : undefined;
  const source = sourceId ? graphIndex.get(sourceId) : undefined;
  return source && source.kind === "EvidenceSource" ? source.url : "/methodology";
}

function download(filename: string, contents: string, type: string) {
  const url = URL.createObjectURL(new Blob([contents], { type }));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

function toggle(list: string[], value: string): string[] {
  return list.includes(value) ? list.filter((entry) => entry !== value) : [...list, value];
}

function SystemPanel({ system }: { system: ConfiguredSystem }) {
  return (
    <article className="dg-system">
      <header className="dg-system-head">
        <span className="dg-tier">{system.tier.replace("-", " ")}</span>
        <h3>{system.label}</h3>
      </header>

      <table className="dg-table">
        <caption className="dg-caption">Every line carries its price basis and where the link goes.</caption>
        <thead>
          <tr>
            <th scope="col">Part</th>
            <th scope="col">Role</th>
            <th scope="col">Price</th>
            <th scope="col">Why this one</th>
          </tr>
        </thead>
        <tbody>
          {system.lines.map((line) => {
            const link = resolveOutboundLink(decisionGraph, line.nodeId, merchantUrlFor(line.nodeId));
            return (
              <tr key={line.nodeId}>
                <th scope="row">
                  <a href={link.href} rel={link.rel} target="_blank">
                    {line.label}
                  </a>
                  <span className="dg-disclosure">{link.disclosure}</span>
                </th>
                <td>{line.role}</td>
                <td>
                  {line.priceMinor === null || !line.currency
                    ? "unverified"
                    : `${(line.priceMinor / 100).toFixed(0)} ${line.currency}`}
                  <span className="dg-basis">{line.priceBasis}</span>
                </td>
                <td>{line.justification}</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <dl className="dg-facts">
        <div>
          <dt>Total</dt>
          <dd>{system.cost.budgetNote}</dd>
        </div>
        <div>
          <dt>First bottleneck</dt>
          <dd>
            <strong>{system.bottleneck.resource}</strong> — {system.bottleneck.explanation}
          </dd>
        </div>
        <div>
          <dt>Upgrade path</dt>
          <dd>
            <ul>
              {system.upgradePath.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ul>
          </dd>
        </div>
        <div>
          <dt>Power, noise, mobility</dt>
          <dd>
            {system.tradeoffs.power} {system.tradeoffs.noise} {system.tradeoffs.mobility}
          </dd>
        </div>
      </dl>

      {system.wrongPurchaseConditions.length > 0 && (
        <section className="dg-warnings">
          <h4>Do not buy this if</h4>
          <ul>
            {system.wrongPurchaseConditions.map((condition) => (
              <li key={condition.id}>
                <strong>{condition.condition}</strong> {condition.instead}
              </li>
            ))}
          </ul>
        </section>
      )}
    </article>
  );
}

export function StudioConfigurator() {
  const [input, setInput] = useState<ConfiguratorInput>({
    workloadIds: ["wl-local-llm-mid", "wl-video-4k"],
    budgetId: "bud-3000",
    regionCode: "EU-NL",
    constraintIds: [],
  });

  const output = useMemo(() => configure(input), [input]);
  const today = new Date().toISOString().slice(0, 10);

  const exportSheet = (format: "md" | "json") => {
    const sheet = toBuildSheetJson(output, { now: today });
    if (format === "json") {
      download(`starlight-build-sheet-${output.inputsHash}.json`, JSON.stringify(sheet, null, 2), "application/json");
      return;
    }
    download(`starlight-build-sheet-${output.inputsHash}.md`, toBuildSheetMarkdown(sheet), "text/markdown");
  };

  return (
    <section className="dg" aria-labelledby="dg-title">
      <div className="finder-head">
        <span>AI creator studio configurator</span>
        <span>Runs in your browser · nothing is sent anywhere</span>
      </div>

      <h2 id="dg-title" className="dg-title">
        What are you actually going to do with it?
      </h2>

      <div className="dg-inputs">
        <fieldset>
          <legend>Workloads</legend>
          {workloadOptions.map((option) => (
            <label key={option.id}>
              <input
                type="checkbox"
                checked={input.workloadIds.includes(option.id)}
                onChange={() => setInput((current) => ({ ...current, workloadIds: toggle(current.workloadIds, option.id) }))}
              />
              {option.label}
            </label>
          ))}
        </fieldset>

        <fieldset>
          <legend>Non-negotiables</legend>
          {constraintOptions.map((option) => (
            <label key={option.id}>
              <input
                type="checkbox"
                checked={input.constraintIds.includes(option.id)}
                onChange={() =>
                  setInput((current) => ({ ...current, constraintIds: toggle(current.constraintIds, option.id) }))
                }
              />
              {option.label}
            </label>
          ))}
          <p className="dg-hint">A non-negotiable disqualifies a system outright. It never quietly costs it points.</p>
        </fieldset>

        <fieldset>
          <legend>Budget and region</legend>
          <label className="dg-select">
            Budget
            <select value={input.budgetId} onChange={(event) => setInput((current) => ({ ...current, budgetId: event.target.value }))}>
              {budgetOptions.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <label className="dg-select">
            Region
            <select
              value={input.regionCode}
              onChange={(event) => setInput((current) => ({ ...current, regionCode: event.target.value as Region }))}
            >
              {regionOptions.map((option) => (
                <option key={option.code} value={option.code}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </fieldset>
      </div>

      <div className="dg-requirement" aria-live="polite">
        <span>Sized against</span>
        <strong>
          {output.requirement.vramGb} GB model memory · {output.requirement.systemRamGb} GB system memory ·{" "}
          {output.requirement.cpuThreads} threads · {output.requirement.fastStorageTb} TB fast storage ·{" "}
          {output.requirement.portability}
        </strong>
      </div>

      {output.unmet.length > 0 && (
        <div className="dg-unmet">
          {output.unmet.map((note) => (
            <p key={note}>{note}</p>
          ))}
        </div>
      )}

      <div className="dg-systems">
        {output.systems.map((system) => (
          <SystemPanel key={system.tier} system={system} />
        ))}
      </div>

      {output.disqualified.length > 0 && (
        <section className="dg-ruled-out">
          <h3>Ruled out, and why</h3>
          <ul>
            {output.disqualified.map((item) => (
              <li key={item.archetypeId}>
                <strong>{item.label}</strong> {item.reason}
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="dg-export">
        <button type="button" className="button button-primary" onClick={() => exportSheet("md")} disabled={output.systems.length === 0}>
          Export the build sheet
        </button>
        <button type="button" className="button button-quiet" onClick={() => exportSheet("json")} disabled={output.systems.length === 0}>
          Export as JSON
        </button>
        <p className="dg-hint">
          The sheet carries every source, every date, every price basis and every commercial relationship. Hardware here
          earns us nothing; the software lines are disclosed partner links.
        </p>
      </div>
    </section>
  );
}
