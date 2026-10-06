import type { Metadata } from "next";

export const metadata: Metadata = { title: "Privacy", description: "Starlight Technology privacy and browser-local Studio planning." };

export default function PrivacyPage() {
  return (
    <article className="article shell">
      <header className="article-header">
        <p className="eyebrow">Privacy</p><h1>Minimal data by default.</h1>
        <p className="article-summary">The site has no accounts, newsletter form, advertising pixels or non-essential cookies. Studio plans stay in your browser.</p>
      </header>
      <section className="article-section"><h2>Your Studio plan</h2><p>Titles, notes, assumptions and saved drafts are stored in this browser. Exports download to your device; importing a plan reads the file locally. We do not send plan contents to an analytics service, model provider or our server.</p><p>Official videos load from YouTube only when you choose to load one. The player receives its fixed public video ID and technical request data. Your plan is not included. Manufacturer gallery links open the manufacturer&apos;s site under its own privacy terms.</p></section>
      <section className="article-section"><h2>Public-page measurements</h2><p>Public editorial pages use Vercel Web Analytics and Speed Insights for page visits and performance measurements. Studio routes are excluded. Our event filter also removes query strings and fragments from measured page URLs, and discards queued events while you are in Studio. We configure no custom events containing form values or plan contents.</p><p>See <a href="https://vercel.com/docs/analytics/privacy-policy">Vercel&apos;s Web Analytics privacy information</a> and <a href="https://vercel.com/docs/speed-insights/privacy-policy">Speed Insights privacy information</a> for the provider&apos;s data handling.</p></section>
      <section className="article-section"><h2>Hosting data</h2><p>Vercel hosts the site and may process technical request information needed to operate and secure it, such as IP address, user agent, requested URL and timestamps, under its service terms. Hosting request logs are separate from your locally saved plan.</p></section>
      <section className="article-section"><h2>Contact</h2><p>If you email us, we receive the information you send. Do not include passwords, credentials or unnecessary sensitive information.</p></section>
      <section className="article-section"><h2>Future changes</h2><p>Cloud-saved plans, alerts or accounts will require an updated privacy notice before they collect additional data.</p></section>
    </article>
  );
}
