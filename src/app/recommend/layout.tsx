import type { Metadata } from 'next'
import type React from 'react'

export const metadata: Metadata = {
  title: 'ボドゲーター — ボードゲームおすすめ診断',
  description: 'ボドゲーター — 5つの質問に答えるだけで今夜ぴったりのボードゲームを占います。人数・気分・時間から自動でおすすめを提案。ボードゲーム選びに迷ったらボドゲーターへ。',
  keywords: [
    'ボドゲーター', 'ボードゲームおすすめ', 'ボードゲーム占い', 'ボードゲーム選び方',
    'ボードゲームレコメンド', 'ボードゲーム診断', 'ボードゲーム何する',
  ],
  openGraph: {
    title: 'ボドゲーター — ボードゲームおすすめ診断 | ラ王のボドゲ倉庫',
    description: '5つの質問に答えるだけで今夜ぴったりのボードゲームを提案します。無料・登録不要。',
  },
}

export default function RecommendLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
