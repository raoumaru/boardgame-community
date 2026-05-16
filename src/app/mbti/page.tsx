'use client'

import { useState, useCallback, Suspense } from 'react'
import Link from 'next/link'
import { Swords, ExternalLink, RotateCcw, ChevronLeft, Share2 } from 'lucide-react'
import { NavMenu } from '@/components/ui/NavMenu'

// ─── データ定義 ────────────────────────────────────────────────────────────────

const QUESTIONS = [
  { id: 1,  axis: 'DW', text: 'ゲームを始める前に、まず全体の戦略を立てたい。',              dir: 'A' },
  { id: 2,  axis: 'DW', text: 'その場の流れや勢いで動くほうが、じっくり考えるより楽しい。',   dir: 'B' },
  { id: 3,  axis: 'DW', text: '相手の行動を予測して、先手を打つのが好きだ。',              dir: 'A' },
  { id: 4,  axis: 'DW', text: 'ゲームでサイコロやカードなどの運要素があったほうがワクワクする。', dir: 'B' },
  { id: 5,  axis: 'DW', text: '負けたとき、何が悪かったか真剣に分析する。',              dir: 'A' },
  { id: 6,  axis: 'RU', text: 'ゲームで誰かを出し抜いて勝ったとき、最高に気持ちいい。',       dir: 'A' },
  { id: 7,  axis: 'RU', text: 'みんなで力を合わせてクリアできたとき、最も達成感を感じる。',    dir: 'B' },
  { id: 8,  axis: 'RU', text: '友達同士でも、ゲーム中は全力で競い合いたい。',              dir: 'A' },
  { id: 9,  axis: 'RU', text: 'チームが勝つためなら、自分が目立たなくてもいい。',           dir: 'B' },
  { id: 10, axis: 'RU', text: 'ランキングや順位があるゲームのほうが燃える。',              dir: 'A' },
  { id: 11, axis: 'IG', text: '2〜3人でじっくり、深く楽しむゲームが好きだ。',             dir: 'A' },
  { id: 12, axis: 'IG', text: '大勢で賑やかにワイワイするゲームのほうが楽しい。',           dir: 'B' },
  { id: 13, axis: 'IG', text: '少人数のほうが、お互いの動きをよく観察できて面白い。',        dir: 'A' },
  { id: 14, axis: 'IG', text: 'プレイヤーが多いほど、ゲームが盛り上がると思う。',           dir: 'B' },
  { id: 15, axis: 'IG', text: '初対面の人と大勢で遊ぶボードゲームが好きだ。',             dir: 'B' },
  { id: 16, axis: 'HL', text: '複雑なルールでも、時間をかけてでも覚えたい。',             dir: 'A' },
  { id: 17, axis: 'HL', text: 'サクッと短時間で終わるゲームを何回も繰り返すほうが好きだ。',   dir: 'B' },
  { id: 18, axis: 'HL', text: '2〜3時間かかるボードゲームでも、全く苦にならない。',         dir: 'A' },
  { id: 19, axis: 'HL', text: 'ルール説明が長いゲームは、始める前に少し億劫になる。',        dir: 'B' },
  { id: 20, axis: 'HL', text: 'ゲームの深みやリプレイ性を最も重視する。',               dir: 'A' },
] as const

type TypeCode = 'DRIH'|'DRIL'|'DRGH'|'DRGL'|'DUIH'|'DUIL'|'DUGH'|'DUGL'|'WRIH'|'WRIL'|'WRGH'|'WRGL'|'WUIH'|'WUIL'|'WUGH'|'WUGL'

