"use client";

import { useRef, useState, type FormEvent } from "react";
import { trackShopEvent } from "@/lib/shop/analytics-client";
import styles from "./storefront.module.css";

type Status = { tone: "idle" } | { tone: "sending" } | { tone: "ok"; message: string } | { tone: "warn"; message: string; mailto: string };

export const SUPPORT_EMAIL = "hello@frankx.ai";

export function buildMailto(fields: { product: string; email: string; role: string; useCase: string; interests: string[] }) {
  const subject = `Availability request: ${fields.product}`;
  const body = [`Product: ${fields.product}`, `Email: ${fields.email}`, `Role: ${fields.role || "-"}`, `Also interested in: ${fields.interests.join(", ") || "-"}`, "", "What I want to turn into a brief or workflow:", fields.useCase || "-", "", "I understand this is an availability request, not an order, and that no payment is taken."].join("\n");
  return `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

export function AvailabilityForm({ products, defaultProduct, interests }: { products: { slug: string; name: string }[]; defaultProduct: string; interests: { id: string; label: string }[] }) {
  const [status, setStatus] = useState<Status>({ tone: "idle" });
  const started = useRef(false);
  function onStart() {
    if (started.current) return;
    started.current = true;
    trackShopEvent("availability_request_started", { product: defaultProduct });
  }
  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const payload = {
      product: String(form.get("product") ?? ""),
      email: String(form.get("email") ?? "").trim(),
      role: String(form.get("role") ?? ""),
      useCase: String(form.get("useCase") ?? "").trim().slice(0, 1000),
      interests: form.getAll("interests").map(String),
      consent: form.get("consent") === "on"
    };
    if (!payload.consent) { setStatus({ tone: "warn", message: "Tick the consent box so we are allowed to email you about availability.", mailto: buildMailto(payload) }); return; }
    setStatus({ tone: "sending" });
    try {
      const response = await fetch("/api/shop/availability", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(payload) });
      if (response.ok) {
        trackShopEvent("availability_request_completed", { product: payload.product });
        setStatus({ tone: "ok", message: "Request recorded. You will hear from us when checkout opens, with the final price and terms. Nothing has been charged." });
        return;
      }
      const data = (await response.json().catch(() => ({}))) as { error?: string };
      setStatus({ tone: "warn", message: data.error ?? "The request endpoint is not configured yet.", mailto: buildMailto(payload) });
    } catch {
      setStatus({ tone: "warn", message: "The request could not be sent from this browser.", mailto: buildMailto(payload) });
    }
  }
  return <form className={styles.form} onSubmit={onSubmit} onFocusCapture={onStart} aria-describedby="availability-note">
    <div className={styles.field}>
      <label htmlFor="av-product">Edition</label>
      <select id="av-product" name="product" defaultValue={defaultProduct}>{products.map((product) => <option key={product.slug} value={product.slug}>{product.name}</option>)}</select>
    </div>
    <div className={styles.field}>
      <label htmlFor="av-email">Email</label>
      <input id="av-email" name="email" type="email" required autoComplete="email" placeholder="you@studio.example" />
      <small>Used only to tell you when checkout opens and to answer this request.</small>
    </div>
    <div className={styles.field}>
      <label htmlFor="av-role">Which describes you best?</label>
      <select id="av-role" name="role" defaultValue="">
        <option value="">Choose one (optional)</option>
        <option>Founder or operator</option>
        <option>Indie developer</option>
        <option>Small studio or agency</option>
        <option>Researcher or analyst</option>
        <option>Other</option>
      </select>
    </div>
    <div className={styles.field}>
      <label htmlFor="av-usecase">What do you want to turn into a brief or workflow?</label>
      <textarea id="av-usecase" name="useCase" maxLength={1000} placeholder="Example: twelve vendor notes and a renewal date, every quarter." />
      <small>Optional. One or two sentences help us tell you whether the edition fits before you pay for it.</small>
    </div>
    <fieldset className={styles.field} style={{ border: 0, padding: 0, margin: 0 }}>
      <legend>Also tell me about</legend>
      <div className={styles.checks}>{interests.map((interest) => <label key={interest.id}><input type="checkbox" name="interests" value={interest.id} /><span>{interest.label}</span></label>)}</div>
    </fieldset>
    <div className={styles.checks}>
      <label><input type="checkbox" name="consent" required /><span>Email me about availability, price and terms for the edition I selected. No marketing list, no third-party sharing, one unsubscribe link.</span></label>
    </div>
    <p id="availability-note" className={styles.muted} style={{ fontSize: ".8rem" }}>This is not a pre-order. No payment details are collected and nothing is reserved.</p>
    <div className={styles.actions} style={{ marginTop: 0 }}>
      <button className={`${styles.btn} ${styles.btnPrimary}`} type="submit" disabled={status.tone === "sending"}>{status.tone === "sending" ? "Sending…" : "Join the availability list"}</button>
      <a className={`${styles.btn} ${styles.btnQuiet}`} href={buildMailto({ product: defaultProduct, email: "", role: "", useCase: "", interests: [] })}>Email the request instead</a>
    </div>
    {status.tone === "ok" && <p className={styles.formStatus} data-tone="ok" role="status">{status.message}</p>}
    {status.tone === "warn" && <p className={styles.formStatus} data-tone="warn" role="status">{status.message} <a href={status.mailto}>Send it by email instead</a>; your answers are pre-filled.</p>}
  </form>;
}
