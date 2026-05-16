import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Suspense } from 'react'
import { ExternalLink, ChevronLeft, Dna, Zap, Shield, ThumbsUp, ThumbsDown } from 'lucide-react'
import { NavMenu } from '@/components/ui/NavMenu'
import { TYPES, getAxisLabels, AXIS_COLORS, type TypeCode } from '../data'
import type { Metadata } from 'next'

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
    title: `${typeCode}｜${type.name}`,
    description: `ボドゲMBTI ${typeCode}タイプ「${type.name}」。${type.catchcopy}。${type.description}`,
    openGraph: {
      title: `${typeCode} ${type.name} | ボドゲMBTI`,
      description: type.catchcopy,
    },
  }
}

export default async function MbtiDetailPage({ params }: Props) {
  const { code } = await params
  const typeCode = code.toUpperCase() as TypeCode
  const type = TYPES[typeCode]
  if (!type) notFound()

  const axisLabels = getAxisLabels(typeCode)

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

        {/* ── 強み・弱み ── */}
        <div className="mb-4 grid grid-cols-2 gap-3">
          <div className="rounded-2xl border border-green-400/20 bg-green-500/5 p-4">
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
          <div className="rounded-2xl border border-red-400/20 bg-red-500/5 p-4">
            <h2 className="mb-3 flex items-center gap-1.5 text-xs font-bold tracking-widest text-red-400/70 uppercase">
              <ThumbsDown className="h-3.5 w-3.5" />
              弱み
            </h2>
            <ul className="space-y-2">
              {type.weaknesses.map(w => (
                <li key={w} className="flex items-start gap-1.5 text-xs leading-relaxed text-white/70">
                  <span className="mt-0.5 shrink-0 text-red-400">✗</span>
                  {w}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* ── 好き・苦手なゲームタイプ ── */}
        <div className="mb-4 rounded-2xl border border-white/10 bg-white/5 p-5">
          <h2 className="mb-4 flex items-center gap-2 text-xs font-bold tracking-widest text-amber-400/70 uppercase">
            <Zap className="h-3.5 w-3.5" />
            ゲームの傾向
          </h2>
          <div className="mb-4">
            <p className="mb-2 text-xs font-bold text-green-400/80">好きなゲームタイプ</p>
            <div className="flex flex-wrap gap-2">
              {type.likedGames.map(g => (
                <span key={g} className="rounded-full border border-green-400/20 bg-green-500/10 px-3 py-1 text-xs text-green-300">
                  {g}
                </span>
              ))}
            </div>
          </div>
          <div>
            <p className="mb-2 text-xs font-bold text-red-400/80">苦手なゲームタイプ</p>
            <div className="flex flex-wrap gap-2">
              {type.dislikedGames.map(g => (
                <span key={g} className="rounded-full border border-red-400/20 bg-red-500/10 px-3 py-1 text-xs text-red-300">
                  {g}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* ── おすすめゲーム ── */}
        <div className="mb-6 rounded-2xl border border-amber-400/20 bg-amber-500/5 p-5">
          <h2 className="mb-3 text-xs font-bold tracking-widest text-amber-400/70 uppercase">
            おすすめボードゲーム
          </h2>
          <div className="space-y-2">
            {type.games.map(game => (
              <a
                key={game}
                href={`https://www.google.com/search?q=${encodeURIComponent(game + ' ボードゲーム')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-amber-100 transition hover:border-amber-400/40 hover:bg-amber-400/10"
              >
                <span className="font-medium">{game}</span>
                <ExternalLink className="h-3.5 w-3.5 shrink-0 text-amber-400/50" />
              </a>
            ))}
          </div>
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
