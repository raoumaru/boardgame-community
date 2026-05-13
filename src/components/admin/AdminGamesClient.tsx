'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { DeleteButton } from '@/components/admin/DeleteButton'
import { TogglePublishButton } from '@/components/admin/TogglePublishButton'

type Game = {
  id: string
  title: string
  min_players: number
  max_players: number
  play_time_min: number
  play_time_max: number | null
  is_published: boolean
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

  const filtered = useMemo(() => {
    return games.filter(g => {
      const matchTitle = g.title.toLowerCase().includes(titleFilter.toLowerCase())
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
        <Link
          href="/admin/games/new"
          className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-600"
        >
          ＋ 新規追加
        </Link>
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
              <th className="px-4 py-3 text-left">人数</th>
              <th className="px-4 py-3 text-left">時間</th>
              <th className="px-4 py-3 text-left">画像</th>
              <th className="px-4 py-3 text-left">公開</th>
              <th className="px-4 py-3 text-right">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map(game => (
              <tr key={game.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-800">{game.title}</td>
                <td className="px-4 py-3 text-gray-500">{game.min_players}〜{game.max_players}人</td>
                <td className="px-4 py-3 text-gray-500">
                  {game.play_time_min}{game.play_time_max ? `〜${game.play_time_max}` : ''}分
                </td>
                <td className="px-4 py-3">
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
