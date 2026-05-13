import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

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

// slug → BGG検索クエリ（見つかりやすいもののみ）
const BGG_QUERIES = {
  'nine-tiles-panic':   'Nine Tiles Panic',
  'penguin-party':      'Penguin Party',
  'gobblet-gobblers':   'Gobblet Gobblers',
  'custom-heroes':      'Custom Heroes AEG',
  'tiger-and-dragon':   'Tiger Dragon',
  'geistesblitz':       'Geistesblitz',
  'geistesblitz-2':     'Geistesblitz 2',
  'hannin-wa-odoru':    'Hannin wa Odoru',
  'draft-poker':        'Draft Poker',
  'stroop-card-expert': 'Stroop card game',
}

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms))
}

async function searchBGG(query) {
  const url = `https://boardgamegeek.com/xmlapi2/search?query=${encodeURIComponent(query)}&type=boardgame`
  const res = await fetch(url, { headers: { 'User-Agent': 'BoardgameLibrary/1.0' } })
  if (!res.ok) return null
  const text = await res.text()
  const match = text.match(/<item type="boardgame" id="(\d+)"/)
  return match ? match[1] : null
}

async function getBGGImageUrl(gameId) {
  await sleep(1000) // BGGレート制限対策
  const url = `https://boardgamegeek.com/xmlapi2/thing?id=${gameId}`
  const res = await fetch(url, { headers: { 'User-Agent': 'BoardgameLibrary/1.0' } })
  if (!res.ok) return null
  const text = await res.text()
  const match = text.match(/<image>\s*([^\s<]+)\s*<\/image>/)
  if (!match) return null
  const imgPath = match[1].trim()
  return imgPath.startsWith('//') ? `https:${imgPath}` : imgPath
}

async function uploadImage(slug, imageUrl) {
  const res = await fetch(imageUrl, { headers: { 'User-Agent': 'BoardgameLibrary/1.0' } })
  if (!res.ok) throw new Error(`画像取得失敗: ${res.status}`)
  const buffer = await res.arrayBuffer()
  const rawExt = imageUrl.split('.').pop().split('?')[0].toLowerCase().replace(/[^a-z]/g, '')
  const ext = ['jpg', 'jpeg', 'png', 'webp'].includes(rawExt) ? rawExt : 'jpg'
  const path = `games/${slug}.${ext}`
  const { error } = await supabase.storage
    .from('game-images')
    .upload(path, buffer, {
      contentType: ext === 'jpg' || ext === 'jpeg' ? 'image/jpeg' : `image/${ext}`,
      upsert: true,
    })
  if (error) throw new Error(`アップロード失敗: ${error.message}`)
  return path
}

async function updateGameImagePath(slug, imagePath) {
  const { error } = await supabase.from('games').update({ image_path: imagePath }).eq('slug', slug)
  if (error) throw new Error(`DB更新失敗: ${error.message}`)
}

async function main() {
  console.log('新規ゲーム画像アップロード開始...\n')

  for (const [slug, query] of Object.entries(BGG_QUERIES)) {
    process.stdout.write(`${slug} ... `)
    try {
      const gameId = await searchBGG(query)
      if (!gameId) {
        console.log('❌ BGGで見つからず')
        await sleep(1500)
        continue
      }
      const imageUrl = await getBGGImageUrl(gameId)
      if (!imageUrl) {
        console.log(`❌ 画像URLなし (BGG ID: ${gameId})`)
        await sleep(500)
        continue
      }
      const imagePath = await uploadImage(slug, imageUrl)
      await updateGameImagePath(slug, imagePath)
      console.log(`✅ ${imagePath}`)
    } catch (err) {
      console.log(`❌ ${err.message}`)
    }
    await sleep(1500)
  }

  console.log('\n手動で画像登録が必要なゲーム:')
  const manual = [
    'san-ren-tan', 'black-market', 'kartel', 'propose-kotoba',
    'fukinshinn-king', 'goi-no-oosama', 'sotto-oyasumi', 'pile-up',
  ]
  manual.forEach(s => console.log(`  - ${s}`))
  console.log('\n完了！管理画面の編集ページから画像をアップロードできます。')
}

main()
