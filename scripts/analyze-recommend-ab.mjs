// 現行 vs ランダム版 比較分析
// 実行: node scripts/analyze-recommend-ab.mjs

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

// ── アルゴリズム ─────────────────────────────────────────────────────────────
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

function getEligible(games, players) {
  const playerNum = players === '2' ? 2 : players === '3-4' ? 3 : 5
  const eligible = games.filter(g => g.min_players <= playerNum && g.max_players >= playerNum)
  return eligible.length < 3 ? games : eligible
}

// 現行: 常に上位3件を返す
function getCurrentTop3(games, answers) {
  const eligible = getEligible(games, answers.players)
  return eligible
    .map(game => ({ game, score: scoreGame(game, answers) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map(s => s.game)
}

// 改善A-1: 上位N件からランダム均等抽出
function getRandomTopN(games, answers, N = 10) {
  const eligible = getEligible(games, answers.players)
  const scored = eligible
    .map(game => ({ game, score: scoreGame(game, answers) }))
    .sort((a, b) => b.score - a.score)
  const pool = scored.slice(0, N)
  // Fisher-Yates でシャッフルして上位3件
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]]
  }
  return pool.slice(0, 3).map(s => s.game)
}

// 改善A-2: スコア比例の重み付きランダム抽出
function getWeightedRandom(games, answers, N = 15) {
  const eligible = getEligible(games, answers.players)
  const scored = eligible
    .map(game => ({ game, score: scoreGame(game, answers) }))
    .sort((a, b) => b.score - a.score)
  const pool = scored.slice(0, N)
  const minScore = Math.min(...pool.map(x => x.score))
  // スコアをシフトして全て正にし、重みとして使用
  const shifted = pool.map(x => ({ ...x, weight: Math.max(x.score - minScore + 1, 1) }))
  const result = []
  const available = [...shifted]
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
  return result
}

// ── 全パターン ───────────────────────────────────────────────────────────────
function allSubsets(arr) {
  const result = []
  for (let i = 1; i < (1 << arr.length); i++) {
    result.push(arr.filter((_, j) => i & (1 << j)))
  }
  return result
}
const PLAYERS    = ['2', '3-4', '5+']
const MOODS      = ['fun', 'think']
const CATS       = allSubsets(['cooperative', 'bluff', 'puzzle', 'strategy', 'party'])
const TIMES      = ['short', 'medium', 'long']
const EXPS       = ['beginner', 'sometimes', 'often']

function runSimulation(games, getFn, label, REPEAT = 1) {
  const count = {}
  games.forEach(g => { count[g.slug] = 0 })
  let totalCombos = 0
  for (const players of PLAYERS) {
    for (const mood of MOODS) {
      for (const categories of CATS) {
        for (const time of TIMES) {
          for (const experience of EXPS) {
            const answers = { players, mood, categories, time, experience }
            for (let r = 0; r < REPEAT; r++) {
              const top3 = getFn(games, answers)
              top3.forEach(g => { count[g.slug] = (count[g.slug] ?? 0) + 1 })
            }
            totalCombos++
          }
        }
      }
    }
  }
  const appeared    = Object.values(count).filter(v => v > 0).length
  const notAppeared = games.length - appeared
  const sorted = Object.entries(count).sort((a, b) => b[1] - a[1])
  const top3Total  = sorted.slice(0, 3).reduce((s, [, v]) => s + v, 0)
  const top10Total = sorted.slice(0, 10).reduce((s, [, v]) => s + v, 0)
  const expectedPerGame = (totalCombos * 3 * REPEAT) / games.length
  const actual = Object.values(count)
  const variance = actual.reduce((s, v) => s + (v - expectedPerGame) ** 2, 0) / actual.length
  const stdDev = Math.sqrt(variance)

  console.log(`\n【${label}】`)
  console.log(`  出現ゲーム数  : ${appeared} / ${games.length}本`)
  console.log(`  未出現ゲーム数: ${notAppeared}本`)
  console.log(`  上位3本の独占率: ${((top3Total / (totalCombos * 3 * REPEAT)) * 100).toFixed(1)}%`)
  console.log(`  上位10本の独占率: ${((top10Total / (totalCombos * 3 * REPEAT)) * 100).toFixed(1)}%`)
  console.log(`  出現回数の標準偏差: ${stdDev.toFixed(1)} (低いほど均一)`)
  console.log('  出現回数上位5:')
  sorted.slice(0, 5).forEach(([slug, cnt]) => {
    const title = games.find(g => g.slug === slug)?.title ?? slug
    console.log(`    ${title.padEnd(30)} ${cnt}回`)
  })
  return count
}

async function main() {
  const { data: games, error } = await supabase
    .from('games').select('*')
    .eq('is_published', true).eq('is_recommendable', true)
  if (error || !games) { console.error(error); process.exit(1) }

  console.log(`\n対象: ${games.length}本 / 全パターン: 1,674通り`)
  console.log('ランダム版は各パターン10回試行して平均を見る\n')
  console.log('═══════════════════════════════════════════')

  // 現行
  runSimulation(games, getCurrentTop3, '現行（常に上位3件固定）', 1)

  // A-1: 上位10件からランダム（10回試行）
  runSimulation(games, (g, a) => getRandomTopN(g, a, 10), 'A-1: 上位10件からランダム均等', 10)

  // A-2: 上位15件からスコア重み付きランダム（10回試行）
  runSimulation(games, (g, a) => getWeightedRandom(g, a, 15), 'A-2: 上位15件スコア重み付きランダム', 10)

  console.log('\n═══════════════════════════════════════════')
  console.log('\n【理想値（全ゲームが均等に出た場合）】')
  console.log(`  上位3本の独占率: ${(3 / games.length * 100).toFixed(1)}%`)
  console.log(`  上位10本の独占率: ${(10 / games.length * 100).toFixed(1)}%`)
}

main().catch(console.error)
