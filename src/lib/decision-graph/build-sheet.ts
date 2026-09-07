/**
 * The build sheet is the product. It is the artefact a buyer takes to a shop, a partner, or a
 * finance approval, and it has to survive being read by someone who did not use the site: every
 * line carries its evidence kind, its source, its date, its region and its commercial relationship.
 */

import { indexGraph } from "./graph";
import { decisionGraph } from "./dataset";
import { partnerRouteProvenance, resolveOutboundLink } from "./partner-links";
import { assessFreshness } from "./staleness";
import type { ConfiguratorOutput, ConfiguredSystem } from "./configurator";
import type { DecisionGraph, EvidenceSourceNode } from "./schema";

export type BuildSheetOptions = {
  now: string;
  graph?: DecisionGraph;
};

export type BuildSheetJson = {
  schema: "StarlightBuildSheet.v1";
  decisionGraphSchema: "DecisionGraph.v1";
  generatedAt: string;
  inputsHash: string;
  requirement: ConfiguratorOutput["requirement"];
  disclosure: string;
  routerProvenance: typeof partnerRouteProvenance;
  systems: {
    tier: string;
    label: string;
    freshness: ReturnType<typeof assessFreshness>;
    bottleneck: ConfiguredSystem["bottleneck"];
    upgradePath: string[];
    tradeoffs: ConfiguredSystem["tradeoffs"];
    cost: ConfiguredSystem["cost"];
    lines: {
      label: string;
      role: string;
      quantity: number;
      justification: string;
      price: string;
      link: { href: string; routed: boolean; disclosure: string };
      citations: string[];
    }[];
    wrongPurchaseConditions: { condition: string; instead: string }[];
  }[];
  disqualified: ConfiguratorOutput["disqualified"];
  unmet: string[];
  sources: { id: string; publisher: string; title: string; url: string; standing: string; retrievedAt: string }[];
};

const DISCLOSURE =
  "Hardware on this sheet carries no commercial relationship: those links are plain merchant links and earn nothing. Software lines marked as partner links route through go.agenticincome.ai and may pay a commission at no extra cost to you. Prices marked cited-msrp are the figure the vendor published, not a price any shop is obliged to honour.";

function merchantUrl(graph: DecisionGraph, nodeId: string): string {
  const index = indexGraph(graph);
  const node = index.get(nodeId);
  if (!node) return "https://starlight.technology/methodology";
  const sourceId =
    "specs" in node ? Object.values(node.specs)[0]?.source : undefined;
  const source = sourceId ? index.get(sourceId) : undefined;
  return source && source.kind === "EvidenceSource" ? source.url : "https://starlight.technology/methodology";
}

function formatPrice(line: ConfiguredSystem["lines"][number]): string {
  if (line.priceMinor === null || !line.currency) return "unverified — no price observed for this part";
  return `${(line.priceMinor / 100).toFixed(2)} ${line.currency} — ${line.priceBasis}`;
}

export function toBuildSheetJson(
  output: ConfiguratorOutput,
  options: BuildSheetOptions,
): BuildSheetJson {
  const graph = options.graph ?? decisionGraph;
  const index = indexGraph(graph);
  const usedSourceIds = new Set(output.systems.flatMap((system) => system.citations));

  return {
    schema: "StarlightBuildSheet.v1",
    decisionGraphSchema: "DecisionGraph.v1",
    generatedAt: options.now,
    inputsHash: output.inputsHash,
    requirement: output.requirement,
    disclosure: DISCLOSURE,
    routerProvenance: partnerRouteProvenance,
    systems: output.systems.map((system) => ({
      tier: system.tier,
      label: system.label,
      freshness: assessFreshness(system, { now: options.now, graph }),
      bottleneck: system.bottleneck,
      upgradePath: system.upgradePath,
      tradeoffs: system.tradeoffs,
      cost: system.cost,
      lines: system.lines.map((line) => {
        const link = resolveOutboundLink(graph, line.nodeId, merchantUrl(graph, line.nodeId));
        return {
          label: line.label,
          role: line.role,
          quantity: line.quantity,
          justification: line.justification,
          price: formatPrice(line),
          link: { href: link.href, routed: link.routed, disclosure: link.disclosure },
          citations: line.citations,
        };
      }),
      wrongPurchaseConditions: system.wrongPurchaseConditions.map((condition) => ({
        condition: condition.condition,
        instead: condition.instead,
      })),
    })),
    disqualified: output.disqualified,
    unmet: output.unmet,
    sources: [...usedSourceIds]
      .map((id) => index.get(id))
      .filter((node): node is EvidenceSourceNode => Boolean(node && node.kind === "EvidenceSource"))
      .map((node) => ({
        id: node.id,
        publisher: node.publisher,
        title: node.title,
        url: node.url,
        standing: node.standing,
        retrievedAt: node.retrievedAt,
      })),
  };
}

