// A-2実装後も出ないゲームの特定と原因分析
import { createClient } from '@supabase/supabase-js'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { readFileSync } from 'fs'

const __dirname = dirname(fileURLToPath(import.meta.url))
try {
  const env = readFileSync(join(__dirname, '../.env.local'), 'utf-8')
  env.split('\n').forEach(line => {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) return
    const idx = trimmed.indexOf('=')
    if (idx === -1) return
    const key = trimmed.slice(0, idx).trim()
    const val = trimmed.slice(idx + 1).trim().replace(/^["']|["']$/g, '')
    if (key) process.env[key] = val
  })
} catch {}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

const GENRE_CATEGORY_MAP = {
  cooperative: ['cooperative'],
  bluff:       ['bluffing', 'hidden_role'],
  puzzle:      ['puzzle'],
  strategy:    ['strategy', 'drafting', 'deck_building'],
  party:       ['party', 'family', 'word_sense'],
}
const FUN_GENRES   = ['party', 'family', 'word_sense', 'bluffing', 'hidden_role']
const THINK_GENRES = ['strategy', 'puzzle', 'deck_building', 'drafting', 'cooperative']

function scoreGame(game, { mood, categories, time, experience }) {
  let score = 0
  const g = game.genres ?? []
  const selectedGenres = categories.flatMap(c => GENRE_CATEGORY_MAP[c] ?? [])
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
  return score
}

function allSubsets(arr) {
  const result = []
  for (let i = 1; i < (1 << arr.length); i++) result.push(arr.filter((_, j) => i & (1 << j)))
  return result
}

const PLAYERS  = ['2', '3-4', '5+']
const MOODS    = ['fun', 'think']
const CATS     = allSubsets(['cooperative', 'bluff', 'puzzle', 'strategy', 'party'])
const TIMES    = ['short', 'medium', 'long']
const EXPS     = ['beginner', 'sometimes', 'often']

async function main() {
  const { data: games } = await supabase
    .from('games').select('*')
    .eq('is_published', true).eq('is_recommendable', true)

  // 各ゲームの全パターンにわたる最高スコアと、top15入り回数を記録
  const maxScore   = {}
  const top15Count = {}
  games.forEach(g => { maxScore[g.slug] = -999; top15Count[g.slug] = 0 })

  for (const players of PLAYERS) {
    const playerNum = players === '2' ? 2 : players === '3-4' ? 3 : 5
    let eligible = games.filter(g => g.min_players <= playerNum && g.max_players >= playerNum)
    if (eligible.length < 3) eligible = games

    for (const mood of MOODS) {
      for (const categories of CATS) {
        for (const time of TIMES) {
          for (const experience of EXPS) {
            const answers = { mood, categories, time, experience }
            const scored = eligible
              .map(game => ({ game, score: scoreGame(game, answers) }))
              .sort((a, b) => b.score - a.score)

            // top15に入ったゲームをカウント
            scored.slice(0, 15).forEach(({ game, score }) => {
              top15Count[game.slug]++
              if (score > maxScore[game.slug]) maxScore[game.slug] = score
            })
          }
        }
      }
    }
  }

  const neverInTop15 = games
    .filter(g => top15Count[g.slug] === 0)
    .sort((a, b) => (maxScore[b.slug] ?? 0) - (maxScore[a.slug] ?? 0))

  console.log(`\n━━━ A-2でも出ないゲーム（top15にすら入らない）: ${neverInTop15.length}本 ━━━\n`)
  neverInTop15.forEach(g => {
    const genres = (g.genres ?? []).join(', ') || 'なし'
    const diff   = g.difficulty ?? 'なし'
    const best   = maxScore[g.slug]
    console.log(`【${g.title}】`)
    console.log(`  現在のジャンル: [${genres}]`)
    console.log(`  難易度: ${diff}　人数: ${g.min_players}〜${g.max_players}人　時間: ${g.play_time_min}〜${g.play_time_max ?? '?'}分`)
    console.log(`  全パターンでの最高スコア: ${best}点`)
    console.log()
  })

  // スコアが低い理由を分析
  console.log('━━━ スコアが低い原因パターン ━━━\n')
  const noGenre = neverInTop15.filter(g => !g.genres || g.genres.length === 0)
  const onlyAbstract = neverInTop15.filter(g => g.genres?.every(x => !Object.values(GENRE_CATEGORY_MAP).flat().includes(x)))
  console.log(`・ジャンル未設定: ${noGenre.length}本`)
  noGenre.forEach(g => console.log(`  - ${g.title}`))
  console.log(`・スコア対象外ジャンルのみ: ${onlyAbstract.length}本`)
  onlyAbstract.forEach(g => console.log(`  - ${g.title} [${(g.genres ?? []).join(', ')}]`))
}

main().catch(console.error)
