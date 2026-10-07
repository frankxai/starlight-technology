"use client";

import { useRef } from "react";
import Link from "next/link";

const links = [
  ["AI Shop", "/ai"],
  ["Hardware", "/shop"],
  ["Builds", "/builds"],
  ["Compare", "/compare"],
  ["Infrastructure", "/infrastructure"],
  ["Guides", "/guides"],
  ["Partners", "/partners"]
] as const;

export function SiteHeader() {
  const mobileMenu = useRef<HTMLDetailsElement>(null);
  function closeMenu() { if (mobileMenu.current) mobileMenu.current.open = false; }
  return (
    <header className="site-header">
      <Link className="brand" href="/" aria-label="Starlight Technology home" onClick={closeMenu}>
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
      <details className="mobile-nav" ref={mobileMenu}><summary>Menu</summary><div>{links.map(([label, href]) => <Link key={href} href={href} onClick={closeMenu}>{label}</Link>)}<Link href="/pricing" onClick={closeMenu}>Studio pricing</Link><Link href="/methodology" onClick={closeMenu}>Methodology</Link></div></details>
      <Link className="header-cta" href="/shop" onClick={closeMenu}>Studio Shop ↗</Link>
    </header>
  );
}
