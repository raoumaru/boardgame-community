import { Suspense } from 'react'
import { connection } from 'next/server'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { GameForm } from '@/components/admin/GameForm'

type Props = { params: Promise<{ id: string }> }

async function EditGameLoader({ id }: { id: string }) {
  await connection()
  const supabase = await createClient()
  const { data: game } = await supabase.from('games').select('*').eq('id', id).single()
  if (!game) notFound()

  return (
    <div>
      <h1 className="mb-6 text-xl font-bold text-gray-800">ゲーム編集：{game.title}</h1>
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <GameForm game={game} />
      </div>
    </div>
  )
}

export default async function EditGamePage({ params }: Props) {
  const { id } = await params
  return (
    <Suspense fallback={<div className="p-6 text-gray-500">読み込み中...</div>}>
      <EditGameLoader id={id} />
    </Suspense>
  )
}
