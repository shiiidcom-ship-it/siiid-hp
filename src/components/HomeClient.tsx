"use client";

import { useEffect, useRef, useState } from "react";
import type { CSSProperties, PointerEvent as ReactPointerEvent } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";

const GradientSphere = dynamic(() => import("./GradientSphere"), { ssr: false });
const WebGLShaderBg = dynamic(() => import("@/components/ui/web-gl-shader").then(m => ({ default: m.WebGLShader })), { ssr: false });

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
    body: "恋愛・美容整形・ビジネス・受験——Xの界隈で「この人に聞けば間違いない」と言われるあなたの知識、1回答ごとに収益になります。",
    cta: "事前登録（無料）",
    href: "https://seebuy-lp-one.vercel.app/",
  },
];

const VALUES = [
  {
    num: "01",
    title: "発信者ファースト",
    desc: "すべての意思決定は「発信者にとって最もシンプルか」で判断します。",
  },
  {
    num: "02",
    title: "フェアな収益構造",
    desc: "不透明な手数料や隠れたコストを排除し、発信者が正しく報われる仕組みを設計します。",
  },
  {
    num: "03",
    title: "テクノロジーで摩擦をゼロに",
    desc: "「声を録る」「質問に答える」——それだけで収益が生まれる世界を技術で実現します。",
  },
] as const;

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);


/* ── split-text reveal (CSS animation) ─────────────────────── */
function SplitTextReveal({
  text,
  style,
  delay = 0,
}: {
  text: string;
  style?: CSSProperties;
  delay?: number;
}) {
  return (
    <p style={{ ...style, perspective: "800px" }}>
      {text.split("").map((char, i) => (
        <span
          key={i}
          className="split-char"
          style={{
            display: "inline-block",
            transformOrigin: "bottom center",
            opacity: 0,
            animation: `splitCharIn 0.7s cubic-bezier(0.34, 1.56, 0.64, 1) forwards`,
            animationDelay: `${delay + i * 0.04}s`,
          }}
        >
          {char === " " ? "\u00A0" : char}
        </span>
      ))}
    </p>
  );
}

function ProductHeadline({
  text,
  style,
  delayStart,
}: {
  text: string;
  style: CSSProperties;
  delayStart: number;
}) {
  return (
    <h2 style={style}>
      {text.split("\n").map((line, index) => (
        <span
          key={`${line}-${index}`}
          className="product-stagger product-headline-line"
          style={
            {
              "--stagger-delay": `${delayStart + index * 0.15}s`,
            } as CSSProperties
          }
        >
          {line}
        </span>
      ))}
    </h2>
  );
}

