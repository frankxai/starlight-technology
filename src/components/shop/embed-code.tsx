"use client";

import { useState } from "react";
import { embedSnippet } from "@/lib/shop/embed";
import styles from "./storefront.module.css";

// Live preview of the embeddable card plus the snippet that produces it.
// The preview is the real /shop/embed route in an iframe, so what a person
// copies is exactly what they just saw.
export function EmbedCode({ slug, kind, name }: { slug: string; kind: "edition" | "free"; name: string }) {
  const [note, setNote] = useState<string | null>(null);
  const snippet = embedSnippet(slug, kind);
  async function copy() {
    try { await navigator.clipboard.writeText(snippet); setNote("Embed code copied."); }
    catch { setNote("Copy failed in this browser. Select the code and copy it by hand."); }
  }
  return <div className={styles.embedWrap}>
    <div className={styles.embedPreview}>
      <iframe src={`/shop/embed/${slug}`} title={`Live embed preview: ${name}`} loading="lazy" />
    </div>
    <div className={styles.embedCode}>
      <p className={styles.muted} style={{ fontSize: ".84rem", lineHeight: 1.55 }}>Paste this on any page. The card reads the catalogue live: price basis, status and the checkout state stay in sync with this page, and it never shows a Buy button while checkout is closed. No tracking script ships with it.</p>
      <pre className={styles.mono}><code>{snippet}</code></pre>
      <div className={styles.actions} style={{ marginTop: 12 }}>
        <button type="button" className={`${styles.btn} ${styles.btnQuiet}`} onClick={copy}>Copy embed code</button>
        <a className={`${styles.btn} ${styles.btnQuiet}`} href={`/shop/embed/${slug}`} target="_blank" rel="noopener">Open the card alone ↗</a>
      </div>
      {note && <p className={styles.muted} role="status" style={{ fontSize: ".8rem", marginTop: 8 }}>{note}</p>}
    </div>
  </div>;
}
