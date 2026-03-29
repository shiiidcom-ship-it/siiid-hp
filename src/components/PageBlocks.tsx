import React from "react";

/** Shared section-heading style used across product pages */
export const sh: React.CSSProperties = {
  fontFamily: "'Shippori Mincho B1', serif",
  fontSize: "clamp(24px, 3.5vw, 38px)",
  fontWeight: "700",
  color: "var(--text)",
  margin: "0 0 48px",
  lineHeight: "1.3",
};

export function SectionLabel({ text, color }: { text: string; color: string }) {
  return (
    <p style={{ fontSize: "11px", color, letterSpacing: "0.2em", textTransform: "uppercase", fontFamily: "'Noto Sans JP', sans-serif", marginBottom: "12px", opacity: 0.7 }}>
      {text}
    </p>
  );
}

export function StepCard({ step, title, desc, icon, light }: { step: string; title: string; desc: string; icon: string; light: string }) {
  return (
    <div style={{ background: "var(--surface)", border: "1px solid rgba(14,22,49,0.07)", borderRadius: "20px", padding: "32px" }}>
      <div style={{ fontSize: "11px", color: light, letterSpacing: "0.2em", fontFamily: "'Noto Sans JP', sans-serif", marginBottom: "16px", opacity: 0.6 }}>STEP {step}</div>
      <div style={{ fontSize: "32px", marginBottom: "16px" }}>{icon}</div>
      <h3 style={{ fontFamily: "'Shippori Mincho B1', serif", fontSize: "20px", fontWeight: "700", color: "var(--text)", margin: "0 0 12px" }}>{title}</h3>
      <p style={{ fontFamily: "'Noto Sans JP', sans-serif", fontSize: "13px", color: "var(--muted)", lineHeight: "1.8", margin: 0, fontWeight: "300" }}>{desc}</p>
    </div>
  );
}

export function FeatureCard({ icon, title, desc, accent }: { icon: string; title: string; desc: string; accent: string }) {
  return (
    <div style={{ display: "flex", gap: "16px", background: "var(--surface)", border: "1px solid rgba(14,22,49,0.06)", borderRadius: "16px", padding: "24px" }}>
      <span style={{ fontSize: "24px", flexShrink: 0, width: "44px", height: "44px", background: `${accent}20`, borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center" }}>{icon}</span>
      <div>
        <h3 style={{ fontFamily: "'Noto Sans JP', sans-serif", fontSize: "15px", fontWeight: "700", color: "var(--text)", margin: "0 0 8px" }}>{title}</h3>
        <p style={{ fontFamily: "'Noto Sans JP', sans-serif", fontSize: "13px", color: "var(--muted)", lineHeight: "1.7", margin: 0, fontWeight: "300" }}>{desc}</p>
      </div>
    </div>
  );
}

export function FaqItem({ question, answer, accent }: { question: string; answer: string; accent: string }) {
  return (
    <details style={{ background: "var(--surface)", border: "1px solid rgba(14,22,49,0.07)", borderRadius: "16px", cursor: "pointer" }}>
      <summary style={{ padding: "20px 24px", fontFamily: "'Noto Sans JP', sans-serif", fontSize: "14px", fontWeight: "500", color: "var(--text)", listStyle: "none", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px" }}>
        {question}
        <span style={{ color: accent, flexShrink: 0, fontSize: "18px", lineHeight: 1 }}>+</span>
      </summary>
      <div style={{ padding: "16px 24px 20px", fontFamily: "'Noto Sans JP', sans-serif", fontSize: "13px", color: "var(--muted)", lineHeight: "1.8", fontWeight: "300", borderTop: "1px solid rgba(14,22,49,0.04)" }}>
        {answer}
      </div>
    </details>
  );
}
