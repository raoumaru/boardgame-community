'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Heart, Share2, Check, Gamepad2 } from 'lucide-react'
import { useBookmarks } from '@/hooks/useBookmarks'
import { GameGrid } from '@/components/games/GameGrid'
import { NavMenu } from '@/components/ui/NavMenu'
import type { Game } from '@/lib/types'

const IMAGE_BASE_URL = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/game-images`

function FavoritesContent() {
  const { ids } = useBookmarks()
  const searchParams = useSearchParams()
  const sharedIds = searchParams.get('ids')?.split(',').filter(Boolean) ?? []

  const isSharedView = sharedIds.length > 0
  const targetIds = isSharedView ? sharedIds : ids
  const targetIdsStr = targetIds.join(',')

  const [games, setGames] = useState<Game[]>([])
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!targetIdsStr) { setGames([]); return }
    setLoading(true)
    fetch(`/api/games?ids=${targetIdsStr}`)
      .then(r => r.json())
      .then(d => setGames(d.games ?? []))
      .finally(() => setLoading(false))
  }, [targetIdsStr])

  const handleShare = () => {
    if (ids.length === 0) return
    const url = `${window.location.origin}/favorites?ids=${ids.join(',')}`
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
      <NavMenu />

      <div className="mb-6 mt-2 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Heart className="h-5 w-5 fill-red-400 text-red-400" />
          <h1 className="text-lg font-bold text-amber-200">
            {isSharedView ? 'シェアされたお気に入り' : 'お気に入り'}
            {!isSharedView && ids.length > 0 && (
              <span className="ml-2 text-sm font-normal text-white/40">{ids.length}件</span>
            )}
          </h1>
        </div>

        {!isSharedView && ids.length > 0 && (
          <button
            onClick={handleShare}
            className="flex w-fit items-center gap-2 rounded-full border border-amber-400/30 bg-amber-500/10 px-4 py-2 text-sm font-medium text-amber-300 transition hover:bg-amber-500/20"
          >
            {copied
              ? <><Check className="h-4 w-4" />コピーしました！</>
              : <><Share2 className="h-4 w-4" />URLをコピーしてシェア</>
            }
          </button>
        )}
      </div>

      {isSharedView && (
        <div className="mb-4 rounded-xl border border-amber-400/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-300">
          🔗 シェアされたお気に入りリストを表示しています。ハートを押して自分のお気に入りに追加できます。
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="overflow-hidden rounded-xl bg-white/90 shadow-md">
              <div className="aspect-[4/3] animate-pulse bg-gray-200" />
              <div className="space-y-2 p-3">
                <div className="h-4 animate-pulse rounded bg-gray-200" />
                <div className="h-3 w-2/3 animate-pulse rounded bg-gray-200" />
              </div>
            </div>
          ))}
        </div>
      ) : games.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <Heart className="mb-4 h-16 w-16 text-white/20" />
          <p className="text-lg font-medium text-white/40">
            {isSharedView ? 'ゲームが見つかりませんでした' : 'お気に入りがまだありません'}
          </p>
          <p className="mt-1 text-sm text-white/30">
            {isSharedView ? 'リンクが古い可能性があります' : 'ゲーム一覧でハートを押して追加しましょう'}
          </p>
          <Link
            href="/games"
            className="mt-6 flex items-center gap-2 rounded-full bg-amber-500 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-amber-400"
          >
            <Gamepad2 className="h-4 w-4" />
            ゲーム一覧を見る
          </Link>
        </div>
      ) : (
        <GameGrid games={games} imageBaseUrl={IMAGE_BASE_URL} />
      )}
    </div>
  )
}

export default function FavoritesPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-white/40">読み込み中...</div>}>
      <FavoritesContent />
    </Suspense>
  )
}
