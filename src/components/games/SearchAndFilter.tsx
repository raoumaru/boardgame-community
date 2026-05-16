'use client'

import Link from 'next/link'
import { Users, Clock, Gamepad2, Trophy, Sparkles, Flame, Search, X, Wand2 } from 'lucide-react'
import { GENRES } from '@/lib/types'
import type { FilterState } from '@/components/games/GamesClient'

const PLAYER_OPTIONS = [
  { label: 'すべての人数', value: '' },
  { label: '2人',         value: '2' },
  { label: '3人',         value: '3' },
  { label: '4人',         value: '4' },
  { label: '5人',         value: '5' },
  { label: '6人',         value: '6' },
  { label: '7人',         value: '7' },
  { label: '8人以上',     value: '8' },
]

const TIME_OPTIONS = [
  { label: 'すべての時間', value: '' },
  { label: '〜30分',      value: '30' },
  { label: '30〜60分',    value: '30-60' },
  { label: '60〜90分',    value: '60-90' },
  { label: '90分以上',    value: '91' },
]

const DIFFICULTY_OPTIONS = [
  { label: 'すべての難易度', value: '' },
  { label: 'かんたん',      value: 'easy' },
  { label: '普通',          value: 'medium' },
  { label: '難しい',        value: 'hard' },
]

const GENRE_OPTIONS = [
  { label: 'すべてのジャンル', value: '' },
  ...GENRES.map(g => ({ label: g.label, value: g.value })),
]

const selectClass = `
  w-full appearance-none rounded-xl border-0 bg-white/90 px-3 py-2.5 pr-8 text-sm text-gray-800
  shadow-md focus:outline-none focus:ring-2 focus:ring-amber-400 cursor-pointer
  bg-[url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")]
  bg-no-repeat bg-[right_0.75rem_center]
`.replace(/\s+/g, ' ').trim()

type Props = {
  filters: FilterState
  onChange: (filters: FilterState) => void
}

export function SearchAndFilter({ filters, onChange }: Props) {
  const { q, players, time, genre, difficulty, isNew, isPopular } = filters

  const update = (patch: Partial<FilterState>) => onChange({ ...filters, ...patch })

  const handleReset = () =>
    onChange({ q: '', players: '', time: '', genre: '', difficulty: '', isNew: false, isPopular: false })

  const hasFilter = q || players || time || genre || difficulty || isNew || isPopular

  return (
    <div className="mb-6 space-y-3">

      {/* 占いバナー */}
      <Link
        href="/recommend"
        className="flex items-center justify-between rounded-xl bg-amber-500/20 border border-amber-400/30 px-4 py-3 text-sm font-semibold text-amber-200 transition hover:bg-amber-500/30 hover:border-amber-400/50"
      >
        <span className="flex items-center gap-2">
          <Wand2 className="h-4 w-4 shrink-0" />
          ボドゲーター（ゲームを占う）
        </span>
        <span className="text-amber-400">→</span>
      </Link>

      {/* 検索バー */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          type="search"
          placeholder="ゲーム名で検索..."
          value={q}
          onChange={e => update({ q: e.target.value })}
          className="w-full rounded-xl border-0 bg-white/90 py-2.5 pl-9 pr-4 text-sm text-gray-800 shadow-md placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400"
        />
      </div>

      {/* プルダウンフィルター（2×2グリッド） */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <div className="relative">
          <Users className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
          <select
            value={players}
            onChange={e => update({ players: e.target.value })}
            className={`${selectClass} pl-8`}
          >
            {PLAYER_OPTIONS.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>

        <div className="relative">
          <Clock className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
          <select
            value={time}
            onChange={e => update({ time: e.target.value })}
            className={`${selectClass} pl-8`}
          >
            {TIME_OPTIONS.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>

        <div className="relative">
          <Gamepad2 className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
          <select
            value={genre}
            onChange={e => update({ genre: e.target.value })}
            className={`${selectClass} pl-8`}
          >
            {GENRE_OPTIONS.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>

        <div className="relative">
          <Trophy className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
          <select
            value={difficulty}
            onChange={e => update({ difficulty: e.target.value })}
            className={`${selectClass} pl-8`}
          >
            {DIFFICULTY_OPTIONS.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* クイックフィルター＋リセット */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => update({ isNew: !isNew, isPopular: false })}
          className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-semibold shadow-md transition ${
            isNew
              ? 'bg-emerald-500 text-white hover:bg-emerald-600'
              : 'bg-white/15 text-white hover:bg-white/25'
          }`}
        >
          <Sparkles className="h-4 w-4" />
          新規入荷
        </button>

        <button
          onClick={() => update({ isPopular: !isPopular, isNew: false })}
          className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-semibold shadow-md transition ${
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
