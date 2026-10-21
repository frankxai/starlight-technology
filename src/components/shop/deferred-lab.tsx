"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import styles from "./lab.module.css";

// The storefront embeds the real lab, but the lab's code should not be on the
// critical path of /shop. The chunk is requested only when the section is
// about to scroll into view (or on request), so first paint and hydration of
// the storefront cost the same as before the lab moved here.
const SourceToBriefLab = dynamic(() => import("./source-to-brief-lab").then((m) => m.SourceToBriefLab), { ssr: false, loading: () => <div className={styles.empty} role="status">Loading the lab…</div> });

export function DeferredLab() {
  const [mount, setMount] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const node = ref.current;
    if (!node || mount) return;
    if (!("IntersectionObserver" in window)) return;
    const observer = new IntersectionObserver((entries) => { if (entries.some((entry) => entry.isIntersecting)) { setMount(true); observer.disconnect(); } }, { rootMargin: "600px 0px" });
    observer.observe(node);
    return () => observer.disconnect();
  }, [mount]);
  return <div ref={ref} style={{ minHeight: mount ? undefined : 320 }}>
    {mount ? <SourceToBriefLab /> : <div className={styles.empty}><p>The lab loads when you scroll here.</p><button type="button" className={styles.iconBtn} style={{ marginTop: 12 }} onClick={() => setMount(true)}>Load the lab now</button></div>}
  </div>;
}
