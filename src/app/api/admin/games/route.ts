import { revalidateTag } from 'next/cache'
import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { isAdmin } from '@/lib/auth'
import { gameApiSchema } from '@/lib/schemas/game'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!isAdmin(user)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // サーバー側バリデーション（クライアントを信頼しない）
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
  const { data, error } = await admin.from('games').insert(parsed.data).select().single()
  if (error) {
    console.error('[POST /api/admin/games]', error.message)
    return NextResponse.json({ error: 'Failed to save game' }, { status: 500 })
  }
  revalidateTag('games-list', 'max')
  return NextResponse.json(data)
}
