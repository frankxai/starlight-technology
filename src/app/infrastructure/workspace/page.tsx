import type { Metadata } from "next";
import { InfrastructureFrame } from "@/components/infrastructure/frame";
import { ReferenceWorkspace } from "@/components/infrastructure/reference-workspace";

export const metadata: Metadata = {
  title: "Reference Control Room · Infrastructure Partnership OS",
  description: "Reference workspace for deals, assets, workloads, agents, contracts, finance, energy and evidence."
};

export default function WorkspacePage() {
  return <InfrastructureFrame><ReferenceWorkspace /></InfrastructureFrame>;
}
