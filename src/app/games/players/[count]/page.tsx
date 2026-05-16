import { unstable_cache } from 'next/cache'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import { createAdminClient } from '@/lib/supabase/admin'
import { NavMenu } from '@/components/ui/NavMenu'
import { GamesClient } from '@/components/games/GamesClient'
import type { Game } from '@/lib/types'
import type { Metadata } from 'next'

const IMAGE_BASE_URL = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/game-images`

const GAMES_SELECT =
  'id, title, slug, title_kana, min_players, max_players, play_time_min, play_time_max, difficulty, genres, image_path, is_popular, is_recommendable, sort_order, created_at, external_url'

type CountParam = '2' | '3-4' | '5plus'

const COUNT_CONFIG: Record<CountParam, {
  label: string
  description: string
  minPlayers: number
  maxPlayers: number | null
}> = {
  '2': {
    label: '2人用',
    description: '2人で遊べるボードゲーム一覧。カップルや友人2人でも楽しめるおすすめゲームを紹介します。',
    minPlayers: 2,
    maxPlayers: 2,
  },
  '3-4': {
    label: '3〜4人用',
    description: '3人・4人で遊べるボードゲーム一覧。少人数グループやサークルに最適なおすすめゲームを紹介します。',
    minPlayers: 3,
    maxPlayers: 4,
  },
  '5plus': {
    label: '5人以上',
    description: '5人以上の大人数で遊べるボードゲーム一覧。パーティーやサークルの大人数プレイに最適なゲームを紹介します。',
    minPlayers: 5,
    maxPlayers: null,
  },
}

type Props = { params: Promise<{ count: string }> }

export function generateStaticParams() {
  return Object.keys(COUNT_CONFIG).map(count => ({ count }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { count } = await params
  const config = COUNT_CONFIG[count as CountParam]
  if (!config) return { title: 'ページが見つかりません' }

  return {
    title: `${config.label}ボードゲーム一覧`,
    description: config.description,
    openGraph: {
      title: `${config.label}ボードゲーム一覧 | ラ王のボドゲ倉庫`,
      description: config.description,
    },
  }
}

const fetchGamesByPlayers = (count: CountParam) =>
  unstable_cache(
    async () => {
      const supabase = createAdminClient()
      const config = COUNT_CONFIG[count]
      let query = supabase
        .from('games')
        .select(GAMES_SELECT)
        .eq('is_published', true)
        .lte('min_players', config.minPlayers)

      if (config.maxPlayers !== null) {
        query = query.gte('max_players', config.minPlayers)
      } else {
        query = query.gte('max_players', config.minPlayers)
      }

      const { data } = await query.order('sort_order', { ascending: true })
      return data ?? []
    },
    [`games-players-${count}`],
    { revalidate: 3600, tags: ['games-list'] }
  )()

async function GamesWithData({ count }: { count: CountParam }) {
  const games = await fetchGamesByPlayers(count)
  return (
    <GamesClient
      allGames={games as Game[]}
      imageBaseUrl={IMAGE_BASE_URL}
    />
  )
}

export default async function PlayerCountPage({ params }: Props) {
  const { count } = await params
  const config = COUNT_CONFIG[count as CountParam]
  if (!config) notFound()

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `${config.label}ボードゲーム一覧 | ラ王のボドゲ倉庫`,
    description: config.description,
    url: `https://www.boardgame-raou.com/games/players/${count}`,
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Suspense fallback={null}>
        <NavMenu />
      </Suspense>
      <h1 className="mb-6 text-center text-2xl font-bold text-amber-100">
        {config.label}ボードゲーム一覧
      </h1>
      <Suspense fallback={<div className="text-center text-amber-200/60">読み込み中...</div>}>
        <GamesWithData count={count as CountParam} />
      </Suspense>
    </div>
  )
}
