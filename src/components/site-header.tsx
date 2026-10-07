import Link from "next/link";

const links = [
  ["Shop", "/shop"],
  ["Builds", "/builds"],
  ["Compare", "/compare"],
  ["Infrastructure", "/infrastructure"],
  ["Guides", "/guides"],
  ["Partners", "/partners"]
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
      <details className="mobile-nav"><summary>Menu</summary><div>{links.map(([label, href]) => <Link key={href} href={href}>{label}</Link>)}<Link href="/pricing">Studio pricing</Link><Link href="/methodology">Methodology</Link></div></details>
      <Link className="header-cta" href="/shop">Studio Shop ↗</Link>
    </header>
  );
}
