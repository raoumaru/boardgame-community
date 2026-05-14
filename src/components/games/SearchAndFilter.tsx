'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useTransition, useState } from 'react'
import type React from 'react'
import { Users, Clock, Gamepad2, Trophy, Sparkles, Flame, Search, X } from 'lucide-react'
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
  const isNew     = searchParams.get('new') === 'true'
  const isPopular = searchParams.get('popular') === 'true'

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

  const handleNewToggle = useCallback(() => {
    const params = new URLSearchParams()
    if (!isNew) params.set('new', 'true')
    startTransition(() => router.push(`/games?${params.toString()}`, { scroll: false }))
  }, [isNew, router])

  const handlePopularToggle = useCallback(() => {
    const params = new URLSearchParams()
    if (!isPopular) params.set('popular', 'true')
    startTransition(() => router.push(`/games?${params.toString()}`, { scroll: false }))
  }, [isPopular, router])

  const handleReset = useCallback(() => {
    setLocal({ q: '', players: '', time: '', genre: '', difficulty: '' })
    startTransition(() => router.push('/games', { scroll: false }))
  }, [router])

  const hasFilter = local.q || local.players || local.time || local.genre || local.difficulty || isNew || isPopular

  return (
    <div className="mb-6 space-y-3">

      {/* 検索バー */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
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
          label={<><Users className="h-3.5 w-3.5 shrink-0" /><span>人数</span></>}
          options={PLAYER_OPTIONS}
          current={local.players}
          onChange={v => setLocal(prev => ({ ...prev, players: v }))}
        />
        <FilterRow
          label={<><Clock className="h-3.5 w-3.5 shrink-0" /><span>時間</span></>}
          options={TIME_OPTIONS}
          current={local.time}
          onChange={v => setLocal(prev => ({ ...prev, time: v }))}
        />
        <FilterRow
          label={<><Gamepad2 className="h-3.5 w-3.5 shrink-0" /><span>ジャンル</span></>}
          options={[{ label: 'すべて', value: '' }, ...GENRES.map(g => ({ label: g.label, value: g.value }))]}
          current={local.genre}
          onChange={v => setLocal(prev => ({ ...prev, genre: v }))}
        />
        <FilterRow
          label={<><Trophy className="h-3.5 w-3.5 shrink-0" /><span>難易度</span></>}
          options={DIFFICULTY_OPTIONS}
          current={local.difficulty}
          onChange={v => setLocal(prev => ({ ...prev, difficulty: v }))}
        />
      </div>

      {/* 検索ボタン＋クイックフィルター＋リセット */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={handleSearch}
          disabled={isPending}
          className="flex items-center gap-1.5 rounded-xl bg-amber-500 px-5 py-2 text-sm font-semibold text-white shadow-md transition hover:bg-amber-600 disabled:opacity-60"
        >
          <Search className="h-4 w-4" />
          {isPending ? '検索中...' : '検索'}
        </button>

        <button
          onClick={handleNewToggle}
          disabled={isPending}
          className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-semibold shadow-md transition disabled:opacity-60 ${
            isNew
              ? 'bg-emerald-500 text-white hover:bg-emerald-600'
              : 'bg-white/15 text-white hover:bg-white/25'
          }`}
        >
          <Sparkles className="h-4 w-4" />
          新規入荷
        </button>

        <button
          onClick={handlePopularToggle}
          disabled={isPending}
          className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-semibold shadow-md transition disabled:opacity-60 ${
            isPopular
              ? 'bg-amber-500 text-white hover:bg-amber-600'
              : 'bg-white/15 text-white hover:bg-white/25'
          }`}
        >
          <Flame className="h-4 w-4" />
          人気
        </button>

        {hasFilter && (
          <button
            onClick={handleReset}
            className="flex items-center gap-1 text-xs text-amber-200/80 underline underline-offset-2 hover:text-amber-100"
          >
            <X className="h-3 w-3" />
            リセット
          </button>
        )}
      </div>
    </div>
  )
}

type FilterRowProps = {
  label: React.ReactNode
  options: { label: string; value: string }[]
  current: string
  onChange: (v: string) => void
}

function FilterRow({ label, options, current, onChange }: FilterRowProps) {
  return (
    <div className="flex items-start gap-2 p-3">
      <span className="flex w-20 shrink-0 items-center gap-1 pt-1 text-xs text-amber-200/70">{label}</span>
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
