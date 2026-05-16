'use client'

import { useState, useMemo, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { GameGrid } from '@/components/games/GameGrid'
import { SearchAndFilter } from '@/components/games/SearchAndFilter'
import type { Game } from '@/lib/types'

export type FilterState = {
  q: string
  players: string
  time: string
  genre: string
  difficulty: string
  isNew: boolean
  isPopular: boolean
}

function toKatakana(str: string): string {
  return str.replace(/[ぁ-ゖ]/g, ch => String.fromCharCode(ch.charCodeAt(0) + 0x60))
}
function toHiragana(str: string): string {
  return str.replace(/[ァ-ヶ]/g, ch => String.fromCharCode(ch.charCodeAt(0) - 0x60))
}

export function GamesClient({
  allGames,
  imageBaseUrl,
}: {
  allGames: Game[]
  imageBaseUrl: string
}) {
  const router = useRouter()
  const searchParams = useSearchParams()

  // URLから初期値を復元（バックボタン対応）
  const [filters, setFilters] = useState<FilterState>({
    q:          searchParams.get('q') ?? '',
    players:    searchParams.get('players') ?? '',
    time:       searchParams.get('time') ?? '',
    genre:      searchParams.get('genre') ?? '',
    difficulty: searchParams.get('difficulty') ?? '',
    isNew:      searchParams.get('new') === 'true',
    isPopular:  searchParams.get('popular') === 'true',
  })

  // フィルター変更 → state更新 + URLをreplaceで同期（戻るボタン用）
  const handleFilterChange = useCallback((next: FilterState) => {
    setFilters(next)
    const params = new URLSearchParams()
    if (next.q)          params.set('q', next.q)
    if (next.players)    params.set('players', next.players)
    if (next.time)       params.set('time', next.time)
    if (next.genre)      params.set('genre', next.genre)
    if (next.difficulty) params.set('difficulty', next.difficulty)
    if (next.isNew)      params.set('new', 'true')
    if (next.isPopular)  params.set('popular', 'true')
    router.replace(`/games?${params.toString()}`, { scroll: false })
  }, [router])

  // NEW判定: created_at 降順上位5件
  const newGameIds = useMemo(() => {
    const sorted = [...allGames].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )
    return new Set(sorted.slice(0, 5).map(g => g.id))
  }, [allGames])

  // クライアントサイドフィルタリング
  const filtered = useMemo(() => {
    const { q, players, time, genre, difficulty, isNew, isPopular } = filters

    let result = [...allGames]

    // ソート: NEWフィルター時は新着順、それ以外はsort_order
    if (isNew) {
      result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    }

    // テキスト検索（ひらがな・カタカナ両対応）
    if (q) {
      const kata  = toKatakana(q)
      const hira  = toHiragana(q)
      const terms = [...new Set([q, kata, hira])].map(t => t.toLowerCase())
      result = result.filter(g => {
        const title = g.title.toLowerCase()
        const kana  = (g.title_kana ?? '').toLowerCase()
        return terms.some(t => title.includes(t) || kana.includes(t))
      })
    }

    // ジャンル
    if (genre) {
      result = result.filter(g => (g.genres ?? []).includes(genre))
    }

    // 人数
    if (players) {
      const n = parseInt(players)
      if (!isNaN(n)) {
        if (n === 8) {
          result = result.filter(g => g.max_players >= 8)
        } else {
          result = result.filter(g => g.min_players <= n && g.max_players >= n)
        }
      }
    }

    // 難易度
    if (difficulty) {
      result = result.filter(g => g.difficulty === difficulty)
    }

    // NEW
    if (isNew) {
      result = result.filter(g => newGameIds.has(g.id))
    }

    // 人気
    if (isPopular) {
      result = result.filter(g => g.is_popular)
    }

    // プレイ時間
    if (time) {
      if (time === '91') {
        result = result.filter(g => g.play_time_min >= 90)
      } else if (time === '30') {
        result = result.filter(g => g.play_time_min <= 30)
      } else if (time === '30-60') {
        result = result.filter(g =>
          g.play_time_min <= 60 &&
          (g.play_time_max != null ? g.play_time_max >= 30 : g.play_time_min >= 30)
        )
      } else if (time === '60-90') {
        result = result.filter(g =>
          g.play_time_min <= 90 &&
          (g.play_time_max != null ? g.play_time_max >= 60 : g.play_time_min >= 60)
        )
      }
    }

    return result
  }, [allGames, filters, newGameIds])

  return (
    <>
      <SearchAndFilter filters={filters} onChange={handleFilterChange} />
      <GameGrid games={filtered} imageBaseUrl={imageBaseUrl} newGameIds={newGameIds} />
    </>
  )
}