/* ── main component ───────────────────────────────────────── */
export function HomeClient() {
  const rootRef = useRef<HTMLDivElement>(null);
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updateMotionPreference = () => setPrefersReducedMotion(media.matches);
    updateMotionPreference();
    media.addEventListener("change", updateMotionPreference);
    return () => media.removeEventListener("change", updateMotionPreference);
  }, []);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  /* ── CSS-based scroll-triggered section reveals ── */
  useEffect(() => {
    const sections = document.querySelectorAll<HTMLElement>(".reveal-section");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            (entry.target as HTMLElement).classList.add("visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const parallaxItems = Array.from(
      root.querySelectorAll<HTMLElement>("[data-parallax-speed]")
    );
    let frame = 0;

    const updateMotion = () => {
      const scrollY = window.scrollY;
      const heroProgress = prefersReducedMotion
        ? 0
        : clamp(scrollY / (window.innerHeight * 0.62), 0, 1);
      const sphereOpacity = clamp(1 - heroProgress * 1.1, 0, 1);
      const scrollOpacity = clamp(1 - heroProgress * 1.35, 0, 1);

      setScrolled((prev) => {
        const next = scrollY > 60;
        return prev === next ? prev : next;
      });

      root.style.setProperty("--hero-sphere-scale", `${1 - heroProgress * 0.42}`);
      root.style.setProperty("--hero-sphere-opacity", `${sphereOpacity}`);
      root.style.setProperty("--hero-sphere-y", `${heroProgress * -96}px`);
      root.style.setProperty("--hero-scroll-opacity", `${scrollOpacity}`);

      if (prefersReducedMotion) {
        parallaxItems.forEach((item) => {
          item.style.setProperty("--parallax-y", "0px");
        });
        return;
      }

      const viewportCenter = window.innerHeight * 0.5;
      const mobileFactor = isMobile ? 0.55 : 1;

      parallaxItems.forEach((item) => {
        const speed = Number(item.dataset.parallaxSpeed ?? 1);
        const rect = item.getBoundingClientRect();
        const itemCenter = rect.top + rect.height * 0.5;
        const offset = (viewportCenter - itemCenter) / window.innerHeight;
        const translateY = clamp(offset * speed * 72 * mobileFactor, -36, 36);
        item.style.setProperty("--parallax-y", `${translateY.toFixed(1)}px`);
      });
    };

    const requestUpdate = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        updateMotion();
      });
    };

    updateMotion();
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);

    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
    };
  }, [isMobile, prefersReducedMotion]);

  useEffect(() => {
    const counters = document.querySelectorAll<HTMLElement>("[data-countup]");
    if (!counters.length) return;

    const animateCounter = (counter: HTMLElement) => {
      const target = Number(counter.dataset.countup ?? 0);
      if (!Number.isFinite(target)) return;

      if (prefersReducedMotion) {
        counter.textContent = String(target).padStart(2, "0");
        return;
      }

      const duration = 900;
      let startTime = 0;

      const tick = (time: number) => {
        if (!startTime) startTime = time;
        const progress = clamp((time - startTime) / duration, 0, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        const value = Math.round(target * eased);
        counter.textContent = String(value).padStart(2, "0");

        if (progress < 1) {
          window.requestAnimationFrame(tick);
        }
      };

      window.requestAnimationFrame(tick);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const counter = entry.target as HTMLElement;
          if (counter.dataset.animated === "true") return;
          counter.dataset.animated = "true";
          animateCounter(counter);
          observer.unobserve(counter);
        });
      },
      { threshold: 0.5 }
    );

    counters.forEach((counter) => observer.observe(counter));
    return () => observer.disconnect();
  }, [prefersReducedMotion]);

  const handleCtaPointerMove = (event: ReactPointerEvent<HTMLAnchorElement>) => {
    const button = event.currentTarget;
    const rect = button.getBoundingClientRect();
    button.style.setProperty("--shine-x", `${event.clientX - rect.left}px`);
    button.style.setProperty("--shine-y", `${event.clientY - rect.top}px`);
  };

  const handleCtaPointerEnter = (event: ReactPointerEvent<HTMLAnchorElement>) => {
    event.currentTarget.style.setProperty("--shine-opacity", "1");
  };

  const handleCtaPointerLeave = (event: ReactPointerEvent<HTMLAnchorElement>) => {
    event.currentTarget.style.setProperty("--shine-opacity", "0");
  };

  return (
    <div
      ref={rootRef}
      style={
        {
          position: "relative",
          "--hero-sphere-scale": 1,
          "--hero-sphere-opacity": 1,
          "--hero-sphere-y": "0px",
          "--hero-scroll-opacity": 1,
        } as CSSProperties
      }
    >
      {/* ── NAV (scroll-reactive + mobile hamburger) ─── */}
      <nav
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          background: scrolled || menuOpen ? "rgba(245,247,255,0.92)" : "transparent",
          backdropFilter: scrolled || menuOpen ? "blur(18px) saturate(1.5)" : "none",
          WebkitBackdropFilter: scrolled || menuOpen ? "blur(18px) saturate(1.5)" : "none",
          borderBottom: scrolled || menuOpen ? "1px solid var(--border)" : "1px solid transparent",
          transition: "background 0.45s cubic-bezier(0.16,1,0.3,1), border-color 0.45s",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px clamp(20px, 5vw, 48px)", height: "56px" }}>
          {/* desktop links */}
          <div className="desktop-nav" style={{ display: "flex", gap: "32px" }}>
            {[
              { label: "KoePass", href: "/koepass" },
              { label: "Seebuy", href: "https://seebuy-lp-one.vercel.app/" },
              { label: "会社について", href: "#about" },
            ].map((item) => (
              <Link key={item.label} href={item.href} style={{ fontSize: "12px", fontFamily: "var(--font-sans)", letterSpacing: "0.12em", color: "rgba(14,22,49,0.5)", textDecoration: "none", transition: "color 0.3s" }} className="nav-link">
                {item.label}
              </Link>
            ))}
          </div>

          {/* mobile hamburger */}
          <button
            className="mobile-menu-btn"
            onClick={() => setMenuOpen(!menuOpen)}
            style={{ background: "none", border: "none", cursor: "pointer", padding: "8px", display: "none", flexDirection: "column", gap: "5px" }}
            aria-label="メニュー"
          >
            {[0, 1, 2].map((i) => (
              <span key={i} style={{ display: "block", width: "20px", height: "2px", background: "var(--text)", borderRadius: "1px", transition: "all 0.3s", transform: menuOpen && i === 0 ? "rotate(45deg) translate(5px, 5px)" : menuOpen && i === 2 ? "rotate(-45deg) translate(5px, -5px)" : "none", opacity: menuOpen && i === 1 ? 0 : 1 }} />
            ))}
          </button>
        </div>

        {/* mobile dropdown */}
        {menuOpen && (
          <div style={{ padding: "0 clamp(20px, 5vw, 48px) 16px", borderTop: "1px solid var(--border)" }}>
            {[
              { label: "KoePass", href: "/koepass", color: "#e8458c" },
              { label: "Seebuy", href: "https://seebuy-lp-one.vercel.app/", color: "#16a34a" },
              { label: "会社について", href: "#about", color: "var(--text)" },
            ].map((item) => (
              <Link key={item.href} href={item.href} onClick={() => setMenuOpen(false)} style={{ display: "block", padding: "12px 0", color: item.color, textDecoration: "none", fontSize: "14px", fontFamily: "var(--font-sans)", fontWeight: "500", borderBottom: "1px solid var(--border)" }}>
                {item.label}
              </Link>
            ))}
          </div>
        )}
      </nav>

      {/* ── HERO ─────────────────────────────────────────── */}
      <section
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
        {/* WebGL shader background */}
        <div style={{ position: "absolute", inset: 0, zIndex: 0, opacity: 0.35 }}>
          <WebGLShaderBg />
        </div>

        {/* Three.js sphere (hidden on mobile for perf) */}
        <div className="sphere-wrapper">
          <GradientSphere />
        </div>

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
          className="scroll-indicator"
          style={{
            position: "absolute",
            bottom: "40px",
            left: "50%",
            transform: "translateX(-50%)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "8px",
            opacity: "var(--hero-scroll-opacity)",
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
          className="reveal-section product-section"
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
              className="product-stagger"
              style={{
                fontFamily: "var(--font-mincho)",
                fontSize: "clamp(28px, 4vw, 52px)",
                fontWeight: "800",
                letterSpacing: "-0.02em",
                color: p.light,
                margin: "0 0 12px",
                lineHeight: "1",
                viewTransitionName: `${p.id}-hero`,
                "--stagger-delay": "0s",
              } as CSSProperties}
            >
              {p.name}
            </p>

            <p
              className="product-stagger"
              style={{
                fontFamily: "var(--font-syne)",
                fontSize: "10px",
                letterSpacing: "0.28em",
                color: p.accent,
                textTransform: "uppercase",
                marginBottom: "24px",
                opacity: 0.9,
                "--stagger-delay": "0.15s",
              } as CSSProperties}
            >
              {p.tagline}
            </p>

            <ProductHeadline
              text={p.headline}
              delayStart={0.3}
              style={{
                fontFamily: "var(--font-mincho)",
                fontSize: p.headlineSize ?? "clamp(32px, 5vw, 72px)",
                fontWeight: "800",
                color: "var(--text)",
                lineHeight: "1.25",
                letterSpacing: "-0.01em",
                margin: "0 0 32px",
              }}
            />

            <p
              className="product-stagger"
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "clamp(13px, 1.5vw, 16px)",
                fontWeight: "300",
                color: "var(--muted)",
                lineHeight: "2",
                margin: "0 0 48px",
                maxWidth: "460px",
                "--stagger-delay": `${0.3 + p.headline.split("\n").length * 0.15}s`,
              } as CSSProperties}
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
                "--stagger-delay": `${0.45 + p.headline.split("\n").length * 0.15}s`,
              } as CSSProperties}
              className={`cta-btn product-stagger cta-btn-${p.id}`}
              onPointerMove={handleCtaPointerMove}
              onPointerEnter={handleCtaPointerEnter}
              onPointerLeave={handleCtaPointerLeave}
            >
              <span className="cta-btn-shine" aria-hidden="true" />
              <span style={{ position: "relative", zIndex: 1 }}>{p.cta}</span>
              <span style={{ fontFamily: "monospace", position: "relative", zIndex: 1 }}>→</span>
            </Link>
          </div>

          {/* visual */}
          <div
            className="section-visual product-visual-shell"
            style={{
              flex: "0 0 clamp(260px, 40%, 520px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div
              className="product-visual-inner"
              data-parallax-speed={idx % 2 === 0 ? "0.9" : "1.2"}
            >
              {p.id === "koepass" ? <KoePassVisual /> : <SeebuyVisual />}
            </div>
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
          {VALUES.map((v) => (
            <div key={v.num} style={{ padding: "32px 0", borderTop: "1px solid var(--border)" }}>
              <span
                className="value-count"
                data-countup={Number(v.num)}
                aria-label={v.num}
                style={{
                  fontFamily: "var(--font-syne)",
                  fontSize: "12px",
                  color: "var(--blue)",
                  letterSpacing: "0.1em",
                  fontWeight: "700",
                }}
              >
                00
              </span>
              <h3 style={{ fontFamily: "var(--font-mincho)", fontSize: "20px", fontWeight: "700", color: "var(--text)", margin: "16px 0 12px", lineHeight: "1.4" }}>{v.title}</h3>
              <p style={{ fontFamily: "var(--font-sans)", fontSize: "13px", color: "var(--muted)", lineHeight: "1.9", margin: 0, fontWeight: "300" }}>{v.desc}</p>
            </div>
          ))}
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
        .cta-btn-koepass:hover { background: rgba(232,69,140,0.08) !important; }
        .cta-btn-seebuy:hover  { background: rgba(22,163,74,0.08)  !important; }
        .sphere-wrapper {
          transform: translate3d(0, var(--hero-sphere-y), 0) scale(var(--hero-sphere-scale));
          transform-origin: center center;
          opacity: var(--hero-sphere-opacity);
          transition: opacity 0.24s linear;
          will-change: transform, opacity;
        }
        .scroll-indicator {
          transition: opacity 0.2s linear;
        }

        /* ── Desktop ── */
        @media (min-width: 769px) {
          .mobile-menu-btn { display: none !important; }
          .desktop-nav { display: flex !important; }
        }

        /* ── Mobile ── */
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .mobile-menu-btn { display: flex !important; }

          /* Sphere hidden on mobile for performance */
          .sphere-wrapper { display: none !important; }

          /* Product sections: stack vertically */
          .reveal-section { flex-direction: column !important; gap: 32px !important; padding: 60px 20px !important; min-height: auto !important; }
          .section-visual { flex: none !important; width: 100% !important; max-width: 300px !important; margin: 0 auto; }
          .product-headline-line { white-space: normal !important; }

          /* Values grid */
          .values-grid { grid-template-columns: 1fr !important; }

          /* Hero adjustments */
          .hero-content { padding: 0 16px !important; }
        }

        @media (prefers-reduced-motion: reduce) {
          .split-char { opacity: 1 !important; animation: none !important; }
          .sphere-wrapper { transform: none !important; opacity: 1 !important; transition: none !important; }
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
  return (
    <div style={{ width: "280px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "24px", overflow: "hidden", boxShadow: "0 24px 64px rgba(14,22,49,0.10), 0 4px 16px rgba(14,22,49,0.06)" }}>
      {/* app bar */}
      <div style={{ background: "#16a34a", padding: "10px 20px 8px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontFamily: "var(--font-syne)", fontSize: "11px", fontWeight: "700", color: "white", letterSpacing: "0.08em" }}>Seebuy</span>
        <span style={{ fontSize: "9px", color: "rgba(255,255,255,0.85)", fontFamily: "var(--font-sans)" }}>Q&A</span>
      </div>

      {/* notification */}
      <div style={{ padding: "14px 20px", borderBottom: "1px solid var(--border)", background: "rgba(22,163,74,0.04)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
          <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#22c55e" }} />
          <span style={{ fontSize: "10px", fontFamily: "var(--font-sans)", fontWeight: "500", color: "var(--text)" }}>新しい質問が届きました</span>
        </div>
        <p style={{ fontFamily: "var(--font-sans)", fontSize: "11px", color: "var(--muted)", lineHeight: "1.6", margin: 0, paddingLeft: "14px" }}>
          「転職のタイミング、どう見極めましたか？」
        </p>
      </div>

      {/* answer flow */}
      <div style={{ padding: "16px 20px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "14px" }}>
          <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "linear-gradient(135deg, #16a34a, #22c55e)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: "700", color: "white", fontFamily: "var(--font-syne)", flexShrink: 0 }}>Y</div>
          <div>
            <div style={{ fontFamily: "var(--font-sans)", fontSize: "12px", fontWeight: "500", color: "var(--text)" }}>あなた</div>
            <div style={{ fontFamily: "var(--font-sans)", fontSize: "9px", color: "var(--muted)" }}>回答者</div>
          </div>
          <div style={{ marginLeft: "auto", fontSize: "9px", fontFamily: "var(--font-syne)", color: "#16a34a", letterSpacing: "0.08em", border: "1px solid rgba(22,163,74,0.3)", padding: "3px 8px", borderRadius: "20px" }}>EXPERT</div>
        </div>

        {/* typing indicator */}
        <div style={{ background: "rgba(22,163,74,0.06)", border: "1px solid rgba(22,163,74,0.12)", borderRadius: "14px", padding: "12px 16px", marginBottom: "12px" }}>
          <p style={{ fontFamily: "var(--font-sans)", fontSize: "11px", color: "var(--text)", lineHeight: "1.7", margin: "0 0 4px", fontWeight: "300" }}>
            結論から言うと、現職で学ぶべきことが無くなったと感じた瞬間です。市場価値は…
          </p>
          <span style={{ fontSize: "9px", fontFamily: "var(--font-sans)", color: "var(--muted)" }}>入力中...</span>
        </div>

        {/* send button */}
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", background: "linear-gradient(135deg, #16a34a, #22c55e)", borderRadius: "20px", padding: "8px 18px", boxShadow: "0 4px 12px rgba(22,163,74,0.25)" }}>
            <span style={{ fontSize: "11px", fontFamily: "var(--font-syne)", fontWeight: "700", color: "white", letterSpacing: "0.06em" }}>回答を送信</span>
          </div>
        </div>
      </div>

      {/* earnings bar */}
      <div style={{ padding: "10px 20px 14px", borderTop: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: "9px", fontFamily: "var(--font-sans)", color: "var(--muted)" }}>この回答の報酬</span>
        <span style={{ fontSize: "13px", fontFamily: "var(--font-syne)", fontWeight: "800", color: "#16a34a" }}>¥3,000</span>
      </div>
    </div>
  );
}
