import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div><p className="eyebrow">Starlight Technology</p><p>Buying intelligence for AI-native creators and small teams.</p></div>
      <div className="footer-links"><Link href="/about">About</Link><Link href="/methodology">Methodology</Link><Link href="/disclosure">Disclosure</Link><Link href="/privacy">Privacy</Link><a href="https://www.frankx.ai/stack">FrankX Stack ↗</a></div>
      <p className="footer-note">© 2026 Starlight Technology. Verify current compatibility, availability and merchant terms before purchase.</p>
    </footer>
  );
}
