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
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/favicon.png', type: 'image/png' },
    ],
  },
  verification: {
    google: '7XHn00Bwt7q6JPxnI9y3Lwqic4v3HU60-4xgdGiyLOg',
  },
};

// globals.css の !important が背景を制御しているため、ここはフォールバック
const warmBrickStyle = {
  backgroundColor: "#7A3018",
} as React.CSSProperties;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className={`${notoSansJP.variable} h-full`}>
      <body
        className="min-h-dvh font-[var(--font-noto-sans-jp)] antialiased"
        style={warmBrickStyle}
      >
        {children}
      </body>
    </html>
  );
}
