import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createAdminClient } from '@/lib/supabase/admin'
import { GENRE_CATEGORY_MAP, scoreGames } from '@/lib/scoring'
import type { Game } from '@/lib/types'

const VALID_CATEGORIES = Object.keys(GENRE_CATEGORY_MAP) as [string, ...string[]]

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

  const scored = scoreGames(games as Game[], { players, mood, categories, time, experience })
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
