import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

// .env.local を読み込む
const env = Object.fromEntries(
  readFileSync(join(__dirname, '../.env.local'), 'utf-8')
    .split('\n')
    .filter(line => line.includes('=') && !line.startsWith('#'))
    .map(line => {
      const idx = line.indexOf('=')
      return [line.slice(0, idx).trim(), line.slice(idx + 1).trim()]
    })
)

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY)

// slug → Wikipedia ページタイトル
const WIKIPEDIA_TITLES = {
  'catan':             'Catan',
  'pandemic':          'Pandemic_(game)',
  'dominion':          'Dominion_(card_game)',
  'agricola':          'Agricola_(board_game)',
  'codenames':         'Codenames_(board_game)',
  'terraforming-mars': 'Terraforming_Mars_(board_game)',
  // 以下は Wikipedia に英語記事がないため手動で URL を指定
  'nanjamo':    null,
  'ito':        null,
  'word-wolf':  null,
  'dice-tower': null,
}

async function fetchWikipediaImageUrl(title) {
  const res = await fetch(
    `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`,
    { headers: { 'User-Agent': 'BoardgameLibrary/1.0 (community site)' } }
  )
  if (!res.ok) return null
  const data = await res.json()
  return data.thumbnail?.source ?? null
}

async function uploadImage(slug, imageUrl) {
  const res = await fetch(imageUrl, {
    headers: { 'User-Agent': 'BoardgameLibrary/1.0' }
  })
  if (!res.ok) throw new Error(`画像取得失敗: ${res.status}`)
  const buffer = await res.arrayBuffer()

  const ext = imageUrl.split('.').pop().split('?')[0].toLowerCase() || 'jpg'
  const path = `games/${slug}.${ext}`

  const { error } = await supabase.storage
    .from('game-images')
    .upload(path, buffer, {
      contentType: ext === 'jpg' ? 'image/jpeg' : `image/${ext}`,
      upsert: true,
    })

  if (error) throw new Error(`アップロード失敗: ${error.message}`)
  return path
}

async function updateGameImagePath(slug, imagePath) {
  const { error } = await supabase
    .from('games')
    .update({ image_path: imagePath })
    .eq('slug', slug)
  if (error) throw new Error(`DB更新失敗: ${error.message}`)
}

async function main() {
  console.log('画像アップロード開始...\n')

  for (const [slug, wikiTitle] of Object.entries(WIKIPEDIA_TITLES)) {
    if (!wikiTitle) {
      console.log(`${slug} ... ⏭ スキップ（Wikipedia記事なし）`)
      continue
    }

    process.stdout.write(`${slug} ... `)
    try {
      const imageUrl = await fetchWikipediaImageUrl(wikiTitle)
      if (!imageUrl) {
        console.log('❌ 画像URLが見つからず')
        continue
      }
      const imagePath = await uploadImage(slug, imageUrl)
      await updateGameImagePath(slug, imagePath)
      console.log(`✅ ${imagePath}`)
    } catch (err) {
      console.log(`❌ ${err.message}`)
    }

    await new Promise(r => setTimeout(r, 500))
  }

  console.log('\n完了！')
}

main()
