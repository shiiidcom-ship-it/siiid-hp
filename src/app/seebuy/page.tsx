import type { Metadata } from "next";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import StickyNav from "@/components/StickyNav";
import { sh, SectionLabel, StepCard, FeatureCard, FaqItem } from "@/components/PageBlocks";

export const metadata: Metadata = {
  title: "Seebuy — フォロワーの「教えてください」に、値段がつく。",
  description:
    "有料Q&Aプラットフォーム。恋愛・美容整形・ビジネス・受験など、あなたの知識が1回答ごとに収益になります。",
};

const ACCENT = "#16a34a";
const LIGHT = "#22c55e";
const GLOW = "rgba(22,163,74,0.25)";

export default function SeebuyPage() {
  return (
    <>
      <SiteHeader variant="seebuy" />

      <main>
        {/* ─── HERO ──────────────────────────────── */}
        <section
          style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden", padding: "120px 24px 80px", textAlign: "center" }}
        >
          <div
            aria-hidden
            style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse 70% 60% at 50% 40%, rgba(22,163,74,0.15) 0%, transparent 60%), radial-gradient(ellipse 40% 30% at 20% 80%, rgba(34,197,94,0.08) 0%, transparent 50%)` }}
          />

          {/* Floating value badges */}
          {[
            { top: "25%", left: "15%", label: "¥1,000", delay: "0s" },
            { top: "35%", right: "12%", label: "¥5,000", delay: "0.8s" },
            { top: "65%", left: "8%", label: "¥500", delay: "1.6s" },
            { top: "60%", right: "18%", label: "¥2,000", delay: "0.4s" },
          ].map((coin, i) => (
            <div
              key={i}
              aria-hidden
              style={{ position: "absolute", top: coin.top, left: (coin as { left?: string }).left, right: (coin as { right?: string }).right, background: `${ACCENT}20`, border: `1px solid ${ACCENT}40`, borderRadius: "20px", padding: "6px 14px", fontSize: "12px", color: LIGHT, fontFamily: "'Noto Sans JP', sans-serif", fontWeight: "700", animation: `float ${4 + i * 0.5}s ease-in-out infinite ${coin.delay}`, pointerEvents: "none", opacity: 0.6 }}
            >
              {coin.label}
            </div>
          ))}

          <div style={{ position: "relative", zIndex: 1, maxWidth: "720px" }}>
            <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: "56px", height: "56px", background: `linear-gradient(135deg, ${ACCENT}, ${LIGHT})`, borderRadius: "16px", fontSize: "26px", marginBottom: "32px", boxShadow: `0 0 30px ${GLOW}` }}>
              💡
            </div>

            <h1 style={{ fontFamily: "'Shippori Mincho B1', serif", fontSize: "clamp(56px, 10vw, 112px)", fontWeight: "800", letterSpacing: "-0.03em", margin: "0 0 8px", background: `linear-gradient(135deg, ${ACCENT}, ${LIGHT}, #bbf7d0)`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", viewTransitionName: "seebuy-hero" } as React.CSSProperties}>
              Seebuy
            </h1>

            <p style={{ fontSize: "13px", color: LIGHT, letterSpacing: "0.2em", textTransform: "uppercase", fontFamily: "'Noto Sans JP', sans-serif", marginBottom: "48px", opacity: 0.7 }}>
              Paid Q&amp;A Platform
            </p>

            <h2 style={{ fontFamily: "'Shippori Mincho B1', serif", fontSize: "clamp(22px, 3.5vw, 38px)", fontWeight: "700", color: "var(--text)", margin: "0 0 20px", lineHeight: "1.4", textWrap: "pretty" } as React.CSSProperties}>
              フォロワーの質問に、<br />値段をつけよう。
            </h2>

            <p style={{ fontFamily: "'Noto Sans JP', sans-serif", fontSize: "clamp(14px, 1.8vw, 16px)", color: "var(--muted)", lineHeight: "2", margin: "0 0 48px", fontWeight: "300" }}>
              恋愛・美容整形・ビジネス・受験——Xの界隈で「この人に聞けば間違いない」と言われるあなたの知識、1回答ごとに収益になります。
            </p>

            <a href="#register" style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "15px 36px", background: `linear-gradient(135deg, ${ACCENT}, ${LIGHT})`, borderRadius: "50px", color: "white", textDecoration: "none", fontSize: "14px", fontFamily: "'Noto Sans JP', sans-serif", fontWeight: "500", letterSpacing: "0.05em", boxShadow: `0 0 40px ${GLOW}` }}>
              事前登録（無料）
            </a>
          </div>
        </section>

        <StickyNav
          items={[
            { id: "about", label: "Seebuyとは？" },
            { id: "features", label: "できること" },
            { id: "howto", label: "使い方" },
            { id: "revenue", label: "収益モデル" },
            { id: "faq", label: "FAQ" },
          ]}
          accent={LIGHT}
        />

        {/* ─── とは？ ─────────────────────────────── */}
        <section id="about" style={{ padding: "100px 24px", maxWidth: "1100px", margin: "0 auto" }}>
          <SectionLabel text="Seebuyとは？" color={LIGHT} />
          <h2 style={sh}>知識を持つ人が、正当に報われる世界へ。</h2>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "40px", alignItems: "center" }} className="two-col">
            <div>
              <p style={{ fontFamily: "'Noto Sans JP', sans-serif", fontSize: "15px", color: "var(--muted)", lineHeight: "2.2", fontWeight: "300", marginBottom: "24px" }}>
                SNSには、膨大な「教えてください」があふれています。
                でも、その質問に答えるのはいつも無償。

                Seebuyは、あなたの知識に適正な価格をつけるプラットフォームです。
                フォロワーはあなたに質問を送り、あなたはそれに答えることで収益を得られます。
              </p>
              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                {["恋愛", "美容整形", "ビジネス", "受験", "筋トレ", "転職", "脱毛", "副業", "プログラミング", "投資", "ダイエット", "留学"].map((tag) => (
                  <span key={tag} style={{ background: `${ACCENT}20`, border: `1px solid ${ACCENT}40`, borderRadius: "20px", padding: "5px 12px", fontSize: "12px", color: LIGHT, fontFamily: "'Noto Sans JP', sans-serif" }}>{tag}</span>
                ))}
              </div>
            </div>

            {/* Mock chat visual */}
            <div style={{ background: "rgba(22,163,74,0.06)", border: "1px solid rgba(22,163,74,0.15)", borderRadius: "24px", padding: "32px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {[
                  { from: "フォロワー", msg: "整形どこでやったか教えてください！", type: "q" },
                  { from: "あなた", msg: "答えました ✓  +¥1,500", type: "a" },
                  { from: "フォロワー", msg: "転職活動のコツを教えてほしいです", type: "q" },
                  { from: "あなた", msg: "答えました ✓  +¥2,000", type: "a" },
                ].map((item, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: item.type === "a" ? "flex-end" : "flex-start" }}>
                    <div style={{ maxWidth: "80%", background: item.type === "a" ? `linear-gradient(135deg, ${ACCENT}40, ${LIGHT}30)` : "rgba(14,22,49,0.04)", border: item.type === "a" ? `1px solid ${ACCENT}50` : "1px solid rgba(14,22,49,0.08)", borderRadius: "12px", padding: "10px 14px" }}>
                      <div style={{ fontSize: "10px", color: item.type === "a" ? LIGHT : "#6b7280", marginBottom: "4px", fontFamily: "'Noto Sans JP', sans-serif", letterSpacing: "0.05em" }}>{item.from}</div>
                      <div style={{ fontSize: "12px", color: item.type === "a" ? "#bbf7d0" : "#d1d5db", fontFamily: "'Noto Sans JP', sans-serif", fontWeight: item.type === "a" ? "500" : "300" }}>{item.msg}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ─── できること ──────────────────────────── */}
        <section id="features" style={{ padding: "100px 24px", background: "rgba(22,163,74,0.04)", borderTop: "1px solid rgba(22,163,74,0.1)", borderBottom: "1px solid rgba(22,163,74,0.1)" }}>
          <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
            <SectionLabel text="できること" color={LIGHT} />
            <h2 style={sh}>Seebuyでできること</h2>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: "20px" }} className="two-col">
              {[
                { icon: "💰", title: "質問に答えて収益化", desc: "フォロワーの質問に答えるたびに設定した金額を受け取れます。1回答から始められます。" },
                { icon: "🎯", title: "専門分野を設定", desc: "得意ジャンルをプロフィールに設定。関連する質問が集まりやすくなります。" },
                { icon: "🔗", title: "SNSと連携", desc: "XやInstagramにプロフィールリンクを貼るだけで質問を受付開始。既存フォロワーが即戦力。" },
                { icon: "📈", title: "収益ダッシュボード", desc: "累計収益・回答数・人気質問など、分析データをリアルタイムで確認できます。" },
                { icon: "🛡", title: "モデレーション機能", desc: "不適切な質問は自動でフィルタリング。ブロック・通報機能も完備で安心して使えます。" },
                { icon: "💳", title: "即日振り込み", desc: "翌営業日に銀行口座へ振り込み。最小振り込み金額は¥1,000から。" },
              ].map((item) => (
                <FeatureCard key={item.title} {...item} accent={ACCENT} />
              ))}
            </div>
          </div>
        </section>

        {/* ─── 使い方 ─────────────────────────────── */}
        <section id="howto" style={{ padding: "100px 24px", maxWidth: "1100px", margin: "0 auto" }}>
          <SectionLabel text="使い方" color={LIGHT} />
          <h2 style={sh}>今日から始められる</h2>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "24px" }} className="three-col">
            {[
              { step: "01", title: "プロフィール作成", desc: "得意分野と回答価格を設定。あなたの専門性をアピールするプロフィールページが完成します。", icon: "✍️" },
              { step: "02", title: "リンクをシェア", desc: "XやInstagramのプロフィールにリンクを貼るだけ。フォロワーがそこから質問を送れます。", icon: "🔗" },
              { step: "03", title: "回答して収益GET", desc: "質問が届いたら回答。報酬は即座に記録され、定期的に振り込まれます。", icon: "💰" },
            ].map((item) => (
              <StepCard key={item.step} {...item} light={LIGHT} />
            ))}
          </div>
        </section>

        {/* ─── 収益モデル ──────────────────────────── */}
        <section id="revenue" style={{ padding: "100px 24px", background: "rgba(22,163,74,0.04)", borderTop: "1px solid rgba(22,163,74,0.1)", borderBottom: "1px solid rgba(22,163,74,0.1)" }}>
          <div style={{ maxWidth: "900px", margin: "0 auto" }}>
            <SectionLabel text="収益モデル" color={LIGHT} />
            <h2 style={sh}>透明で公平な収益分配</h2>

            <div style={{ background: "rgba(22,163,74,0.08)", border: `1px solid ${ACCENT}30`, borderRadius: "24px", padding: "40px", marginBottom: "40px", textAlign: "center" }}>
              <p style={{ fontFamily: "'Noto Sans JP', sans-serif", fontSize: "13px", color: "var(--muted)", marginBottom: "24px", letterSpacing: "0.1em" }}>1回答 ¥1,000 の場合（3者間分配モデル）</p>
              <div style={{ display: "flex", justifyContent: "center", gap: "32px", flexWrap: "wrap" }}>
                {[
                  { label: "回答者（Expert）", value: "¥600", pct: "60%", color: LIGHT },
                  { label: "質問者（紹介料）", value: "¥200", pct: "20%", color: "#86efac" },
                  { label: "プラットフォーム", value: "¥200", pct: "20%", color: "#4b5563" },
                ].map((item) => (
                  <div key={item.label} style={{ textAlign: "center" }}>
                    <div style={{ fontFamily: "'Shippori Mincho B1', serif", fontSize: "44px", fontWeight: "800", color: item.color, lineHeight: "1", marginBottom: "4px" }}>{item.value}</div>
                    <div style={{ fontSize: "14px", color: item.color, fontFamily: "'Noto Sans JP', sans-serif", fontWeight: "500", marginBottom: "4px", opacity: 0.8 }}>{item.pct}</div>
                    <div style={{ fontSize: "12px", color: "var(--muted)", fontFamily: "'Noto Sans JP', sans-serif" }}>{item.label}</div>
                  </div>
                ))}
              </div>
              <p style={{ marginTop: "20px", fontSize: "12px", color: "var(--muted)", fontFamily: "'Noto Sans JP', sans-serif" }}>
                ※ 最初の100名登録者は手数料0%の特別優遇
              </p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "20px" }} className="three-col">
              {[
                { icon: "🎁", title: "最初の100名は手数料0%", desc: "事前登録の先着100名はプラットフォーム手数料が永久0%の特別優遇。今すぐ登録を。" },
                { icon: "🔄", title: "質問者にも20%の紹介料", desc: "質問した側にも回答価格の20%が入る独自の3者間分配モデル。広める動機が生まれる。" },
                { icon: "💳", title: "Stripe決済・72時間返金保証", desc: "安全なStripe決済。72時間以内に未回答の場合は全額返金保証。" },
              ].map((item) => (
                <div key={item.title} style={{ background: "var(--surface)", border: "1px solid rgba(14,22,49,0.06)", borderRadius: "16px", padding: "24px", textAlign: "center" }}>
                  <div style={{ fontSize: "28px", marginBottom: "12px" }}>{item.icon}</div>
                  <h3 style={{ fontFamily: "'Noto Sans JP', sans-serif", fontSize: "14px", fontWeight: "700", color: LIGHT, margin: "0 0 8px" }}>{item.title}</h3>
                  <p style={{ fontFamily: "'Noto Sans JP', sans-serif", fontSize: "12px", color: "var(--muted)", lineHeight: "1.7", margin: 0, fontWeight: "300" }}>{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── FAQ ───────────────────────────────── */}
        <section id="faq" style={{ padding: "100px 24px", maxWidth: "800px", margin: "0 auto" }}>
          <SectionLabel text="FAQ" color={LIGHT} />
          <h2 style={sh}>よくある質問</h2>

          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {[
              { q: "フォロワーが少なくても使えますか？", a: "はい。フォロワー数は問いません。Xの界隈で「詳しい人」と認識されていれば十分です。少数精鋭のフォロワーのほうが収益化しやすいケースも多いです。" },
              { q: "質問者にも収益が入る仕組みとは？", a: "Seebuyは回答者60%・質問者20%・プラットフォーム20%の3者間分配モデルです。あなたの質問経由で別の人が回答を購入した場合、質問者にも20%が還元されます。" },
              { q: "最初の100名の手数料0%とは？", a: "事前登録した先着100名には、プラットフォーム手数料（通常20%）が永久0%になる特別優遇を適用します。回答者取り分が通常60%→80%になります。" },
              { q: "回答しなかった場合はどうなりますか？", a: "72時間以内に回答がなかった場合、質問者へ全額返金されます。Stripe決済のため安全に処理されます。" },
              { q: "完全匿名で質問できますか？", a: "はい。質問者は完全匿名で質問を送れます。回答者には質問内容と設定金額のみ表示されます。" },
            ].map((item) => (
              <FaqItem key={item.q} question={item.q} answer={item.a} accent={LIGHT} />
            ))}
          </div>
        </section>

        {/* ─── CTA / 事前登録 ───────────────────── */}
        <section id="register" style={{ padding: "100px 24px", textAlign: "center", background: `linear-gradient(135deg, rgba(22,163,74,0.12) 0%, rgba(34,197,94,0.06) 100%)`, borderTop: "1px solid rgba(22,163,74,0.15)" }}>
          <div style={{ maxWidth: "560px", margin: "0 auto" }}>
            <div style={{ display: "inline-block", background: `${ACCENT}20`, border: `1px solid ${ACCENT}40`, borderRadius: "20px", padding: "6px 16px", fontSize: "11px", color: LIGHT, fontFamily: "'Noto Sans JP', sans-serif", letterSpacing: "0.15em", marginBottom: "24px" }}>近日公開</div>
            <h2 style={{ fontFamily: "'Shippori Mincho B1', serif", fontSize: "clamp(28px, 4vw, 44px)", fontWeight: "800", color: "var(--text)", margin: "0 0 20px", lineHeight: "1.3" }}>
              あなたの知識に、値段をつけよう。
            </h2>
            <p style={{ color: "var(--muted)", fontSize: "14px", fontFamily: "'Noto Sans JP', sans-serif", marginBottom: "36px", lineHeight: "1.8", fontWeight: "300" }}>
              事前登録で優先招待＋初期ユーザー限定特典をお届けします。
            </p>

            <RegisterForm accent={ACCENT} light={LIGHT} glow={GLOW} />
            <p style={{ fontSize: "11px", color: "#4b5563", fontFamily: "'Noto Sans JP', sans-serif", marginTop: "16px" }}>
              スパムメールは送りません。いつでも登録解除できます。
            </p>
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

function RegisterForm({ accent, light, glow }: { accent: string; light: string; glow: string }) {
  return (
    <form
      style={{ display: "flex", gap: "12px", maxWidth: "440px", margin: "0 auto", flexWrap: "wrap", justifyContent: "center" }}
      action="#"
      method="POST"
    >
      <input
        type="email"
        name="email"
        placeholder="メールアドレスを入力"
        style={{ flex: "1", minWidth: "220px", padding: "13px 20px", background: "rgba(14,22,49,0.04)", border: "1px solid rgba(14,22,49,0.12)", borderRadius: "50px", color: "var(--text)", fontSize: "14px", fontFamily: "'Noto Sans JP', sans-serif", outline: "none" }}
      />
      <button
        type="submit"
        style={{ padding: "13px 28px", background: `linear-gradient(135deg, ${accent}, ${light})`, borderRadius: "50px", color: "white", fontSize: "14px", fontFamily: "'Noto Sans JP', sans-serif", fontWeight: "500", border: "none", cursor: "pointer", boxShadow: `0 0 30px ${glow}`, whiteSpace: "nowrap" }}
      >
        事前登録（無料）
      </button>
    </form>
  );
}
