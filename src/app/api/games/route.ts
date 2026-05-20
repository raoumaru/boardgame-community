import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

const GAMES_SELECT =
  'id, title, slug, title_kana, min_players, max_players, play_time_min, play_time_max, difficulty, genres, image_path, is_popular, is_recommendable, sort_order, created_at, external_url, submitter_nickname'

export async function GET(req: NextRequest) {
  const raw = req.nextUrl.searchParams.get('ids') ?? ''
  const ids = raw.split(',').map(s => s.trim()).filter(Boolean)

  if (ids.length === 0) return NextResponse.json({ games: [] })
  if (ids.length > 50) return NextResponse.json({ error: 'Too many IDs' }, { status: 400 })

  const supabase = createAdminClient()
  const { data } = await supabase
    .from('games')
    .select(GAMES_SELECT)
    .in('id', ids)
    .eq('is_published', true)

  return NextResponse.json({ games: data ?? [] })
}
