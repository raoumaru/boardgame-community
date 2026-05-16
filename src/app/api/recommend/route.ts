import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createAdminClient } from '@/lib/supabase/admin'

// genre category → actual genre values
const GENRE_CATEGORY_MAP: Record<string, string[]> = {
  cooperative: ['cooperative'],
  bluff:       ['bluffing', 'hidden_role'],
  puzzle:      ['puzzle'],
  strategy:    ['strategy', 'drafting', 'deck_building'],
  party:       ['party', 'family', 'word_sense'],
}

const VALID_CATEGORIES = Object.keys(GENRE_CATEGORY_MAP) as [string, ...string[]]

const FUN_GENRES   = ['party', 'family', 'word_sense', 'bluffing', 'hidden_role']
const THINK_GENRES = ['strategy', 'puzzle', 'deck_building', 'drafting', 'cooperative']

// リクエストボディのバリデーションスキーマ（公開エンドポイントなのでサーバー側検証必須）
const bodySchema = z.object({
  players:    z.enum(['2', '3-4', '5+']),
  mood:       z.enum(['fun', 'think']),
  categories: z.array(z.enum(VALID_CATEGORIES)).min(0).max(5),
  time:       z.enum(['short', 'medium', 'long']),
  experience: z.enum(['beginner', 'sometimes', 'often']),
  excludeIds: z.array(z.string().uuid()).max(50).optional(),
})

export async function POST(req: NextRequest) {
  // サーバー側バリデーション
  let rawBody: unknown
  try {
    rawBody = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = bodySchema.safeParse(rawBody)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid request', details: parsed.error.flatten().fieldErrors },
      { status: 400 }
    )
  }

  const { players, mood, categories, time, experience, excludeIds } = parsed.data

  const supabase = createAdminClient()
  const { data: games, error } = await supabase
    .from('games')
    .select('*')
    .eq('is_published', true)
    .eq('is_recommendable', true)

  if (error || !games) {
    console.error('[POST /api/recommend]', error?.message)
    return NextResponse.json({ error: 'Failed to fetch games' }, { status: 500 })
  }

  // プロトタイプ汚染防止: Object.hasOwn でキーが存在することを確認してからアクセス
  const selectedGenres = categories.flatMap(c =>
    Object.hasOwn(GENRE_CATEGORY_MAP, c) ? GENRE_CATEGORY_MAP[c] : []
  )

  // Player count hard filter
  const playerNum = players === '2' ? 2 : players === '3-4' ? 3 : 5
  let eligible = games.filter(g => g.min_players <= playerNum && g.max_players >= playerNum)
  // Fallback: if too few pass the filter, use the full set
  if (eligible.length < 3) eligible = games

  const scored = eligible.map(game => {
    let score = 0
    const g = game.genres ?? []

    // Genre match (highest weight)
    selectedGenres.forEach(genre => {
      if (g.includes(genre)) score += 4
    })

    // Mood
    if (mood === 'fun'   && g.some((x: string) => FUN_GENRES.includes(x)))   score += 2
    if (mood === 'think' && g.some((x: string) => THINK_GENRES.includes(x))) score += 2

    // Experience → difficulty
    if (experience === 'beginner') {
      if (game.difficulty === 'easy')   score += 4
      if (game.difficulty === 'medium') score += 1
      if (game.difficulty === 'hard')   score -= 2
    } else if (experience === 'sometimes') {
      if (game.difficulty === 'easy')   score += 2
      if (game.difficulty === 'medium') score += 3
      if (game.difficulty === 'hard')   score += 1
    } else {
      if (game.difficulty === 'easy')   score += 0
      if (game.difficulty === 'medium') score += 2
      if (game.difficulty === 'hard')   score += 4
    }

    // Time (lower weight)
    if (time === 'short') {
      if (game.play_time_min <= 20) score += 2
      else if (game.play_time_min <= 30) score += 1
    } else if (time === 'medium') {
      if (game.play_time_min >= 20 && game.play_time_min <= 60) score += 1
    } else {
      if (game.play_time_min >= 45) score += 1
    }

    return { game, score }
  })

  scored.sort((a, b) => b.score - a.score)

  // A-2: スコア重み付きランダム抽出（上位15件のプールから3本選ぶ）
  const POOL_SIZE = 15
  const rawPool = scored.slice(0, POOL_SIZE)
  // すでに表示したゲームをプールから除外（違う3本を見る）
  const pool = excludeIds?.length
    ? rawPool.filter(x => !excludeIds.includes(x.game.id))
    : rawPool
  // プールが空になった場合はフル rawPool にフォールバック
  const effectivePool = pool.length >= 3 ? pool : rawPool
  const minScore = Math.min(...effectivePool.map(x => x.score))
  // スコアをシフトして全て正にし、重みとして使用
  const weighted = effectivePool.map(x => ({ ...x, weight: Math.max(x.score - minScore + 1, 1) }))

  const result: typeof scored[0]['game'][] = []
  const available = [...weighted]
  for (let pick = 0; pick < 3 && available.length > 0; pick++) {
    const totalWeight = available.reduce((s, x) => s + x.weight, 0)
    let rand = Math.random() * totalWeight
    for (let i = 0; i < available.length; i++) {
      rand -= available[i].weight
      if (rand <= 0) {
        result.push(available[i].game)
        available.splice(i, 1)
        break
      }
    }
  }

  return NextResponse.json({ games: result })
}
