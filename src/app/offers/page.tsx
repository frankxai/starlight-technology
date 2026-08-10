import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Offers",
  description:
    "Creator System Blueprint and evidence-led buying intelligence offers for AI-native studios."
};

const offers = [
  {
    title: "Open library",
    price: "Free",
    body: "Complete builds, comparisons and guides with explicit evidence states. No account wall.",
    cta: { href: "/builds", label: "Explore builds" },
    note: null as string | null
  },
  {
    title: "Creator System Blueprint",
    price: "€190 · human-reviewed",
    body: "A fixed-scope blueprint for one studio objective: workload map, complete-system allocation, wrong-purchase conditions, and next purchase order.",
    cta: { href: "/blueprint", label: "Start blueprint intake" },
    note: "Polar checkout optional via NEXT_PUBLIC_POLAR_BLUEPRINT_URL once the product exists."
  },
  {
    title: "Studio stack audit",
    price: "€890 · fixed scope",
    body: "Remote audit of an existing creator/AI stack: bottlenecks, evidence gaps, upgrade sequence, and regional offer intelligence for NL/EU starting points.",
    cta: {
      href: "mailto:hello@frankx.ai?subject=Starlight%20Technology%20stack%20audit",
      label: "Request audit"
    },
    note: null
  }
] as const;

export default function OffersPage() {
  const polar = process.env.NEXT_PUBLIC_POLAR_BLUEPRINT_URL;
  return (
    <div className="shell page-header offers-page">
      <p className="eyebrow">Commercial lane</p>
      <h1>Income without fake hands-on theater.</h1>
      <p className="lede">
        Free decision literacy first. Paid blueprints only when a human reviews your workload.
        Affiliate links never rewrite a verdict.
      </p>
      <div className="offers-grid">
        {offers.map((offer) => {
          const href =
            offer.title === "Creator System Blueprint" && polar?.startsWith("http")
              ? polar
              : offer.cta.href;
          return (
            <article className="offer-card" key={offer.title}>
              <h2>{offer.title}</h2>
              <p className="offer-price">{offer.price}</p>
              <p>{offer.body}</p>
              {offer.note ? <p className="muted">{offer.note}</p> : null}
              <Link className="button button-primary" href={href}>
                {offer.cta.label}
              </Link>
            </article>
          );
        })}
      </div>
      <section className="method-callout" style={{ marginTop: "3rem" }}>
        <div>
          <p className="eyebrow">Stack choice</p>
          <h2>Vercel yes. Dual payment no.</h2>
        </div>
        <p>
          Hosting stays on Vercel (domain already owned). Polar is preferred for digital blueprints.
          Stripe is reserved for later enterprise invoices. Supabase and AI SDK only when accounts or
          model explainers earn their keep — not for launch.
        </p>
      </section>
    </div>
  );
}
