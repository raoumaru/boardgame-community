import { revalidateTag, revalidatePath } from 'next/cache'
import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { isAdmin } from '@/lib/auth'

type Params = { params: Promise<{ id: string }> }

export async function PUT(request: Request, { params }: Params) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!isAdmin(user)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const body = await request.json()
  const admin = createAdminClient()
  const { data, error } = await admin.from('games').update(body).eq('id', id).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // ゲーム一覧 + 詳細ページのキャッシュをクリア
  revalidateTag('games-list', 'max')
  revalidateTag(`game-detail-${data.slug}`, 'max')

  return NextResponse.json(data)
}

export async function DELETE(_: Request, { params }: Params) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!isAdmin(user)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const admin = createAdminClient()

  // slug と image_path を取得してから削除
  const { data: game } = await admin.from('games').select('slug, image_path').eq('id', id).single()
  if (game?.image_path) {
    await admin.storage.from('game-images').remove([game.image_path])
  }

  const { error } = await admin.from('games').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // ゲーム一覧 + 詳細ページのキャッシュをクリア
  revalidateTag('games-list', 'max')
  if (game?.slug) revalidateTag(`game-detail-${game.slug}`, 'max')

  return NextResponse.json({ ok: true })
}
