import Link from "next/link";
import Image from "next/image";

export default function SiteFooter() {
  return (
    <footer
      style={{
        borderTop: "1px solid var(--border)",
        background: "var(--surface)",
        padding: "48px 24px 32px",
        fontFamily: "var(--font-sans)",
      }}
    >
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <div
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "40px", marginBottom: "48px" }}
          className="footer-grid"
        >
          {/* Brand */}
          <div>
            <div style={{ marginBottom: "16px" }}>
              <Image src="/logo-transparent.png" alt="SiiiD" width={100} height={34} style={{ objectFit: "contain" }} />
            </div>
            <p style={{ color: "var(--muted)", fontSize: "12px", lineHeight: "1.8", margin: 0 }}>
              発信だけで生きていける、を当たり前に。
            </p>
          </div>

          {/* Products */}
          <div>
            <h3
              style={{
                color: "var(--muted)",
                fontSize: "11px",
                fontWeight: "500",
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                fontFamily: "var(--font-syne)",
                marginBottom: "16px",
              }}
            >
              プロダクト
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <FooterLink href="/koepass" label="KoePass" hoverColor="#e8458c" />
              <FooterLink href="https://seebuy-lp-one.vercel.app/" label="Seebuy" hoverColor="#16a34a" />
            </div>
          </div>

          {/* Company */}
          <div>
            <h3
              style={{
                color: "var(--muted)",
                fontSize: "11px",
                fontWeight: "500",
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                fontFamily: "var(--font-syne)",
                marginBottom: "16px",
              }}
            >
              会社情報
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <FooterLink href="/#about" label="会社概要" hoverColor="var(--blue)" />
              <FooterLink href="/#contact" label="お問い合わせ" hoverColor="var(--blue)" />
              <FooterLink href="/privacy" label="プライバシーポリシー" hoverColor="var(--blue)" />
              <FooterLink href="/terms" label="利用規約" hoverColor="var(--blue)" />
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div
          style={{
            paddingTop: "24px",
            borderTop: "1px solid var(--border)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
          className="footer-bottom"
        >
          <p style={{ color: "var(--muted)", fontSize: "12px", margin: 0 }}>
            © 2025 株式会社SiiiD. All rights reserved.
          </p>
          <div style={{ display: "flex", gap: "16px" }}>
            <span style={{ color: "var(--muted)", fontSize: "11px", letterSpacing: "0.1em" }}>KoePass</span>
            <span style={{ color: "var(--border)", fontSize: "11px" }}>×</span>
            <span style={{ color: "var(--muted)", fontSize: "11px", letterSpacing: "0.1em" }}>Seebuy</span>
          </div>
        </div>
      </div>

      <style>{`
        .footer-link { color: var(--muted); text-decoration: none; font-size: 13px; transition: color 0.2s; display: inline-block; }
        .footer-link:hover { color: var(--footer-link-hover, var(--blue)); }
        @media (max-width: 768px) {
          .footer-grid { grid-template-columns: 1fr !important; gap: 32px !important; }
          .footer-bottom { flex-direction: column !important; gap: 12px !important; align-items: flex-start !important; }
        }
      `}</style>
    </footer>
  );
}

function FooterLink({ href, label, hoverColor }: { href: string; label: string; hoverColor: string }) {
  return (
    <Link
      href={href}
      className="footer-link"
      style={{ "--footer-link-hover": hoverColor } as React.CSSProperties}
    >
      {label}
    </Link>
  );
}
