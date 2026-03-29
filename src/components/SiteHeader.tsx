"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";

interface SiteHeaderProps {
  variant?: "home" | "koepass" | "seebuy";
}

export default function SiteHeader({ variant = "home" }: SiteHeaderProps) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    let raf: number;
    const handler = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => setScrolled(window.scrollY > 20));
    };
    window.addEventListener("scroll", handler, { passive: true });
    return () => { window.removeEventListener("scroll", handler); cancelAnimationFrame(raf); };
  }, []);

  const accentColor =
    variant === "koepass" ? "#e8458c" : variant === "seebuy" ? "#16a34a" : "#1d4ed8";

  return (
    <header
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        transition: "all 0.3s ease",
        background: scrolled ? "rgba(245,247,255,0.92)" : "transparent",
        backdropFilter: scrolled ? "blur(20px)" : "none",
        borderBottom: scrolled ? "1px solid var(--border)" : "1px solid transparent",
      }}
    >
      <nav
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "0 24px",
          height: "64px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {/* Logo */}
        <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center" }}>
          <Image src="/logo-transparent.png" alt="SiiiD" width={120} height={40} style={{ objectFit: "contain" }} priority />
        </Link>

        {/* Desktop Nav */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }} className="hidden-mobile">
          <NavLink href="/koepass" accent="#e8458c" label="KoePass" />
          <NavLink href="https://seebuy-lp-one.vercel.app/" accent="#16a34a" label="Seebuy" />
          <div style={{ width: "1px", height: "16px", background: "var(--border)", margin: "0 8px" }} />
          <Link
            href="/#about"
            style={{ color: "var(--muted)", textDecoration: "none", fontSize: "13px", fontFamily: "var(--font-sans)", padding: "6px 12px", transition: "color 0.2s" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text)")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "var(--muted)")}
          >
            会社概要
          </Link>
          <Link
            href="/#contact"
            style={{ color: "var(--muted)", textDecoration: "none", fontSize: "13px", fontFamily: "var(--font-sans)", padding: "6px 12px", transition: "color 0.2s" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text)")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "var(--muted)")}
          >
            お問い合わせ
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          style={{ background: "none", border: "none", cursor: "pointer", padding: "8px", display: "none", flexDirection: "column", gap: "5px" }}
          className="show-mobile"
          aria-label="メニュー"
        >
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              style={{
                display: "block",
                width: "20px",
                height: "2px",
                background: "var(--text)",
                borderRadius: "1px",
                transition: "all 0.3s",
                transform:
                  menuOpen && i === 0 ? "rotate(45deg) translate(5px, 5px)"
                  : menuOpen && i === 2 ? "rotate(-45deg) translate(5px, -5px)"
                  : "none",
                opacity: menuOpen && i === 1 ? 0 : 1,
              }}
            />
          ))}
        </button>
      </nav>

      {/* Mobile Menu */}
      {menuOpen && (
        <div
          style={{
            background: "rgba(245,247,255,0.98)",
            borderTop: "1px solid var(--border)",
            padding: "16px 24px 24px",
          }}
        >
          {[
            { href: "/koepass", label: "KoePass", color: "#e8458c" },
            { href: "https://seebuy-lp-one.vercel.app/", label: "Seebuy", color: "#16a34a" },
            { href: "/#about", label: "会社概要", color: "var(--text)" },
            { href: "/#contact", label: "お問い合わせ", color: "var(--text)" },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMenuOpen(false)}
              style={{
                display: "block",
                padding: "12px 0",
                color: item.color,
                textDecoration: "none",
                fontSize: "15px",
                fontFamily: "var(--font-sans)",
                fontWeight: "500",
                borderBottom: "1px solid var(--border)",
              }}
            >
              {item.label}
            </Link>
          ))}
        </div>
      )}

      <style>{`
        @media (max-width: 640px) {
          .hidden-mobile { display: none !important; }
          .show-mobile { display: flex !important; }
        }
        @media (min-width: 641px) {
          .show-mobile { display: none !important; }
          .hidden-mobile { display: flex !important; }
        }
      `}</style>
    </header>
  );
}

function NavLink({ href, label, accent }: { href: string; label: string; accent: string }) {
  return (
    <Link
      href={href}
      style={{
        color: "var(--muted)",
        textDecoration: "none",
        fontSize: "13px",
        fontFamily: "var(--font-sans)",
        fontWeight: "500",
        padding: "6px 14px",
        borderRadius: "20px",
        border: "1px solid var(--border)",
        transition: "all 0.2s",
        letterSpacing: "0.02em",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = accent;
        e.currentTarget.style.color = accent;
        e.currentTarget.style.background = `${accent}12`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "var(--border)";
        e.currentTarget.style.color = "var(--muted)";
        e.currentTarget.style.background = "transparent";
      }}
    >
      {label}
    </Link>
  );
}
