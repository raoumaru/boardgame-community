'use client'

import { useState } from 'react'

type Props = {
  id: string
  isPublished: boolean
  onToggle?: (next: boolean) => void
}

export function TogglePublishButton({ id, isPublished, onToggle }: Props) {
  const [loading, setLoading] = useState(false)
  const [published, setPublished] = useState(isPublished)

  const handleToggle = async () => {
    setLoading(true)
    try {
      const next = !published
      const res = await fetch(`/api/admin/games/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_published: next }),
      })
      if (res.ok) {
        setPublished(next)
        onToggle?.(next)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={`rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors disabled:opacity-50 ${
        published
          ? 'bg-green-100 text-green-700 hover:bg-green-200'
          : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
      }`}
    >
      {published ? '公開中' : '非公開'}
    </button>
  )
}
