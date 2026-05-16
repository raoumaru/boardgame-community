import type { Metadata } from "next";
import type React from "react";
import { Noto_Sans_JP } from "next/font/google";
import "./globals.css";

const notoSansJP = Noto_Sans_JP({
  subsets: ["latin"],
  variable: "--font-noto-sans-jp",
});

export const metadata: Metadata = {
  title: "ラ王のボドゲ倉庫",
  description: "サークル用ボードゲーム一覧",
  applicationName: "ラ王のボドゲ倉庫",
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

// globals.css の !important が背景を制御しているため、ここはフォールバック
const warmBrickStyle = {
  backgroundColor: "#7A3018",
} as React.CSSProperties;

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'ラ王のボドゲ倉庫',
  url: 'https://www.boardgame-raou.com',
  description: 'サークル用ボードゲーム一覧',
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
        style={warmBrickStyle}
      >
        {children}
      </body>
    </html>
  );
}
