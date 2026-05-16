'use client'

import { useState, useRef, useCallback, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { Swords, ExternalLink, RotateCcw, Share2, ThumbsUp, ThumbsDown, Zap, Copy, Check } from 'lucide-react'
import { NavMenu } from '@/components/ui/NavMenu'
import { TYPES, type TypeCode } from './data'

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


const AXES = [
  { key: 'DW', labelA: 'D 戦略型', labelB: 'W 直感型' },
  { key: 'RU', labelA: 'R 競争型', labelB: 'U 協力型' },
  { key: 'IG', labelA: 'I 少人数型', labelB: 'G 大人数型' },
  { key: 'HL', labelA: 'H 重量級型', labelB: 'L 軽量級型' },
]

// 値1〜7 に対応する円のサイズ（両端が大きく、中央が小さい対称デザイン）
const CIRCLE_SIZES = [
  'h-14 w-14 text-base',
  'h-11 w-11 text-sm',
  'h-9 w-9 text-sm',
  'h-7 w-7 text-xs',
  'h-9 w-9 text-sm',
  'h-11 w-11 text-sm',
  'h-14 w-14 text-base',
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
type DiagResult = { code: TypeCode; scores: Record<string, { a: number; b: number }> }

export default function MbtiPage() {
  const [stage, setStage] = useState<Stage>('intro')
  const [answers, setAnswers] = useState<Record<number, number>>({})
  const [result, setResult] = useState<DiagResult | null>(null)
  const [savedResult, setSavedResult] = useState<DiagResult | null>(null)
  const [copied, setCopied] = useState(false)

  const questionRefs = useRef<Array<HTMLDivElement | null>>(Array(QUESTIONS.length).fill(null))

  // 前回の診断結果をlocalStorageから読み込む
  useEffect(() => {
    try {
      const saved = localStorage.getItem('mbti-last-result')
      if (saved) setSavedResult(JSON.parse(saved))
    } catch {}
  }, [])

  const totalAnswered = Object.keys(answers).length
  const allAnswered = totalAnswered === QUESTIONS.length

  const handleSelect = useCallback((qId: number, qIndex: number, val: number) => {
    setAnswers(prev => {
      const next = { ...prev, [qId]: val }
      let nextIdx = -1
      for (let i = qIndex + 1; i < QUESTIONS.length; i++) {
        if (next[QUESTIONS[i].id] === undefined) { nextIdx = i; break }
      }
      if (nextIdx !== -1) {
        setTimeout(() => {
          questionRefs.current[nextIdx]?.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }, 150)
      }
      return next
    })
  }, [])

  const handleDiagnose = () => {
    if (!allAnswered) return
    const r = calcType(answers)
    setResult(r)
    setStage('result')
    try { localStorage.setItem('mbti-last-result', JSON.stringify(r)) } catch {}
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleReset = () => {
    setStage('intro')
    setAnswers({})
    setResult(null)
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior })
  }

  const handleCopyForInstagram = (code: TypeCode, name: string, catchcopy: string) => {
    const text = `ボドゲMBTI診断で【${code}：${name}】でした！\n「${catchcopy}」\n\n#ボドゲMBTI #ボードゲーム\nhttps://www.boardgame-raou.com/mbti`
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  // ── イントロ画面 ─────────────────────────────────────────────────────────────
  if (stage === 'intro') {
    return (
      <div className="min-h-dvh px-4 py-12">
        <Suspense fallback={null}><NavMenu /></Suspense>

        {/* ヒーローセクション */}
        <div className="mb-12 text-center">
          <div className="mb-4 flex justify-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-amber-500/20 border border-amber-400/30">
              <Swords className="h-10 w-10 text-amber-300" />
            </div>
          </div>
          <p className="mb-1 text-xs tracking-[0.3em] text-amber-400/60 uppercase">Board Game MBTI</p>
          <h1 className="mb-4 text-4xl font-bold tracking-wide text-amber-100">ボドゲMBTI</h1>
          <p className="mb-1 text-sm text-amber-200/70">20問の診断でボードゲームの好みを16タイプに分類します</p>
          <p className="mb-8 text-xs text-amber-400/50">所要時間：約3〜5分</p>
          <button
            onClick={() => setStage('quiz')}
            className="group inline-flex items-center gap-2 rounded-full bg-amber-500 px-8 py-3.5 text-base font-bold text-white shadow-lg shadow-amber-900/50 transition-all hover:bg-amber-400 hover:-translate-y-0.5"
          >
            <span>診断を始める</span>
            <span className="transition-transform group-hover:translate-x-1">→</span>
          </button>

          {/* 前回の結果 */}
          {savedResult && (
            <div className="mt-5">
              <button
                onClick={() => { setResult(savedResult); setStage('result') }}
                className="inline-flex items-center gap-2 rounded-full border border-amber-400/30 px-5 py-2 text-xs text-amber-400/70 transition-all hover:border-amber-400/60 hover:text-amber-300"
              >
                <RotateCcw className="h-3 w-3" />
                前回の結果を見る：{savedResult.code}「{TYPES[savedResult.code].name}」
              </button>
            </div>
          )}
        </div>

        {/* キャラクター紹介 */}
        <div className="mx-auto max-w-3xl">
          <h2 className="mb-6 text-center text-xl font-bold text-amber-100">キャラクター紹介</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {(Object.entries(TYPES) as [TypeCode, typeof TYPES[TypeCode]][]).map(([code, type]) => (
              <Link
                key={code}
                href={`/mbti/${code.toLowerCase()}`}
                className="flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/5 text-center transition-all hover:border-amber-400/40 hover:bg-amber-500/8 hover:-translate-y-0.5"
              >
                {/* タイプコード */}
                <div className="px-3 pt-3 pb-1">
                  <p className="text-xs font-black tracking-widest text-amber-400">{code}</p>
                </div>

                {/* キャラクター画像エリア */}
                <div className="mx-3 mb-2 flex h-40 items-center justify-center overflow-hidden rounded-xl bg-white">
                  {type.image ? (
                    <img
                      src={type.image}
                      alt={type.name}
                      className="h-full w-full object-contain"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center gap-1">
                      <Swords className="h-8 w-8 text-amber-400/20" />
                      <p className="text-[9px] text-white/20">準備中</p>
                    </div>
                  )}
                </div>

                {/* 名前・説明 */}
                <div className="flex flex-1 flex-col px-3 pb-4">
                  <p className="mb-1.5 text-sm font-bold text-amber-100">{type.name}</p>
                  <p className="text-[10px] leading-relaxed text-white/50 line-clamp-3">
                    {type.description}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* フッターリンク */}
        <div className="mt-12 text-center">
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
            <div className="mb-2 text-6xl font-black tracking-widest text-amber-300">{result.code}</div>
            <h2 className="mb-1 text-2xl font-bold text-amber-100">{typeData.name}</h2>
            <p className="text-sm text-amber-200/50">「{typeData.catchcopy}」</p>
          </div>

          {/* キャラクター画像 */}
          <div className="mb-5 flex justify-center">
            <div className="relative h-52 w-52 overflow-hidden rounded-2xl border border-amber-400/20 bg-white">
              {typeData.image
                ? <img src={typeData.image} alt={typeData.name} className="h-full w-full object-contain" />
                : <div className="flex h-full items-center justify-center"><Swords className="h-16 w-16 text-amber-400/30" /></div>
              }
            </div>
          </div>

          {/* 説明 */}
          <div className="mb-4 rounded-2xl border border-white/10 bg-white/5 p-5">
            <p className="text-sm leading-relaxed text-white/80">{typeData.description}</p>
          </div>

          {/* 軸スコアバー（パーセンテージ付き） */}
          <div className="mb-4 rounded-2xl border border-white/10 bg-white/5 p-5">
            <h3 className="mb-4 text-xs font-bold tracking-widest text-amber-400/70 uppercase">診断スコア</h3>
            {AXES.map(axis => {
              const s = result.scores[axis.key]
              const aRatio = Math.round(((s.a + 15) / 30) * 100)
              const bRatio = 100 - aRatio
              const aWins = aRatio >= 50
              return (
                <div key={axis.key} className="mb-4 last:mb-0">
                  <div className="mb-1.5 flex justify-between text-xs">
                    <span className={`font-bold ${aWins ? 'text-amber-300' : 'text-white/40'}`}>
                      {axis.labelA}
                      {aWins && <span className="ml-1 text-amber-400">{aRatio}%</span>}
                    </span>
                    <span className={`font-bold ${!aWins ? 'text-amber-300' : 'text-white/40'}`}>
                      {!aWins && <span className="mr-1 text-amber-400">{bRatio}%</span>}
                      {axis.labelB}
                    </span>
                  </div>
                  <div className="h-2.5 w-full overflow-hidden rounded-full bg-white/10">
                    <div className="h-full rounded-full bg-amber-400 transition-all duration-700" style={{ width: `${aRatio}%` }} />
                  </div>
                </div>
              )
            })}
          </div>

          {/* プレイスタイル */}
          <div className="mb-4 rounded-2xl border border-white/10 bg-white/5 p-5">
            <h3 className="mb-3 flex items-center gap-2 text-xs font-bold tracking-widest text-amber-400/70 uppercase">
              <Swords className="h-3.5 w-3.5" />プレイスタイル
            </h3>
            <p className="text-sm leading-relaxed text-white/70">{typeData.playStyle}</p>
          </div>

          {/* 強み・弱み */}
          <div className="mb-4 grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-green-400/20 bg-green-500/5 p-4">
              <h3 className="mb-3 flex items-center gap-1.5 text-xs font-bold tracking-widest text-green-400/70 uppercase">
                <ThumbsUp className="h-3.5 w-3.5" />強み
              </h3>
              <ul className="space-y-2">
                {typeData.strengths.map(s => (
                  <li key={s} className="flex items-start gap-1.5 text-xs leading-relaxed text-white/70">
                    <span className="mt-0.5 shrink-0 text-green-400">✓</span>{s}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl border border-red-400/20 bg-red-500/5 p-4">
              <h3 className="mb-3 flex items-center gap-1.5 text-xs font-bold tracking-widest text-red-400/70 uppercase">
                <ThumbsDown className="h-3.5 w-3.5" />弱み
              </h3>
              <ul className="space-y-2">
                {typeData.weaknesses.map(w => (
                  <li key={w} className="flex items-start gap-1.5 text-xs leading-relaxed text-white/70">
                    <span className="mt-0.5 shrink-0 text-red-400">✗</span>{w}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* ゲームの傾向 */}
          <div className="mb-4 rounded-2xl border border-white/10 bg-white/5 p-5">
            <h3 className="mb-4 flex items-center gap-2 text-xs font-bold tracking-widest text-amber-400/70 uppercase">
              <Zap className="h-3.5 w-3.5" />ゲームの傾向
            </h3>
            <div className="mb-3">
              <p className="mb-2 text-xs font-bold text-green-400/80">好きなゲームタイプ</p>
              <div className="flex flex-wrap gap-2">
                {typeData.likedGames.map(g => (
                  <span key={g} className="rounded-full border border-green-400/20 bg-green-500/10 px-3 py-1 text-xs text-green-300">{g}</span>
                ))}
              </div>
            </div>
            <div>
              <p className="mb-2 text-xs font-bold text-red-400/80">苦手なゲームタイプ</p>
              <div className="flex flex-wrap gap-2">
                {typeData.dislikedGames.map(g => (
                  <span key={g} className="rounded-full border border-red-400/20 bg-red-500/10 px-3 py-1 text-xs text-red-300">{g}</span>
                ))}
              </div>
            </div>
          </div>

          {/* おすすめゲーム */}
          <div className="mb-4 rounded-2xl border border-amber-400/20 bg-amber-500/5 p-5">
            <h3 className="mb-3 text-xs font-bold tracking-widest text-amber-400/70 uppercase">おすすめゲーム</h3>
            <div className="space-y-2">
              {typeData.games.map(game => (
                <a key={game} href={`https://www.google.com/search?q=${encodeURIComponent(game + ' ボードゲーム')}`}
                  target="_blank" rel="noopener noreferrer"
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
              <Share2 className="h-3.5 w-3.5" />シェアする
            </h3>
            <div className="flex gap-2">
              {/* X */}
              <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`ボドゲMBTI診断で【${result.code}：${typeData.name}】でした！\n「${typeData.catchcopy}」\n\nあなたのタイプは？\n#ボドゲMBTI #ボードゲーム`)}&url=${encodeURIComponent('https://www.boardgame-raou.com/mbti')}`}
                target="_blank" rel="noopener noreferrer"
                className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-white/20 bg-black px-3 py-2.5 text-xs font-bold text-white transition hover:bg-white/10"
              >
                <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.766l7.73-8.835L1.254 2.25H8.08l4.253 5.622L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                Xでシェア
              </a>
              {/* LINE */}
              <a href={`https://social-plugins.line.me/lineit/share?url=${encodeURIComponent('https://www.boardgame-raou.com/mbti')}&text=${encodeURIComponent(`ボドゲMBTI診断で【${result.code}：${typeData.name}】でした！あなたのタイプは？`)}`}
                target="_blank" rel="noopener noreferrer"
                className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-[#06C755] px-3 py-2.5 text-xs font-bold text-white transition hover:bg-[#05b34c]"
              >
                <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24"><path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.630 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.630 0 .344-.281.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314"/></svg>
                LINE
              </a>
              {/* Instagram（コピー） */}
              <button
                onClick={() => handleCopyForInstagram(result.code, typeData.name, typeData.catchcopy)}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 px-3 py-2.5 text-xs font-bold text-white transition hover:opacity-90"
              >
                {copied
                  ? <><Check className="h-3.5 w-3.5" />コピー済</>
                  : <><Copy className="h-3.5 w-3.5" />インスタ用</>
                }
              </button>
            </div>
            {copied && (
              <p className="mt-2 text-center text-[10px] text-white/40">テキストをコピーしました。インスタの投稿に貼り付けてね！</p>
            )}
          </div>

          {/* ボタン */}
          <div className="space-y-3 pb-8 text-center">
            <div>
              <Link href={`/mbti/${result.code.toLowerCase()}`}
                className="inline-flex items-center gap-2 rounded-full bg-amber-500/20 border border-amber-400/40 px-6 py-2.5 text-sm text-amber-300 transition-all hover:bg-amber-500/30"
              >
                詳細ページを見る →
              </Link>
            </div>
            <div>
              <button onClick={handleReset}
                className="inline-flex items-center gap-2 rounded-full border border-white/20 px-6 py-2.5 text-sm text-white/50 transition-all hover:bg-white/10 hover:text-white/80"
              >
                <RotateCcw className="h-4 w-4" />もう一度診断する
              </button>
            </div>
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
  return (
    <div className="min-h-dvh px-4 py-6">
      <Suspense fallback={null}><NavMenu /></Suspense>

      <div className="mx-auto max-w-lg">
        {/* スティッキー進捗バー */}
        <div className="sticky top-3 z-10 mb-8">
          <div className="rounded-2xl border border-white/10 bg-black/70 px-4 py-3 backdrop-blur-md">
            <div className="mb-1.5 flex justify-between text-xs text-amber-400/50">
              <span className="font-medium tracking-wider uppercase">ボドゲMBTI 診断</span>
              <span>{totalAnswered} / {QUESTIONS.length} 問回答済み</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-amber-400 transition-all duration-300"
                style={{ width: `${(totalAnswered / QUESTIONS.length) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* 全質問リスト */}
        <div className="space-y-5 pb-6">
          {QUESTIONS.map((q, idx) => {
            const answered = answers[q.id] !== undefined
            return (
              <div
                key={q.id}
                ref={el => { questionRefs.current[idx] = el }}
                className={`rounded-2xl border p-6 transition-all duration-300 ${
                  answered
                    ? 'border-amber-400/20 bg-amber-500/5'
                    : 'border-white/10 bg-white/5'
                }`}
              >
                <p className="mb-1 text-xs tracking-[0.3em] text-amber-400/40 uppercase">Q{q.id}</p>
                <h2 className="mb-6 text-lg font-bold leading-relaxed text-amber-100">
                  {q.text}
                </h2>

                {/* 7段階スケール */}
                <div className="mb-3 flex items-center justify-center gap-1.5">
                  {[1, 2, 3, 4, 5, 6, 7].map((val, i) => {
                    const isSelected = answers[q.id] === val
                    return (
                      <button
                        key={val}
                        onClick={() => handleSelect(q.id, idx, val)}
                        className={`${CIRCLE_SIZES[i]} flex shrink-0 items-center justify-center rounded-full border transition-all duration-150 ${
                          isSelected
                            ? 'border-amber-400 bg-amber-400 shadow-[0_0_14px_rgba(251,191,36,0.5)]'
                            : 'border-white/20 bg-black/30 hover:border-amber-400/60 hover:bg-amber-400/10'
                        }`}
                      >
                      </button>
                    )
                  })}
                </div>
                <div className="flex justify-between text-xs text-white/30">
                  <span>そう思う</span>
                  <span>そう思わない</span>
                </div>
              </div>
            )
          })}
        </div>

        {/* 診断するボタン */}
        <div className="pb-16 text-center">
          <button
            onClick={handleDiagnose}
            disabled={!allAnswered}
            className="inline-flex items-center gap-2 rounded-full bg-amber-500 px-10 py-4 text-base font-bold text-white shadow-lg shadow-amber-900/40 transition-all hover:bg-amber-400 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-30"
          >
            <Swords className="h-5 w-5" />
            診断する
          </button>
          {!allAnswered && (
            <p className="mt-3 text-xs text-amber-600/50">
              残り {QUESTIONS.length - totalAnswered} 問回答してください
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
