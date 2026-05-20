/**
 * public/ 内の画像を WebP に圧縮するスクリプト
 * npx tsx scripts/compress-public-images.ts
 */
import sharp from 'sharp'
import * as fs from 'fs'
import * as path from 'path'

const ROOT = path.join(process.cwd(), 'public')

const TARGETS: { src: string; maxWidth: number; quality: number }[] = [
  { src: 'bodogater.png',              maxWidth: 800, quality: 85 },
  { src: 'mbti-characters/drgh.png',   maxWidth: 480, quality: 85 },
  { src: 'mbti-characters/drgl.png',   maxWidth: 480, quality: 85 },
  { src: 'mbti-characters/drih.png',   maxWidth: 480, quality: 85 },
  { src: 'mbti-characters/dril.png',   maxWidth: 480, quality: 85 },
  { src: 'mbti-characters/dugh.png',   maxWidth: 480, quality: 85 },
  { src: 'mbti-characters/dugl.png',   maxWidth: 480, quality: 85 },
  { src: 'mbti-characters/duih.png',   maxWidth: 480, quality: 85 },
  { src: 'mbti-characters/duil.png',   maxWidth: 480, quality: 85 },
  { src: 'mbti-characters/wrgh.png',   maxWidth: 480, quality: 85 },
  { src: 'mbti-characters/wrgl.png',   maxWidth: 480, quality: 85 },
  { src: 'mbti-characters/wrih.png',   maxWidth: 480, quality: 85 },
  { src: 'mbti-characters/wril.png',   maxWidth: 480, quality: 85 },
  { src: 'mbti-characters/wugh.png',   maxWidth: 480, quality: 85 },
  { src: 'mbti-characters/wugl.png',   maxWidth: 480, quality: 85 },
  { src: 'mbti-characters/wuih.png',   maxWidth: 480, quality: 85 },
  { src: 'mbti-characters/wuil.png',   maxWidth: 480, quality: 85 },
]

async function run() {
  console.log('\n=== public/ 画像 WebP 圧縮 ===\n')

  let totalBefore = 0
  let totalAfter = 0

  for (const t of TARGETS) {
    const srcPath  = path.join(ROOT, t.src)
    const destPath = srcPath.replace(/\.[^.]+$/, '.webp')

    if (!fs.existsSync(srcPath)) {
      console.log(`⚠ スキップ（存在しない）: ${t.src}`)
      continue
    }

    const beforeBytes = fs.statSync(srcPath).size
    const inputBuf = fs.readFileSync(srcPath)

    const outputBuf = await sharp(inputBuf)
      .resize(t.maxWidth, undefined, { withoutEnlargement: true })
      .webp({ quality: t.quality })
      .toBuffer()

    fs.writeFileSync(destPath, outputBuf)

    const beforeKB   = Math.round(beforeBytes / 1024)
    const afterKB    = Math.round(outputBuf.length / 1024)
    const reduction  = Math.round((1 - outputBuf.length / beforeBytes) * 100)

    console.log(`✅ ${t.src}`)
    console.log(`   ${beforeKB}KB → ${afterKB}KB (${reduction}%削減)`)

    totalBefore += beforeBytes
    totalAfter  += outputBuf.length
  }

  const totalReduction = Math.round((1 - totalAfter / totalBefore) * 100)
  console.log(`\n===== 合計 =====`)
  console.log(`${Math.round(totalBefore/1024)}KB → ${Math.round(totalAfter/1024)}KB (${totalReduction}%削減)`)
}

run().catch(e => { console.error(e); process.exit(1) })
