import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Users, Clock, Gamepad2, Sparkles, ExternalLink, ArrowLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { GenreBadge, DifficultyBadge } from '@/components/ui/Badge'
import { NavMenu } from '@/components/ui/NavMenu'
import { formatPlayers, formatPlayTime } from '@/lib/utils'
import { GENRES, DIFFICULTY_LABELS } from '@/lib/types'
import type { Game, Difficulty } from '@/lib/types'
import type { Metadata } from 'next'

const IMAGE_BASE_URL = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/game-images`
const VALID_GENRES = new Set<string>(GENRES.map(g => g.value))

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const supabase = createAdminClient()
  const { data: game } = await supabase
    .from('games')
    .select('title, description, difficulty, min_players, max_players, play_time_min, play_time_max, image_path')
    .eq('slug', slug)
    .eq('is_published', true)
    .single()

  if (!game) return { title: 'ゲームが見つかりません' }

  const diffLabel = game.difficulty ? `難易度：${DIFFICULTY_LABELS[game.difficulty as Difficulty]}　` : ''
  const players = formatPlayers(game.min_players, game.max_players)
  const time = formatPlayTime(game.play_time_min, game.play_time_max)
  const description = game.description
    ?? `${diffLabel}${players}　${time}で遊べるボードゲーム。ラ王のボドゲ倉庫で詳細を確認。`

  return {
    title: `${game.title} | ラ王のボドゲ倉庫`,
    description,
    openGraph: {
      title: `${game.title} | ラ王のボドゲ倉庫`,
      description,
      images: game.image_path ? [`${IMAGE_BASE_URL}/${game.image_path}`] : [],
    },
  }
}

async function GameDetailContent({ slug }: { slug: string }) {
  const supabase = await createClient()
  const { data: game } = await supabase
    .from('games')
    .select('*')
    .eq('slug', slug)
    .eq('is_published', true)
    .single()

  if (!game) notFound()

  const g = game as Game
  const imageUrl = g.image_path ? `${IMAGE_BASE_URL}/${g.image_path}` : null

  return (
    <div className="overflow-hidden rounded-2xl bg-[#FEF3E8]/95 shadow-2xl shadow-black/40">
      {/* 画像 */}
      <div className="relative aspect-[16/9] w-full bg-gray-100">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={g.title}
            fill
            className="object-contain"
            sizes="(max-width: 640px) 100vw, 672px"
            priority
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
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{g.title}</h1>
          <div className="mt-2 flex flex-wrap gap-3 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <Users className="h-4 w-4 shrink-0" />
              <span>{formatPlayers(g.min_players, g.max_players)}</span>
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4 shrink-0" />
              <span>{formatPlayTime(g.play_time_min, g.play_time_max)}</span>
            </span>
          </div>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {g.difficulty && <DifficultyBadge difficulty={g.difficulty as Difficulty} />}
            {g.genres?.filter(v => VALID_GENRES.has(v)).map(v => (
              <GenreBadge key={v} genre={v} />
            ))}
          </div>
        </div>

        {g.rules && (
          <div className="rounded-xl bg-[#F8F5F0] p-4">
            <h2 className="mb-2 flex items-center gap-2 font-bold text-[#2D5A27]">
              <Gamepad2 className="h-4 w-4 shrink-0" />
              どんなゲーム？
            </h2>
            <p className="text-sm leading-relaxed text-gray-700">{g.rules}</p>
          </div>
        )}

        {g.recommended_for && (
          <div className="rounded-xl border border-[#C4892A]/30 bg-[#C4892A]/5 p-4">
            <h2 className="mb-2 flex items-center gap-2 font-bold text-[#C4892A]">
              <Sparkles className="h-4 w-4 shrink-0" />
              こんな人におすすめ
            </h2>
            <p className="text-sm leading-relaxed text-gray-700">{g.recommended_for}</p>
          </div>
        )}

        {g.external_url && (
          <a
            href={g.external_url}
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
  )
}

function GameDetailSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl bg-[#FEF3E8]/95 shadow-2xl shadow-black/40">
      <div className="aspect-[16/9] w-full animate-pulse bg-gray-200" />
      <div className="space-y-4 p-5">
        <div className="h-7 w-2/3 animate-pulse rounded bg-gray-200" />
        <div className="h-4 w-1/3 animate-pulse rounded bg-gray-200" />
        <div className="h-24 animate-pulse rounded-xl bg-gray-200" />
      </div>
    </div>
  )
}

export default async function GameDetailPage({ params }: Props) {
  const { slug } = await params

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6">
      <NavMenu />
      <Link
        href="/games"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-amber-200/80 hover:text-amber-200 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        ゲーム一覧に戻る
      </Link>
      <Suspense fallback={<GameDetailSkeleton />}>
        <GameDetailContent slug={slug} />
      </Suspense>
    </div>
  )
}
