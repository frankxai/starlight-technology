"use client";

import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { usePathname } from "next/navigation";
import { filterPublicTelemetry, isPrivateStudioPath } from "@/lib/telemetry-privacy";

function beforeSend<T extends { url: string }>(event: T): T | null {
  // A collector loaded on a public page may outlive navigation into Studio.
  return filterPublicTelemetry(event, window.location.pathname);
}

export function SiteTelemetry() {
  const pathname = usePathname();
  if (!pathname || isPrivateStudioPath(pathname)) return null;
  return <><Analytics beforeSend={beforeSend} /><SpeedInsights beforeSend={beforeSend} /></>;
}
