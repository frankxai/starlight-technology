"use client";

import { useId, useState } from "react";
import { prepareReleaseRequest, releaseRequestMailto, requestHosts, type ReleaseRequest as RequestRecord } from "@/lib/release-request";
import styles from "./release-request.module.css";

export function ReleaseRequest({ productId, productName }: { productId: string; productName: string }) {
  const inputId = useId();
  const [outcome, setOutcome] = useState("");
  const [tools, setTools] = useState("");
  const [host, setHost] = useState<typeof requestHosts[number]>("Codex");
  const [draft, setDraft] = useState<RequestRecord | null>(null);
  const [edited, setEdited] = useState(false);
  const [notice, setNotice] = useState("");
  function prepare(event: React.FormEvent) {
    event.preventDefault();
    if (edited && !window.confirm("Replace your edited draft with the current inputs? Download a copy first.")) return;
    try { setDraft(prepareReleaseRequest(productId, productName, outcome, tools, host)); setEdited(false); setNotice("Draft prepared here. Send it from your email app to request a reply."); }
    catch (error) { setNotice(error instanceof Error ? error.message : "Could not prepare the request."); }
  }
  async function copy() {
    if (!draft) return;
    try { await navigator.clipboard.writeText(draft.message); setNotice("Draft copied. Paste it into your email to send it."); }
    catch { setNotice("Could not copy automatically. Select the draft text or download a copy."); }
  }
  function download() {
    if (!draft) return;
    const url = URL.createObjectURL(new Blob([JSON.stringify(draft, null, 2)], { type: "application/json" }));
    const anchor = document.createElement("a"); anchor.href = url; anchor.download = "starlight-release-request.json"; anchor.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000); setNotice("Draft downloaded. It has not been submitted.");
  }
  const email = draft ? releaseRequestMailto(draft) : null;
  return <section className={styles.request} aria-label="Prepare a release request">
    <h2>What would you like to build?</h2>
    <p>Describe the work you need this kit to help you finish. Preparing this draft keeps it in this page. To request a reply, send it to hello@frankx.ai from your email app.</p>
    <form onSubmit={prepare}>
      <label htmlFor={`${inputId}-outcome`}>Target outcome</label><textarea id={`${inputId}-outcome`} required maxLength={2000} rows={4} value={outcome} onChange={event => setOutcome(event.target.value)} placeholder="The project, decision or workflow you need to complete" />
      <label htmlFor={`${inputId}-tools`}>Current tools or hardware</label><textarea id={`${inputId}-tools`} maxLength={1000} rows={3} value={tools} onChange={event => setTools(event.target.value)} />
      <label htmlFor={`${inputId}-host`}>Current host</label><select id={`${inputId}-host`} value={host} onChange={event => setHost(event.target.value as typeof host)}>{requestHosts.map(value => <option key={value}>{value}</option>)}</select>
      <button className="button button-primary" type="submit">Prepare draft</button>
    </form>
    {draft && <div className={styles.draft}>
      <label htmlFor={`${inputId}-draft`}>Your request draft</label><textarea id={`${inputId}-draft`} rows={12} maxLength={8000} value={draft.message} onChange={event => { setDraft({ ...draft, message: event.target.value }); setEdited(true); }} />
      <div className={styles.actions}><button className="button" type="button" onClick={() => { void copy(); }}>Copy draft</button><button className="button" type="button" onClick={download}>Download draft</button><a className="button button-primary" href={email?.href}>{email?.bodyIncluded ? "Open email draft" : "Open email and paste the draft"}</a></div>
      {email && !email.bodyIncluded && <p>The draft is long. Copy or download it, then paste it into the email. The email link includes the subject only.</p>}
    </div>}
    <p role="status" className={styles.notice}>{notice}</p>
    <p>We cannot confirm email delivery on this page. Preparing a draft does not place an order, make a payment or subscribe you to a mailing list.</p>
  </section>;
}
