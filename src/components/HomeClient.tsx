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
    body: "インスタライブより気軽に、ファンとつながれる。手数料は売上の15%のみ（決済手数料込み）。それ以外の費用はゼロ。",
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
    body: "恋愛・美容整形・ビジネス・受験——Xの界隈で「この人に聞けば間違いない」と言われるあなたの知識、1回答ごとに収益になります。回答者60%の高分配。",
    cta: "事前登録（無料）",
    href: "https://seebuy-lp-one.vercel.app/",
  },
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
    tl.to(hero.querySelector(".hero-scroll"), { opacity: 1, duration: 1, delay: 1.5 });

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
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* Three.js sphere background */}
        <GradientSphere />

        {/* giant SiiiD — watermark */}
        <div
          style={{
            position: "absolute",
            bottom: "-0.12em",
            left: "-0.04em",
            lineHeight: "1",
            userSelect: "none",
            pointerEvents: "none",
            zIndex: 1,
          }}
        >
          <span
            style={{
              fontFamily: "var(--font-syne)",
              fontSize: "clamp(120px, 22vw, 340px)",
              fontWeight: "800",
              color: "rgba(14,22,49,0.04)",
              letterSpacing: "-0.04em",
              display: "block",
            }}
          >
            SiiiD
          </span>
        </div>

        {/* center content */}
        <div
          className="hero-content"
          style={{
            position: "relative",
            zIndex: 2,
            textAlign: "center",
            padding: "0 24px",
            maxWidth: "900px",
          }}
        >
          {/* main tagline */}
          <SplitTextReveal
            text="発信だけで生きていける、"
            style={{
              fontFamily: "var(--font-mincho)",
              fontSize: "clamp(28px, 5vw, 56px)",
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
              fontSize: "clamp(28px, 5vw, 56px)",
              fontWeight: "800",
              color: "var(--text)",
              lineHeight: "1.4",
              letterSpacing: "-0.01em",
              margin: "0 0 20px",
            }}
            delay={0.8}
          />

          {/* spacer between tagline and CTAs */}
          <div style={{ height: "48px" }} />

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
            flexDirection: idx % 2 === 1 ? "row-reverse" : "row",
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
              marginBottom: "56px",
            }}
          >
            株式会社SiiiDは、「声」と「知識」という人間固有の資産に光を当てます。
            テクノロジーを通じて、クリエイターと発信者が持つ本質的な価値を
            適切に届け、新しい経済圏を生み出すことが私たちの使命です。
          </p>

          {/* company info table */}
          <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "var(--font-sans)", fontSize: "14px" }}>
            <tbody>
              {[
                ["会社名", "株式会社SiiiD"],
                ["設立", "2025年4月"],
                ["代表", "石井 一真"],
                ["所在地", "東京都渋谷区"],
                ["事業内容", "KoePass（ボイスメッセージプラットフォーム）、Seebuy（有料Q&Aプラットフォーム）の企画・開発・運営"],
              ].map(([label, value]) => (
                <tr key={label} style={{ borderBottom: "1px solid var(--border)" }}>
                  <td style={{ padding: "16px 0", color: "var(--muted)", fontWeight: "300", width: "120px", verticalAlign: "top", whiteSpace: "nowrap" }}>{label}</td>
                  <td style={{ padding: "16px 0 16px 24px", color: "var(--text)", fontWeight: "400", lineHeight: "1.7" }}>{value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── MISSION / VALUES ─────────────────────────────── */}
      <section
        className="reveal-section"
        style={{
          padding: "100px clamp(32px, 8vw, 120px)",
          borderTop: "1px solid var(--border)",
        }}
      >
        <p style={{
          fontFamily: "var(--font-syne)", fontSize: "10px", letterSpacing: "0.28em",
          color: "rgba(14,22,49,0.3)", textTransform: "uppercase", marginBottom: "32px",
        }}>Our Values</p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "32px" }} className="values-grid">
          {[
            { num: "01", title: "発信者ファースト", desc: "すべての意思決定は「発信者にとって最もシンプルか」で判断します。" },
            { num: "02", title: "フェアな収益構造", desc: "不透明な手数料や隠れたコストを排除し、発信者が正しく報われる仕組みを設計します。" },
            { num: "03", title: "テクノロジーで摩擦をゼロに", desc: "「声を録る」「質問に答える」——それだけで収益が生まれる世界を技術で実現します。" },
          ].map((v) => (
            <div key={v.num} style={{ padding: "32px 0", borderTop: "1px solid var(--border)" }}>
              <span style={{ fontFamily: "var(--font-syne)", fontSize: "12px", color: "var(--blue)", letterSpacing: "0.1em", fontWeight: "700" }}>{v.num}</span>
              <h3 style={{ fontFamily: "var(--font-mincho)", fontSize: "20px", fontWeight: "700", color: "var(--text)", margin: "16px 0 12px", lineHeight: "1.4" }}>{v.title}</h3>
              <p style={{ fontFamily: "var(--font-sans)", fontSize: "13px", color: "var(--muted)", lineHeight: "1.9", margin: 0, fontWeight: "300" }}>{v.desc}</p>
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
        @media (max-width: 768px) {
          .section-visual { display: none !important; }
          .values-grid { grid-template-columns: 1fr !important; }
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
    <div style={{ width: "100%", maxWidth: "440px", minWidth: "320px", display: "flex", flexDirection: "column", gap: "16px" }}>
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
      }}>
        <div style={{ flexShrink: 0 }}>
          <div style={{ fontSize: "9px", fontFamily: "var(--font-syne)", color: "var(--muted)", letterSpacing: "0.12em", marginBottom: "6px" }}>今月の収益</div>
          <div style={{ fontSize: "22px", fontFamily: "var(--font-syne)", fontWeight: "800", color: "var(--text)" }}>¥48,000</div>
        </div>
        <div style={{ width: "1px", height: "36px", background: "var(--border)", flexShrink: 0, margin: "0 16px" }} />
        <div style={{ textAlign: "right", flexShrink: 0 }}>
          <div style={{ fontSize: "9px", fontFamily: "var(--font-syne)", color: "var(--muted)", letterSpacing: "0.12em", marginBottom: "6px" }}>回答者の取り分</div>
          <div style={{ fontSize: "22px", fontFamily: "var(--font-syne)", fontWeight: "800", color: "#22c55e" }}>60%</div>
        </div>
      </div>
    </div>
  );
}
