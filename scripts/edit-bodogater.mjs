import { createCanvas, loadImage, registerFont } from 'canvas'
import { createWriteStream } from 'fs'

const img = await loadImage('C:/Users/rikus/boardgame-community/public/bodogater.png')

const canvas = createCanvas(img.width, img.height)
const ctx = canvas.getContext('2d')

// 元画像を描画
ctx.drawImage(img, 0, 0)

// 吹き出しのテキスト領域を塗りつぶす（右上あたり）
// 画像サイズを確認
console.log('Image size:', img.width, 'x', img.height)

// 吹き出し部分をクリーム色で塗りつぶす
const bubbleX = img.width * 0.52
const bubbleY = img.height * 0.04
const bubbleW = img.width * 0.44
const bubbleH = img.height * 0.32

ctx.fillStyle = '#f5f0e8'
ctx.beginPath()
ctx.roundRect(bubbleX, bubbleY, bubbleW, bubbleH, 12)
ctx.fill()

// テキストを描く
const fontSize = Math.floor(img.width * 0.038)
ctx.fillStyle = '#1a1a1a'
ctx.font = `bold ${fontSize}px sans-serif`
ctx.textAlign = 'center'
ctx.textBaseline = 'middle'

const text = 'あなたに合う'
const text2 = 'ボードゲームを'
const text3 = '占いましょう！'
const cx = bubbleX + bubbleW / 2
const cy = bubbleY + bubbleH / 2

ctx.fillText(text,  cx, cy - fontSize * 1.2)
ctx.fillText(text2, cx, cy)
ctx.fillText(text3, cx, cy + fontSize * 1.2)

// 保存
const out = createWriteStream('C:/Users/rikus/boardgame-community/public/bodogater.png')
canvas.createPNGStream().pipe(out)
out.on('finish', () => console.log('Done! Saved to public/bodogater.png'))
