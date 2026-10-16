import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div><p className="eyebrow">Starlight Technology</p><p>Buying intelligence for AI-native creators and small teams.</p></div>
      <div className="footer-links"><Link href="/shop">Shop</Link><Link href="/shop/free/source-to-brief-lab">Free lab</Link><Link href="/shop/how-it-works">How it works</Link><Link href="/shop/licensing-and-support">Licensing &amp; support</Link><Link href="/shop/updates">Updates</Link><Link href="/shop/availability">Availability</Link><Link href="/partners">Partners</Link><Link href="/about">About</Link><Link href="/methodology">Methodology</Link><Link href="/disclosure">Disclosure</Link><Link href="/privacy">Privacy</Link><a href="https://www.frankx.ai/stack">FrankX Stack ↗</a></div>
      <p className="footer-note">© 2026 Starlight Technology. Verify current compatibility, availability and merchant terms before purchase. External links are labelled independent, affiliate or official source per link; see <Link href="/disclosure">disclosure</Link>. Support and requests: <a href="mailto:hello@frankx.ai">hello@frankx.ai</a>.</p>
    </footer>
  );
}
