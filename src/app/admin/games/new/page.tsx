import { GameForm } from '@/components/admin/GameForm'

export default function NewGamePage() {
  return (
    <div>
      <h1 className="mb-6 text-xl font-bold text-gray-800">ゲーム新規追加</h1>
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <GameForm />
      </div>
    </div>
  )
}
