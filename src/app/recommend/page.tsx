'use client'

import { useState, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  User, Users, UserPlus,
  PartyPopper, Brain,
  Handshake, EyeOff, Puzzle, Shield, Smile,
  Zap, Clock, Moon,
  Sprout, Leaf, TreePine,
  Wand2, Sparkles, Star,
  Gamepad2,
} from 'lucide-react'
import type React from 'react'
import { GameModal } from '@/components/games/GameModal'
import { NavMenu } from '@/components/ui/NavMenu'
import type { Game } from '@/lib/types'

const IMAGE_BASE_URL = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/game-images`

type IconFC = React.FC<{ className?: string }>

// ─── Questions ──────────────────────────────────────────────────────────────

const STEPS = [
  {
    key: 'players',
    label: '第一の問い',
    question: '今日は何人で遊びますか？',
    sub: '仲間の数が、運命のゲームを決める',
    type: 'single' as const,
    options: [
      { value: '2',   label: '2人',    icon: User as IconFC },
      { value: '3-4', label: '3〜4人', icon: Users as IconFC },
      { value: '5+',  label: '5人以上', icon: UserPlus as IconFC },
    ],
  },
  {
    key: 'mood',
    label: '第二の問い',
    question: '今日の気分はどちらに近いですか？',
    sub: '心の向かう先に、真の遊びがある',
    type: 'single' as const,
    options: [
      { value: 'fun',   label: 'わいわい盛り上がりたい', icon: PartyPopper as IconFC },
      { value: 'think', label: 'じっくり頭を使いたい',   icon: Brain as IconFC },
    ],
  },
  {
    key: 'categories',
    label: '第三の問い',
    question: 'どんな遊びに惹かれますか？',
    sub: '複数選べます。直感で選んでください',
    type: 'multi' as const,
    options: [
      { value: 'cooperative', label: 'みんなで協力',       icon: Handshake as IconFC },
      { value: 'bluff',       label: 'だまし合い・正体隠匿', icon: EyeOff as IconFC },
      { value: 'puzzle',      label: 'パズル・謎解き',     icon: Puzzle as IconFC },
      { value: 'strategy',    label: '戦略・陣取り',       icon: Shield as IconFC },
      { value: 'party',       label: 'ワイワイ盛り上がり', icon: Smile as IconFC },
    ],
  },
  {
    key: 'time',
    label: '第四の問い',
    question: '時間はどのくらいありますか？',
    sub: '運命は時の中に宿る',
    type: 'single' as const,
    options: [
      { value: 'short',  label: 'サクッと（〜30分）',  icon: Zap as IconFC },
      { value: 'medium', label: 'ふつう（30〜60分）',  icon: Clock as IconFC },
      { value: 'long',   label: 'がっつり（60分〜）',  icon: Moon as IconFC },
    ],
  },
  {
    key: 'experience',
    label: '第五の問い',
    question: 'どのくらいの難しさがお好みですか？',
    sub: '求める深さに、運命のゲームは宿る',
    type: 'single' as const,
    options: [
      { value: 'beginner',  label: '気軽に楽しみたい',       icon: Smile as IconFC },
      { value: 'sometimes', label: 'ちょうどいい歯ごたえで', icon: Leaf as IconFC },
      { value: 'often',     label: 'フル回転で行ける',       icon: Zap as IconFC },
    ],
  },
] as const

type StepKey = typeof STEPS[number]['key']
type Answers = Partial<Record<StepKey, string | string[]>>
type Stage = 'intro' | 'quiz' | 'loading' | 'results'

const RANK_STYLES = [
  { badge: '1', bgClass: 'bg-amber-400 text-amber-900',   label: 'いちばんのおすすめ' },
  { badge: '2', bgClass: 'bg-gray-300 text-gray-700',     label: '2番目のおすすめ' },
  { badge: '3', bgClass: 'bg-orange-700/80 text-orange-100', label: '3番目のおすすめ' },
]

// ─── Component ───────────────────────────────────────────────────────────────

export default function RecommendPage() {
  const [stage, setStage]           = useState<Stage>('intro')
  const [stepIndex, setStepIndex]   = useState(0)
  const [answers, setAnswers]       = useState<Answers>({})
  const [animKey, setAnimKey]       = useState(0)
  const [results, setResults]       = useState<Game[]>([])
  const [selectedGame, setSelectedGame] = useState<Game | null>(null)
  const [error, setError]           = useState('')

  const currentStep = STEPS[stepIndex]

  const currentValue = answers[currentStep?.key as StepKey]
  const canNext =
    currentStep?.type === 'multi'
      ? Array.isArray(currentValue) && currentValue.length > 0
      : !!currentValue

  const handleSelect = useCallback((value: string) => {
    const key = currentStep.key as StepKey
    if (currentStep.type === 'multi') {
      setAnswers(prev => {
        const arr = (prev[key] as string[] | undefined) ?? []
        return {
          ...prev,
          [key]: arr.includes(value) ? arr.filter(v => v !== value) : [...arr, value],
        }
      })
    } else {
      setAnswers(prev => ({ ...prev, [key]: value }))
    }
  }, [currentStep])

  const handleNext = useCallback(async () => {
    if (!canNext) return
    if (stepIndex < STEPS.length - 1) {
      setStepIndex(i => i + 1)
      setAnimKey(k => k + 1)
    } else {
      setStage('loading')
      try {
        const body = {
          players:    answers.players    as string,
          mood:       answers.mood       as string,
          categories: answers.categories as string[] ?? [],
          time:       answers.time       as string,
          experience: answers.experience as string,
        }
        const res  = await fetch('/api/recommend', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error)
        setResults(data.games)
        setStage('results')
      } catch {
        setError('占いに失敗しました。もう一度お試しください。')
        setStage('quiz')
      }
    }
  }, [canNext, stepIndex, answers])

  const handleBack = useCallback(() => {
    if (stepIndex === 0) {
      setStage('intro')
    } else {
      setStepIndex(i => i - 1)
      setAnimKey(k => k + 1)
    }
  }, [stepIndex])

  const handleReset = () => {
    setStage('intro')
    setStepIndex(0)
    setAnswers({})
    setAnimKey(0)
    setResults([])
    setError('')
  }

  // ── Intro ──────────────────────────────────────────────────────────────────
  if (stage === 'intro') {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center px-4 py-12">
        <NavMenu />
        <div className="animate-fade-up w-full max-w-md text-center">
          {/* Crystal ball decoration */}
          <div className="relative mx-auto mb-8 h-32 w-32">
            <div className="absolute inset-0 flex items-center justify-center">
              <Wand2 className="h-16 w-16 text-amber-300 drop-shadow-[0_0_20px_rgba(251,191,36,0.5)]" />
            </div>
            <div className="animate-shimmer absolute -top-1 left-8">
              <Sparkles className="h-5 w-5 text-amber-200/80" />
            </div>
            <div className="animate-shimmer absolute right-4 top-4" style={{ animationDelay: '0.7s' }}>
              <Star className="h-3.5 w-3.5 text-amber-300/70" />
            </div>
            <div className="animate-shimmer absolute bottom-0 left-2" style={{ animationDelay: '1.3s' }}>
              <Sparkles className="h-3.5 w-3.5 text-amber-200/60" />
            </div>
            <div className="animate-shimmer absolute bottom-2 right-6" style={{ animationDelay: '0.4s' }}>
              <Star className="h-5 w-5 text-amber-300/60" />
            </div>
          </div>

          <p className="mb-2 text-xs tracking-[0.3em] text-amber-400/60 uppercase">Board Game Oracle</p>
          <h1 className="mb-3 text-4xl font-bold tracking-wide text-amber-100">ゲーム占い</h1>
          <p className="mb-2 text-base text-amber-200/80">
            5つの問いに答えるだけで
          </p>
          <p className="mb-8 text-base text-amber-200/80">
            あなたにぴったりのゲームを導き出します
          </p>

          <button
            onClick={() => { setStage('quiz'); setAnimKey(k => k + 1) }}
            className="group relative inline-flex items-center gap-2 rounded-full bg-amber-500 px-8 py-3.5 text-base font-bold text-white shadow-lg shadow-amber-900/50 transition-all hover:bg-amber-400 hover:shadow-amber-800/60 hover:-translate-y-0.5"
          >
            <span>占いを始める</span>
            <span className="transition-transform group-hover:translate-x-1">→</span>
          </button>

          <div className="mt-6">
            <Link href="/games" className="text-xs text-amber-600/60 hover:text-amber-500/80 transition-colors">
              ← ゲーム一覧に戻る
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // ── Loading ────────────────────────────────────────────────────────────────
  if (stage === 'loading') {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center px-4">
        <NavMenu />
        <div className="animate-fade-in text-center">
          <div className="mb-6 flex justify-center animate-shimmer">
            <Wand2 className="h-16 w-16 text-amber-300 drop-shadow-[0_0_20px_rgba(251,191,36,0.5)]" />
          </div>
          <p className="text-lg font-medium text-amber-200">運命のゲームを占っています</p>
          <p className="mt-1 text-sm text-amber-400/60">しばらくお待ちください...</p>
          <div className="mt-6 flex justify-center gap-1.5">
            {[0, 1, 2].map(i => (
              <div
                key={i}
                className="h-2 w-2 rounded-full bg-amber-400 animate-shimmer"
                style={{ animationDelay: `${i * 0.3}s` }}
              />
            ))}
          </div>
        </div>
      </div>
    )
  }

  // ── Results ────────────────────────────────────────────────────────────────
  if (stage === 'results') {
    return (
      <div className="min-h-dvh px-4 py-12">
        <NavMenu />
        <div className="mx-auto max-w-2xl">
          {/* Header */}
          <div className="animate-fade-up mb-10 text-center">
            <p className="mb-1 text-xs tracking-[0.3em] text-amber-400/60 uppercase">Your Destiny</p>
            <h2 className="text-3xl font-bold text-amber-100">あなたへのおすすめ</h2>
            <p className="mt-2 text-sm text-amber-300/60">運命が導いたゲームたちです</p>
          </div>

          {/* Game cards */}
          <div className="space-y-4">
            {results.map((game, i) => (
              <ResultCard
                key={game.id}
                game={game}
                rank={i}
                imageBaseUrl={IMAGE_BASE_URL}
                delay={i * 0.15}
                onClick={() => setSelectedGame(game)}
              />
            ))}
          </div>

          {/* Reset */}
          <div className="mt-10 text-center">
            <button
              onClick={handleReset}
              className="inline-flex items-center gap-2 rounded-full border border-amber-500/40 px-6 py-2.5 text-sm text-amber-400 transition-all hover:bg-amber-500/10 hover:border-amber-400"
            >
              <Wand2 className="h-4 w-4" />
              もう一度占う
            </button>
            <div className="mt-4">
              <Link href="/games" className="text-xs text-amber-600/60 hover:text-amber-500/80 transition-colors">
                ← ゲーム一覧に戻る
              </Link>
            </div>
          </div>
        </div>

        {selectedGame && (
          <GameModal
            game={selectedGame}
            imageBaseUrl={IMAGE_BASE_URL}
            onClose={() => setSelectedGame(null)}
          />
        )}
      </div>
    )
  }

  // ── Quiz ───────────────────────────────────────────────────────────────────
  const multiSelected = (answers[currentStep.key as StepKey] as string[] | undefined) ?? []

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-4 py-12">
      <NavMenu />
      <div className="w-full max-w-lg">
        {/* Progress dots */}
        <div className="mb-8 flex justify-center gap-2">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i < stepIndex
                  ? 'bg-amber-400 w-6'
                  : i === stepIndex
                  ? 'bg-amber-400 w-8'
                  : 'bg-white/10 w-4'
              }`}
            />
          ))}
        </div>

        {/* Question card */}
        <div key={animKey} className="animate-fade-up">
          {/* Step label */}
          <p className="mb-4 text-center text-xs tracking-[0.3em] text-amber-400/50 uppercase">
            {currentStep.label}
          </p>

          {/* Question */}
          <h2 className="mb-1 text-center text-2xl font-bold text-amber-100">
            {currentStep.question}
          </h2>
          <p className="mb-8 text-center text-xs text-amber-400/50">
            {currentStep.sub}
          </p>

          {/* Options */}
          <div className="grid gap-3 grid-cols-1">
            {currentStep.options.map(opt => {
              const isSelected =
                currentStep.type === 'multi'
                  ? multiSelected.includes(opt.value)
                  : answers[currentStep.key as StepKey] === opt.value
              const Icon = opt.icon

              return (
                <button
                  key={opt.value}
                  onClick={() => handleSelect(opt.value)}
                  className={`flex items-center gap-3 rounded-xl border px-4 py-3.5 text-left transition-all duration-200 ${
                    isSelected
                      ? 'border-amber-400 bg-amber-400/15 text-amber-100 shadow-[0_0_16px_rgba(251,191,36,0.15)]'
                      : 'border-white/20 bg-black/40 text-white/85 hover:border-amber-400/50 hover:bg-black/55 hover:text-white'
                  }`}
                >
                  <Icon className="h-6 w-6 shrink-0" />
                  <span className="text-sm font-medium">{opt.label}</span>
                  {currentStep.type === 'multi' && (
                    <span className={`ml-auto flex h-5 w-5 items-center justify-center rounded-full border text-xs transition-all ${
                      isSelected ? 'border-amber-400 bg-amber-400 text-white' : 'border-white/20'
                    }`}>
                      {isSelected ? '✓' : ''}
                    </span>
                  )}
                </button>
              )
            })}
          </div>

          {/* Buttons */}
          <div className="mt-8 flex items-center justify-center gap-3">
            <button
              onClick={handleBack}
              className="inline-flex items-center gap-1.5 rounded-full border border-white/15 px-5 py-3 text-sm text-white/50 transition-all hover:border-white/30 hover:text-white/80"
            >
              ← 戻る
            </button>
            {error && <p className="text-xs text-red-400">{error}</p>}
            <button
              onClick={handleNext}
              disabled={!canNext}
              className="inline-flex items-center gap-2 rounded-full bg-amber-500 px-8 py-3 text-sm font-bold text-white shadow-lg shadow-amber-900/40 transition-all hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-30"
            >
              {stepIndex === STEPS.length - 1 ? (
                <><Wand2 className="h-4 w-4" /> 占う</>
              ) : (
                <>次の問いへ →</>
              )}
            </button>
          </div>

          {/* Step counter */}
          <p className="mt-4 text-center text-xs text-amber-600/40">
            {stepIndex + 1} / {STEPS.length}
          </p>
        </div>
      </div>
    </div>
  )
}

