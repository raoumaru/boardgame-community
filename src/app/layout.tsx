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
  icons: {
    icon: '/favicon.jpg',
  },
};

const warmBrickStyle = {
  // レンガの家の内側・暖炉の温かい部屋
  backgroundColor: "#C1622A",
  backgroundImage: [
    // 暖炉の強い炎の光（左下）
    "radial-gradient(ellipse 80% 70% at 10% 95%, rgba(255,180,60,0.85) 0%, rgba(240,110,20,0.55) 35%, transparent 65%)",
    // 部屋全体に広がる暖かいオレンジ光
    "radial-gradient(ellipse 160% 140% at 50% 110%, rgba(255,160,50,0.7) 0%, rgba(210,100,20,0.45) 35%, rgba(170,65,15,0.2) 60%, transparent 75%)",
    // 上部も暖かく照らす
    "radial-gradient(ellipse 120% 60% at 50% -10%, rgba(230,130,50,0.5) 0%, rgba(195,85,25,0.3) 40%, transparent 65%)",
    // 右側の壁からの反射光
    "radial-gradient(ellipse 50% 80% at 100% 50%, rgba(245,155,55,0.35) 0%, transparent 55%)",
    // レンガの横モルタルライン
    "repeating-linear-gradient(180deg, transparent 0px, transparent 26px, rgba(100,30,0,0.25) 26px, rgba(100,30,0,0.25) 30px)",
    // レンガの縦目地
    "repeating-linear-gradient(90deg, transparent 0px, transparent 55px, rgba(100,30,0,0.1) 55px, rgba(100,30,0,0.1) 58px)",
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
