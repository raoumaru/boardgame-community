import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

// genre category → actual genre values
const GENRE_CATEGORY_MAP: Record<string, string[]> = {
  cooperative: ['cooperative'],
  bluff:       ['bluffing', 'hidden_role'],
  puzzle:      ['puzzle'],
  strategy:    ['strategy', 'drafting', 'deck_building'],
  party:       ['party', 'family', 'word_sense'],
}

const FUN_GENRES   = ['party', 'family', 'word_sense', 'bluffing', 'hidden_role']
const THINK_GENRES = ['strategy', 'puzzle', 'deck_building', 'drafting', 'cooperative']

type Body = {
  players:    '2' | '3-4' | '5+'
  mood:       'fun' | 'think'
  categories: string[]   // genre categories selected
  time:       'short' | 'medium' | 'long'
  experience: 'beginner' | 'sometimes' | 'often'
}

export async function POST(req: NextRequest) {
  const body: Body = await req.json()
  const { players, mood, categories, time, experience } = body

  const supabase = createAdminClient()
  const { data: games, error } = await supabase
    .from('games')
    .select('*')
    .eq('is_published', true)

  if (error || !games) {
    return NextResponse.json({ error: 'Failed to fetch games' }, { status: 500 })
  }

  // Expand selected categories to individual genre values
  const selectedGenres = categories.flatMap(c => GENRE_CATEGORY_MAP[c] ?? [])

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
  const top3 = scored.slice(0, 3).map(s => s.game)

  return NextResponse.json({ games: top3 })
}
