import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { z } from 'zod'

// In-memory rate limiting (IP ごとに 3回/10分)
const rateMap = new Map<string, { count: number; resetAt: number }>()
const RATE_LIMIT = 3
const RATE_WINDOW_MS = 10 * 60 * 1000

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const entry = rateMap.get(ip)
  if (!entry || now > entry.resetAt) {
    rateMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS })
    return false
  }
  if (entry.count >= RATE_LIMIT) return true
  entry.count++
  return false
}

const schema = z.object({
  category:    z.enum(['game', 'bug', 'collab', 'other']),
  name:        z.string().min(1).max(100),
  email:       z.string().email().optional().or(z.literal('')),
  message:     z.string().min(1).max(2000),
  honeypot:    z.string().max(0), // ボットトラップ（空でなければ弾く）
})

const CATEGORY_LABELS: Record<string, string> = {
  game:   'ゲームについて',
  bug:    '不具合・要望',
  collab: '取材・コラボ',
  other:  'その他',
}

export async function POST(req: NextRequest) {
  // レート制限
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? 'unknown'
  if (isRateLimited(ip)) {
    return NextResponse.json({ error: 'しばらく待ってから再度お試しください' }, { status: 429 })
  }

  // バリデーション
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'リクエストが不正です' }, { status: 400 })
  }

  const result = schema.safeParse(body)
  if (!result.success) {
    return NextResponse.json({ error: '入力内容を確認してください' }, { status: 400 })
  }

  const { category, name, email, message } = result.data

  const fromEmail = process.env.CONTACT_FROM_EMAIL ?? 'noreply@boardgame-raou.com'
  const toEmail   = process.env.CONTACT_TO_EMAIL   ?? 'gute107080@gmail.com'

  const replyTo = email ? [email] : undefined

  const resend = new Resend(process.env.RESEND_API_KEY)

  try {
    await resend.emails.send({
      from:     `ラ王のボドゲ倉庫 <${fromEmail}>`,
      to:       toEmail,
      replyTo,
      subject:  `【お問い合わせ】${CATEGORY_LABELS[category]} - ${name}`,
      text: [
        `■ カテゴリ: ${CATEGORY_LABELS[category]}`,
        `■ お名前: ${name}`,
        `■ メールアドレス: ${email || '未入力'}`,
        '',
        '■ メッセージ:',
        message,
        '',
        '---',
        'ラ王のボドゲ倉庫 お問い合わせフォームより',
        'https://www.boardgame-raou.com/contact',
      ].join('\n'),
    })

    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('Resend error:', e)
    return NextResponse.json({ error: 'メール送信に失敗しました' }, { status: 500 })
  }
}
