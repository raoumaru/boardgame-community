import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Suspense } from 'react'
import { ArrowLeft, BookOpen, Gamepad2, Wand2, ChevronRight } from 'lucide-react'
import { NavMenu } from '@/components/ui/NavMenu'
import { GLOSSARY_TERMS, getTermBySlug } from '@/lib/glossary'
import { SITE_URL } from '@/lib/constants'
import type { Metadata } from 'next'

type Props = { params: Promise<{ slug: string }> }

export function generateStaticParams() {
  return GLOSSARY_TERMS.map(t => ({ slug: t.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const term = getTermBySlug(slug)
  if (!term) return { title: '用語が見つかりません' }

  const title = `${term.title}とは？【ボードゲーム用語集】`
  const description = `${term.title}（${term.reading}）— ${term.shortDef}。${term.description[0].slice(0, 80)}…`

  return {
    title: `${title} | ラ王のボドゲ倉庫`,
    description,
    openGraph: {
      title: `${title} | ラ王のボドゲ倉庫`,
      description,
      url: `${SITE_URL}/glossary/${slug}`,
    },
    alternates: { canonical: `${SITE_URL}/glossary/${slug}` },
  }
}

// ─── HTML+Tailwind イラスト ───────────────────────────────────────────────

function IllustWorkerPlacement() {
  const cells = [
    { label: '木材', taken: 'blue' },
    { label: '食料', taken: 'red' },
    { label: '石材', taken: null },
    { label: '農場', taken: 'blue' },
    { label: '市場', taken: null },
    { label: '工房', taken: 'red' },
  ]
  return (
    <div className="flex flex-col items-center gap-3 p-4">
      <p className="text-xs font-semibold text-gray-500">アクションスペース</p>
      <div className="grid grid-cols-3 gap-2 w-full max-w-xs">
        {cells.map((c, i) => (
          <div key={i} className={`flex flex-col items-center justify-center gap-1 rounded-xl border-2 py-3 ${c.taken ? 'border-gray-300 bg-gray-100' : 'border-amber-300 bg-amber-50'}`}>
            {c.taken && (
              <div className={`h-6 w-6 rounded-full ${c.taken === 'blue' ? 'bg-blue-500' : 'bg-red-500'} flex items-center justify-center`}>
                <span className="text-[8px] font-bold text-white">{c.taken === 'blue' ? 'A' : 'B'}</span>
              </div>
            )}
            <span className="text-[10px] font-medium text-gray-600">{c.label}</span>
            {!c.taken && <span className="text-[9px] text-amber-500">空き</span>}
          </div>
        ))}
      </div>
      <div className="flex gap-4 text-xs text-gray-500">
        <span className="flex items-center gap-1"><span className="h-3 w-3 rounded-full bg-blue-500 inline-block"/>プレイヤーA</span>
        <span className="flex items-center gap-1"><span className="h-3 w-3 rounded-full bg-red-500 inline-block"/>プレイヤーB</span>
      </div>
      <p className="text-center text-xs text-gray-500">先に置いたプレイヤーがそのアクションを独占</p>
    </div>
  )
}

function IllustDeckBuilding() {
  return (
    <div className="flex items-end justify-center gap-4 p-4">
      {/* スタートデッキ */}
      <div className="flex flex-col items-center gap-2">
        <div className="relative w-16 h-20">
          {[2,1,0].map(i => (
            <div key={i} className="absolute rounded-lg border-2 border-gray-300 bg-gray-100 w-14 h-18"
              style={{ bottom: i*3, left: i*2, width: 52, height: 68 }} />
          ))}
          <div className="absolute bottom-0 left-0 w-[52px] h-[68px] rounded-lg border-2 border-gray-400 bg-white flex items-center justify-center">
            <span className="text-[9px] text-gray-400 text-center leading-tight">弱い<br/>カード</span>
          </div>
        </div>
        <span className="text-[10px] text-gray-500 font-semibold">スタート<br className="hidden"/>デッキ（5枚）</span>
      </div>

      {/* 矢印＋購入 */}
      <div className="flex flex-col items-center gap-1 pb-6">
        <div className="rounded-lg border-2 border-yellow-400 bg-yellow-50 px-2 py-1 text-center">
          <span className="text-lg">★</span>
          <p className="text-[9px] text-yellow-700 font-semibold">強カード<br/>を購入</p>
        </div>
        <span className="text-lg text-amber-500">↓</span>
      </div>

      {/* 強化デッキ */}
      <div className="flex flex-col items-center gap-2">
        <div className="relative w-16 h-24">
          {[4,3,2,1,0].map(i => (
            <div key={i} className="absolute rounded-lg border-2 w-[52px] h-[72px]"
              style={{
                bottom: i*3, left: i*2,
                borderColor: i===0 ? '#f59e0b' : '#d1d5db',
                backgroundColor: i===0 ? '#fef3c7' : '#f9fafb',
              }} />
          ))}
          <div className="absolute bottom-0 left-0 w-[52px] h-[72px] rounded-lg border-2 border-yellow-400 bg-yellow-50 flex items-center justify-center">
            <span className="text-[9px] text-yellow-700 text-center leading-tight font-semibold">強化後<br/>デッキ</span>
          </div>
        </div>
        <span className="text-[10px] text-gray-500 font-semibold">強化デッキ（10枚）</span>
      </div>
    </div>
  )
}

function IllustDraft() {
  const players = [
    { label: 'A', color: 'bg-blue-500',   pos: 'top-0 left-1/2 -translate-x-1/2' },
    { label: 'B', color: 'bg-green-500',  pos: 'top-1/2 right-0 -translate-y-1/2' },
    { label: 'C', color: 'bg-amber-500',  pos: 'bottom-0 left-1/2 -translate-x-1/2' },
    { label: 'D', color: 'bg-red-500',    pos: 'top-1/2 left-0 -translate-y-1/2' },
  ]
  return (
    <div className="flex flex-col items-center gap-3 p-4">
      <div className="relative w-44 h-44">
        {/* 円形の矢印を模したリング */}
        <div className="absolute inset-4 rounded-full border-2 border-dashed border-amber-300/60" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="rounded-lg border-2 border-amber-400 bg-amber-50 px-2 py-1 text-center">
            <p className="text-[10px] font-bold text-amber-800">1枚選ぶ</p>
            <p className="text-[9px] text-amber-600">残りを渡す→</p>
          </div>
        </div>
        {players.map(p => (
          <div key={p.label} className={`absolute ${p.pos}`}>
            <div className={`h-9 w-9 rounded-full ${p.color} flex items-center justify-center shadow-md`}>
              <span className="text-sm font-bold text-white">{p.label}</span>
            </div>
          </div>
        ))}
      </div>
      <p className="text-xs text-gray-500">時計回りにカードを渡していく</p>
    </div>
  )
}

function IllustMeeple() {
  const colors = ['bg-amber-500', 'bg-blue-500', 'bg-red-500', 'bg-green-500', 'bg-purple-500']
  return (
    <div className="flex flex-col items-center gap-4 p-4">
      {/* 大きなミープル SVG */}
      <svg viewBox="0 0 60 80" className="w-20 h-24" aria-hidden="true">
        <circle cx="30" cy="14" r="12" fill="#C4892A"/>
        <path d="M10,30 C6,20 8,40 14,48 L22,48 L26,36 L34,36 L38,48 L46,48 C52,40 54,20 50,30 C46,18 14,18 10,30 Z" fill="#C4892A"/>
        <path d="M14,48 L8,68 L20,68 L26,52 L34,52 L40,68 L52,68 L46,48 Z" fill="#C4892A"/>
      </svg>
      <p className="text-sm font-bold text-gray-700">ミープル</p>
      {/* カラーバリエーション */}
      <div className="flex gap-2">
        {colors.map((c, i) => (
          <svg key={i} viewBox="0 0 60 80" className="w-8 h-10" aria-hidden="true">
            <circle cx="30" cy="14" r="12" className={c.replace('bg-', 'fill-')}
              style={{ fill: ['#f59e0b','#3b82f6','#ef4444','#22c55e','#a855f7'][i] }}/>
            <path d="M10,30 C6,20 8,40 14,48 L22,48 L26,36 L34,36 L38,48 L46,48 C52,40 54,20 50,30 C46,18 14,18 10,30 Z"
              style={{ fill: ['#f59e0b','#3b82f6','#ef4444','#22c55e','#a855f7'][i] }}/>
            <path d="M14,48 L8,68 L20,68 L26,52 L34,52 L40,68 L52,68 L46,48 Z"
              style={{ fill: ['#f59e0b','#3b82f6','#ef4444','#22c55e','#a855f7'][i] }}/>
          </svg>
        ))}
      </div>
      <p className="text-xs text-gray-500">色違いで各プレイヤーを区別する</p>
    </div>
  )
}

function IllustCooperative() {
  return (
    <div className="flex flex-col items-center gap-3 p-4">
      <div className="flex w-full max-w-xs items-center gap-3">
        {/* プレイヤー側 */}
        <div className="flex flex-1 flex-col items-center gap-2 rounded-xl border-2 border-blue-200 bg-blue-50 p-3">
          <p className="text-xs font-bold text-blue-700">プレイヤー全員</p>
          <div className="flex gap-1">
            {['#3b82f6','#22c55e','#f59e0b','#a855f7'].map((c,i) => (
              <div key={i} className="h-6 w-6 rounded-full flex items-center justify-center text-[8px] font-bold text-white"
                style={{ backgroundColor: c }}>P{i+1}</div>
            ))}
          </div>
          <p className="text-[10px] text-blue-600 text-center">協力して作戦を立てる</p>
        </div>
        {/* VS */}
        <div className="shrink-0">
          <div className="rounded-full bg-gray-200 px-2 py-1 text-xs font-bold text-gray-600">VS</div>
        </div>
        {/* ゲーム側 */}
        <div className="flex flex-1 flex-col items-center gap-2 rounded-xl border-2 border-red-200 bg-red-50 p-3">
          <p className="text-xs font-bold text-red-700">ゲーム</p>
          <div className="text-2xl">🎲</div>
          <p className="text-[10px] text-red-600 text-center">システムが敵</p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2 w-full max-w-xs text-xs">
        <div className="rounded-lg bg-green-50 border border-green-200 p-2 text-center text-green-700 font-semibold">
          全員勝利 🎉
        </div>
        <div className="rounded-lg bg-red-50 border border-red-200 p-2 text-center text-red-700 font-semibold">
          全員敗北 💀
        </div>
      </div>
    </div>
  )
}

function IllustAreaMajority() {
  const areas = [
    { name: 'エリアA', blue: 3, red: 1, winner: 'blue' },
    { name: 'エリアB', blue: 1, red: 2, winner: 'red' },
    { name: 'エリアC', blue: 2, red: 2, winner: null },
  ]
  return (
    <div className="flex flex-col items-center gap-3 p-4">
      <div className="grid grid-cols-3 gap-2 w-full max-w-xs">
        {areas.map(area => (
          <div key={area.name}
            className={`rounded-xl border-2 p-2 flex flex-col items-center gap-1.5 ${
              area.winner === 'blue' ? 'border-blue-400 bg-blue-50' :
              area.winner === 'red'  ? 'border-red-400 bg-red-50' :
              'border-gray-300 bg-gray-50'
            }`}>
            <p className="text-[9px] font-bold text-gray-600">{area.name}</p>
            <div className="flex flex-wrap justify-center gap-0.5">
              {Array(area.blue).fill(0).map((_, i) => (
                <div key={`b${i}`} className="h-4 w-4 rounded-full bg-blue-500"/>
              ))}
              {Array(area.red).fill(0).map((_, i) => (
                <div key={`r${i}`} className="h-4 w-4 rounded-full bg-red-500"/>
              ))}
            </div>
            <p className={`text-[9px] font-bold ${
              area.winner === 'blue' ? 'text-blue-700' :
              area.winner === 'red'  ? 'text-red-700' :
              'text-gray-500'
            }`}>
              {area.winner === 'blue' ? '青の支配' : area.winner === 'red' ? '赤の支配' : '引き分け'}
            </p>
          </div>
        ))}
      </div>
      <div className="flex gap-4 text-xs text-gray-500">
        <span className="flex items-center gap-1"><span className="h-3 w-3 rounded-full bg-blue-500 inline-block"/>青チーム</span>
        <span className="flex items-center gap-1"><span className="h-3 w-3 rounded-full bg-red-500 inline-block"/>赤チーム</span>
      </div>
      <p className="text-xs text-gray-500 text-center">多数派のコマを置いたチームがエリアを支配</p>
    </div>
  )
}

function IllustAbstractGame() {
  const board = [
    [1,0,1,0,1],
    [0,1,0,1,0],
    [1,0,0,0,1],
    [0,1,0,1,0],
    [1,0,1,0,1],
  ]
  return (
    <div className="flex flex-col items-center gap-3 p-4">
      <div className="grid grid-cols-5 gap-0.5 border-2 border-gray-400 rounded-lg overflow-hidden p-1 bg-gray-200">
        {board.flat().map((v, i) => (
          <div key={i} className="h-8 w-8 rounded flex items-center justify-center bg-amber-50">
            {v === 1 && (
              <div className="h-6 w-6 rounded-full bg-gray-800 shadow-inner"/>
            )}
          </div>
        ))}
      </div>
      <div className="flex gap-3 text-xs">
        <div className="flex items-center gap-1.5 rounded-lg border border-green-300 bg-green-50 px-3 py-1.5">
          <span className="text-green-700 font-semibold">✓ 完全情報</span>
        </div>
        <div className="flex items-center gap-1.5 rounded-lg border border-red-300 bg-red-50 px-3 py-1.5">
          <span className="text-red-700 font-semibold">✕ 運要素なし</span>
        </div>
      </div>
      <p className="text-xs text-gray-500">純粋な思考力・読み合いだけで勝敗が決まる</p>
    </div>
  )
}

function IllustEuroGame() {
  return (
    <div className="flex flex-col items-center gap-3 p-4">
      {/* 勝利点トラック */}
      <div className="w-full max-w-xs">
        <p className="text-xs font-bold text-gray-600 mb-1.5">勝利点（VP）トラック</p>
        <div className="flex rounded-lg overflow-hidden border border-gray-300">
          {[1,2,3,4,5,6,7,8,9,10].map(n => (
            <div key={n} className={`flex-1 py-1.5 text-center text-[10px] border-r border-gray-300 last:border-r-0 font-medium relative
              ${n <= 6 ? 'bg-amber-50 text-amber-800' : 'bg-gray-50 text-gray-400'}`}>
              {n}
              {n === 6 && <div className="absolute -top-1 left-1/2 -translate-x-1/2 h-2 w-2 rounded-full bg-blue-500"/>}
              {n === 4 && <div className="absolute -top-1 left-1/2 -translate-x-1/2 h-2 w-2 rounded-full bg-red-500"/>}
            </div>
          ))}
        </div>
      </div>
      {/* 特徴比較 */}
      <div className="grid grid-cols-2 gap-2 w-full max-w-xs text-xs">
        <div className="rounded-xl border border-green-200 bg-green-50 p-2 space-y-1">
          <p className="font-bold text-green-700">ユーロゲームの特徴</p>
          <p className="text-green-600">✓ 間接的な競争</p>
          <p className="text-green-600">✓ 資源・エンジン構築</p>
          <p className="text-green-600">✓ VP積み上げ</p>
        </div>
        <div className="rounded-xl border border-red-200 bg-red-50 p-2 space-y-1">
          <p className="font-bold text-red-700">少ないもの</p>
          <p className="text-red-600">✕ 直接攻撃</p>
          <p className="text-red-600">✕ 相手の排除</p>
          <p className="text-gray-500">△ 妨害は少しあり</p>
        </div>
      </div>
    </div>
  )
}

const ILLUSTRATIONS: Record<string, React.FC> = {
  'worker-placement': IllustWorkerPlacement,
  'deck-building':    IllustDeckBuilding,
  'draft':            IllustDraft,
  'meeple':           IllustMeeple,
  'cooperative-game': IllustCooperative,
  'area-majority':    IllustAreaMajority,
  'abstract-game':    IllustAbstractGame,
  'euro-game':        IllustEuroGame,
}

function TermIllustration({ slug }: { slug: string }) {
  const Illust = ILLUSTRATIONS[slug]
  return (
    <div className="w-full overflow-hidden rounded-xl border border-amber-200/60 bg-[#FEF3E8]">
      {Illust ? <Illust /> : (
        <div className="flex h-32 items-center justify-center">
          <BookOpen className="h-10 w-10 text-amber-300" />
        </div>
      )}
    </div>
  )
}

// ─── メインページ ─────────────────────────────────────────────────────────

export default async function GlossaryTermPage({ params }: Props) {
  const { slug } = await params
  const term = getTermBySlug(slug)
  if (!term) notFound()

  const relatedTerms = GLOSSARY_TERMS.filter(t => term.relatedSlugs.includes(t.slug))

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: `${term.title}とは？`,
    description: term.shortDef,
    url: `${SITE_URL}/glossary/${slug}`,
    author: { '@type': 'Organization', name: 'ラ王のボドゲ倉庫' },
  }

  return (
    <div className="min-h-dvh bg-[linear-gradient(160deg,#1a0a00_0%,#0d0500_40%,#050200_100%)]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Suspense fallback={null}>
        <NavMenu />
      </Suspense>

      <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
        {/* パンくず */}
        <nav className="mb-6 flex items-center gap-1.5 text-xs text-white/40">
          <Link href="/" className="hover:text-white/70 transition">トップ</Link>
          <ChevronRight className="h-3 w-3" />
          <Link href="/glossary" className="hover:text-white/70 transition">用語集</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-white/60">{term.title}</span>
        </nav>

        {/* メインカード */}
        <div className="rounded-2xl border border-white/10 bg-[#FEF3E8]/95 p-6 shadow-2xl shadow-black/40">
          <span className="mb-3 inline-block rounded-full bg-amber-100 px-3 py-0.5 text-xs font-medium text-amber-800">
            {term.category}
          </span>

          <h1 className="text-2xl font-bold text-gray-900">
            {term.title}<span className="text-gray-500">とは？</span>
          </h1>
          <p className="mt-0.5 text-sm text-gray-400">（{term.reading}）</p>

          <div className="mt-4 rounded-xl border-l-4 border-amber-400 bg-amber-50 px-4 py-3">
            <p className="text-sm font-semibold text-amber-900">{term.shortDef}</p>
          </div>

          <div className="mt-5">
            <TermIllustration slug={slug} />
          </div>

          <div className="mt-5 space-y-3">
            {term.description.map((para, i) => (
              <p key={i} className="text-sm leading-relaxed text-gray-700">{para}</p>
            ))}
          </div>

          {term.relatedGenre && (
            <div className="mt-6">
              <h2 className="mb-3 flex items-center gap-2 text-sm font-bold text-gray-800">
                <Gamepad2 className="h-4 w-4 text-amber-600" />
                {term.title}系のゲームを探す
              </h2>
              <Link
                href={`/games?genre=${term.relatedGenre}`}
                className="flex items-center justify-between rounded-xl border border-amber-300/60 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800 transition hover:bg-amber-100"
              >
                <span>{term.relatedGenreLabel}の一覧を見る</span>
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          )}
        </div>

        {/* 関連用語 */}
        {relatedTerms.length > 0 && (
          <div className="mt-8">
            <h2 className="mb-3 text-sm font-bold text-white/60">関連用語</h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {relatedTerms.map(t => (
                <Link
                  key={t.slug}
                  href={`/glossary/${t.slug}`}
                  className="rounded-xl border border-white/10 bg-white/5 p-4 transition hover:bg-white/10 hover:border-amber-400/30"
                >
                  <p className="text-sm font-bold text-amber-300">{t.title}</p>
                  <p className="mt-1 text-xs text-white/50 line-clamp-2">{t.shortDef}</p>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* CTA */}
        <div className="mt-8 grid grid-cols-2 gap-3">
          <Link
            href="/games"
            className="flex items-center justify-center gap-2 rounded-xl border border-amber-400/40 bg-amber-500/10 py-3 text-sm font-semibold text-amber-300 transition hover:bg-amber-500/20"
          >
            <Gamepad2 className="h-4 w-4" />
            ゲームを探す
          </Link>
          <Link
            href="/recommend"
            className="flex items-center justify-center gap-2 rounded-xl border border-purple-400/40 bg-purple-500/10 py-3 text-sm font-semibold text-purple-300 transition hover:bg-purple-500/20"
          >
            <Wand2 className="h-4 w-4" />
            ボドゲーター
          </Link>
        </div>

        <div className="mt-6">
          <Link
            href="/glossary"
            className="flex items-center gap-2 text-sm text-white/40 transition hover:text-white/70"
          >
            <ArrowLeft className="h-4 w-4" />
            用語集一覧に戻る
          </Link>
        </div>
      </div>
    </div>
  )
}
