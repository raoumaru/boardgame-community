import type { Metadata } from "next";
import type React from "react";
import { SITE_URL } from "@/lib/constants";
import { Noto_Sans_JP } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { Footer } from "@/components/ui/Footer";
import "./globals.css";

const notoSansJP = Noto_Sans_JP({
  subsets: ["latin"],
  variable: "--font-noto-sans-jp",
});

export const metadata: Metadata = {
  title: {
    default: 'ラ王のボドゲ倉庫',
    template: '%s | ラ王のボドゲ倉庫',
  },
  description: 'ラ王のボドゲ倉庫 — ボードゲーム一覧・おすすめ検索・ボドゲーター（ボードゲーム占い）が使えるサイト。人数・時間・ジャンルで絞り込んでぴったりのボードゲームを見つけよう。',
  applicationName: "ラ王のボドゲ倉庫",
  keywords: [
    'ボドゲーター', 'ボードゲーム一覧', 'ボードゲームおすすめ', 'ボードゲーム占い',
    'ラ王ボドゲ倉庫', 'ボードゲーム検索', 'ボドゲMBTI', 'ボードゲームMBTI',
    'ボードゲームタイプ診断', 'ボードゲーム性格診断', 'ボードゲーム診断',
    'ボードゲーム適性', 'ボードゲームプレイスタイル',
  ],
  icons: {
    apple: '/logo.png',
  },
  openGraph: {
    siteName: 'ラ王のボドゲ倉庫',
    locale: 'ja_JP',
    type: 'website',
  },
  verification: {
    google: '-IE-xJMDCuBCJ4kd_rBuKfPie33lZ0s7I3j1WCuJPUE',
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'ラ王のボドゲ倉庫',
  url: SITE_URL,
  description: 'ボードゲーム一覧・おすすめ・占いで探せるボードゲームサイト。ボドゲーターでぴったりのゲームを見つけよう。',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className={`${notoSansJP.variable} h-full`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        className="min-h-dvh font-[var(--font-noto-sans-jp)] antialiased"
      >
        {children}
        <Footer />
        <Analytics />
      </body>
    </html>
  );
}
