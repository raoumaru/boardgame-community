import type { Game } from './types'

export const GENRE_CATEGORY_MAP: Record<string, string[]> = {
  cooperative: ['cooperative'],
  bluff:       ['bluffing', 'hidden_role'],
  puzzle:      ['puzzle'],
  strategy:    ['strategy', 'drafting', 'deck_building'],
  party:       ['party', 'family', 'word_sense'],
}

export const FUN_GENRES   = ['party', 'family', 'word_sense', 'bluffing', 'hidden_role']
export const THINK_GENRES = ['strategy', 'puzzle', 'deck_building', 'drafting', 'cooperative']

export type ScoringParams = {
  players:    '2' | '3-4' | '5+'
  mood:       'fun' | 'think'
  categories: string[]
  time:       'short' | 'medium' | 'long'
  experience: 'beginner' | 'sometimes' | 'often'
}

/**
 * Score games against recommendation params.
 * Returns eligible games (player-count filtered, with full-set fallback) sorted by caller.
 */
export function scoreGames(
  games: Game[],
  params: ScoringParams,
): Array<{ game: Game; score: number }> {
  const { players, mood, categories, time, experience } = params

  const selectedGenres = categories.flatMap(c =>
    Object.hasOwn(GENRE_CATEGORY_MAP, c) ? GENRE_CATEGORY_MAP[c] : []
  )

  const playerNum = players === '2' ? 2 : players === '3-4' ? 3 : 5
  let eligible = games.filter(g => g.min_players <= playerNum && g.max_players >= playerNum)
  if (eligible.length < 3) eligible = games

  return eligible.map(game => {
    let score = 0
    const g = game.genres ?? []

    selectedGenres.forEach(genre => { if (g.includes(genre)) score += 4 })

    if (mood === 'fun'   && g.some(x => FUN_GENRES.includes(x)))   score += 2
    if (mood === 'think' && g.some(x => THINK_GENRES.includes(x))) score += 2

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
}
