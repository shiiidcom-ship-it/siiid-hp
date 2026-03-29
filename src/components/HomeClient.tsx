"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import gsap from "gsap";

const GradientSphere = dynamic(() => import("./GradientSphere"), { ssr: false });

/* ── product data ─────────────────────────────────────────── */
const PRODUCTS = [
  {
    id: "koepass",
    name: "KoePass",
    accent: "#e8458c",
    light: "#f472b6",
    tagline: "ボイスメッセージ特化プラットフォーム",
    headline: "メイクなし。\n準備なし。\n声だけで交流。",
    body: "インスタライブより気軽に、ファンとつながれる。",
    cta: "無料で始める",
    href: "/koepass",
  },
  {
    id: "seebuy",
    name: "Seebuy",
    accent: "#16a34a",
    light: "#22c55e",
    tagline: "有料Q&Aプラットフォーム",
    headline: "フォロワーの\n「教えてください」に、\n値段がつく。",
    headlineSize: "clamp(24px, 3.8vw, 52px)",
    body: "恋愛・美容整形・ビジネス・受験——Xの界隈で「この人に聞けば間違いない」と言われるあなたの知識、1回答ごとに収益になります。",
    cta: "事前登録（無料）",
    href: "https://seebuy-lp-one.vercel.app/",
  },
];

/* ── masonry photo data ────────────────────────────────────── */
const MASONRY_ITEMS = [
  { label: "オフィスの様子",     sub: "渋谷・コワーキング",   span: 3, gradient: "linear-gradient(135deg,#6366f1,#8b5cf6)" },
  { label: "チームランチ",       sub: "毎週金曜日",           span: 2, gradient: "linear-gradient(135deg,#0ea5e9,#22c55e)" },
  { label: "プロダクト開発",     sub: "週次スプリント",       span: 2, gradient: "linear-gradient(135deg,#f97316,#eab308)" },
  { label: "ユーザーインタビュー", sub: "リサーチ駆動",       span: 3, gradient: "linear-gradient(135deg,#e8458c,#f472b6)" },
  { label: "ハッカソン",         sub: "48時間",               span: 2, gradient: "linear-gradient(135deg,#14b8a6,#3b82f6)" },
  { label: "キックオフ",         sub: "2025年4月",            span: 2, gradient: "linear-gradient(135deg,#a855f7,#ec4899)" },
];

/* ── split-text reveal (GSAP-powered) ──────────────────────── */
function SplitTextReveal({
  text,
  style,
  delay = 0,
}: {
  text: string;
  style?: React.CSSProperties;
  delay?: number;
}) {
  const ref = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const chars = el.querySelectorAll<HTMLElement>(".split-char");

    gsap.set(chars, { opacity: 0, y: 40, rotateX: -90, scale: 0.8 });

    const tl = gsap.timeline({ delay });
    tl.to(chars, {
      opacity: 1,
      y: 0,
      rotateX: 0,
      scale: 1,
      duration: 0.8,
      stagger: 0.04,
      ease: "back.out(1.7)",
    });

    return () => { tl.kill(); };
  }, [delay]);

  return (
    <p ref={ref} style={{ ...style, perspective: "800px" }}>
      {text.split("").map((char, i) => (
        <span
          key={i}
          className="split-char"
          style={{
            display: "inline-block",
            transformOrigin: "bottom center",
            opacity: 0,
            willChange: "transform, opacity",
          }}
        >
          {char === " " ? "\u00A0" : char}
        </span>
      ))}
    </p>
  );
}

