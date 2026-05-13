'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

type Props = {
  id: string
  title: string
}

export function DeleteButton({ id, title }: Props) {
  const router = useRouter()
  const [deleting, setDeleting] = useState(false)

  const handleDelete = async () => {
    if (!confirm(`「${title}」を削除しますか？この操作は取り消せません。`)) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/admin/games/${id}`, { method: 'DELETE' })
      if (!res.ok) {
        const data = await res.json()
        alert(data.error ?? '削除に失敗しました')
        return
      }
      router.refresh()
    } finally {
      setDeleting(false)
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={deleting}
      className="rounded px-2 py-1 text-xs text-red-500 hover:bg-red-50 disabled:opacity-50"
    >
      {deleting ? '削除中...' : '削除'}
    </button>
  )
}
