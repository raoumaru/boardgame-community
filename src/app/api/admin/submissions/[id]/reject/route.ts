import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { isAdmin } from '@/lib/auth'

type Props = { params: Promise<{ id: string }> }

export async function POST(req: NextRequest, { params }: Props) {
  const supabaseAuth = await createClient()
  const { data: { user } } = await supabaseAuth.auth.getUser()
  if (!isAdmin(user)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params

  let body: { admin_note?: string } = {}
  try { body = await req.json() } catch {}

  const supabase = createAdminClient()

  const { error } = await supabase
    .from('game_submissions')
    .update({
      status:      'rejected',
      admin_note:  body.admin_note ?? null,
      reviewed_at: new Date().toISOString(),
    })
    .eq('id', id)
    .eq('status', 'pending')

  if (error) {
    return NextResponse.json({ error: '却下に失敗しました' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