/* ── main component ───────────────────────────────────────── */
export function HomeClient() {
  const [scrolled, setScrolled] = useState(false);
  const heroRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* ── GSAP hero entrance timeline ── */
  useEffect(() => {
    const hero = heroRef.current;
    if (!hero) return;

    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
    tl.to(hero.querySelector(".hero-label"), { opacity: 1, y: 0, duration: 0.8, delay: 0.1 })
      .to(hero.querySelector(".hero-ctas"), { opacity: 1, y: 0, duration: 0.8 }, "-=0.1")
      .to(hero.querySelector(".hero-scroll"), { opacity: 1, duration: 1 }, "-=0.3");

    return () => { tl.kill(); };
  }, []);

  /* ── GSAP scroll-triggered section reveals ── */
  useEffect(() => {
    const sections = document.querySelectorAll<HTMLElement>(".reveal-section");
    const observers: IntersectionObserver[] = [];

    sections.forEach((section) => {
      gsap.set(section, { opacity: 0, y: 60 });
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            gsap.to(section, { opacity: 1, y: 0, duration: 1, ease: "power3.out" });
            observer.unobserve(section);
          }
        },
        { threshold: 0.15 }
      );
      observer.observe(section);
      observers.push(observer);
    });

    return () => observers.forEach((o) => o.disconnect());
  }, []);

  return (
    <div style={{ position: "relative" }}>
      {/* ── NAV (scroll-reactive) ────────────────────────── */}
      <nav
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "28px 48px",
          background: scrolled ? "rgba(245,247,255,0.82)" : "transparent",
          backdropFilter: scrolled ? "blur(18px) saturate(1.5)" : "none",
          WebkitBackdropFilter: scrolled ? "blur(18px) saturate(1.5)" : "none",
          borderBottom: scrolled ? "1px solid var(--border)" : "1px solid transparent",
          transition: "background 0.45s cubic-bezier(0.16,1,0.3,1), border-color 0.45s",
        }}
      >
        <div style={{ display: "flex", gap: "32px" }}>
          {[
            { label: "KoePass", href: "/koepass" },
            { label: "Seebuy", href: "https://seebuy-lp-one.vercel.app/" },
            { label: "会社について", href: "#about" },
          ].map((item) => (
            <Link
              key={item.label}
              href={item.href}
              style={{
                fontSize: "12px",
                fontFamily: "var(--font-sans)",
                letterSpacing: "0.12em",
                color: "rgba(14,22,49,0.5)",
                textDecoration: "none",
                transition: "color 0.3s",
              }}
              className="nav-link"
            >
              {item.label}
            </Link>
          ))}
        </div>

        <Link
          href="#contact"
          style={{
            fontSize: "12px",
            fontFamily: "var(--font-sans)",
            letterSpacing: "0.12em",
            color: "rgba(14,22,49,0.55)",
            textDecoration: "none",
          }}
          className="nav-link"
        >
          お問い合わせ →
        </Link>
      </nav>

      {/* ── HERO ─────────────────────────────────────────── */}
      <section
        ref={heroRef}
        style={{
          position: "relative",
          height: "100vh",
          minHeight: "700px",
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
          padding: "0 clamp(32px, 8vw, 120px)",
        }}
      >
        {/* giant SiiiD — watermark */}
        <div
          style={{
            position: "absolute",
            bottom: "-0.12em",
            left: "-0.04em",
            lineHeight: "1",
            userSelect: "none",
            pointerEvents: "none",
            zIndex: 0,
          }}
        >
          <span
            style={{
              fontFamily: "var(--font-syne)",
              fontSize: "clamp(100px, 18vw, 280px)",
              fontWeight: "800",
              color: "rgba(14,22,49,0.04)",
              letterSpacing: "-0.04em",
              display: "block",
            }}
          >
            SiiiD
          </span>
        </div>

        {/* left: text content */}
        <div
          className="hero-content"
          style={{
            position: "relative",
            zIndex: 2,
            flex: "1 1 55%",
            maxWidth: "600px",
          }}
        >
          {/* label */}
          <p
            className="hero-label"
            style={{
              fontFamily: "var(--font-syne)",
              fontSize: "11px",
              letterSpacing: "0.3em",
              color: "rgba(14,22,49,0.35)",
              textTransform: "uppercase",
              marginBottom: "24px",
              opacity: 0,
            }}
          >
            Empowering Creators
          </p>

          {/* main tagline */}
          <SplitTextReveal
            text="発信だけで生きていける、"
            style={{
              fontFamily: "var(--font-mincho)",
              fontSize: "clamp(26px, 4vw, 48px)",
              fontWeight: "800",
              color: "var(--text)",
              lineHeight: "1.4",
              letterSpacing: "-0.01em",
              margin: "0",
            }}
            delay={0.3}
          />
          <SplitTextReveal
            text="を当たり前に。"
            style={{
              fontFamily: "var(--font-mincho)",
              fontSize: "clamp(26px, 4vw, 48px)",
              fontWeight: "800",
              color: "var(--text)",
              lineHeight: "1.4",
              letterSpacing: "-0.01em",
              margin: "0 0 40px",
            }}
            delay={0.8}
          />

          {/* 2-product CTA cards */}
          <div
            className="hero-ctas"
            style={{
              display: "flex",
              gap: "12px",
              flexWrap: "wrap",
              opacity: 0,
            }}
          >
            {PRODUCTS.map((p) => (
              <Link
                key={p.id}
                href={p.href}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "12px 20px",
                  background: "rgba(255,255,255,0.75)",
                  backdropFilter: "blur(20px)",
                  WebkitBackdropFilter: "blur(20px)",
                  border: `1px solid ${p.accent}30`,
                  borderRadius: "12px",
                  textDecoration: "none",
                  transition: "all 0.3s cubic-bezier(0.16,1,0.3,1)",
                  boxShadow: "0 4px 24px rgba(14,22,49,0.06)",
                }}
                className={`hero-card hero-card-${p.id}`}
              >
                <div
                  style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "8px",
                    background: `linear-gradient(135deg, ${p.accent}, ${p.light})`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "12px",
                    fontWeight: "800",
                    color: "white",
                    fontFamily: "var(--font-syne)",
                    flexShrink: 0,
                  }}
                >
                  {p.name[0]}
                </div>
                <div style={{ textAlign: "left" }}>
                  <div style={{ fontFamily: "var(--font-syne)", fontSize: "13px", fontWeight: "700", color: "var(--text)", letterSpacing: "0.04em" }}>
                    {p.name}
                  </div>
                  <div style={{ fontFamily: "var(--font-sans)", fontSize: "10px", color: "var(--muted)", fontWeight: "300" }}>
                    {p.tagline}
                  </div>
                </div>
                <span style={{ fontSize: "14px", color: p.accent, marginLeft: "4px", transition: "transform 0.3s" }}>→</span>
              </Link>
            ))}
          </div>
        </div>

        {/* right: sphere */}
        <div
          className="hero-sphere"
          style={{
            position: "relative",
            flex: "0 0 45%",
            height: "60vh",
            minHeight: "400px",
            maxHeight: "600px",
            zIndex: 1,
          }}
        >
          <GradientSphere />
        </div>

        {/* scroll indicator */}
        <div
          className="hero-scroll"
          style={{
            position: "absolute",
            bottom: "40px",
            left: "50%",
            transform: "translateX(-50%)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "8px",
            opacity: 0,
            zIndex: 2,
          }}
        >
          <div
            style={{
              width: "1px",
              height: "48px",
              background: "linear-gradient(to bottom, transparent, rgba(14,22,49,0.15))",
              animation: "scrollPulse 2s ease-in-out infinite",
            }}
          />
          <span
            style={{
              fontSize: "9px",
              fontFamily: "var(--font-syne)",
              letterSpacing: "0.25em",
              color: "rgba(14,22,49,0.25)",
            }}
          >
            SCROLL
          </span>
        </div>
      </section>

      {/* ── PRODUCT SECTIONS ─────────────────────────────── */}
      {PRODUCTS.map((p, idx) => (
        <section
          key={p.id}
          className="reveal-section"
          style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            padding: "80px clamp(32px, 8vw, 120px)",
            borderTop: "1px solid var(--border)",
            gap: "clamp(40px, 8vw, 120px)",
          }}
        >
          {/* text */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <p
              style={{
                fontFamily: "var(--font-mincho)",
                fontSize: "clamp(28px, 4vw, 52px)",
                fontWeight: "800",
                letterSpacing: "-0.02em",
                color: p.light,
                margin: "0 0 12px",
                lineHeight: "1",
                viewTransitionName: `${p.id}-hero`,
              } as React.CSSProperties}
            >
              {p.name}
            </p>

            <p
              style={{
                fontFamily: "var(--font-syne)",
                fontSize: "10px",
                letterSpacing: "0.28em",
                color: p.accent,
                textTransform: "uppercase",
                marginBottom: "24px",
                opacity: 0.9,
              }}
            >
              {p.tagline}
            </p>

            <h2
              style={{
                fontFamily: "var(--font-mincho)",
                fontSize: p.headlineSize ?? "clamp(32px, 5vw, 72px)",
                fontWeight: "800",
                color: "var(--text)",
                lineHeight: "1.25",
                letterSpacing: "-0.01em",
                margin: "0 0 32px",
                whiteSpace: "pre-line",
              }}
            >
              {p.headline}
            </h2>

            <p
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "clamp(13px, 1.5vw, 16px)",
                fontWeight: "300",
                color: "var(--muted)",
                lineHeight: "2",
                margin: "0 0 48px",
                maxWidth: "460px",
              }}
            >
              {p.body}
            </p>

            <Link
              href={p.href}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "10px",
                padding: "14px 32px",
                border: `1px solid ${p.accent}`,
                borderRadius: "2px",
                color: p.accent,
                fontSize: "13px",
                fontFamily: "var(--font-syne)",
                fontWeight: "700",
                letterSpacing: "0.1em",
                textDecoration: "none",
                transition: "background 0.25s, color 0.25s",
                textTransform: "uppercase",
              }}
              className={`cta-btn-${p.id}`}
            >
              {p.cta}
              <span style={{ fontFamily: "monospace" }}>→</span>
            </Link>
          </div>

          {/* visual */}
          <div
            className="section-visual"
            style={{
              flex: "0 0 clamp(280px, 40%, 520px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {p.id === "koepass" ? <KoePassVisual /> : <SeebuyVisual />}
          </div>
        </section>
      ))}

      {/* ── ABOUT ─────────────────────────────────────────── */}
      <section
        id="about"
        className="reveal-section"
        style={{
          padding: "120px clamp(32px, 8vw, 120px)",
          borderTop: "1px solid var(--border)",
        }}
      >
        <div style={{ maxWidth: "720px" }}>
          <p
            style={{
              fontFamily: "var(--font-syne)",
              fontSize: "10px",
              letterSpacing: "0.28em",
              color: "rgba(14,22,49,0.3)",
              textTransform: "uppercase",
              marginBottom: "32px",
            }}
          >
            About
          </p>
          <h2
            style={{
              fontFamily: "var(--font-mincho)",
              fontSize: "clamp(28px, 4vw, 56px)",
              fontWeight: "700",
              color: "var(--text)",
              lineHeight: "1.4",
              margin: "0 0 32px",
            }}
          >
            誰もが持つ「価値」を、正しく届けるために。
          </h2>
          <p
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "clamp(13px, 1.4vw, 15px)",
              fontWeight: "300",
              color: "var(--muted)",
              lineHeight: "2.1",
            }}
          >
            株式会社SiiiDは、「声」と「知識」という人間固有の資産に光を当てます。
            テクノロジーを通じて、クリエイターと発信者が持つ本質的な価値を
            適切に届け、新しい経済圏を生み出すことが私たちの使命です。
          </p>
        </div>
      </section>

      {/* ── JOIN US — masonry grid ─────────────────────────── */}
      <section
        id="join-us"
        className="reveal-section"
        style={{
          padding: "100px clamp(32px, 8vw, 120px)",
          borderTop: "1px solid var(--border)",
          overflow: "hidden",
        }}
      >
        <div style={{
          display: "flex", alignItems: "flex-end", justifyContent: "space-between",
          marginBottom: "48px", flexWrap: "wrap", gap: "24px",
        }}>
          <div>
            <p style={{
              fontFamily: "var(--font-syne)", fontSize: "10px", letterSpacing: "0.28em",
              color: "rgba(14,22,49,0.3)", textTransform: "uppercase", marginBottom: "16px",
            }}>Join Us</p>
            <h2 style={{
              fontFamily: "var(--font-mincho)", fontSize: "clamp(28px, 4vw, 52px)",
              fontWeight: "700", color: "var(--text)", lineHeight: "1.3", margin: 0,
            }}>
              世界を変える仲間を、<br />探しています。
            </h2>
          </div>
          <a
            href="mailto:info@siiid.co.jp"
            style={{
              display: "inline-flex", alignItems: "center", gap: "10px",
              padding: "14px 32px", border: "1px solid var(--text)", borderRadius: "2px",
              color: "var(--text)", fontSize: "13px", fontFamily: "var(--font-syne)",
              fontWeight: "700", letterSpacing: "0.1em", textDecoration: "none",
              transition: "background 0.25s", textTransform: "uppercase", flexShrink: 0,
            }}
            className="cta-btn-joinus"
          >
            話を聞く →
          </a>
        </div>

        {/* masonry CSS grid */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gridAutoRows: "110px",
          gap: "10px",
        }}>
          {MASONRY_ITEMS.map((item, i) => (
            <div
              key={i}
             
              style={{
                gridRow: `span ${item.span}`,
                borderRadius: "10px",
                overflow: "hidden",
                position: "relative",
                background: item.gradient,
              }}
            >
              <div style={{
                position: "absolute", inset: 0,
                background: "linear-gradient(to top, rgba(0,0,0,0.55) 0%, transparent 55%)",
              }} />
              <div style={{ position: "absolute", bottom: "16px", left: "18px", right: "18px" }}>
                <p style={{
                  fontFamily: "var(--font-sans)", fontSize: "12px", fontWeight: "500",
                  color: "white", margin: "0 0 3px", lineHeight: "1.4",
                }}>{item.label}</p>
                <p style={{
                  fontFamily: "var(--font-sans)", fontSize: "10px", fontWeight: "300",
                  color: "rgba(255,255,255,0.65)", margin: 0,
                }}>{item.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CONTACT ───────────────────────────────────────── */}
      <section
        id="contact"
        className="reveal-section"
        style={{
          padding: "80px clamp(32px, 8vw, 120px) 120px",
          borderTop: "1px solid var(--border)",
        }}
      >
        <div>
        <p
          style={{
            fontFamily: "var(--font-syne)",
            fontSize: "10px",
            letterSpacing: "0.28em",
            color: "rgba(14,22,49,0.3)",
            textTransform: "uppercase",
            marginBottom: "32px",
          }}
        >
          Contact
        </p>
        <h2
          style={{
            fontFamily: "var(--font-mincho)",
            fontSize: "clamp(24px, 3.5vw, 48px)",
            fontWeight: "700",
            color: "var(--text)",
            margin: "0 0 24px",
          }}
        >
          お問い合わせ
        </h2>
        <p
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: "13px",
            fontWeight: "300",
            color: "var(--muted)",
            lineHeight: "1.9",
            marginBottom: "40px",
          }}
        >
          事業提携・取材・その他のお問い合わせは下記よりご連絡ください。
        </p>
        <a
          href="mailto:info@siiid.co.jp"
          style={{
            fontFamily: "var(--font-syne)",
            fontSize: "clamp(16px, 2.5vw, 28px)",
            fontWeight: "700",
            color: "var(--blue)",
            textDecoration: "none",
            letterSpacing: "0.04em",
            borderBottom: "1px solid var(--border)",
            paddingBottom: "4px",
            transition: "border-color 0.3s",
          }}
          className="email-link"
        >
          info@siiid.co.jp
        </a>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────── */}
      <footer
        style={{
          padding: "32px clamp(32px, 8vw, 120px)",
          borderTop: "1px solid var(--border)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-syne)",
            fontSize: "11px",
            fontWeight: "700",
            letterSpacing: "0.1em",
            color: "rgba(14,22,49,0.2)",
          }}
        >
          SiiiD
        </span>
        <span
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: "11px",
            color: "rgba(14,22,49,0.25)",
            letterSpacing: "0.05em",
          }}
        >
          © 2025 株式会社SiiiD
        </span>
      </footer>

      <style>{`
        .nav-link:hover { color: var(--text) !important; }
        .email-link:hover { border-color: var(--blue) !important; }
        .cta-btn-koepass:hover { background: rgba(232,69,140,0.08) !important; }
        .cta-btn-seebuy:hover  { background: rgba(22,163,74,0.08)  !important; }
        .cta-btn-joinus:hover  { background: rgba(14,22,49,0.06)   !important; }
        @media (max-width: 768px) {
          .hero-sphere { display: none !important; }
          .hero-content { flex: 1 1 100% !important; }
          .section-visual { display: none !important; }
          .masonry-grid-3 { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 480px) {
          .masonry-grid-3 { grid-template-columns: 1fr !important; }
        }
        @media (prefers-reduced-motion: reduce) {
          .char { opacity: 1 !important; transform: none !important; }
        }
      `}</style>
    </div>
  );
}

