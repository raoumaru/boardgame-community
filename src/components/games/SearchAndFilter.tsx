'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useTransition, useState } from 'react'
import { GENRES } from '@/lib/types'

const PLAYER_OPTIONS = [
  { label: 'すべて',  value: '' },
  { label: '2人',    value: '2' },
  { label: '3人',    value: '3' },
  { label: '4人',    value: '4' },
  { label: '5人',    value: '5' },
  { label: '6人',    value: '6' },
  { label: '7人',    value: '7' },
  { label: '8人以上', value: '8' },
]

const TIME_OPTIONS = [
  { label: 'すべて',    value: '' },
  { label: '〜30分',   value: '30' },
  { label: '30〜60分', value: '30-60' },
  { label: '60〜90分', value: '60-90' },
  { label: '90分以上', value: '91' },
]

const DIFFICULTY_OPTIONS = [
  { label: 'すべて',   value: '' },
  { label: 'かんたん', value: 'easy' },
  { label: '普通',     value: 'medium' },
  { label: '難しい',   value: 'hard' },
]

export function SearchAndFilter() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const [local, setLocal] = useState({
    q:          searchParams.get('q') ?? '',
    players:    searchParams.get('players') ?? '',
    time:       searchParams.get('time') ?? '',
    genre:      searchParams.get('genre') ?? '',
    difficulty: searchParams.get('difficulty') ?? '',
  })

  const handleSearch = useCallback(() => {
    const params = new URLSearchParams()
    if (local.q)          params.set('q', local.q)
    if (local.players)    params.set('players', local.players)
    if (local.time)       params.set('time', local.time)
    if (local.genre)      params.set('genre', local.genre)
    if (local.difficulty) params.set('difficulty', local.difficulty)
    startTransition(() => {
      router.push(`/games?${params.toString()}`, { scroll: false })
    })
  }, [local, router])

  const handleReset = useCallback(() => {
    setLocal({ q: '', players: '', time: '', genre: '', difficulty: '' })
    startTransition(() => router.push('/games', { scroll: false }))
  }, [router])

  const hasFilter = local.q || local.players || local.time || local.genre || local.difficulty

  return (
    <div className="mb-6 space-y-3">

      {/* 検索バー */}
      <div className="relative">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
          fill="none" viewBox="0 0 24 24" stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="search"
          placeholder="ゲーム名で検索..."
          value={local.q}
          onChange={e => setLocal(prev => ({ ...prev, q: e.target.value }))}
          onKeyDown={e => { if (e.key === 'Enter') handleSearch() }}
          className="w-full rounded-xl border-0 bg-white/90 py-2.5 pl-9 pr-4 text-sm text-gray-800 shadow-md placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400"
        />
      </div>

      {/* フィルターチップ群 */}
      <div className="divide-y divide-white/10 rounded-xl bg-black/20 backdrop-blur-sm">
        <FilterRow
          label="👥 人数"
          options={PLAYER_OPTIONS}
          current={local.players}
          onChange={v => setLocal(prev => ({ ...prev, players: v }))}
        />
        <FilterRow
          label="⏱ 時間"
          options={TIME_OPTIONS}
          current={local.time}
          onChange={v => setLocal(prev => ({ ...prev, time: v }))}
        />
        <FilterRow
          label="🎲 ジャンル"
          options={[{ label: 'すべて', value: '' }, ...GENRES.map(g => ({ label: g.label, value: g.value }))]}
          current={local.genre}
          onChange={v => setLocal(prev => ({ ...prev, genre: v }))}
        />
        <FilterRow
          label="🏆 難易度"
          options={DIFFICULTY_OPTIONS}
          current={local.difficulty}
          onChange={v => setLocal(prev => ({ ...prev, difficulty: v }))}
        />
      </div>

      {/* 検索ボタン＋リセット */}
      <div className="flex items-center gap-3">
        <button
          onClick={handleSearch}
          disabled={isPending}
          className="flex items-center gap-1.5 rounded-xl bg-amber-500 px-5 py-2 text-sm font-semibold text-white shadow-md transition hover:bg-amber-600 disabled:opacity-60"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          {isPending ? '検索中...' : '検索'}
        </button>

        {hasFilter && (
          <button
            onClick={handleReset}
            className="flex items-center gap-1 text-xs text-amber-200/80 underline underline-offset-2 hover:text-amber-100"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            絞り込みをリセット
          </button>
        )}
      </div>
    </div>
  )
}

type FilterRowProps = {
  label: string
  options: { label: string; value: string }[]
  current: string
  onChange: (v: string) => void
}

function FilterRow({ label, options, current, onChange }: FilterRowProps) {
  return (
    <div className="flex items-start gap-2 p-3">
      <span className="w-20 shrink-0 pt-1 text-xs text-amber-200/70">{label}</span>
      <div className="flex flex-wrap gap-1.5">
        {options.map(opt => (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              current === opt.value
                ? 'bg-amber-400 text-amber-900 shadow'
                : 'bg-white/20 text-white hover:bg-white/30'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  )
}
