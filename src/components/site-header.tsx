import Link from "next/link";

const links = [
  ["Builds", "/builds"],
  ["Compare", "/compare"],
  ["Pricing", "/pricing"],
  ["Guides", "/guides"],
  ["Method", "/methodology"]
] as const;

export function SiteHeader() {
  return (
    <header className="site-header">
      <Link className="brand" href="/" aria-label="Starlight Technology home">
        <span className="brand-signal" aria-hidden="true" />
        <span>STARLIGHT</span>
        <span className="brand-divider">/</span>
        <span className="brand-sub">TECHNOLOGY</span>
      </Link>
      <nav aria-label="Primary navigation">
        {links.map(([label, href]) => (
          <Link key={href} href={href}>{label}</Link>
        ))}
      </nav>
      <Link className="header-cta" href="/pricing">Get Studio</Link>
    </header>
  );
}
