import { Suspense } from 'react'
import { connection } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { AdminGamesClient } from '@/components/admin/AdminGamesClient'

async function GamesLoader() {
  await connection()
  const supabase = createAdminClient()
  const { data: games } = await supabase
    .from('games')
    .select('id, title, title_kana, min_players, max_players, play_time_min, play_time_max, difficulty, is_published, is_recommendable, is_popular, sort_order, image_path')
    .order('sort_order', { ascending: true })

  return <AdminGamesClient games={games ?? []} />
}

export default function AdminGamesPage() {
  return (
    <Suspense fallback={<div className="p-6 text-gray-500">読み込み中...</div>}>
      <GamesLoader />
    </Suspense>
  )
}
