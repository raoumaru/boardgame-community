import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { createAdminClient } from '@/lib/supabase/admin'

// レート制限: 同一IP から 1時間5件まで
const rateMap = new Map<string, { count: number; resetAt: number }>()
const RATE_LIMIT    = 5
const RATE_WINDOW_MS = 60 * 60 * 1000

function isRateLimited(ip: string): boolean {
  const now   = Date.now()
  const entry = rateMap.get(ip)
  if (!entry || now > entry.resetAt) {
    rateMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS })
    return false
  }
  if (entry.count >= RATE_LIMIT) return true
  entry.count++
  return false
}

export async function POST(req: NextRequest) {
  // レート制限
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? 'unknown'
  if (isRateLimited(ip)) {
    return NextResponse.json({ error: 'しばらく待ってから再度お試しください' }, { status: 429 })
  }

  let formData: FormData
  try {
    formData = await req.formData()
  } catch {
    return NextResponse.json({ error: 'リクエストが不正です' }, { status: 400 })
  }

  // ハニーポット
  const honeypot = formData.get('honeypot') as string | null
  if (honeypot && honeypot.length > 0) {
    return NextResponse.json({ ok: true }) // ボット: 黙って200を返す
  }

  // 必須バリデーション
  const title              = (formData.get('title') as string | null)?.trim()
  const submitterNickname  = (formData.get('submitter_nickname') as string | null)?.trim()
  const imageFile          = formData.get('image') as File | null

  if (!title || title.length === 0)             return NextResponse.json({ error: 'ゲーム名は必須です' }, { status: 400 })
  if (!submitterNickname)                        return NextResponse.json({ error: 'ニックネームは必須です' }, { status: 400 })
  if (!imageFile || imageFile.size === 0)        return NextResponse.json({ error: '画像は必須です' }, { status: 400 })
  if (imageFile.size > 5 * 1024 * 1024)         return NextResponse.json({ error: '画像は5MB以下にしてください' }, { status: 400 })

  // 任意フィールド取得
  const description       = (formData.get('description') as string | null)?.trim() || null
  const minPlayers        = formData.get('min_players')  ? Number(formData.get('min_players'))  : null
  const maxPlayers        = formData.get('max_players')  ? Number(formData.get('max_players'))  : null
  const playTimeMin       = formData.get('play_time_min') ? Number(formData.get('play_time_min')) : null
  const playTimeMax       = formData.get('play_time_max') ? Number(formData.get('play_time_max')) : null
  const difficulty        = (formData.get('difficulty') as string | null) || null
  const genresRaw         = formData.get('genres') as string | null
  const genres            = genresRaw ? (JSON.parse(genresRaw) as string[]) : null
  const submitterComment  = (formData.get('submitter_comment') as string | null)?.trim() || null

  const supabase = createAdminClient()

  // 画像を submission-images バケットにアップロード
  const submissionId = crypto.randomUUID()
  const imageExt     = imageFile.name.endsWith('.webp') ? 'webp' : imageFile.name.split('.').pop() ?? 'jpg'
  const imagePath    = `submissions/${submissionId}.${imageExt}`
  const imageBuffer  = Buffer.from(await imageFile.arrayBuffer())

  const { error: uploadError } = await supabase.storage
    .from('submission-images')
    .upload(imagePath, imageBuffer, {
      contentType: imageFile.type,
      upsert:      false,
    })

  if (uploadError) {
    console.error('Upload error:', uploadError)
    return NextResponse.json({ error: '画像のアップロードに失敗しました' }, { status: 500 })
  }

  // DB に申請データを保存
  const { error: insertError } = await supabase
    .from('game_submissions')
    .insert({
      id:                 submissionId,
      title,
      submitter_nickname: submitterNickname,
      image_path:         imagePath,
      image_consented:    true,
      description,
      min_players:        minPlayers,
      max_players:        maxPlayers,
      play_time_min:      playTimeMin,
      play_time_max:      playTimeMax,
      difficulty,
      genres,
      submitter_comment:  submitterComment,
      status:             'pending',
    })

  if (insertError) {
    console.error('Insert error:', insertError)
    return NextResponse.json({ error: '申請の保存に失敗しました' }, { status: 500 })
  }

  // 管理者にメール通知
  try {
    const resend    = new Resend(process.env.RESEND_API_KEY)
    const fromEmail = process.env.CONTACT_FROM_EMAIL ?? 'noreply@boardgame-raou.com'
    const toEmail   = process.env.CONTACT_TO_EMAIL   ?? 'gute107080@gmail.com'

    await resend.emails.send({
      from:    `ラ王のボドゲ倉庫 <${fromEmail}>`,
      to:      toEmail,
      subject: `【ボドゲ申請】新しい申請が届きました：${title}`,
      text: [
        `■ ゲーム名：${title}`,
        `■ 申請者：${submitterNickname}`,
        `■ 説明：${description ?? '（管理者に任せる）'}`,
        `■ 人数：${minPlayers && maxPlayers ? `${minPlayers}〜${maxPlayers}人` : '（管理者に任せる）'}`,
        `■ 時間：${playTimeMin ? `${playTimeMin}${playTimeMax ? `〜${playTimeMax}` : ''}分` : '（管理者に任せる）'}`,
        `■ 難易度：${difficulty ?? '（管理者に任せる）'}`,
        `■ ジャンル：${genres?.join('・') ?? '（管理者に任せる）'}`,
        `■ コメント：${submitterComment ?? 'なし'}`,
        '',
        '管理画面で審査してください：',
        'https://www.boardgame-raou.com/admin/submissions',
      ].join('\n'),
    })
  } catch (e) {
    // メール失敗は握りつぶす（申請自体は成功）
    console.error('Email error:', e)
  }

  return NextResponse.json({ ok: true })
}
