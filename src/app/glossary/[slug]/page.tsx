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

// 用語ごとのSVGイラスト
function TermIllustration({ slug }: { slug: string }) {
  const svgs: Record<string, React.ReactNode> = {
    'worker-placement': (
      <svg viewBox="0 0 240 160" className="w-full h-full" aria-hidden="true">
        <rect width="240" height="160" fill="#FEF3E8" rx="12"/>
        {/* グリッド */}
        {[20,80,140].map(x => [20,80,120].map(y => (
          <rect key={`${x}-${y}`} x={x} y={y} width="50" height="36" rx="6" fill="#e8d5b0" stroke="#c4a56a" strokeWidth="1.5"/>
        )))}
        {/* ワーカー（青チーム） */}
        <circle cx="45" cy="38" r="10" fill="#3B82F6"/>
        <ellipse cx="45" cy="52" rx="8" ry="4" fill="#3B82F6"/>
        <circle cx="105" cy="98" r="10" fill="#3B82F6"/>
        <ellipse cx="105" cy="112" rx="8" ry="4" fill="#3B82F6"/>
        {/* ワーカー（赤チーム） */}
        <circle cx="165" cy="38" r="10" fill="#EF4444"/>
        <ellipse cx="165" cy="52" rx="8" ry="4" fill="#EF4444"/>
        <circle cx="45" cy="98" r="10" fill="#EF4444"/>
        <ellipse cx="45" cy="112" rx="8" ry="4" fill="#EF4444"/>
        {/* ラベル */}
        <text x="120" y="152" textAnchor="middle" fontSize="11" fill="#92400e" fontFamily="sans-serif">コマを置いてアクション確保</text>
      </svg>
    ),
    'deck-building': (
      <svg viewBox="0 0 240 160" className="w-full h-full" aria-hidden="true">
        <rect width="240" height="160" fill="#FEF3E8" rx="12"/>
        {/* 初期デッキ（小） */}
        {[0,2,4].map(i => <rect key={i} x={20+i*3} y={60-i*3} width="40" height="56" rx="4" fill="#e8d5b0" stroke="#c4a56a" strokeWidth="1.5"/>)}
        <text x="40" y="72" textAnchor="middle" fontSize="9" fill="#78350f" fontFamily="sans-serif">スタート</text>
        <text x="40" y="83" textAnchor="middle" fontSize="9" fill="#78350f" fontFamily="sans-serif">デッキ</text>
        {/* 矢印 */}
        <path d="M68 88 L88 88" stroke="#C4892A" strokeWidth="2.5" markerEnd="url(#arr)"/>
        <defs><marker id="arr" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6" fill="none" stroke="#C4892A" strokeWidth="1.5"/></marker></defs>
        {/* カード購入 */}
        <rect x="90" y="50" width="36" height="50" rx="4" fill="#fbbf24" stroke="#d97706" strokeWidth="1.5"/>
        <text x="108" y="72" textAnchor="middle" fontSize="18" fontFamily="sans-serif">★</text>
        <text x="108" y="88" textAnchor="middle" fontSize="9" fill="#78350f" fontFamily="sans-serif">強カード</text>
        {/* 矢印 */}
        <path d="M134 88 L154 88" stroke="#C4892A" strokeWidth="2.5" markerEnd="url(#arr)"/>
        {/* 強化後デッキ（大） */}
        {[0,2,4,6,8].map(i => <rect key={i} x={156+i*3} y={50-i*3} width="44" height="62" rx="4" fill="#e8d5b0" stroke="#c4a56a" strokeWidth="1.5"/>)}
        <rect x="156" y="50" width="44" height="62" rx="4" fill="#fbbf24" stroke="#d97706" strokeWidth="1.5"/>
        <text x="178" y="77" textAnchor="middle" fontSize="9" fill="#78350f" fontFamily="sans-serif">強化後</text>
        <text x="178" y="89" textAnchor="middle" fontSize="9" fill="#78350f" fontFamily="sans-serif">デッキ</text>
        <text x="120" y="152" textAnchor="middle" fontSize="11" fill="#92400e" fontFamily="sans-serif">カードを獲得してデッキを育てる</text>
      </svg>
    ),
    'draft': (
      <svg viewBox="0 0 240 160" className="w-full h-full" aria-hidden="true">
        <rect width="240" height="160" fill="#FEF3E8" rx="12"/>
        {/* プレイヤー */}
        {[
          { x: 120, y: 20, label: 'A', color: '#3B82F6' },
          { x: 210, y: 90, label: 'B', color: '#10B981' },
          { x: 120, y: 130, label: 'C', color: '#F59E0B' },
          { x: 30,  y: 90, label: 'D', color: '#EF4444' },
        ].map(p => (
          <g key={p.label}>
            <circle cx={p.x} cy={p.y} r="18" fill={p.color}/>
            <text x={p.x} y={p.y+5} textAnchor="middle" fontSize="14" fill="white" fontWeight="bold" fontFamily="sans-serif">{p.label}</text>
          </g>
        ))}
        {/* 矢印（時計回り） */}
        <path d="M138 28 Q175 28 196 72" stroke="#C4892A" strokeWidth="2" fill="none" markerEnd="url(#arr2)"/>
        <path d="M204 108 Q210 130 162 138" stroke="#C4892A" strokeWidth="2" fill="none" markerEnd="url(#arr2)"/>
        <path d="M102 138 Q60 138 44 108" stroke="#C4892A" strokeWidth="2" fill="none" markerEnd="url(#arr2)"/>
        <path d="M36 72 Q36 28 102 26" stroke="#C4892A" strokeWidth="2" fill="none" markerEnd="url(#arr2)"/>
        <defs><marker id="arr2" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6" fill="none" stroke="#C4892A" strokeWidth="1.5"/></marker></defs>
        {/* 中央カード */}
        <rect x="100" y="65" width="40" height="30" rx="4" fill="#fbbf24" stroke="#d97706" strokeWidth="1.5"/>
        <text x="120" y="83" textAnchor="middle" fontSize="10" fill="#78350f" fontFamily="sans-serif">1枚選んで</text>
        <text x="120" y="152" textAnchor="middle" fontSize="11" fill="#92400e" fontFamily="sans-serif">1枚選んで残りを隣へ回す</text>
      </svg>
    ),
    'meeple': (
      <svg viewBox="0 0 240 160" className="w-full h-full" aria-hidden="true">
        <rect width="240" height="160" fill="#FEF3E8" rx="12"/>
        {/* ミープル形状（大） */}
        <g transform="translate(120,75)">
          <circle cx="0" cy="-40" r="18" fill="#C4892A"/>
          <path d="M-22,-22 C-30,-10 -28,8 -20,18 L-8,18 L-4,4 L4,4 L8,18 L20,18 C28,8 30,-10 22,-22 Z" fill="#C4892A"/>
          <path d="M-20,18 L-28,38 L-16,38 L-8,22 L8,22 L16,38 L28,38 L20,18 Z" fill="#C4892A"/>
        </g>
        {/* 色違いの小ミープル */}
        {[
          { x: 50, color: '#3B82F6' },
          { x: 90, color: '#10B981' },
          { x: 160, color: '#EF4444' },
          { x: 200, color: '#8B5CF6' },
        ].map((m, i) => (
          <g key={i} transform={`translate(${m.x}, 105) scale(0.5)`}>
            <circle cx="0" cy="-40" r="18" fill={m.color}/>
            <path d="M-22,-22 C-30,-10 -28,8 -20,18 L-8,18 L-4,4 L4,4 L8,18 L20,18 C28,8 30,-10 22,-22 Z" fill={m.color}/>
            <path d="M-20,18 L-28,38 L-16,38 L-8,22 L8,22 L16,38 L28,38 L20,18 Z" fill={m.color}/>
          </g>
        ))}
        <text x="120" y="152" textAnchor="middle" fontSize="11" fill="#92400e" fontFamily="sans-serif">ボードゲームの人型コマの総称</text>
      </svg>
    ),
    'cooperative-game': (
      <svg viewBox="0 0 240 160" className="w-full h-full" aria-hidden="true">
        <rect width="240" height="160" fill="#FEF3E8" rx="12"/>
        {/* 共通目標 */}
        <rect x="90" y="10" width="60" height="40" rx="8" fill="#FCA5A5" stroke="#EF4444" strokeWidth="2"/>
        <text x="120" y="27" textAnchor="middle" fontSize="10" fill="#7f1d1d" fontFamily="sans-serif">ゲーム</text>
        <text x="120" y="40" textAnchor="middle" fontSize="10" fill="#7f1d1d" fontFamily="sans-serif">（敵）</text>
        {/* プレイヤーたち */}
        {[
          { x: 40,  y: 100, color: '#3B82F6', label: 'P1' },
          { x: 100, y: 120, color: '#10B981', label: 'P2' },
          { x: 160, y: 100, color: '#F59E0B', label: 'P3' },
          { x: 120, y: 80,  color: '#8B5CF6', label: 'P4' },
        ].map(p => (
          <g key={p.label}>
            <circle cx={p.x} cy={p.y} r="16" fill={p.color}/>
            <text x={p.x} y={p.y+5} textAnchor="middle" fontSize="11" fill="white" fontWeight="bold" fontFamily="sans-serif">{p.label}</text>
          </g>
        ))}
        {/* 協力の矢印 */}
        <path d="M56 94 L104 88" stroke="#C4892A" strokeWidth="2" markerEnd="url(#arr3)"/>
        <path d="M116 88 L148 94" stroke="#C4892A" strokeWidth="2" markerEnd="url(#arr3)"/>
        <path d="M100 104 L108 52" stroke="#C4892A" strokeWidth="2" markerEnd="url(#arr3)"/>
        <defs><marker id="arr3" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6" fill="none" stroke="#C4892A" strokeWidth="1.5"/></marker></defs>
        {/* VS */}
        <text x="190" y="60" fontSize="16" fill="#EF4444" fontWeight="bold" fontFamily="sans-serif">VS</text>
        <path d="M165 62 L185 52" stroke="#EF4444" strokeWidth="2"/>
        <text x="120" y="152" textAnchor="middle" fontSize="11" fill="#92400e" fontFamily="sans-serif">全員でゲームに勝つ or 負ける</text>
      </svg>
    ),
    'area-majority': (
      <svg viewBox="0 0 240 160" className="w-full h-full" aria-hidden="true">
        <rect width="240" height="160" fill="#FEF3E8" rx="12"/>
        {/* エリア分割 */}
        <rect x="15" y="15" width="70" height="55" rx="6" fill="#BFDBFE" stroke="#3B82F6" strokeWidth="2"/>
        <rect x="95" y="15" width="70" height="55" rx="6" fill="#FEF3C7" stroke="#D97706" strokeWidth="2"/>
        <rect x="175" y="15" width="50" height="55" rx="6" fill="#FCE7F3" stroke="#EC4899" strokeWidth="2"/>
        <rect x="15" y="82" width="100" height="63" rx="6" fill="#D1FAE5" stroke="#10B981" strokeWidth="2"/>
        <rect x="125" y="82" width="100" height="63" rx="6" fill="#EDE9FE" stroke="#8B5CF6" strokeWidth="2"/>
        {/* コマ配置 */}
        {/* エリア1: 青3個 */}
        {[35,55,75].map((x,i) => <circle key={i} cx={x} cy="42" r="8" fill="#3B82F6"/>)}
        {/* エリア2: 青1 赤2 */}
        <circle cx="115" cy="42" r="8" fill="#3B82F6"/>
        {[135,155].map((x,i) => <circle key={i} cx={x} cy="42" r="8" fill="#EF4444"/>)}
        {/* エリア3: 赤2 */}
        {[185,205].map((x,i) => <circle key={i} cx={x} cy="42" r="8" fill="#EF4444"/>)}
        {/* スコア */}
        <text x="50" y="80" textAnchor="middle" fontSize="10" fill="#1d4ed8" fontWeight="bold" fontFamily="sans-serif">青 支配</text>
        <text x="130" y="80" textAnchor="middle" fontSize="10" fill="#b91c1c" fontWeight="bold" fontFamily="sans-serif">赤 支配</text>
        <text x="200" y="80" textAnchor="middle" fontSize="10" fill="#b91c1c" fontWeight="bold" fontFamily="sans-serif">赤</text>
        <text x="120" y="152" textAnchor="middle" fontSize="11" fill="#92400e" fontFamily="sans-serif">各エリアで多数派を目指す</text>
      </svg>
    ),
    'abstract-game': (
      <svg viewBox="0 0 240 160" className="w-full h-full" aria-hidden="true">
        <rect width="240" height="160" fill="#FEF3E8" rx="12"/>
        {/* 碁盤風グリッド */}
        {[40,72,104,136,168].map(x => <line key={`v${x}`} x1={x} y1="20" x2={x} y2="132" stroke="#c4a56a" strokeWidth="1"/>)}
        {[20,52,84,116,132].map(y => <line key={`h${y}`} x1="40" y1={y} x2="168" y2={y} stroke="#c4a56a" strokeWidth="1"/>)}
        {/* 黒石 */}
        {[[40,20],[72,52],[104,20],[136,84],[168,52],[104,84],[40,116]].map(([x,y],i) =>
          <circle key={i} cx={x} cy={y} r="10" fill="#1c1917" stroke="#78716c" strokeWidth="1"/>
        )}
        {/* 白石 */}
        {[[72,20],[104,52],[136,20],[40,52],[168,84],[72,116],[136,116]].map(([x,y],i) =>
          <circle key={i} cx={x} cy={y} r="10" fill="#fafaf9" stroke="#a8a29e" strokeWidth="1"/>
        )}
        {/* 無テーマ表示 */}
        <rect x="175" y="45" width="55" height="70" rx="8" fill="#fff8f0" stroke="#c4a56a" strokeWidth="1.5"/>
        <text x="202" y="67" textAnchor="middle" fontSize="9" fill="#78350f" fontFamily="sans-serif">テーマ</text>
        <text x="202" y="79" textAnchor="middle" fontSize="9" fill="#78350f" fontFamily="sans-serif">なし</text>
        <line x1="178" y1="48" x2="227" y2="112" stroke="#EF4444" strokeWidth="2"/>
        <line x1="227" y1="48" x2="178" y2="112" stroke="#EF4444" strokeWidth="2"/>
        <text x="120" y="152" textAnchor="middle" fontSize="11" fill="#92400e" fontFamily="sans-serif">純粋な思考力・戦略だけで競う</text>
      </svg>
    ),
    'euro-game': (
      <svg viewBox="0 0 240 160" className="w-full h-full" aria-hidden="true">
        <rect width="240" height="160" fill="#FEF3E8" rx="12"/>
        {/* 勝利点トラック */}
        <rect x="20" y="20" width="200" height="30" rx="6" fill="#e8d5b0" stroke="#c4a56a" strokeWidth="1.5"/>
        <text x="30" y="40" fontSize="10" fill="#78350f" fontFamily="sans-serif">VP</text>
        {[0,1,2,3,4,5,6,7,8,9].map(i =>
          <rect key={i} x={50+i*16} y="24" width="14" height="22" rx="2" fill={i<7?"#fef9c3":"#e8d5b0"} stroke="#c4a56a" strokeWidth="1"/>
        )}
        {[0,1,2,3,4,5,6,7,8,9].map(i =>
          <text key={i} x={57+i*16} y="38" textAnchor="middle" fontSize="9" fill="#78350f" fontFamily="sans-serif">{i+1}</text>
        )}
        {/* プレイヤーマーカー */}
        <circle cx="106" cy="35" r="7" fill="#3B82F6" stroke="white" strokeWidth="1.5"/>
        <circle cx="122" cy="35" r="7" fill="#EF4444" stroke="white" strokeWidth="1.5"/>
        {/* 建設的な競争 */}
        <rect x="20" y="65" width="90" height="75" rx="8" fill="#d1fae5" stroke="#10B981" strokeWidth="1.5"/>
        <text x="65" y="83" textAnchor="middle" fontSize="9" fill="#065f46" fontWeight="bold" fontFamily="sans-serif">間接的な競争</text>
        <text x="65" y="96" textAnchor="middle" fontSize="9" fill="#065f46" fontFamily="sans-serif">・資源収集</text>
        <text x="65" y="108" textAnchor="middle" fontSize="9" fill="#065f46" fontFamily="sans-serif">・エンジン構築</text>
        <text x="65" y="120" textAnchor="middle" fontSize="9" fill="#065f46" fontFamily="sans-serif">・VP積み上げ</text>
        <rect x="130" y="65" width="90" height="75" rx="8" fill="#fee2e2" stroke="#EF4444" strokeWidth="1.5"/>
        <text x="175" y="83" textAnchor="middle" fontSize="9" fill="#7f1d1d" fontWeight="bold" fontFamily="sans-serif">直接攻撃は少ない</text>
        <text x="175" y="96" textAnchor="middle" fontSize="9" fill="#7f1d1d" fontFamily="sans-serif">✕ユニット破壊</text>
        <text x="175" y="108" textAnchor="middle" fontSize="9" fill="#7f1d1d" fontFamily="sans-serif">✕領土侵略</text>
        <text x="175" y="120" textAnchor="middle" fontSize="9" fill="#7f1d1d" fontFamily="sans-serif">△妨害は少しあり</text>
        <text x="120" y="152" textAnchor="middle" fontSize="11" fill="#92400e" fontFamily="sans-serif">勝利点を積み上げて勝つ欧州スタイル</text>
      </svg>
    ),
  }

  return (
    <div className="aspect-[3/2] w-full overflow-hidden rounded-xl border border-amber-200/60 bg-[#FEF3E8]">
      {svgs[slug] ?? (
        <div className="flex h-full items-center justify-center">
          <BookOpen className="h-12 w-12 text-amber-300" />
        </div>
      )}
    </div>
  )
}

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
          {/* カテゴリバッジ */}
          <span className="mb-3 inline-block rounded-full bg-amber-100 px-3 py-0.5 text-xs font-medium text-amber-800">
            {term.category}
          </span>

          {/* タイトル */}
          <h1 className="text-2xl font-bold text-gray-900">
            {term.title}<span className="text-gray-500">とは？</span>
          </h1>
          <p className="mt-0.5 text-sm text-gray-400">（{term.reading}）</p>

          {/* 一言定義 */}
          <div className="mt-4 rounded-xl border-l-4 border-amber-400 bg-amber-50 px-4 py-3">
            <p className="text-sm font-semibold text-amber-900">{term.shortDef}</p>
          </div>

          {/* SVGイラスト */}
          <div className="mt-5">
            <TermIllustration slug={slug} />
          </div>

          {/* 説明文 */}
          <div className="mt-5 space-y-3">
            {term.description.map((para, i) => (
              <p key={i} className="text-sm leading-relaxed text-gray-700">{para}</p>
            ))}
          </div>

          {/* 関連ゲームへのリンク */}
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

        {/* 用語集一覧へ戻る */}
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
