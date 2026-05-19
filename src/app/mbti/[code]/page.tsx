import { notFound } from 'next/navigation'
import { unstable_cache } from 'next/cache'
import Link from 'next/link'
import { Suspense } from 'react'
import { ChevronLeft, Dna, Zap, ThumbsUp } from 'lucide-react'
import { NavMenu } from '@/components/ui/NavMenu'
import { GameCard } from '@/components/games/GameCard'
import { createAdminClient } from '@/lib/supabase/admin'
import { scoreGames, type ScoringParams } from '@/lib/scoring'
import { TYPES, getAxisLabels, AXIS_COLORS, type TypeCode } from '../data'
import type { Metadata } from 'next'
import type { Game } from '@/lib/types'

const IMAGE_BASE_URL = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/game-images`


type Props = { params: Promise<{ code: string }> }

export function generateStaticParams() {
  return Object.keys(TYPES).map(code => ({ code: code.toLowerCase() }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { code } = await params
  const typeCode = code.toUpperCase() as TypeCode
  const type = TYPES[typeCode]
  if (!type) return { title: 'ページが見つかりません' }
  return {
    title: `${type.name}（${typeCode}）| ボドゲMBTI診断結果`,
    description: `ボドゲMBTI ${typeCode}タイプ「${type.name}」。${type.catchcopy}。${type.description} あなたに合ったボードゲームもご紹介。`,
    keywords: [
      `ボドゲMBTI ${typeCode}`, type.name, 'ボードゲームMBTI',
      'ボードゲームタイプ診断', 'ボードゲーム診断結果', 'ボドゲ診断',
    ],
    openGraph: {
      title: `${type.name}（${typeCode}）| ボドゲMBTI`,
      description: `${type.catchcopy} — ボドゲMBTI ${typeCode}タイプの詳細・おすすめゲームはこちら。`,
    },
  }
}

function getMbtiRecommendParams(code: TypeCode): ScoringParams {
  const d = code[0], r = code[1], i = code[2], h = code[3]
  return {
    players:    i === 'I' ? '2' : i === 'G' ? '5+' : '3-4',
    mood:       d === 'D' ? 'think' : 'fun',
    categories: r === 'R' ? ['strategy', 'bluff'] : ['cooperative', 'party'],
    time:       h === 'H' ? 'long' : 'short',
    experience: d === 'D' && h === 'H' ? 'often' : d === 'W' && h === 'L' ? 'beginner' : 'sometimes',
  }
}

async function getRecommendedGames(typeCode: TypeCode): Promise<Game[]> {
  return unstable_cache(
    async () => _fetchRecommendedGames(typeCode),
    [`mbti-recommend-${typeCode}`],
    { tags: ['mbti-recommend', `mbti-recommend-${typeCode}`] }
  )()
}

async function _fetchRecommendedGames(typeCode: TypeCode): Promise<Game[]> {
  const params = getMbtiRecommendParams(typeCode)

  const supabase = createAdminClient()
  const { data: games } = await supabase
    .from('games')
    .select('*')
    .eq('is_published', true)
    .eq('is_recommendable', true)

  if (!games?.length) return []

  return scoreGames(games as Game[], params)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map(x => x.game)
}

export default async function MbtiDetailPage({ params }: Props) {
  const { code } = await params
  const typeCode = code.toUpperCase() as TypeCode
  const type = TYPES[typeCode]
  if (!type) notFound()

  const axisLabels = getAxisLabels(typeCode)
  const recommendedGames = await getRecommendedGames(typeCode)

  return (
    <div className="min-h-dvh px-4 py-8">
      <Suspense fallback={null}><NavMenu /></Suspense>

      <div className="mx-auto max-w-lg">

        {/* 戻るリンク */}
        <Link
          href="/mbti"
          className="mb-6 inline-flex items-center gap-1.5 text-sm text-amber-400/60 transition-colors hover:text-amber-400"
        >
          <ChevronLeft className="h-4 w-4" />
          キャラクター一覧に戻る
        </Link>

        {/* ── ヘッダー ── */}
        <div className="mb-5 overflow-hidden rounded-2xl border border-white/10 bg-white/5">
          {/* キャラクター画像 */}
          <div className="flex justify-center bg-white px-6 pt-6 pb-2">
            {type.image ? (
              <img
                src={type.image}
                alt={type.name}
                className="h-52 w-52 object-contain"
              />
            ) : (
              <div className="flex h-52 w-52 items-center justify-center">
                <Dna className="h-20 w-20 text-amber-400/20" />
              </div>
            )}
          </div>

          {/* タイプ情報 */}
          <div className="p-5 text-center">
            <p className="mb-1 text-xs tracking-[0.3em] text-amber-400/50 uppercase">Board Game MBTI</p>
            <div className="mb-1 text-4xl font-black tracking-widest text-amber-300">{typeCode}</div>
            <h1 className="mb-2 text-2xl font-bold text-amber-100">{type.name}</h1>
            <p className="text-sm text-amber-200/60">「{type.catchcopy}」</p>
          </div>

          {/* 軸バッジ */}
          <div className="flex flex-wrap justify-center gap-2 px-5 pb-5">
            {typeCode.split('').map((letter, i) => (
              <span
                key={i}
                className={`rounded-full border px-3 py-1 text-xs font-bold ${AXIS_COLORS[letter]}`}
              >
                {axisLabels[i]}
              </span>
            ))}
          </div>
        </div>

        {/* ── 特徴説明 ── */}
        <div className="mb-4 rounded-2xl border border-white/10 bg-white/5 p-5">
          <p className="text-sm leading-relaxed text-white/80">{type.description}</p>
        </div>

        {/* ── プレイスタイル ── */}
        <div className="mb-4 rounded-2xl border border-white/10 bg-white/5 p-5">
          <h2 className="mb-3 flex items-center gap-2 text-xs font-bold tracking-widest text-amber-400/70 uppercase">
            <Dna className="h-3.5 w-3.5" />
            プレイスタイル
          </h2>
          <p className="text-sm leading-relaxed text-white/70">{type.playStyle}</p>
        </div>

        {/* ── 強み ── */}
        <div className="mb-4 rounded-2xl border border-green-400/20 bg-green-500/5 p-4">
          <h2 className="mb-3 flex items-center gap-1.5 text-xs font-bold tracking-widest text-green-400/70 uppercase">
            <ThumbsUp className="h-3.5 w-3.5" />
            強み
          </h2>
          <ul className="space-y-2">
            {type.strengths.map(s => (
              <li key={s} className="flex items-start gap-1.5 text-xs leading-relaxed text-white/70">
                <span className="mt-0.5 shrink-0 text-green-400">✓</span>
                {s}
              </li>
            ))}
          </ul>
        </div>

        {/* ── 好きなゲームタイプ ── */}
        <div className="mb-4 rounded-2xl border border-white/10 bg-white/5 p-5">
          <h2 className="mb-4 flex items-center gap-2 text-xs font-bold tracking-widest text-amber-400/70 uppercase">
            <Zap className="h-3.5 w-3.5" />
            ゲームの傾向
          </h2>
          <p className="mb-2 text-xs font-bold text-green-400/80">好きなゲームタイプ</p>
          <div className="flex flex-wrap gap-2">
            {type.likedGames.map(g => (
              <span key={g} className="rounded-full border border-green-400/20 bg-green-500/10 px-3 py-1 text-xs text-green-300">
                {g}
              </span>
            ))}
          </div>
        </div>

        {/* ── おすすめゲーム（DBから取得） ── */}
        <div className="mb-6">
          <h2 className="mb-3 text-xs font-bold tracking-widest text-amber-400/70 uppercase">
            おすすめボードゲーム
          </h2>
          {recommendedGames.length > 0 ? (
            <div className="grid grid-cols-3 gap-2">
              {recommendedGames.map(game => (
                <GameCard key={game.id} game={game} imageBaseUrl={IMAGE_BASE_URL} />
              ))}
            </div>
          ) : (
            <p className="text-xs text-white/30">現在表示できるゲームがありません</p>
          )}
        </div>

        {/* ── CTA ── */}
        <div className="space-y-3 pb-12 text-center">
          <div>
            <Link
              href="/mbti"
              className="group inline-flex items-center gap-2 rounded-full bg-amber-500 px-8 py-3.5 text-base font-bold text-white shadow-lg shadow-amber-900/50 transition-all hover:bg-amber-400 hover:-translate-y-0.5"
            >
              <Dna className="h-4 w-4" />
              <span>自分のタイプを診断する</span>
              <span className="transition-transform group-hover:translate-x-1">→</span>
            </Link>
          </div>
          <div>
            <Link
              href="/mbti"
              className="text-xs text-amber-600/60 transition-colors hover:text-amber-500/80"
            >
              ← 全タイプ一覧に戻る
            </Link>
          </div>
        </div>

      </div>
    </div>
  )
}
