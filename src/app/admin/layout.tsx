import { Suspense } from 'react'
import Link from 'next/link'
import { LayoutDashboard } from 'lucide-react'
import { connection } from 'next/server'
import { createClient } from '@/lib/supabase/server'

async function AdminNav() {
  await connection()
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  return (
    <nav className="border-b border-gray-200 bg-white px-4 py-3 shadow-sm">
      <div className="mx-auto flex max-w-5xl items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/games" className="flex items-center gap-1.5 text-sm font-bold text-gray-800">
            <LayoutDashboard className="h-4 w-4" /> 管理画面
          </Link>
          <Link href="/admin/games" className="text-xs text-gray-500 hover:text-gray-700">
            ゲーム管理
          </Link>
          <Link href="/admin/submissions" className="text-xs text-gray-500 hover:text-gray-700">
            申請管理
          </Link>
          <Link href="/games" className="text-xs text-gray-500 hover:text-gray-700">
            ← 公開サイトへ
          </Link>
        </div>
        <LogoutButton />
      </div>
    </nav>
  )
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-gray-50">
      <Suspense fallback={<div className="h-[52px] border-b border-gray-200 bg-white" />}>
        <AdminNav />
      </Suspense>
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
