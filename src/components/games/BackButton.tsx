'use client'

import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'

export function BackButton() {
  const router = useRouter()
  return (
    <button
      onClick={() => router.back()}
      className="mb-6 inline-flex items-center gap-1.5 text-sm text-amber-200/80 hover:text-amber-200 transition-colors"
    >
      <ArrowLeft className="h-4 w-4" />
      ゲーム一覧に戻る
    </button>
  )
}
