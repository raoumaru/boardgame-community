'use client'

import { useState, useRef, useCallback, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { Dna, RotateCcw, ThumbsUp, ThumbsDown, Zap, ImageDown } from 'lucide-react'
import { NavMenu } from '@/components/ui/NavMenu'
import { GameCard } from '@/components/games/GameCard'
import { TYPES, getAxisLabels, AXIS_COLORS, type TypeCode } from './data'
import type { Game } from '@/lib/types'

const IMAGE_BASE_URL = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/game-images`

// MBTIタイプコードから /api/recommend へのパラメータを導出
function getMbtiRecommendParams(code: TypeCode) {
  const d = code[0], r = code[1], i = code[2], h = code[3]
  return {
    players:    i === 'I' ? '2' : i === 'G' ? '5+' : '3-4',
    mood:       d === 'D' ? 'think' : 'fun',
    categories: r === 'R' ? ['strategy', 'bluff'] : ['cooperative', 'party'],
    time:       h === 'H' ? 'long' : 'short',
    experience: d === 'D' && h === 'H' ? 'often' : d === 'W' && h === 'L' ? 'beginner' : 'sometimes',
  }
}

// ─── Canvas直接描画でシェア画像を生成（html2canvas不使用・iOS含む全ブラウザ対応） ──────────
const BADGE_COLORS_CANVAS: Record<string, { bg: string; text: string }> = {
  D: { bg: 'rgba(245,158,11,0.25)',  text: '#fcd34d' },
  W: { bg: 'rgba(59,130,246,0.25)', text: '#93c5fd' },
  R: { bg: 'rgba(239,68,68,0.25)',  text: '#fca5a5' },
  U: { bg: 'rgba(34,197,94,0.25)',  text: '#86efac' },
  I: { bg: 'rgba(168,85,247,0.25)', text: '#d8b4fe' },
  G: { bg: 'rgba(249,115,22,0.25)', text: '#fdba74' },
  H: { bg: 'rgba(120,113,108,0.25)',text: '#d6d3d1' },
  L: { bg: 'rgba(20,184,166,0.25)', text: '#5eead4' },
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y)
  ctx.arcTo(x + w, y, x + w, y + r, r)
  ctx.lineTo(x + w, y + h - r)
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r)
  ctx.lineTo(x + r, y + h)
  ctx.arcTo(x, y + h, x, y + h - r, r)
  ctx.lineTo(x, y + r)
  ctx.arcTo(x, y, x + r, y, r)
  ctx.closePath()
}

async function generateMbtiShareImage(
  code: TypeCode,
  name: string,
  catchcopy: string,
  axisLabels: string[],
  imageSrc: string | undefined
): Promise<Blob | null> {
  const W = 600
  const IMG_H = 340   // 白背景の画像エリア
  const INFO_H = 300  // テキスト・バッジエリア
  const H = IMG_H + INFO_H

  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')
  if (!ctx) return null

  // ── 上半分：白背景 ──
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, W, IMG_H)

  // キャラクター画像
  if (imageSrc) {
    try {
      const img = await new Promise<HTMLImageElement>((resolve, reject) => {
        const el = new Image()
        // crossOrigin は設定しない（同一オリジン画像に設定するとiOS Chromeでcanvasが tainted になりtoBlob()がnullを返す）
        el.onload = () => resolve(el)
        el.onerror = (e) => reject(new Error(`image load failed: ${String(e)}`))
        el.src = imageSrc.startsWith('http') ? imageSrc : `${window.location.origin}${imageSrc}`
      })
      const scale = Math.min((W - 60) / img.naturalWidth, (IMG_H - 40) / img.naturalHeight)
      const dw = img.naturalWidth * scale
      const dh = img.naturalHeight * scale
      ctx.drawImage(img, (W - dw) / 2, (IMG_H - dh) / 2, dw, dh)
    } catch (imgErr) {
      // 画像読み込み失敗時はスキップ（テキストのみで生成続行）
      console.warn('share image: character image failed to load', imgErr)
    }
  }

  // ── 下半分：ダークレッドグラデーション ──
  const grad = ctx.createLinearGradient(0, IMG_H, W * 0.6, H)
  grad.addColorStop(0, '#3a0a0a')
  grad.addColorStop(0.5, '#1a0505')
  grad.addColorStop(1, '#0d0205')
  ctx.fillStyle = grad
  ctx.fillRect(0, IMG_H, W, INFO_H)

  const cx = W / 2
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'

  // "BOARD GAME MBTI" ラベル
  ctx.fillStyle = 'rgba(251,191,36,0.5)'
  ctx.font = '600 13px -apple-system, "Hiragino Sans", sans-serif'
  ctx.fillText('BOARD  GAME  MBTI', cx, IMG_H + 30)

  // タイプコード
  ctx.fillStyle = '#fbbf24'
  ctx.font = 'bold 72px -apple-system, "Hiragino Sans", sans-serif'
  ctx.fillText(code, cx, IMG_H + 95)

  // 名前
  ctx.fillStyle = '#fef3c7'
  ctx.font = 'bold 30px -apple-system, "Hiragino Sans", sans-serif'
  ctx.fillText(name, cx, IMG_H + 155)

  // キャッチコピー
  ctx.fillStyle = 'rgba(253,230,138,0.55)'
  ctx.font = '17px -apple-system, "Hiragino Sans", sans-serif'
  ctx.fillText(`「${catchcopy}」`, cx, IMG_H + 195)

  // 軸バッジ
  ctx.font = 'bold 14px -apple-system, "Hiragino Sans", sans-serif'
  const letters = code.split('')
  const PAD_X = 16, BADGE_H = 28, GAP = 8
  const badgeWidths = axisLabels.map(l => ctx.measureText(l).width + PAD_X * 2)
  const totalW = badgeWidths.reduce((a, b) => a + b, 0) + GAP * (letters.length - 1)
  let bx = (W - totalW) / 2
  const by = IMG_H + 245

  for (let i = 0; i < letters.length; i++) {
    const bw = badgeWidths[i]
    const colors = BADGE_COLORS_CANVAS[letters[i]] ?? { bg: 'rgba(255,255,255,0.1)', text: '#ffffff' }
    ctx.fillStyle = colors.bg
    roundRect(ctx, bx, by - BADGE_H / 2, bw, BADGE_H, BADGE_H / 2)
    ctx.fill()
    ctx.fillStyle = colors.text
    ctx.fillText(axisLabels[i], bx + bw / 2, by)
    bx += bw + GAP
  }

  return new Promise(resolve => canvas.toBlob(b => resolve(b), 'image/png'))
}

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
  { id: 20, axis: 'HL', text: '何度プレイしても新しい発見があるような、奥深いゲームを好む。', dir: 'A' },
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
  const [sharing, setSharing] = useState(false)
  const [shareImageUrl, setShareImageUrl] = useState<string | null>(null)
  const [shareErrorMsg, setShareErrorMsg] = useState<string | null>(null)
  const [mbtiGames, setMbtiGames] = useState<Game[]>([])
  const [mbtiGamesLoading, setMbtiGamesLoading] = useState(false)

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

  // 診断結果が出たらタイプに合うゲームをDBから取得
  useEffect(() => {
    if (!result) return
    setMbtiGames([])
    setMbtiGamesLoading(true)
    const params = getMbtiRecommendParams(result.code)
    fetch('/api/recommend', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    })
      .then(r => r.json())
      .then(data => setMbtiGames(data.games ?? []))
      .catch(() => {})
      .finally(() => setMbtiGamesLoading(false))
  }, [result])

  const handleReset = () => {
    setStage('intro')
    setAnswers({})
    setResult(null)
    setMbtiGames([])
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior })
  }

  const handleShareImage = async (code: TypeCode, name: string, catchcopy: string, axisLabels: string[], imageSrc?: string) => {
    setSharing(true)
    setShareErrorMsg(null)
    try {
      const blob = await generateMbtiShareImage(code, name, catchcopy, axisLabels, imageSrc)
      if (!blob) {
        setShareErrorMsg('画像の生成に失敗しました（blob null）')
        return
      }

      // iOS（Safari・Chrome共通）: ジェスチャータイムアウト問題のためオーバーレイ表示
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
      if (isIOS) {
        const url = URL.createObjectURL(blob)
        setShareImageUrl(url)
        return
      }

      // Android: Web Share API でファイル共有
      const file = new File([blob], `boardgame-mbti-${name}.png`, { type: 'image/png' })
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: `ボドゲMBTI：${name}` })
        return
      }

      // PC: ダウンロード
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `boardgame-mbti-${name}.png`
      a.click()
      URL.revokeObjectURL(url)
    } catch (e) {
      console.error(e)
      setShareErrorMsg(`エラー: ${e instanceof Error ? e.message : String(e)}`)
    } finally {
      setSharing(false)
    }
  }

  const handleCloseShareImage = () => {
    if (shareImageUrl) URL.revokeObjectURL(shareImageUrl)
    setShareImageUrl(null)
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
              <Dna className="h-10 w-10 text-amber-300" />
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
                      <Dna className="h-8 w-8 text-amber-400/20" />
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
    const axisLabels = getAxisLabels(result.code)
    return (
      <>
      <div className="min-h-dvh px-4 py-12">
        <Suspense fallback={null}><NavMenu /></Suspense>
        <div className="mx-auto max-w-lg">

          {/* ── ヘッダーカード（詳細ページと同じデザイン・シェア対象） ── */}
          <div
            className="mb-2 overflow-hidden rounded-2xl border border-white/10"
            style={{ background: 'linear-gradient(160deg, #3a0a0a 0%, #1a0505 40%, #0d0205 100%)' }}
          >
            {/* キャラクター画像 */}
            <div className="flex justify-center bg-white px-6 pt-6 pb-2">
              {typeData.image ? (
                <img src={typeData.image} alt={typeData.name} className="h-52 w-52 object-contain" />
              ) : (
                <div className="flex h-52 w-52 items-center justify-center">
                  <Dna className="h-20 w-20 text-amber-400/20" />
                </div>
              )}
            </div>
            {/* タイプ情報 */}
            <div className="p-5 text-center">
              <p className="mb-1 text-xs tracking-[0.3em] text-amber-400/50 uppercase">Board Game MBTI</p>
              <div className="mb-1 text-4xl font-black tracking-widest text-amber-300">{result.code}</div>
              <h2 className="mb-2 text-2xl font-bold text-amber-100">{typeData.name}</h2>
              <p className="text-sm text-amber-200/60">「{typeData.catchcopy}」</p>
            </div>
            {/* 軸バッジ */}
            <div className="flex flex-wrap justify-center gap-2 px-5 pb-5">
              {result.code.split('').map((letter, i) => (
                <span key={i} className={`rounded-full border px-3 py-1 text-xs font-bold ${AXIS_COLORS[letter]}`}>
                  {axisLabels[i]}
                </span>
              ))}
            </div>
          </div>

          {/* 画像シェアボタン */}
          <div className="mb-5 text-center">
            <button
              onClick={() => handleShareImage(result.code, typeData.name, typeData.catchcopy, axisLabels, typeData.image)}
              disabled={sharing}
              className="inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-500/10 px-5 py-2 text-xs font-bold text-amber-300 transition-all hover:bg-amber-500/20 disabled:opacity-50"
            >
              <ImageDown className="h-3.5 w-3.5" />
              {sharing ? '生成中...' : '結果画像をシェア・保存'}
            </button>
            {shareErrorMsg && (
              <p className="mt-2 text-[10px] text-red-400">{shareErrorMsg}</p>
            )}
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
              // net = s.a - s.b は全軸で -15〜+15 の範囲になる
              // タイプ判定（a >= b）と必ず一致する
              const aRatio = Math.round(((s.a - s.b + 15) / 30) * 100)
              const bRatio = 100 - aRatio
              const aWins = aRatio >= 50
              const fillPct = aWins ? aRatio : bRatio
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
                  <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-white/10">
                    <div
                      className={`h-full rounded-full bg-amber-400 transition-all duration-700 ${!aWins ? 'ml-auto' : ''}`}
                      style={{ width: `${fillPct}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>

          {/* プレイスタイル */}
          <div className="mb-4 rounded-2xl border border-white/10 bg-white/5 p-5">
            <h3 className="mb-3 flex items-center gap-2 text-xs font-bold tracking-widest text-amber-400/70 uppercase">
              <Dna className="h-3.5 w-3.5" />プレイスタイル
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

          {/* おすすめゲーム（DBから取得） */}
          <div className="mb-4">
            <h3 className="mb-3 text-xs font-bold tracking-widest text-amber-400/70 uppercase">おすすめボードゲーム</h3>
            {mbtiGamesLoading ? (
              <div className="grid grid-cols-3 gap-2">
                {[0, 1, 2].map(i => (
                  <div key={i} className="overflow-hidden rounded-xl bg-white/10 shadow-md">
                    <div className="aspect-[4/3] animate-pulse bg-white/20" />
                    <div className="space-y-2 p-3">
                      <div className="h-3 animate-pulse rounded bg-white/20" />
                      <div className="h-2.5 w-2/3 animate-pulse rounded bg-white/20" />
                    </div>
                  </div>
                ))}
              </div>
            ) : mbtiGames.length > 0 ? (
              <div className="grid grid-cols-3 gap-2">
                {mbtiGames.map(game => (
                  <GameCard key={game.id} game={game} imageBaseUrl={IMAGE_BASE_URL} />
                ))}
              </div>
            ) : null}
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

      {/* iOS用：生成画像オーバーレイ（長押し保存） */}
      {shareImageUrl && (
        <div
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/90 px-4"
          onClick={handleCloseShareImage}
        >
          <p className="mb-3 text-sm font-bold text-amber-300">画像を長押しして保存 📸</p>
          <p className="mb-5 text-xs text-white/50">カメラロールに保存できます</p>
          <img
            src={shareImageUrl}
            alt="シェア用画像"
            className="max-h-[70dvh] max-w-full rounded-xl shadow-2xl"
            onClick={e => e.stopPropagation()}
          />
          <button
            onClick={handleCloseShareImage}
            className="mt-6 rounded-full border border-white/20 px-6 py-2 text-sm text-white/60 transition hover:text-white"
          >
            閉じる
          </button>
        </div>
      )}
      </>
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
            <Dna className="h-5 w-5" />
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
