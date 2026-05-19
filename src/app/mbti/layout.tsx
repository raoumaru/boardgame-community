import type { Metadata } from 'next'
import type React from 'react'
import { SITE_URL } from '@/lib/constants'

export const metadata: Metadata = {
  title: 'ボドゲMBTI — ボードゲームタイプ診断',
  description: 'ボードゲームMBTI診断 — 20問に答えるだけで、あなたのボードゲームタイプを16種類に診断。得意なゲームジャンルやプレイスタイルがわかります。ダークストラテジスト・ロストドリーマーなど個性豊かな16キャラクターで判定。無料。',
  keywords: [
    'ボドゲMBTI', 'ボードゲームMBTI', 'ボードゲーム診断', 'ボードゲームタイプ診断',
    'ボードゲーム性格診断', 'ボードゲーム適性診断', 'ボードゲームプレイスタイル診断',
    'ボードゲームタイプ', 'ボードゲームおすすめ診断', 'ボドゲ診断',
  ],
  openGraph: {
    title: 'ボドゲMBTI — ボードゲームタイプ診断 | ラ王のボドゲ倉庫',
    description: '20問に答えるだけ。あなたのボードゲームタイプを16種類に診断します。無料・登録不要。',
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'ボドゲMBTI',
  description: '20問の診断でボードゲームの好みを16タイプに分類するボードゲームタイプ診断ツール',
  url: `${SITE_URL}/mbti`,
  applicationCategory: 'EntertainmentApplication',
  operatingSystem: 'Web Browser',
  inLanguage: 'ja',
  isAccessibleForFree: true,
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'JPY' },
}

export default function MbtiLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-[linear-gradient(160deg,#3a0a0a_0%,#1a0505_40%,#0d0205_100%)]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {children}
    </div>
  )
}
