'use client'

import { useEffect } from 'react'
import Image from 'next/image'
import { Users, Clock, Gamepad2, Sparkles, ExternalLink, ShoppingCart } from 'lucide-react'
import { GenreBadge, DifficultyBadge } from '@/components/ui/Badge'
import { GENRES } from '@/lib/types'

const VALID_GENRES = new Set<string>(GENRES.map((g) => g.value))
import { formatPlayers, formatPlayTime } from '@/lib/utils'
import type { Game, Difficulty } from '@/lib/types'

type Props = {
  game: Game
  imageBaseUrl: string
  onClose: () => void
}

function AmazonLink({ title }: { title: string }) {
  const tag = process.env.NEXT_PUBLIC_AMAZON_ASSOCIATE_TAG
  if (!tag) return null
  const url = `https://www.amazon.co.jp/s?k=${encodeURIComponent(title + ' ボードゲーム')}&tag=${tag}`
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer sponsored"
      className="flex items-center justify-center gap-2 rounded-xl border border-orange-300/60 bg-orange-50 px-4 py-3 text-sm font-semibold text-orange-700 transition hover:bg-orange-100 hover:border-orange-400/80"
    >
      <ShoppingCart className="h-4 w-4 shrink-0" />
      Amazonで購入する
    </a>
  )
}

function RakutenLink({ title }: { title: string }) {
  const aId  = process.env.NEXT_PUBLIC_MOSHIMO_A_ID
  const pId  = process.env.NEXT_PUBLIC_MOSHIMO_P_ID
  const pcId = process.env.NEXT_PUBLIC_MOSHIMO_PC_ID
  const plId = process.env.NEXT_PUBLIC_MOSHIMO_PL_ID
  if (!aId) return null
  const rakutenUrl  = `https://search.rakuten.co.jp/search/mall/${encodeURIComponent(title + ' ボードゲーム')}/`
  const affiliateUrl = `https://af.moshimo.com/af/c/click?a_id=${aId}&p_id=${pId}&pc_id=${pcId}&pl_id=${plId}&url=${encodeURIComponent(rakutenUrl)}`
  return (
    <a
      href={affiliateUrl}
      target="_blank"
      rel="noopener noreferrer sponsored"
      className="flex items-center justify-center gap-2 rounded-xl border border-red-300/60 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 transition hover:bg-red-100 hover:border-red-400/80"
    >
      <ShoppingCart className="h-4 w-4 shrink-0" />
      楽天市場で購入する
    </a>
  )
}

export function GameModal({ game, imageBaseUrl, onClose }: Props) {
  const imageUrl = game.image_path
    ? `${imageBaseUrl}/${game.image_path}`
    : null

  // 背景スクロール防止
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  // ESCキーで閉じる
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  return (
    <>
      {/* オーバーレイ */}
      <div
        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* モーダル本体 - PC: 中央 / SP: 下からシート */}
      <div className="fixed inset-x-0 bottom-0 z-50 max-h-[90dvh] overflow-y-auto rounded-t-2xl bg-white shadow-2xl sm:inset-0 sm:m-auto sm:max-h-[85vh] sm:max-w-2xl sm:rounded-2xl">
        {/* ドラッグハンドル（SP用） */}
        <div className="sticky top-0 flex justify-center pt-3 pb-1 sm:hidden">
          <div className="h-1 w-10 rounded-full bg-gray-300" />
        </div>

        {/* 閉じるボタン */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/10 text-gray-600 transition hover:bg-black/20"
          aria-label="閉じる"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* 画像 */}
        <div className="relative aspect-[16/9] w-full bg-gray-100">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={game.title}
              fill
              className="object-contain"
              sizes="(max-width: 640px) 100vw, 672px"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}
        </div>

        {/* コンテンツ */}
        <div className="space-y-5 p-5">
          {/* タイトル & 基本情報 */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{game.title}</h2>
            <div className="mt-2 flex flex-wrap gap-3 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <Users className="h-4 w-4 shrink-0" />
                <span>{formatPlayers(game.min_players, game.max_players)}</span>
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4 shrink-0" />
                <span>{formatPlayTime(game.play_time_min, game.play_time_max)}</span>
              </span>
            </div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {game.difficulty && (
                <DifficultyBadge difficulty={game.difficulty as Difficulty} />
              )}
              {game.genres?.filter((g) => VALID_GENRES.has(g)).map((g) => (
                <GenreBadge key={g} genre={g} />
              ))}
            </div>
          </div>

          {/* ルール説明 */}
          {game.rules && (
            <div className="rounded-xl bg-[#F8F5F0] p-4">
              <h3 className="mb-2 flex items-center gap-2 font-bold text-[#2D5A27]">
                <Gamepad2 className="h-4 w-4 shrink-0" />
                <span>どんなゲーム？</span>
              </h3>
              <p className="text-sm leading-relaxed text-gray-700">{game.rules}</p>
            </div>
          )}

          {/* おすすめ */}
          {game.recommended_for && (
            <div className="rounded-xl border border-[#C4892A]/30 bg-[#C4892A]/5 p-4">
              <h3 className="mb-2 flex items-center gap-2 font-bold text-[#C4892A]">
                <Sparkles className="h-4 w-4 shrink-0" />
                <span>こんな人におすすめ</span>
              </h3>
              <p className="text-sm leading-relaxed text-gray-700">{game.recommended_for}</p>
            </div>
          )}

          {/* 購入リンク */}
          <div className="space-y-2">
            <AmazonLink title={game.title} />
            <RakutenLink title={game.title} />
          </div>

          {/* 外部リンク */}
          {game.external_url && (
            <a
              href={game.external_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 rounded-xl border border-amber-400/40 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-700 transition hover:bg-amber-100 hover:border-amber-500/60"
            >
              <ExternalLink className="h-4 w-4 shrink-0" />
              詳しく調べる
            </a>
          )}
        </div>
      </div>
    </>
  )
}
