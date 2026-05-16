import type { Metadata } from 'next'
import type React from 'react'

export const metadata: Metadata = {
  title: 'ボドゲMBTI',
  description: 'ボドゲMBTI — 20問の診断でボードゲームの好みを16タイプに分類。あなたはダークストラテジスト？ロストドリーマー？ぴったりのボードゲームも紹介します。',
  openGraph: {
    title: 'ボドゲMBTI | ラ王のボドゲ倉庫',
    description: '20問の診断でボードゲームの好みを16タイプに分類。あなたのタイプは？',
  },
}

export default function MbtiLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
