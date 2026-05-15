// 占いアルゴリズム全パターン分析スクリプト
// 実行: node scripts/analyze-recommend.mjs

import { createClient } from '@supabase/supabase-js'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { readFileSync } from 'fs'

const __dirname = dirname(fileURLToPath(import.meta.url))

// .env.local を手動パース
try {
  const envPath = join(__dirname, '../.env.local')
  const env = readFileSync(envPath, 'utf-8')
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

// ── アルゴリズム（route.ts と同一） ──────────────────────────────────────────

const GENRE_CATEGORY_MAP = {
  cooperative: ['cooperative'],
  bluff:       ['bluffing', 'hidden_role'],
  puzzle:      ['puzzle'],
  strategy:    ['strategy', 'drafting', 'deck_building'],
  party:       ['party', 'family', 'word_sense'],
}
const FUN_GENRES   = ['party', 'family', 'word_sense', 'bluffing', 'hidden_role']
const THINK_GENRES = ['strategy', 'puzzle', 'deck_building', 'drafting', 'cooperative']

function scoreGame(game, { players, mood, categories, time, experience }) {
  let score = 0
  const g = game.genres ?? []
  const selectedGenres = categories.flatMap(c => GENRE_CATEGORY_MAP[c] ?? [])

  // ジャンルマッチ
  selectedGenres.forEach(genre => { if (g.includes(genre)) score += 4 })

  // 気分
  if (mood === 'fun'   && g.some(x => FUN_GENRES.includes(x)))   score += 2
  if (mood === 'think' && g.some(x => THINK_GENRES.includes(x))) score += 2

  // 経験値→難易度
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

  // 時間
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

function getTop3(games, answers) {
  const playerNum = answers.players === '2' ? 2 : answers.players === '3-4' ? 3 : 5
  let eligible = games.filter(g => g.min_players <= playerNum && g.max_players >= playerNum)
  if (eligible.length < 3) eligible = games

  const scored = eligible
    .map(game => ({ game, score: scoreGame(game, answers) }))
    .sort((a, b) => b.score - a.score)

  return scored.slice(0, 3).map(s => s.game)
}

// ── 全パターン生成 ───────────────────────────────────────────────────────────

function allSubsets(arr) {
  const result = []
  for (let i = 1; i < (1 << arr.length); i++) {
    result.push(arr.filter((_, j) => i & (1 << j)))
  }
  return result
}

const PLAYERS_OPTIONS    = ['2', '3-4', '5+']
const MOOD_OPTIONS       = ['fun', 'think']
const CATEGORY_OPTIONS   = ['cooperative', 'bluff', 'puzzle', 'strategy', 'party']
const TIME_OPTIONS       = ['short', 'medium', 'long']
const EXPERIENCE_OPTIONS = ['beginner', 'sometimes', 'often']
const CATEGORY_SUBSETS   = allSubsets(CATEGORY_OPTIONS)

// ── メイン ───────────────────────────────────────────────────────────────────

async function main() {
  const { data: games, error } = await supabase
    .from('games')
    .select('*')
    .eq('is_published', true)
    .eq('is_recommendable', true)

  if (error || !games) { console.error('DB取得失敗', error); process.exit(1) }

  console.log(`\n対象ゲーム数: ${games.length}本\n`)

  // 全組み合わせをカウント
  const appearCount  = {}  // slug → 出現回数
  const rank1Count   = {}  // slug → 1位回数
  const topCombos    = {}  // slug → 何パターンで上位3入り
  games.forEach(g => { appearCount[g.slug] = 0; rank1Count[g.slug] = 0 })

  let totalCombos = 0
  const scoreDistribution = {} // slug → スコア頻度

  for (const players of PLAYERS_OPTIONS) {
    for (const mood of MOOD_OPTIONS) {
      for (const categories of CATEGORY_SUBSETS) {
        for (const time of TIME_OPTIONS) {
          for (const experience of EXPERIENCE_OPTIONS) {
            const answers = { players, mood, categories, time, experience }
            const top3 = getTop3(games, answers)
            top3.forEach((g, i) => {
              appearCount[g.slug] = (appearCount[g.slug] ?? 0) + 1
              if (i === 0) rank1Count[g.slug] = (rank1Count[g.slug] ?? 0) + 1
            })
            totalCombos++
          }
        }
      }
    }
  }

  // 出現回数でソート
  const sorted = Object.entries(appearCount)
    .map(([slug, count]) => ({
      slug,
      title: games.find(g => g.slug === slug)?.title ?? slug,
      count,
      rank1: rank1Count[slug] ?? 0,
      pct: ((count / totalCombos) * 100).toFixed(1),
    }))
    .sort((a, b) => b.count - a.count)

  const appeared    = sorted.filter(x => x.count > 0)
  const notAppeared = sorted.filter(x => x.count === 0)

  console.log(`全パターン数: ${totalCombos.toLocaleString()}通り\n`)

  console.log('━━━ 出現回数ランキング（上位20件）━━━')
  appeared.slice(0, 20).forEach((x, i) => {
    console.log(`${String(i+1).padStart(2)}. ${x.title.padEnd(28)} ${String(x.count).padStart(5)}回 (${x.pct}%) 1位:${x.rank1}回`)
  })

  if (appeared.length > 20) {
    console.log(`\n... 以下 ${appeared.length - 20} 件（出現あり）`)
    appeared.slice(20).forEach(x => {
      console.log(`    ${x.title.padEnd(28)} ${String(x.count).padStart(5)}回 (${x.pct}%)`)
    })
  }

  console.log(`\n━━━ 一度も出現しないゲーム（${notAppeared.length}件）━━━`)
  notAppeared.forEach(x => console.log(`  - ${x.title} (${x.slug})`))

  // 上位3件に集中しているスコアを分析
  console.log('\n━━━ 偏り分析 ━━━')
  const top10 = appeared.slice(0, 10)
  const top10Total = top10.reduce((s, x) => s + x.count, 0)
  const top10Pct = ((top10Total / (totalCombos * 3)) * 100).toFixed(1)
  console.log(`上位10ゲームが全推薦枠の ${top10Pct}% を占める`)

  const top3Games = appeared.slice(0, 3)
  const top3Total = top3Games.reduce((s, x) => s + x.count, 0)
  const top3Pct = ((top3Total / (totalCombos * 3)) * 100).toFixed(1)
  console.log(`上位3ゲームだけで ${top3Pct}% を占める`)
}

main().catch(console.error)
