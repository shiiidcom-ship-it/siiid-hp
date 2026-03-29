import type { Metadata } from "next";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import StickyNav from "@/components/StickyNav";
import { sh, SectionLabel, StepCard, FeatureCard, FaqItem } from "@/components/PageBlocks";

export const metadata: Metadata = {
  title: "KoePass — メイクなし。準備なし。声だけで交流。",
  description:
    "ボイスメッセージ特化プラットフォーム。インスタライブより気軽に、ファンとつながれる。クリエイターはスマホを開いて話すだけ。",
};

const ACCENT = "#e8458c";
const LIGHT = "#f472b6";
const GLOW = "rgba(232,69,140,0.25)";

export default function KoePassPage() {
  return (
    <>
      <SiteHeader variant="koepass" />

      <main>
        {/* ─── HERO ──────────────────────────────── */}
        <section
          style={{
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
            overflow: "hidden",
            padding: "120px 24px 80px",
            textAlign: "center",
          }}
        >
          <div
            aria-hidden
            style={{
              position: "absolute",
              inset: 0,
              background: `
                radial-gradient(ellipse 70% 60% at 50% 40%, rgba(232,69,140,0.15) 0%, transparent 60%),
                radial-gradient(ellipse 40% 30% at 80% 80%, rgba(244,114,182,0.08) 0%, transparent 50%)
              `,
            }}
          />

          {/* Animated rings */}
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              aria-hidden
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                width: `${200 + i * 120}px`,
                height: `${200 + i * 120}px`,
                borderRadius: "50%",
                border: `1px solid rgba(232,69,140,${0.15 - i * 0.04})`,
                animation: `pulse-glow ${2 + i * 0.5}s ease-in-out infinite ${i * 0.3}s`,
                pointerEvents: "none",
              }}
            />
          ))}

          <div style={{ position: "relative", zIndex: 1, maxWidth: "700px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "32px",
              }}
            >
              <div
                style={{
                  width: "56px",
                  height: "56px",
                  background: `linear-gradient(135deg, ${ACCENT}, ${LIGHT})`,
                  borderRadius: "16px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "26px",
                  boxShadow: `0 0 30px ${GLOW}`,
                }}
              >
                🎙
              </div>
            </div>

            <h1
              style={{
                fontFamily: "'Shippori Mincho B1', serif",
                fontSize: "clamp(56px, 10vw, 112px)",
                fontWeight: "800",
                letterSpacing: "-0.03em",
                margin: "0 0 8px",
                background: `linear-gradient(135deg, ${ACCENT}, ${LIGHT}, #c084fc)`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                viewTransitionName: "koepass-hero",
              } as React.CSSProperties}
            >
              KoePass
            </h1>

            <p
              style={{
                fontSize: "13px",
                color: LIGHT,
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                fontFamily: "'Noto Sans JP', sans-serif",
                marginBottom: "40px",
                opacity: 0.7,
              }}
            >
              Voice Message Platform
            </p>

            {/* Wave visual */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "5px",
                height: "56px",
                marginBottom: "48px",
              }}
            >
              {Array.from({ length: 16 }).map((_, i) => (
                <div
                  key={i}
                  className="wave-bar"
                  style={{
                    width: "5px",
                    height: "100%",
                    background: `linear-gradient(to top, ${ACCENT}, ${LIGHT})`,
                    borderRadius: "3px",
                    transformOrigin: "center",
                    opacity: 0.5 + (i % 4) * 0.15,
                  }}
                />
              ))}
            </div>

            <h2
              style={{
                fontFamily: "'Shippori Mincho B1', serif",
                fontSize: "clamp(22px, 3.5vw, 36px)",
                fontWeight: "700",
                color: "var(--text)",
                margin: "0 0 20px",
                lineHeight: "1.4",
              }}
            >
              メイクなし。準備なし。声だけで交流。
            </h2>

            <p
              style={{
                fontFamily: "'Noto Sans JP', sans-serif",
                fontSize: "clamp(14px, 1.8vw, 16px)",
                color: "var(--muted)",
                lineHeight: "2",
                margin: "0 0 48px",
                fontWeight: "300",
              }}
            >
              インスタライブより気軽に、ファンとつながれる。クリエイターはスマホを開いて話すだけ。ファンには自分だけへの声が届く。
            </p>

            <a
              href="#howto"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "15px 36px",
                background: `linear-gradient(135deg, ${ACCENT}, ${LIGHT})`,
                borderRadius: "50px",
                color: "white",
                textDecoration: "none",
                fontSize: "14px",
                fontFamily: "'Noto Sans JP', sans-serif",
                fontWeight: "500",
                letterSpacing: "0.05em",
                boxShadow: `0 0 40px ${GLOW}`,
              }}
            >
              無料で始める
            </a>
          </div>
        </section>

        <StickyNav
          items={[
            { id: "howto", label: "使い方" },
            { id: "features", label: "機能" },
            { id: "creators", label: "クリエイター" },
            { id: "pricing", label: "料金" },
            { id: "faq", label: "FAQ" },
          ]}
          accent={LIGHT}
        />

        {/* ─── 使い方 ─────────────────────────────── */}
        <section id="howto" style={{ padding: "100px 24px", maxWidth: "1100px", margin: "0 auto" }}>
          <SectionLabel text="使い方" color={LIGHT} />
          <h2 style={sh}>3ステップで始められる</h2>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "24px" }} className="three-col">
            {[
              { step: "01", title: "アカウント登録", desc: "メールアドレスだけで完了。SNSアカウント連携も可能。数分で始められます。", icon: "👤" },
              { step: "02", title: "録音 & 送信", desc: "スマホのマイクで話すだけ。編集不要。そのままファンに届けられます。", icon: "🎙" },
              { step: "03", title: "ファンに届く", desc: "登録したファンのもとへ、あなたの声が届きます。特別なつながりの始まり。", icon: "💌" },
            ].map((item) => (
              <StepCard key={item.step} {...item} light={LIGHT} />
            ))}
          </div>
        </section>

        {/* ─── 機能 ──────────────────────────────── */}
        <section
          id="features"
          style={{ padding: "100px 24px", background: "rgba(232,69,140,0.04)", borderTop: "1px solid rgba(232,69,140,0.1)", borderBottom: "1px solid rgba(232,69,140,0.1)" }}
        >
          <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
            <SectionLabel text="機能" color={LIGHT} />
            <h2 style={sh}>KoePassができること</h2>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: "20px" }} className="two-col">
              {[
                { icon: "🎙", title: "ブラウザ録音、アプリ不要", desc: "ブラウザから直接録音して送信。アプリのインストール不要でスマホだけで完結。" },
                { icon: "💰", title: "業界最高水準 85%ペイアウト", desc: "プラットフォーム手数料はわずか15%。クリエイターの収益を最大化する設計。" },
                { icon: "🛡", title: "承認制・全額返金保証", desc: "クリエイターがリクエストを確認・承認してから課金。ペナルティなしで拒否も可能。" },
                { icon: "⏱", title: "最速72時間配信", desc: "承認から最大72時間以内に音声を届ける。ファンの熱量が冷める前に。" },
                { icon: "🔒", title: "ストリーミング限定再生", desc: "音声のダウンロード不可。クリエイターのコンテンツを無断転載から守る。" },
                { icon: "📅", title: "月次自動振込", desc: "収益は月次で自動振り込み。振込最低額¥1,000。面倒な手続きは一切なし。" },
              ].map((item) => (
                <FeatureCard key={item.title} {...item} accent={ACCENT} />
              ))}
            </div>
          </div>
        </section>

        {/* ─── クリエイター ──────────────────────── */}
        <section id="creators" style={{ padding: "100px 24px", maxWidth: "1100px", margin: "0 auto" }}>
          <SectionLabel text="クリエイター" color={LIGHT} />
          <h2 style={sh}>こんな方に使ってほしい</h2>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "20px" }} className="three-col">
            {[
              { icon: "🎤", type: "歌い手・声優", desc: "声が武器のあなたに最適。カバー曲の制作秘話や日常のつぶやきを声で届けよう。" },
              { icon: "📸", type: "インフルエンサー", desc: "テキストや画像では伝わらない温度感を。声でもっとファンと近づこう。" },
              { icon: "🎮", type: "ゲーム実況者", desc: "配信の裏話や感謝の気持ちをファンへ届ける新しい手段として。" },
              { icon: "✍️", type: "作家・ライター", desc: "文章だけじゃ伝わらない熱量を声で補おう。朗読や創作秘話も人気コンテンツ。" },
              { icon: "🎨", type: "イラストレーター", desc: "作品への思いや制作過程を声で語る。ファンとのつながりが深まる。" },
              { icon: "💄", type: "美容・ライフスタイル", desc: "おすすめアイテムの使い心地や日常のTipsを気軽に発信しよう。" },
            ].map((item) => (
              <CreatorCard key={item.type} {...item} light={LIGHT} />
            ))}
          </div>
        </section>

        {/* ─── 料金 ──────────────────────────────── */}
        <section
          id="pricing"
          style={{ padding: "100px 24px", background: "rgba(232,69,140,0.04)", borderTop: "1px solid rgba(232,69,140,0.1)", borderBottom: "1px solid rgba(232,69,140,0.1)" }}
        >
          <div style={{ maxWidth: "900px", margin: "0 auto", textAlign: "center" }}>
            <SectionLabel text="料金" color={LIGHT} />
            <h2 style={sh}>シンプルな料金体系</h2>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", textAlign: "left" }} className="two-col">
              <PricingCard
                plan="ファン"
                price="¥0〜"
                desc="クリエイターへのリクエスト料金のみ"
                features={[
                  "クリエイターへのボイスリクエスト送信",
                  "金額・トピックを自分で指定",
                  "72時間以内に専用音声が届く",
                  "ストリーミングで無制限再生",
                  "全額返金保証（未承認の場合）",
                ]}
                accent={ACCENT}
                light={LIGHT}
                highlighted={false}
              />
              <PricingCard
                plan="クリエイター"
                price="15%"
                unit="手数料のみ"
                desc="登録無料。クリエイター審査あり。"
                features={[
                  "手数料は売上の 15%のみ（決済手数料込み）",
                  "それ以外の費用はゼロ",
                  "売上の 85% がクリエイターの手取り",
                  "ブラウザ録音・アプリ不要",
                  "リクエストの承認・拒否が自由",
                  "月次自動振り込み",
                  "ペナルティなしで拒否可能",
                ]}
                accent={ACCENT}
                light={LIGHT}
                highlighted
              />
            </div>
            <p style={{ marginTop: "32px", color: "var(--muted)", fontSize: "13px", fontFamily: "'Noto Sans JP', sans-serif" }}>
              ※ 料金は変更される場合があります。最新情報はアプリ内でご確認ください。
            </p>
          </div>
        </section>

        {/* ─── FAQ ───────────────────────────────── */}
        <section id="faq" style={{ padding: "100px 24px", maxWidth: "800px", margin: "0 auto" }}>
          <SectionLabel text="FAQ" color={LIGHT} />
          <h2 style={sh}>よくある質問</h2>

          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {[
              { q: "専用アプリのインストールは必要ですか？", a: "不要です。ブラウザベースで動作するため、スマホのブラウザから直接録音・再生できます。" },
              { q: "クリエイター登録に審査はありますか？", a: "はい、クリエイター登録には審査があります。ファンとして利用する場合は審査なしで即日開始できます。" },
              { q: "リクエストを断ることはできますか？", a: "できます。クリエイターはペナルティなしでリクエストを拒否できます。断った場合、ファンへ全額返金されます。" },
              { q: "音声をダウンロードされる心配はありますか？", a: "音声はストリーミング限定で配信されます。ダウンロード機能はなく、コンテンツを無断転載から守ります。" },
              { q: "収益の振り込みはいつですか？", a: "月次で自動振り込みを行います。最低振り込み額は¥1,000からです。" },
              { q: "禁止コンテンツはありますか？", a: "性的なコンテンツ・誹謗中傷・違法なコンテンツは禁止です。詳細は利用規約をご確認ください。" },
            ].map((item) => (
              <FaqItem key={item.q} question={item.q} answer={item.a} accent={LIGHT} />
            ))}
          </div>
        </section>

        {/* ─── CTA ───────────────────────────────── */}
        <section
          style={{ padding: "100px 24px", textAlign: "center", background: `linear-gradient(135deg, rgba(232,69,140,0.12) 0%, rgba(244,114,182,0.06) 100%)`, borderTop: "1px solid rgba(232,69,140,0.15)" }}
        >
          <div style={{ maxWidth: "560px", margin: "0 auto" }}>
            <h2
              style={{ fontFamily: "'Shippori Mincho B1', serif", fontSize: "clamp(28px, 4vw, 44px)", fontWeight: "800", color: "var(--text)", margin: "0 0 20px", lineHeight: "1.3" }}
            >
              今すぐ、声でファンとつながろう。
            </h2>
            <p style={{ color: "var(--muted)", fontSize: "14px", fontFamily: "'Noto Sans JP', sans-serif", marginBottom: "36px", lineHeight: "1.8" }}>
              メイクなし。準備なし。スマホを開いて話すだけ。
            </p>
            <a
              href="#"
              style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "16px 40px", background: `linear-gradient(135deg, ${ACCENT}, ${LIGHT})`, borderRadius: "50px", color: "white", textDecoration: "none", fontSize: "15px", fontFamily: "'Noto Sans JP', sans-serif", fontWeight: "500", letterSpacing: "0.05em", boxShadow: `0 0 50px ${GLOW}` }}
            >
              無料で始める
            </a>
          </div>
        </section>
      </main>

      <SiteFooter />

      <style>{`
        @media (max-width: 768px) {
          .three-col { grid-template-columns: 1fr !important; }
          .two-col { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </>
  );
}

/* ── sub-components ── */

function CreatorCard({ icon, type, desc, light }: { icon: string; type: string; desc: string; light: string }) {
  return (
    <div style={{ background: "var(--surface)", border: "1px solid rgba(14,22,49,0.07)", borderRadius: "16px", padding: "24px" }}>
      <div style={{ fontSize: "28px", marginBottom: "12px" }}>{icon}</div>
      <h3 style={{ fontFamily: "'Noto Sans JP', sans-serif", fontSize: "15px", fontWeight: "700", color: light, margin: "0 0 10px" }}>{type}</h3>
      <p style={{ fontFamily: "'Noto Sans JP', sans-serif", fontSize: "13px", color: "var(--muted)", lineHeight: "1.7", margin: 0, fontWeight: "300" }}>{desc}</p>
    </div>
  );
}

function PricingCard({ plan, price, unit = "", desc, features, accent, light, highlighted }: { plan: string; price: string; unit?: string; desc: string; features: string[]; accent: string; light: string; highlighted: boolean }) {
  return (
    <div style={{ background: highlighted ? `linear-gradient(135deg, rgba(232,69,140,0.15) 0%, rgba(244,114,182,0.08) 100%)` : "var(--surface)", border: highlighted ? `1px solid ${accent}60` : "1px solid rgba(14,22,49,0.07)", borderRadius: "20px", padding: "32px", position: "relative" }}>
      {highlighted && (
        <div style={{ position: "absolute", top: "-12px", left: "50%", transform: "translateX(-50%)", background: `linear-gradient(135deg, ${accent}, ${light})`, borderRadius: "20px", padding: "4px 16px", fontSize: "11px", color: "white", fontFamily: "'Noto Sans JP', sans-serif", fontWeight: "500", letterSpacing: "0.1em", whiteSpace: "nowrap" }}>おすすめ</div>
      )}
      <h3 style={{ fontFamily: "'Noto Sans JP', sans-serif", fontSize: "14px", color: highlighted ? light : "var(--muted)", letterSpacing: "0.15em", margin: "0 0 16px", fontWeight: "500" }}>{plan}</h3>
      <div style={{ display: "flex", alignItems: "baseline", gap: "4px", marginBottom: "8px" }}>
        <span style={{ fontFamily: "'Shippori Mincho B1', serif", fontSize: "40px", fontWeight: "800", color: "var(--text)" }}>{price}</span>
        {unit && <span style={{ fontSize: "14px", color: "var(--muted)", fontFamily: "'Noto Sans JP', sans-serif" }}>{unit}</span>}
      </div>
      <p style={{ fontSize: "13px", color: "var(--muted)", fontFamily: "'Noto Sans JP', sans-serif", marginBottom: "24px" }}>{desc}</p>
      <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "10px" }}>
        {features.map((f) => (
          <li key={f} style={{ display: "flex", alignItems: "flex-start", gap: "8px", fontSize: "13px", color: "var(--muted)", fontFamily: "'Noto Sans JP', sans-serif", fontWeight: "300" }}>
            <span style={{ color: highlighted ? light : "var(--muted)", flexShrink: 0, marginTop: "2px" }}>✓</span>
            {f}
          </li>
        ))}
      </ul>
    </div>
  );
}

