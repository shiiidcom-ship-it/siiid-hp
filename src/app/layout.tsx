import type { Metadata } from "next";
import { Shippori_Mincho_B1, Noto_Sans_JP, Syne } from "next/font/google";
import "./globals.css";

const shipporiMincho = Shippori_Mincho_B1({
  weight: ["700", "800"],           // drop 400 — only bold weights used
  subsets: ["latin"],
  variable: "--font-mincho",
  display: "swap",
  preload: true,
});

const notoSansJP = Noto_Sans_JP({
  weight: ["300", "400", "500"],    // drop 700 — only light/regular/medium used
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
  preload: false,                   // secondary font, no preload
});

const syne = Syne({
  weight: ["700", "800"],           // drop 400 — only display weights used
  subsets: ["latin"],
  variable: "--font-syne",
  display: "swap",
  preload: true,
});

export const metadata: Metadata = {
  title: "株式会社SiiiD — 声と知識で、世界を変える。",
  description:
    "株式会社SiiiDは、KoePassとSeebuyの2つのプラットフォームを運営しています。クリエイターとファンをつなぐボイスメッセージプラットフォーム「KoePass」と、知識を収益化する有料Q&Aプラットフォーム「Seebuy」。",
  keywords: ["KoePass", "Seebuy", "SiiiD", "ボイスメッセージ", "Q&A", "クリエイター"],
  openGraph: {
    title: "株式会社SiiiD",
    description: "声と知識で、世界を変える。",
    locale: "ja_JP",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ja"
      className={`${shipporiMincho.variable} ${notoSansJP.variable} ${syne.variable} h-full`}
    >
      <body className="min-h-full">
        {children}
      </body>
    </html>
  );
}
