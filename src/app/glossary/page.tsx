import Link from 'next/link'
import { Suspense } from 'react'
import { BookOpen, ChevronRight, Wand2, Gamepad2 } from 'lucide-react'
import { NavMenu } from '@/components/ui/NavMenu'
import { GLOSSARY_TERMS } from '@/lib/glossary'
import { SITE_URL } from '@/lib/constants'
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

const CATEGORY_COLORS: Record<string, string> = {
  '戦略':         'bg-blue-100 text-blue-800',
  'カードゲーム': 'bg-yellow-100 text-yellow-800',
  'ゲームタイプ': 'bg-green-100 text-green-800',
  'コンポーネント':'bg-orange-100 text-orange-800',
  'ゲームスタイル':'bg-purple-100 text-purple-800',
}

export default function GlossaryPage() {
  return (
    <div className="min-h-dvh bg-[linear-gradient(160deg,#1a0a00_0%,#0d0500_40%,#050200_100%)]">
      <Suspense fallback={null}>
        <NavMenu />
      </Suspense>

      <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
        {/* ヘッダー */}
        <div className="mb-8">
          <div className="mb-2 flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-amber-400" />
            <h1 className="text-2xl font-bold text-amber-300">ボードゲーム用語集</h1>
          </div>
          <p className="text-sm text-white/50">
            ワーカープレイスメント、デッキ構築、ドラフトなど、ボードゲームの専門用語をわかりやすく解説します。
          </p>
        </div>

        {/* 用語一覧 */}
        <div className="space-y-3">
          {GLOSSARY_TERMS.map(term => (
            <Link
              key={term.slug}
              href={`/glossary/${term.slug}`}
              className="group flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-4 transition hover:border-amber-400/30 hover:bg-white/10"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-amber-300 group-hover:text-amber-200">
                    {term.title}
                  </span>
                  <span className={`hidden shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium sm:inline-block ${CATEGORY_COLORS[term.category] ?? 'bg-gray-100 text-gray-700'}`}>
                    {term.category}
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-white/40">{term.reading}</p>
                <p className="mt-1 line-clamp-1 text-sm text-white/60">{term.shortDef}</p>
              </div>
              <ChevronRight className="ml-3 h-4 w-4 shrink-0 text-white/30 transition group-hover:text-amber-400" />
            </Link>
          ))}
        </div>

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