const TYPES: Record<TypeCode, { name: string; description: string; games: string[] }> = {
  DRIH: {
    name: 'ダークストラテジスト',
    description: '深い思考と1対1の勝負に最高の喜びを感じる孤高の戦略家。重厚なゲームで相手を追い詰めることに生きがいを感じる完全主義者。盤面の隅々まで計算し尽くしてこそ本領発揮。',
    games: ['テラフォーミング・マーズ', 'ルアーブル', 'ブラス：バーミンガム'],
  },
  DRIL: {
    name: 'サイレントキラー',
    description: '無駄のない洗練された一手で静かに勝利をもぎ取るタイプ。軽量ゲームでも緻密な計算で差をつけ、気づいたときにはもう詰んでいる。多くを語らず、結果だけが雄弁に語る。',
    games: ['七不思議デュエル', 'カスカディア', 'ハイブ'],
  },
  DRGH: {
    name: 'シャドウエンペラー',
    description: '大勢の中でも冷静に全体を把握し、戦略的に動く影の支配者。重量ゲームで真価を発揮し、複数の相手を同時に読んで勝利を手繰り寄せる。混沌の中にこそ秩序を見出す。',
    games: ['エクリプス', 'スモールワールド', 'シヴィライゼーション'],
  },
  DRGL: {
    name: 'ブラッドハンター',
    description: 'にぎやかな場でも勝ちへの執念を決して忘れない。軽いゲームでも手を抜かず、場の空気を読みながら確実に勝利を狙う。笑顔の裏で常に勝算を計算している。',
    games: ['ドミニオン', 'ウィングスパン', '宝石の煌き'],
  },
  DUIH: {
    name: 'ゴーストコンスピレイター',
    description: '少人数でひっそりと陰謀をめぐらせ、仲間と深く連携するタイプ。重厚なゲームで緻密な協力プレイを楽しみ、密かに最善手を追求する完璧主義な協力者。',
    games: ['グルームヘイヴン', 'マルコポーロの旅', 'フロスト'],
  },
  DUIL: {
    name: 'ダークパートナー',
    description: '少人数の仲間と密に連携し、共に困難を乗り越えることに喜びを感じる。ゲームの重さより仲間との絆を最優先にし、信頼関係の中で最善の協力を生み出す。',
    games: ['パンデミック', 'フォレスト・シャッフル', 'アーカム・ホラー'],
  },
  DUGH: {
    name: 'アンダーグラウンドリーダー',
    description: '表には出ないが、大人数チームの方向性をひそかにコントロールするリーダー気質。重量ゲームで全員の戦略を束ねる縁の下の力持ち。みんなが気づかない最善手を先読みしている。',
    games: ['マジック・メイズ', 'ディセント', 'アーカム・ホラーLCG'],
  },
  DUGL: {
    name: 'パペットマスター',
    description: '大人数の中で全員を動かしながら、見えない糸で勝利を操るタイプ。軽いゲームでもチームをまとめる力があり、自然とみんながついてくる。戦略と人望を兼ね備えた存在。',
    games: ['コードネーム', 'ハンビ', 'ワードスミス'],
  },
  WRIH: {
    name: 'デビルギャンブラー',
    description: '計算より勘を信じ、運とリスクを楽しむ少人数向けの勝負師。重量ゲームで予測不能な動きを繰り出し、相手を翻弄する。ハイリスクハイリターンこそが生きがい。',
    games: ['バックギャモン', 'エルドラド', 'ルーインズ'],
  },
  WRIL: {
    name: 'カオスジョーカー',
    description: '自分でも何をするかわからない予測不能の一匹狼。軽量ゲームで思いつきの行動が奇跡的に決まることに快感を覚える。敵も味方も、そして自分さえも混乱させる存在。',
    games: ['ラブレター', 'クワークル', 'フラックス'],
  },
  WRGH: {
    name: 'アナーキーメッセンジャー',
    description: '大人数の場を混沌に陥れることを楽しむカオスメーカー。重量ゲームでも自由奔放に動き回り、秩序を破壊しながら強烈な存在感を放つ。誰も予測できない動きが最大の武器。',
    games: ['キングダムビルダー', 'スモールワールド', 'エイジ・オブ・エンパイア'],
  },
  WRGL: {
    name: 'ルーレットマニア',
    description: '大勢でワイワイ、運任せで笑えればそれでいい。深く考えず流れに乗り、その場のノリで動く盛り上げ上手。勝っても負けても笑顔でいられるムードメーカー。',
    games: ['ito', 'ガリンポ', 'カタン'],
  },
  WUIH: {
    name: 'カースドエクスプローラー',
    description: '行き当たりばったりで迷子になりながら、仲間と一緒に試行錯誤するタイプ。重量ゲームで予期せぬ展開を楽しみながら協力プレイに没頭する冒険者。失敗も含めて旅の醍醐味。',
    games: ['エルドリッチホラー', 'クトゥルフの呼び声', 'ジョーウォーカー'],
  },
  WUIL: {
    name: 'ダークエンジェル',
    description: '感覚で動きながら少人数の仲間と笑いに変えていくタイプ。軽いゲームで失敗も楽しみながら、独自のセンスで場を盛り上げる。失敗すら魅力的に見せてしまう不思議な存在。',
    games: ['ナナトリドリ', 'おばけキャッチ', 'ニムト'],
  },
  WUGH: {
    name: 'ナイトメアホスト',
    description: '大人数を巻き込んで嵐のような盛り上がりを作り出す主催者気質。重量ゲームでも空気を読まずに全力で楽しみ、場の熱量を最大化する。その場にいるだけで空気が変わる。',
    games: ['マジック・メイズ', 'ダンジョン！', 'ウルフ＆ヒツジ'],
  },
  WUGL: {
    name: 'ロストドリーマー',
    description: '大勢でわちゃわちゃしながら終わりを迎えたくない夢見がち。軽いゲームで仲間と笑い続けることが最高の目的。勝敗より過程と雰囲気を大切にする、みんなの癒し的存在。',
    games: ['ドブル', 'テレストレーション', 'コードネーム'],
  },
}

