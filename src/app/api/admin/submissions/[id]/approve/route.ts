import { NextRequest, NextResponse } from 'next/server'
import { revalidateTag } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { isAdmin } from '@/lib/auth'
import { slugify } from '@/lib/utils'

type Props = { params: Promise<{ id: string }> }

export async function POST(req: NextRequest, { params }: Props) {
  const supabaseAuth = await createClient()
  const { data: { user } } = await supabaseAuth.auth.getUser()
  if (!isAdmin(user)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params

  let body: Record<string, unknown>
  try { body = await req.json() } catch {
    return NextResponse.json({ error: 'リクエストが不正です' }, { status: 400 })
  }

  const supabase = createAdminClient()

  // 申請データ確認
  const { data: submission } = await supabase
    .from('game_submissions')
    .select('*')
    .eq('id', id)
    .single()

  if (!submission) return NextResponse.json({ error: '申請が見つかりません' }, { status: 404 })
  if (submission.status !== 'pending') return NextResponse.json({ error: 'すでに審査済みです' }, { status: 400 })

  const gameId = (body.id as string) ?? crypto.randomUUID()
  let imagePath = (body.image_path as string | null) ?? null

  // 申請画像を game-images バケットにコピー
  if (body.copy_submitted_image && body.submitted_image_path) {
    const { data: fileData } = await supabase.storage
      .from('submission-images')
      .download(body.submitted_image_path as string)

    if (fileData) {
      const destPath = `games/${gameId}.webp`
      const { error: copyError } = await supabase.storage
        .from('game-images')
        .upload(destPath, fileData, { contentType: 'image/webp', upsert: false })
      if (!copyError) imagePath = destPath
    }
  }

  // ゲームを登録
  const { error: insertError } = await supabase.from('games').insert({
    id:                 gameId,
    title:              body.title              as string,
    slug:               (body.slug as string)   || slugify(body.title as string),
    description:        body.description        as string | null ?? null,
    rules:              body.rules              as string | null ?? null,
    recommended_for:    body.recommended_for    as string | null ?? null,
    min_players:        Number(body.min_players)  || 2,
    max_players:        Number(body.max_players)  || 4,
    play_time_min:      Number(body.play_time_min) || 30,
    play_time_max:      body.play_time_max ? Number(body.play_time_max) : null,
    difficulty:         body.difficulty         as string | null ?? null,
    genres:             (body.genres            as string[]) ?? [],
    image_path:         imagePath,
    is_published:       body.is_published       as boolean ?? true,
    is_recommendable:   body.is_recommendable   as boolean ?? false,
    is_popular:         body.is_popular         as boolean ?? false,
    is_owned:           body.is_owned           as boolean ?? false,
    submitter_nickname: submission.submitter_nickname,
    external_url:       (body.external_url as string) || null,
    sort_order:         Number(body.sort_order) || 0,
  })

  if (insertError) {
    return NextResponse.json({ error: `ゲーム登録に失敗しました: ${insertError.message}` }, { status: 500 })
  }

  // 申請を承認済みに更新
  await supabase
    .from('game_submissions')
    .update({ status: 'approved', approved_game_id: gameId, reviewed_at: new Date().toISOString() })
    .eq('id', id)

  revalidateTag('games-list', 'max' as Parameters<typeof revalidateTag>[1])

  return NextResponse.json({ ok: true, game_id: gameId })
}
