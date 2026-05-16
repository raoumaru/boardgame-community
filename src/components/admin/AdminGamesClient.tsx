'use client'

import { useState, useMemo, useCallback } from 'react'
import { RefreshCw } from 'lucide-react'

function toKatakana(str: string): string {
  return str.replace(/[ぁ-ゖ]/g, ch => String.fromCharCode(ch.charCodeAt(0) + 0x60))
}

function toHiragana(str: string): string {
  return str.replace(/[ァ-ヶ]/g, ch => String.fromCharCode(ch.charCodeAt(0) - 0x60))
}
import Link from 'next/link'
import { DeleteButton } from '@/components/admin/DeleteButton'
import { TogglePublishButton } from '@/components/admin/TogglePublishButton'
import { ToggleRecommendButton } from '@/components/admin/ToggleRecommendButton'
import { TogglePopularButton } from '@/components/admin/TogglePopularButton'

type Game = {
  id: string
  title: string
  min_players: number
  max_players: number
  play_time_min: number
  play_time_max: number | null
  is_published: boolean
  is_recommendable: boolean
  is_popular: boolean
  sort_order: number
  image_path: string | null
}

type Props = {
  games: Game[]
}

export function AdminGamesClient({ games: initialGames }: Props) {
  const [games, setGames] = useState(initialGames)
  const [titleFilter, setTitleFilter] = useState('')
  const [imageFilter, setImageFilter] = useState<'all' | 'has' | 'none'>('all')
  const [publishFilter, setPublishFilter] = useState<'all' | 'published' | 'unpublished'>('all')
  const [isClearingCache, setIsClearingCache] = useState(false)
  const [cacheMessage, setCacheMessage] = useState('')

  const handleClearCache = useCallback(async () => {
    setIsClearingCache(true)
    setCacheMessage('')
    try {
      const res = await fetch('/api/admin/revalidate', { method: 'POST' })
      if (res.ok) {
        setCacheMessage('✓ キャッシュをクリアしました')
      } else {
        setCacheMessage('✗ クリアに失敗しました')
      }
    } catch {
      setCacheMessage('✗ クリアに失敗しました')
    } finally {
      setIsClearingCache(false)
      setTimeout(() => setCacheMessage(''), 3000)
    }
  }, [])

  const filtered = useMemo(() => {
    return games.filter(g => {
      const q = titleFilter.toLowerCase()
      const qKata = toKatakana(q)
      const qHira = toHiragana(q)
      const t = g.title.toLowerCase()
      const matchTitle = !q || t.includes(q) || t.includes(qKata) || t.includes(qHira)
      const matchImage =
        imageFilter === 'all' ? true :
        imageFilter === 'has' ? !!g.image_path :
        !g.image_path
      const matchPublish =
        publishFilter === 'all' ? true :
        publishFilter === 'published' ? g.is_published :
        !g.is_published
      return matchTitle && matchImage && matchPublish
    })
  }, [games, titleFilter, imageFilter, publishFilter])

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-800">ゲーム管理</h1>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            {cacheMessage && (
              <span className={`text-xs font-medium ${cacheMessage.startsWith('✓') ? 'text-green-600' : 'text-red-500'}`}>
                {cacheMessage}
              </span>
            )}
            <button
              onClick={handleClearCache}
              disabled={isClearingCache}
              title="ゲーム一覧のキャッシュをクリア（1時間キャッシュ）"
              className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-600 shadow-sm transition hover:bg-gray-50 disabled:opacity-50"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isClearingCache ? 'animate-spin' : ''}`} />
              {isClearingCache ? 'クリア中...' : 'キャッシュクリア'}
            </button>
          </div>
          <Link
            href="/admin/games/new"
            className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-600"
          >
            ＋ 新規追加
          </Link>
        </div>
      </div>

      {/* フィルター */}
      <div className="mb-4 flex flex-wrap gap-3">
        <input
          type="text"
          placeholder="ゲームタイトルで検索..."
          value={titleFilter}
          onChange={e => setTitleFilter(e.target.value)}
          className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/30 w-64"
        />
        <div className="flex items-center gap-1 rounded-lg border border-gray-200 bg-white p-1">
          {(['all', 'has', 'none'] as const).map(v => (
            <button
              key={v}
              onClick={() => setImageFilter(v)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                imageFilter === v
                  ? 'bg-amber-500 text-white'
                  : 'text-gray-500 hover:bg-gray-100'
              }`}
            >
              {v === 'all' ? '画像：すべて' : v === 'has' ? '画像あり' : '画像なし'}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1 rounded-lg border border-gray-200 bg-white p-1">
          {(['all', 'published', 'unpublished'] as const).map(v => (
            <button
              key={v}
              onClick={() => setPublishFilter(v)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                publishFilter === v
                  ? 'bg-amber-500 text-white'
                  : 'text-gray-500 hover:bg-gray-100'
              }`}
            >
              {v === 'all' ? '公開：すべて' : v === 'published' ? '公開中' : '非公開'}
            </button>
          ))}
        </div>
        <span className="self-center text-xs text-gray-400">{filtered.length}件</span>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="border-b border-gray-100 bg-gray-50 text-xs text-gray-500">
            <tr>
              <th className="px-4 py-3 text-left">タイトル</th>
              <th className="px-4 py-3 text-left whitespace-nowrap">人数</th>
              <th className="px-4 py-3 text-left whitespace-nowrap">時間</th>
              <th className="px-4 py-3 text-left whitespace-nowrap w-16">画像</th>
              <th className="px-4 py-3 text-left whitespace-nowrap w-20">公開</th>
              <th className="px-4 py-3 text-left whitespace-nowrap w-24">占い</th>
              <th className="px-4 py-3 text-left whitespace-nowrap w-16">人気</th>
              <th className="px-4 py-3 text-right whitespace-nowrap">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map(game => (
              <tr key={game.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-800">{game.title}</td>
                <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{game.min_players}〜{game.max_players}人</td>
                <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                  {game.play_time_min}{game.play_time_max ? `〜${game.play_time_max}` : ''}分
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  {game.image_path
                    ? <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700">あり</span>
                    : <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-400">なし</span>
                  }
                </td>
                <td className="px-4 py-3">
                  <TogglePublishButton
                    id={game.id}
                    isPublished={game.is_published}
                    onToggle={next =>
                      setGames(prev => prev.map(g => g.id === game.id ? { ...g, is_published: next } : g))
                    }
                  />
                </td>
                <td className="px-4 py-3">
                  <ToggleRecommendButton
                    id={game.id}
                    isRecommendable={game.is_recommendable}
                    onToggle={next =>
                      setGames(prev => prev.map(g => g.id === game.id ? { ...g, is_recommendable: next } : g))
                    }
                  />
                </td>
                <td className="px-4 py-3">
                  <TogglePopularButton
                    id={game.id}
                    isPopular={game.is_popular}
                    onToggle={next =>
                      setGames(prev => prev.map(g => g.id === game.id ? { ...g, is_popular: next } : g))
                    }
                  />
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Link
                      href={`/admin/games/${game.id}/edit`}
                      className="rounded px-2 py-1 text-xs text-amber-600 hover:bg-amber-50"
                    >
                      編集
                    </Link>
                    <DeleteButton id={game.id} title={game.title} />
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-sm text-gray-400">
                  該当するゲームがありません
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