// ─── Result Card ─────────────────────────────────────────────────────────────

function ResultCard({
  game,
  rank,
  imageBaseUrl,
  delay,
  onClick,
}: {
  game: Game
  rank: number
  imageBaseUrl: string
  delay: number
  onClick: () => void
}) {
  const imageUrl = game.image_path ? `${imageBaseUrl}/${game.image_path}` : null
  const rankStyle = RANK_STYLES[rank]

  return (
    <button
      onClick={onClick}
      className="animate-fade-up w-full rounded-2xl border border-white/10 bg-white/5 p-4 text-left transition-all hover:border-amber-400/40 hover:bg-amber-400/8"
      style={{ animationDelay: `${delay}s` }}
    >
      <div className="flex gap-4">
        {/* Rank + image */}
        <div className="relative shrink-0">
          <div className="h-20 w-20 overflow-hidden rounded-xl bg-black/20">
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt={game.title}
                width={80}
                height={80}
                className="h-full w-full object-contain"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-white/20">
                <Gamepad2 className="h-8 w-8" />
              </div>
            )}
          </div>
          <span className={`absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold shadow ${rankStyle.bgClass}`}>
            {rankStyle.badge}
          </span>
        </div>

        {/* Info */}
        <div className="min-w-0 flex-1">
          <p className="mb-0.5 text-xs text-amber-400/50">{rankStyle.label}</p>
          <h3 className="line-clamp-2 text-base font-bold text-amber-100">{game.title}</h3>
          <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-white/50">
            <span className="flex items-center gap-1">
              <Users className="h-3 w-3 shrink-0" />
              {game.min_players}〜{game.max_players}人
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3 shrink-0" />
              {game.play_time_min}{game.play_time_max ? `〜${game.play_time_max}` : ''}分
            </span>
          </div>
          {game.description && (
            <p className="mt-1.5 line-clamp-2 text-xs text-white/40">{game.description}</p>
          )}
        </div>
      </div>

      <p className="mt-2 text-right text-xs text-amber-500/50">タップして詳細を見る →</p>
    </button>
  )
}
