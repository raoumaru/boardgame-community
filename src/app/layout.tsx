import type { Metadata } from "next";
import { Noto_Sans_JP } from "next/font/google";
import "./globals.css";

const notoSansJP = Noto_Sans_JP({
  subsets: ["latin"],
  variable: "--font-noto-sans-jp",
});

export const metadata: Metadata = {
  title: "ラ王のボドゲ倉庫",
  description: "サークル用ボードゲーム一覧",
};

const warmBrickStyle = {
  // 暖炉のある暖かいレンガの部屋
  backgroundColor: "#7A3012",
  backgroundImage: [
    // 暖炉の炎の強い光（左下から）
    "radial-gradient(ellipse 70% 60% at 15% 90%, rgba(255,150,30,0.7) 0%, rgba(220,90,10,0.4) 30%, transparent 65%)",
    // 部屋全体を照らす暖かいアンバー光
    "radial-gradient(ellipse 120% 80% at 50% 100%, rgba(240,130,40,0.5) 0%, rgba(180,70,10,0.25) 45%, transparent 70%)",
    // 天井・上部は少し暗め
    "radial-gradient(ellipse 100% 50% at 50% 0%, rgba(40,10,0,0.45) 0%, transparent 60%)",
    // レンガの横モルタルライン
    "repeating-linear-gradient(180deg, transparent 0px, transparent 26px, rgba(80,20,0,0.35) 26px, rgba(80,20,0,0.35) 30px)",
    // レンガの縦目地（列ごとにオフセット）
    "repeating-linear-gradient(90deg, transparent 0px, transparent 55px, rgba(80,20,0,0.15) 55px, rgba(80,20,0,0.15) 58px)",
  ].join(", "),
  backgroundAttachment: "fixed" as const,
};

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
