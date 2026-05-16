import type { Metadata } from 'next'
import type React from 'react'

export const metadata: Metadata = {
  title: 'ボドゲーター',
  description: 'ボドゲーター — 5つの質問に答えるだけでぴったりのボードゲームを占います。ボードゲームおすすめ・ボードゲーム占いならラ王のボドゲ倉庫のボドゲーターへ。',
  openGraph: {
    title: 'ボドゲーター | ラ王のボドゲ倉庫',
    description: '5つの質問に答えるだけであなたにぴったりのボードゲームを占います。',
  },
}

export default function RecommendLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
