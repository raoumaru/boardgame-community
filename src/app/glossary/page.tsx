import { Suspense } from 'react'
import Link from 'next/link'
import { BookOpen, Wand2, Gamepad2 } from 'lucide-react'
import { NavMenu } from '@/components/ui/NavMenu'
import { GLOSSARY_TERMS } from '@/lib/glossary'
import { SITE_URL } from '@/lib/constants'
import { GlossaryIndex } from '@/components/glossary/GlossaryIndex'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'ボードゲーム用語集 | ラ王のボドゲ倉庫',
  description: 'ワーカープレイスメント・デッキ構築・ドラフトなど、ボードゲームの専門用語をわかりやすく解説。初心者から上級者まで使える用語集。',
  openGraph: {
    title: 'ボードゲーム用語集 | ラ王のボドゲ倉庫',
    description: 'ワーカープレイスメント・デッキ構築・ドラフトなど、ボードゲームの専門用語をわかりやすく解説。',
    url: `${SITE_URL}/glossary`,
  },
  alternates: { canonical: `${SITE_URL}/glossary` },
}

export default function GlossaryPage() {
  return (
    <div className="min-h-dvh bg-[linear-gradient(160deg,#1a0a00_0%,#0d0500_40%,#050200_100%)]">
      <Suspense fallback={null}>
        <NavMenu />
      </Suspense>

      <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
        {/* ヘッダー */}
        <div className="mb-6">
          <div className="mb-2 flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-amber-400" />
            <h1 className="text-2xl font-bold text-amber-300">ボードゲーム用語集</h1>
          </div>
          <p className="text-sm text-white/50">
            ワーカープレイスメント、デッキ構築、ドラフトなど、ボードゲームの専門用語をわかりやすく解説します。
          </p>
        </div>

        {/* 検索付き一覧（クライアントコンポーネント） */}
        <GlossaryIndex terms={GLOSSARY_TERMS} />

        {/* CTA */}
        <div className="mt-10 grid grid-cols-2 gap-3">
          <Link
            href="/games"
            className="flex items-center justify-center gap-2 rounded-xl border border-amber-400/40 bg-amber-500/10 py-3 text-sm font-semibold text-amber-300 transition hover:bg-amber-500/20"
          >
            <Gamepad2 className="h-4 w-4" />
            ゲームを探す
          </Link>
          <Link
            href="/recommend"
            className="flex items-center justify-center gap-2 rounded-xl border border-purple-400/40 bg-purple-500/10 py-3 text-sm font-semibold text-purple-300 transition hover:bg-purple-500/20"
          >
            <Wand2 className="h-4 w-4" />
            ボドゲーター
          </Link>
        </div>
      </div>
    </div>
  )
}
