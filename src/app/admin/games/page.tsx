import { connection } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { AdminGamesClient } from '@/components/admin/AdminGamesClient'

export default async function AdminGamesPage() {
  await connection()
  const supabase = createAdminClient()
  const { data: games } = await supabase
    .from('games')
    .select('id, title, min_players, max_players, play_time_min, play_time_max, difficulty, is_published, sort_order, image_path')
    .order('sort_order', { ascending: true })

  return <AdminGamesClient games={games ?? []} />
}