export function toBuildSheetMarkdown(sheet: BuildSheetJson): string {
  const out: string[] = [];
  out.push("# Starlight build sheet");
  out.push("");
  out.push(`Generated ${sheet.generatedAt} · decision graph ${sheet.decisionGraphSchema} · inputs ${sheet.inputsHash}`);
  out.push("");
  out.push("## Disclosure");
  out.push("");
  out.push(sheet.disclosure);
  out.push("");
  out.push(
    `Partner routes resolved against ${sheet.routerProvenance.sourceRepo}/${sheet.routerProvenance.sourceFile}, snapshot ${sheet.routerProvenance.snapshotAt}.`,
  );
  out.push("");
  out.push("## What this was sized against");
  out.push("");
  const need = sheet.requirement;
  out.push(
    `Model memory ${need.vramGb} GB · system memory ${need.systemRamGb} GB · ${need.cpuThreads} threads · ${need.fastStorageTb} TB fast storage · ${need.portability} · noise ceiling ${need.maxNoise}`,
  );

  for (const system of sheet.systems) {
    out.push("");
    out.push(`## ${system.tier} — ${system.label}`);
    out.push("");
    if (!system.freshness.valid) {
      out.push("**This build is not currently valid.**");
      out.push("");
      for (const reason of system.freshness.reasons) out.push(`- ${reason}`);
      out.push("");
    }
    out.push("| Part | Role | Price | Why | Link |");
    out.push("| --- | --- | --- | --- | --- |");
    for (const line of system.lines) {
      const link = `[${line.link.routed ? "partner link" : "merchant"}](${line.link.href}) — ${line.link.disclosure}`;
      out.push(`| ${line.label} | ${line.role} | ${line.price} | ${line.justification} | ${link} |`);
    }
    out.push("");
    out.push(`**Cost.** ${system.cost.budgetNote}`);
    if (system.cost.unpricedLines.length > 0) {
      out.push("");
      out.push(`Unpriced lines: ${system.cost.unpricedLines.join(", ")}. We did not observe these prices, so we do not print one.`);
    }
    out.push("");
    out.push(`**First bottleneck.** ${system.bottleneck.resource} — ${system.bottleneck.explanation}`);
    out.push("");
    out.push("**Upgrade path.**");
    for (const step of system.upgradePath) out.push(`- ${step}`);
    out.push("");
    out.push(
      `**Trade-offs.** Power: ${system.tradeoffs.power} Noise: ${system.tradeoffs.noise} Mobility: ${system.tradeoffs.mobility}`,
    );
    if (system.wrongPurchaseConditions.length > 0) {
      out.push("");
      out.push("**Do not buy this if.**");
      for (const condition of system.wrongPurchaseConditions) {
        out.push(`- ${condition.condition} ${condition.instead}`);
      }
    }
  }

  if (sheet.disqualified.length > 0) {
    out.push("");
    out.push("## Ruled out, and why");
    out.push("");
    for (const item of sheet.disqualified) out.push(`- **${item.label}** — ${item.reason}`);
  }

  if (sheet.unmet.length > 0) {
    out.push("");
    out.push("## What this sheet could not answer");
    out.push("");
    for (const item of sheet.unmet) out.push(`- ${item}`);
  }

  out.push("");
  out.push("## Sources");
  out.push("");
  for (const source of sheet.sources) {
    out.push(`- [${source.publisher} — ${source.title}](${source.url}) · ${source.standing} · retrieved ${source.retrievedAt}`);
  }
  out.push("");
  return out.join("\n");
}