/* ── KoePass visual — phone mockup ───────────────────────── */
function KoePassVisual() {
  const messages = [
    { bars: [40,70,55,90,65,80,45,100,60,85,50,75], dur: "0:32", label: "限定ボイス「おはよう」", new: true },
    { bars: [60,45,80,35,95,55,70,40,85,50,65,90], dur: "1:08", label: "お礼メッセージ", new: false },
    { bars: [80,55,40,75,60,95,45,70,85,50,65,30], dur: "0:47", label: "リクエスト返答", new: false },
  ];

  return (
    <div
      style={{
        width: "260px",
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: "28px",
        overflow: "hidden",
        boxShadow: "0 24px 64px rgba(14,22,49,0.10), 0 4px 16px rgba(14,22,49,0.06)",
      }}
    >
      {/* status bar */}
      <div style={{ background: "#e8458c", padding: "10px 20px 8px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontFamily: "var(--font-syne)", fontSize: "11px", fontWeight: "700", color: "white", letterSpacing: "0.08em" }}>KoePass</span>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "rgba(255,255,255,0.7)" }} />
          <span style={{ fontSize: "9px", color: "rgba(255,255,255,0.85)", fontFamily: "var(--font-sans)" }}>3 new</span>
        </div>
      </div>

      {/* creator header */}
      <div style={{ padding: "16px 20px 12px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: "12px" }}>
        <div style={{
          width: "40px", height: "40px", borderRadius: "50%", flexShrink: 0,
          background: "linear-gradient(135deg, #e8458c, #f472b6)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "14px", fontWeight: "800", color: "white", fontFamily: "var(--font-syne)",
        }}>み</div>
        <div>
          <div style={{ fontFamily: "var(--font-sans)", fontSize: "13px", fontWeight: "500", color: "var(--text)", marginBottom: "2px" }}>田中みかん</div>
          <div style={{ fontFamily: "var(--font-sans)", fontSize: "10px", color: "var(--muted)" }}>フォロワー 12.4K</div>
        </div>
        <div style={{ marginLeft: "auto", fontSize: "9px", fontFamily: "var(--font-syne)", color: "#e8458c", letterSpacing: "0.1em", border: "1px solid rgba(232,69,140,0.3)", padding: "3px 8px", borderRadius: "20px" }}>
          VOICE
        </div>
      </div>

      {/* voice message list */}
      <div style={{ padding: "8px 0" }}>
        {messages.map((msg, i) => (
          <div
            key={i}
            style={{
              padding: "12px 20px",
              borderBottom: i < messages.length - 1 ? "1px solid var(--border)" : "none",
              background: msg.new ? "rgba(232,69,140,0.04)" : "transparent",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
              <span style={{ fontSize: "10px", fontFamily: "var(--font-sans)", color: "var(--text)", fontWeight: msg.new ? "500" : "300" }}>{msg.label}</span>
              {msg.new && (
                <span style={{ fontSize: "8px", background: "#e8458c", color: "white", padding: "2px 6px", borderRadius: "10px", fontFamily: "var(--font-syne)", letterSpacing: "0.05em" }}>NEW</span>
              )}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div style={{
                width: "24px", height: "24px", borderRadius: "50%", flexShrink: 0,
                background: msg.new ? "#e8458c" : "var(--surface-2)",
                border: msg.new ? "none" : "1px solid var(--border)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <span style={{ fontSize: "8px", color: msg.new ? "white" : "var(--muted)" }}>▶</span>
              </div>
              <div style={{ flex: 1, display: "flex", alignItems: "center", gap: "2px", height: "20px" }}>
                {msg.bars.map((h, j) => (
                  <div
                    key={j}
                    style={{
                      flex: 1,
                      height: `${h}%`,
                      background: msg.new ? "linear-gradient(to top, #e8458c, #f472b6)" : "var(--border)",
                      borderRadius: "1px",
                      opacity: msg.new ? 0.7 + (j % 3) * 0.1 : 1,
                    }}
                  />
                ))}
              </div>
              <span style={{ fontSize: "9px", color: "var(--muted)", fontFamily: "var(--font-syne)", flexShrink: 0 }}>{msg.dur}</span>
            </div>
          </div>
        ))}
      </div>

      {/* record button */}
      <div style={{ padding: "16px 20px", borderTop: "1px solid var(--border)", display: "flex", justifyContent: "center" }}>
        <div style={{
          display: "flex", alignItems: "center", gap: "8px",
          background: "linear-gradient(135deg, #e8458c, #f472b6)",
          borderRadius: "24px", padding: "10px 24px",
          boxShadow: "0 4px 16px rgba(232,69,140,0.30)",
        }}>
          <span style={{ fontSize: "12px" }}>🎙</span>
          <span style={{ fontSize: "11px", fontFamily: "var(--font-syne)", fontWeight: "700", color: "white", letterSpacing: "0.08em" }}>録音する</span>
        </div>
      </div>

      {/* fee badge */}
      <div style={{ padding: "8px 20px 16px", textAlign: "center" }}>
        <span style={{ fontSize: "9px", fontFamily: "var(--font-sans)", color: "var(--muted)" }}>
          手数料 <strong style={{ color: "#e8458c" }}>15%</strong>のみ・他費用ゼロ
        </span>
      </div>
    </div>
  );
}

/* ── Seebuy visual — Q&A card mockup ─────────────────────── */
function SeebuyVisual() {
  const threads = [
    {
      category: "美容整形",
      categoryColor: "#ec4899",
      question: "二重整形、どこのクリニックがおすすめですか？自然な仕上がりを求めています。",
      answer: "埋没法なら〇〇クリニックが自然仕上げで実績豊富です。まずカウンセリングを複数受けて比較するのがベストです。",
      price: "¥2,000",
      answerer: "整形",
      answered: true,
    },
    {
      category: "ビジネス",
      categoryColor: "#3b82f6",
      question: "副業から法人化するタイミングの目安を教えてください。",
      answer: null,
      price: "¥3,000",
      answerer: null,
      answered: false,
    },
  ];

  return (
    <div style={{ width: "100%", maxWidth: "400px", display: "flex", flexDirection: "column", gap: "16px" }}>
      {threads.map((t, i) => (
        <div
          key={i}
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: "16px",
            overflow: "hidden",
            boxShadow: "0 2px 12px rgba(14,22,49,0.05)",
          }}
        >
          {/* header */}
          <div style={{ padding: "14px 16px 10px", display: "flex", alignItems: "center", gap: "8px", borderBottom: "1px solid var(--border)" }}>
            <span style={{
              fontSize: "9px", fontFamily: "var(--font-syne)", fontWeight: "700",
              letterSpacing: "0.1em", color: "white",
              background: t.categoryColor, padding: "3px 8px", borderRadius: "10px",
            }}>{t.category}</span>
            <span style={{ marginLeft: "auto", fontSize: "12px", fontFamily: "var(--font-syne)", fontWeight: "800", color: "#16a34a" }}>{t.price}</span>
          </div>

          {/* question */}
          <div style={{ padding: "12px 16px", display: "flex", gap: "10px" }}>
            <div style={{
              width: "28px", height: "28px", borderRadius: "50%", flexShrink: 0,
              background: "var(--surface-2)", border: "1px solid var(--border)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "11px", color: "var(--muted)",
            }}>Q</div>
            <p style={{
              fontFamily: "var(--font-sans)", fontSize: "11px", fontWeight: "400",
              color: "var(--text)", lineHeight: "1.7", margin: 0,
            }}>{t.question}</p>
          </div>

          {/* answer */}
          {t.answered && t.answer ? (
            <div style={{ margin: "0 12px 12px", padding: "12px 14px", background: "rgba(22,163,74,0.06)", border: "1px solid rgba(22,163,74,0.15)", borderRadius: "12px", display: "flex", gap: "10px" }}>
              <div style={{
                width: "28px", height: "28px", borderRadius: "50%", flexShrink: 0,
                background: "linear-gradient(135deg, #16a34a, #22c55e)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "10px", fontWeight: "700", color: "white", fontFamily: "var(--font-syne)",
              }}>{t.answerer}</div>
              <div>
                <p style={{ fontFamily: "var(--font-sans)", fontSize: "11px", color: "var(--text)", lineHeight: "1.7", margin: "0 0 6px", fontWeight: "300" }}>{t.answer}</p>
                <span style={{ fontSize: "9px", fontFamily: "var(--font-syne)", color: "#16a34a", letterSpacing: "0.08em" }}>✓ 回答済み · 60%受取</span>
              </div>
            </div>
          ) : (
            <div style={{ margin: "0 12px 12px", padding: "10px 14px", background: "var(--surface-2)", border: "1px dashed var(--border)", borderRadius: "12px", textAlign: "center" }}>
              <span style={{ fontSize: "10px", fontFamily: "var(--font-sans)", color: "var(--muted)" }}>回答待ち…</span>
            </div>
          )}
        </div>
      ))}

      {/* revenue summary */}
      <div style={{
        background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "12px",
        padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center",
        minWidth: "280px",
      }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: "9px", fontFamily: "var(--font-syne)", color: "var(--muted)", letterSpacing: "0.12em", marginBottom: "6px", whiteSpace: "nowrap" }}>今月の収益</div>
          <div style={{ fontSize: "22px", fontFamily: "var(--font-syne)", fontWeight: "800", color: "var(--text)", whiteSpace: "nowrap" }}>¥48,000</div>
        </div>
        <div style={{ width: "1px", height: "36px", background: "var(--border)", flexShrink: 0, margin: "0 16px" }} />
        <div style={{ textAlign: "right", minWidth: 0 }}>
          <div style={{ fontSize: "9px", fontFamily: "var(--font-syne)", color: "var(--muted)", letterSpacing: "0.12em", marginBottom: "6px", whiteSpace: "nowrap" }}>回答者の取り分</div>
          <div style={{ fontSize: "22px", fontFamily: "var(--font-syne)", fontWeight: "800", color: "#22c55e", whiteSpace: "nowrap" }}>60%</div>
        </div>
      </div>
    </div>
  );
}
