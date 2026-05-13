import Link from 'next/link'
import { connection } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await connection()
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // ログインページは認証不要（middlewareがログイン済みリダイレクトを担当）
  if (!user) {
    return <>{children}</>
  }

  return (
    <div className="min-h-dvh bg-gray-50">
      {/* ナビバー */}
      <nav className="border-b border-gray-200 bg-white px-4 py-3 shadow-sm">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin/games" className="text-sm font-bold text-gray-800">
              🗂️ 管理画面
            </Link>
            <Link href="/games" className="text-xs text-gray-500 hover:text-gray-700">
              ← 公開サイトへ
            </Link>
          </div>
          <LogoutButton />
        </div>
      </nav>

      <main className="mx-auto max-w-5xl px-4 py-6">{children}</main>
    </div>
  )
}

function LogoutButton() {
  return (
    <form action="/api/admin/logout" method="POST">
      <button
        type="submit"
        className="text-xs text-gray-500 hover:text-gray-700"
      >
        ログアウト
      </button>
    </form>
  )
}