const AXES = [
  { key: 'DW', labelA: 'D 戦略型', labelB: 'W 直感型' },
  { key: 'RU', labelA: 'R 競争型', labelB: 'U 協力型' },
  { key: 'IG', labelA: 'I 少人数型', labelB: 'G 大人数型' },
  { key: 'HL', labelA: 'H 重量級型', labelB: 'L 軽量級型' },
]

// ─── スコア計算 ───────────────────────────────────────────────────────────────

function calcType(answers: Record<number, number>): { code: TypeCode; scores: Record<string, { a: number; b: number }> } {
  const scores: Record<string, { a: number; b: number }> = {
    DW: { a: 0, b: 0 },
    RU: { a: 0, b: 0 },
    IG: { a: 0, b: 0 },
    HL: { a: 0, b: 0 },
  }

  for (const q of QUESTIONS) {
    const val = answers[q.id]
    if (val === undefined) continue
    const score = 4 - val
    if (q.dir === 'A') {
      scores[q.axis].a += score
    } else {
      scores[q.axis].b += score
    }
  }

  const d = scores.DW.a >= scores.DW.b ? 'D' : 'W'
  const r = scores.RU.a >= scores.RU.b ? 'R' : 'U'
  const i = scores.IG.a >= scores.IG.b ? 'I' : 'G'
  const h = scores.HL.a >= scores.HL.b ? 'H' : 'L'
  return { code: `${d}${r}${i}${h}` as TypeCode, scores }
}

// ─── コンポーネント ────────────────────────────────────────────────────────────

type Stage = 'intro' | 'quiz' | 'result'

