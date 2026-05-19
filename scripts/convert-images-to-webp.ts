/**
 * 既存ゲーム画像を一括でWebPに変換するスクリプト
 *
 * 実行方法:
 *   npx tsx scripts/convert-images-to-webp.ts
 *
 * 動作:
 *   1. DBから全ゲームの image_path を取得
 *   2. WebP以外の画像をダウンロード → sharp でリサイズ・WebP変換
 *   3. Supabase Storage にアップロード（upsert）
 *   4. DB の image_path を新パスに更新
 *   5. 旧ファイルを削除
 */

import sharp from 'sharp'
import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'

// .env.local を手動で読み込む（Next.js 環境外のため）
function loadEnv() {
  const envPath = path.join(process.cwd(), '.env.local')
  if (!fs.existsSync(envPath)) {
    console.error('.env.local が見つかりません')
    process.exit(1)
  }
  for (const line of fs.readFileSync(envPath, 'utf-8').split('\n')) {
    const m = line.match(/^([^#=]+)=(.*)$/)
    if (m) process.env[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, '')
  }
}

loadEnv()

const SUPABASE_URL            = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_SERVICE_ROLE   = process.env.SUPABASE_SERVICE_ROLE_KEY!
const BUCKET                  = 'game-images'
const MAX_WIDTH               = 800
const QUALITY                 = 85

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE) {
  console.error('環境変数 NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY が未設定です')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE)

async function run() {
  // 1. 画像パスを持つゲームを全件取得
  const { data: games, error } = await supabase
    .from('games')
    .select('id, title, image_path')
    .not('image_path', 'is', null)

  if (error || !games) {
    console.error('DB取得失敗:', error)
    process.exit(1)
  }

  const targets = games.filter(g => g.image_path && !g.image_path.endsWith('.webp'))
  console.log(`\n対象: ${targets.length}件 / 全${games.length}件\n`)

  let ok = 0, skip = 0, fail = 0

  for (const game of targets) {
    const oldPath = game.image_path as string
    process.stdout.write(`[${ok + fail + 1}/${targets.length}] ${game.title} ... `)

    try {
      // 2. ダウンロード
      const { data: fileData, error: dlError } = await supabase.storage
        .from(BUCKET)
        .download(oldPath)

      if (dlError || !fileData) {
        console.log(`❌ ダウンロード失敗: ${dlError?.message}`)
        fail++
        continue
      }

      // 3. WebP変換
      const inputBuf  = Buffer.from(await fileData.arrayBuffer())
      const outputBuf = await sharp(inputBuf)
        .resize(MAX_WIDTH, undefined, { withoutEnlargement: true })
        .webp({ quality: QUALITY })
        .toBuffer()

      const newPath = oldPath.replace(/\.[^.]+$/, '.webp')

      // 4. アップロード
      const { error: upError } = await supabase.storage
        .from(BUCKET)
        .upload(newPath, outputBuf, { upsert: true, contentType: 'image/webp' })

      if (upError) {
        console.log(`❌ アップロード失敗: ${upError.message}`)
        fail++
        continue
      }

      // 5. DB更新
      const { error: dbError } = await supabase
        .from('games')
        .update({ image_path: newPath })
        .eq('id', game.id)

      if (dbError) {
        console.log(`❌ DB更新失敗: ${dbError.message}`)
        fail++
        continue
      }

      // 6. 旧ファイル削除（拡張子が変わった場合のみ）
      if (newPath !== oldPath) {
        await supabase.storage.from(BUCKET).remove([oldPath])
      }

      const savedKb   = Math.round(inputBuf.length  / 1024)
      const afterKb   = Math.round(outputBuf.length / 1024)
      const reduction = Math.round((1 - outputBuf.length / inputBuf.length) * 100)
      console.log(`✅ ${savedKb}KB → ${afterKb}KB (${reduction}%削減)`)
      ok++

    } catch (e) {
      console.log(`❌ エラー: ${e instanceof Error ? e.message : String(e)}`)
      fail++
    }
  }

  console.log(`\n===== 完了 =====`)
  console.log(`成功: ${ok}件 / 失敗: ${fail}件 / スキップ: ${skip}件`)
}

run().catch(e => { console.error(e); process.exit(1) })
