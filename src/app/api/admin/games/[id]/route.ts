import { revalidateTag, revalidatePath } from 'next/cache'
import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { isAdmin } from '@/lib/auth'
import { gameApiSchema } from '@/lib/schemas/game'

type Params = { params: Promise<{ id: string }> }

export async function PUT(request: Request, { params }: Params) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!isAdmin(user)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // IDのバリデーション（UUIDフォーマット）
  const { id } = await params
  if (!id || !/^[0-9a-f-]{36}$/i.test(id)) {
    return NextResponse.json({ error: 'Invalid ID' }, { status: 400 })
  }

  // サーバー側バリデーション
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = gameApiSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
      { status: 400 }
    )
  }

  const admin = createAdminClient()
  const { data, error } = await admin.from('games').update(parsed.data).eq('id', id).select().single()
  if (error) {
    console.error('[PUT /api/admin/games/:id]', error.message)
    return NextResponse.json({ error: 'Failed to update game' }, { status: 500 })
  }

  // ゲーム一覧 + 詳細ページのキャッシュをクリア
  revalidateTag('games-list', 'max')
  revalidateTag(`game-detail-${data.slug}`, 'max')

  return NextResponse.json(data)
}

export async function DELETE(_: Request, { params }: Params) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!isAdmin(user)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // IDのバリデーション（UUIDフォーマット）
  const { id } = await params
  if (!id || !/^[0-9a-f-]{36}$/i.test(id)) {
    return NextResponse.json({ error: 'Invalid ID' }, { status: 400 })
  }

  const admin = createAdminClient()

  // slug と image_path を取得してから削除
  const { data: game } = await admin.from('games').select('slug, image_path').eq('id', id).single()
  if (game?.image_path) {
    await admin.storage.from('game-images').remove([game.image_path])
  }

  const { error } = await admin.from('games').delete().eq('id', id)
  if (error) {
    console.error('[DELETE /api/admin/games/:id]', error.message)
    return NextResponse.json({ error: 'Failed to delete game' }, { status: 500 })
  }

  // ゲーム一覧 + 詳細ページのキャッシュをクリア
  revalidateTag('games-list', 'max')
  if (game?.slug) revalidateTag(`game-detail-${game.slug}`, 'max')

  return NextResponse.json({ ok: true })
}