export default function MbtiPage() {
  const [stage, setStage] = useState<Stage>('intro')
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<number, number>>({})
  const [pendingNext, setPendingNext] = useState(false)
  const [result, setResult] = useState<{ code: TypeCode; scores: Record<string, { a: number; b: number }> } | null>(null)

  const currentQ = QUESTIONS[currentIndex]
  const totalAnswered = Object.keys(answers).length
  const allAnswered = totalAnswered === QUESTIONS.length

  const handleSelect = useCallback((val: number) => {
    if (pendingNext) return
    setAnswers(prev => ({ ...prev, [currentQ.id]: val }))

    if (currentIndex < QUESTIONS.length - 1) {
      setPendingNext(true)
      setTimeout(() => {
        setCurrentIndex(i => i + 1)
        setPendingNext(false)
      }, 200)
    }
  }, [currentQ.id, currentIndex, pendingNext])

  const handleDiagnose = () => {
    if (!allAnswered) return
    const r = calcType(answers)
    setResult(r)
    setStage('result')
  }

  const handleReset = () => {
    setStage('intro')
    setCurrentIndex(0)
    setAnswers({})
    setResult(null)
    setPendingNext(false)
  }

  // ── イントロ画面 ─────────────────────────────────────────────────────────────
  if (stage === 'intro') {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center px-4 py-12">
        <Suspense fallback={null}><NavMenu /></Suspense>
        <div className="w-full max-w-md text-center">
          <div className="mb-4 flex justify-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-amber-500/20 border border-amber-400/30">
              <Swords className="h-10 w-10 text-amber-300" />
            </div>
          </div>
          <p className="mb-1 text-xs tracking-[0.3em] text-amber-400/60 uppercase">Board Game MBTI</p>
          <h1 className="mb-4 text-4xl font-bold tracking-wide text-amber-100">ボドゲMBTI</h1>
          <p className="mb-2 text-sm text-amber-200/70">20問の診断でボードゲームの好みを</p>
          <p className="mb-2 text-sm text-amber-200/70">16タイプに分類します</p>
          <p className="mb-8 text-xs text-amber-400/50">所要時間：約3〜5分</p>

          {/* 16タイプ プレビュー */}
          <div className="mb-8 grid grid-cols-4 gap-1.5">
            {(Object.keys(TYPES) as TypeCode[]).map(code => (
              <div key={code} className="rounded-lg border border-white/10 bg-white/5 px-1 py-2 text-center">
                <p className="text-xs font-bold text-amber-300">{code}</p>
                <p className="mt-0.5 text-[9px] leading-tight text-white/50">{TYPES[code].name}</p>
              </div>
            ))}
          </div>

          <button
            onClick={() => setStage('quiz')}
            className="group inline-flex items-center gap-2 rounded-full bg-amber-500 px-8 py-3.5 text-base font-bold text-white shadow-lg shadow-amber-900/50 transition-all hover:bg-amber-400 hover:-translate-y-0.5"
          >
            <span>診断を始める</span>
            <span className="transition-transform group-hover:translate-x-1">→</span>
          </button>
          <div className="mt-5">
            <Link href="/games" className="text-xs text-amber-600/60 hover:text-amber-500/80 transition-colors">
              ← ゲーム一覧に戻る
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // ── 結果画面 ──────────────────────────────────────────────────────────────────
  if (stage === 'result' && result) {
    const typeData = TYPES[result.code]
    return (
      <div className="min-h-dvh px-4 py-12">
        <Suspense fallback={null}><NavMenu /></Suspense>
        <div className="mx-auto max-w-lg">
          {/* タイプコード・名前 */}
          <div className="mb-6 text-center">
            <p className="mb-1 text-xs tracking-[0.3em] text-amber-400/60 uppercase">Your Type</p>
            <div className="mb-2 text-6xl font-black tracking-widest text-amber-300">
              {result.code}
            </div>
            <h2 className="text-2xl font-bold text-amber-100">{typeData.name}</h2>
          </div>

          {/* 説明 */}
          <div className="mb-5 rounded-2xl border border-white/10 bg-white/5 p-5">
            <p className="text-sm leading-relaxed text-white/80">{typeData.description}</p>
          </div>

          {/* 軸スコアバー */}
          <div className="mb-5 rounded-2xl border border-white/10 bg-white/5 p-5">
            <h3 className="mb-4 text-xs font-bold tracking-widest text-amber-400/70 uppercase">診断スコア</h3>
            {AXES.map(axis => {
              const s = result.scores[axis.key]
              const total = Math.abs(s.a) + Math.abs(s.b) || 1
              const aRatio = Math.round(((s.a + 15) / 30) * 100)
              return (
                <div key={axis.key} className="mb-3 last:mb-0">
                  <div className="mb-1 flex justify-between text-xs text-white/60">
                    <span className="font-medium text-amber-300">{axis.labelA}</span>
                    <span className="font-medium text-white/40">{axis.labelB}</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full bg-amber-400 transition-all duration-700"
                      style={{ width: `${aRatio}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>

          {/* おすすめゲーム */}
          <div className="mb-6 rounded-2xl border border-amber-400/20 bg-amber-500/5 p-5">
            <h3 className="mb-3 text-xs font-bold tracking-widest text-amber-400/70 uppercase">おすすめゲーム</h3>
            <div className="space-y-2">
              {typeData.games.map(game => (
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

          {/* SNSシェア */}
          <div className="mb-5 rounded-2xl border border-white/10 bg-white/5 p-5">
            <h3 className="mb-3 flex items-center gap-2 text-xs font-bold tracking-widest text-amber-400/70 uppercase">
              <Share2 className="h-3.5 w-3.5" />
              シェアする
            </h3>
            <div className="flex gap-2">
              {/* X (Twitter) */}
              <a
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
                  `ボドゲMBTI診断で【${result.code}：${typeData.name}】でした！\n\n${typeData.description.slice(0, 40)}...\n\nあなたのタイプは？\n#ボドゲMBTI #ボードゲーム`
                )}&url=${encodeURIComponent('https://www.boardgame-raou.com/mbti')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-black border border-white/20 px-4 py-3 text-sm font-bold text-white transition hover:bg-white/10"
              >
                <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.766l7.73-8.835L1.254 2.25H8.08l4.253 5.622L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                Xでシェア
              </a>
              {/* LINE */}
              <a
                href={`https://social-plugins.line.me/lineit/share?url=${encodeURIComponent('https://www.boardgame-raou.com/mbti')}&text=${encodeURIComponent(
                  `ボドゲMBTI診断で【${result.code}：${typeData.name}】でした！あなたのタイプは？`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#06C755] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#05b34c]"
              >
                <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24"><path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.281.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314"/></svg>
                LINEでシェア
              </a>
            </div>
          </div>

          {/* ボタン */}
          <div className="space-y-3 text-center">
            <button
              onClick={handleReset}
              className="inline-flex items-center gap-2 rounded-full border border-amber-500/40 px-6 py-2.5 text-sm text-amber-400 transition-all hover:bg-amber-500/10 hover:border-amber-400"
            >
              <RotateCcw className="h-4 w-4" />
              もう一度診断する
            </button>
            <div>
              <Link href="/games" className="text-xs text-amber-600/60 hover:text-amber-500/80 transition-colors">
                ← ゲーム一覧に戻る
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ── クイズ画面 ────────────────────────────────────────────────────────────────
  const axisIndex = AXES.findIndex(a => a.key === currentQ.axis)
  const isLastQuestion = currentIndex === QUESTIONS.length - 1
  const currentAnswer = answers[currentQ.id]

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-4 py-8">
      <Suspense fallback={null}><NavMenu /></Suspense>
      <div className="w-full max-w-lg">

        {/* 進捗バー */}
        <div className="mb-5">
          <div className="mb-1 flex justify-between text-xs text-amber-400/50">
            <span>Q{currentIndex + 1} / {QUESTIONS.length}</span>
            <span>{totalAnswered} 問回答済み</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-amber-400 transition-all duration-300"
              style={{ width: `${(totalAnswered / QUESTIONS.length) * 100}%` }}
            />
          </div>
        </div>

        {/* 軸インジケーター */}
        <div className="mb-6 flex gap-1.5">
          {AXES.map((axis, i) => (
            <div
              key={axis.key}
              className={`flex-1 rounded-lg py-1.5 text-center text-[10px] font-bold transition-all ${
                i === axisIndex
                  ? 'bg-amber-500/30 border border-amber-400/50 text-amber-300'
                  : 'bg-white/5 border border-white/10 text-white/30'
              }`}
            >
              {axis.key}
            </div>
          ))}
        </div>

        {/* 質問 */}
        <div className="mb-10 text-center">
          <p className="mb-1 text-xs tracking-[0.3em] text-amber-400/40 uppercase">
            Q{currentIndex + 1}
          </p>
          <h2 className="text-xl font-bold leading-relaxed text-amber-100">
            {currentQ.text}
          </h2>
        </div>

        {/* 7段階スケール */}
        <div className="mb-3 flex items-center justify-center gap-2">
          {[1, 2, 3, 4, 5, 6, 7].map(val => {
            const isSelected = currentAnswer === val
            const size = val <= 2 ? 'h-12 w-12 text-base' : val <= 4 ? 'h-10 w-10 text-sm' : val <= 6 ? 'h-8 w-8 text-xs' : 'h-7 w-7 text-xs'
            return (
              <button
                key={val}
                onClick={() => handleSelect(val)}
                className={`${size} flex shrink-0 items-center justify-center rounded-full border font-bold transition-all duration-150 ${
                  isSelected
                    ? 'border-amber-400 bg-amber-400 text-white shadow-[0_0_12px_rgba(251,191,36,0.4)]'
                    : 'border-white/20 bg-black/30 text-white/50 hover:border-amber-400/50 hover:text-white/80'
                }`}
              >
                {val}
              </button>
            )
          })}
        </div>
        <div className="mb-8 flex justify-between text-xs text-white/30">
          <span>そう思う</span>
          <span>そう思わない</span>
        </div>

        {/* ナビゲーション */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => {
              if (currentIndex > 0) setCurrentIndex(i => i - 1)
              else setStage('intro')
            }}
            className="inline-flex items-center gap-1.5 rounded-full border border-white/15 px-5 py-2.5 text-sm text-white/50 transition-all hover:border-white/30 hover:text-white/80"
          >
            <ChevronLeft className="h-4 w-4" />
            戻る
          </button>

          {isLastQuestion ? (
            <button
              onClick={handleDiagnose}
              disabled={!allAnswered}
              className="inline-flex items-center gap-2 rounded-full bg-amber-500 px-8 py-2.5 text-sm font-bold text-white shadow-lg shadow-amber-900/40 transition-all hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-30"
            >
              <Swords className="h-4 w-4" />
              診断する
            </button>
          ) : (
            <button
              onClick={() => {
                if (currentIndex < QUESTIONS.length - 1) setCurrentIndex(i => i + 1)
              }}
              disabled={currentAnswer === undefined}
              className="inline-flex items-center gap-2 rounded-full bg-amber-500 px-8 py-2.5 text-sm font-bold text-white shadow-lg shadow-amber-900/40 transition-all hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-30"
            >
              次へ →
            </button>
          )}
        </div>

        {/* 問番号 */}
        <p className="mt-4 text-center text-xs text-amber-600/40">
          {currentIndex + 1} / {QUESTIONS.length}
        </p>
      </div>
    </div>
  )
}
