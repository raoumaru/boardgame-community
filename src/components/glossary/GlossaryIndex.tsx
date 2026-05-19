'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Search, ChevronRight, X } from 'lucide-react'
import type { GlossaryTerm } from '@/lib/glossary'

const CATEGORY_COLORS: Record<string, string> = {
  '戦略':          'bg-blue-100 text-blue-800',
  'カードゲーム':  'bg-yellow-100 text-yellow-800',
  'ゲームタイプ':  'bg-green-100 text-green-800',
  'コンポーネント':'bg-orange-100 text-orange-800',
  'ゲームスタイル':'bg-purple-100 text-purple-800',
}

type Props = { terms: GlossaryTerm[] }

export function GlossaryIndex({ terms }: Props) {
  const [q, setQ] = useState('')

  const filtered = useMemo(() => {
    const lower = q.toLowerCase().trim()
    if (!lower) return terms
    return terms.filter(t =>
      t.title.includes(lower) ||
      t.reading.includes(lower) ||
      t.shortDef.includes(lower) ||
      t.keywords.some(k => k.includes(lower))
    )
  }, [q, terms])

  return (
    <div>
      {/* 検索ボックス */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          type="search"
          placeholder="用語を検索...（例: デッキ、ドラフト）"
          value={q}
          onChange={e => setQ(e.target.value)}
          className="w-full rounded-xl border border-white/10 bg-white/10 py-3 pl-9 pr-10 text-sm text-white placeholder-white/30 focus:border-amber-400/60 focus:outline-none focus:ring-2 focus:ring-amber-400/20"
        />
        {q && (
          <button
            onClick={() => setQ('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* 件数 */}
      {q && (
        <p className="mb-3 text-xs text-white/40">
          「{q}」の検索結果: {filtered.length}件
        </p>
      )}

      {/* 一覧 */}
      {filtered.length === 0 ? (
        <div className="rounded-xl border border-white/10 bg-white/5 py-12 text-center text-sm text-white/40">
          該当する用語が見つかりませんでした
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(term => (
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
      )}
    </div>
  )
}
