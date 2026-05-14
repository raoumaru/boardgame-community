'use client'

import { useState } from 'react'

type Props = {
  id: string
  isRecommendable: boolean
  onToggle?: (next: boolean) => void
}

export function ToggleRecommendButton({ id, isRecommendable, onToggle }: Props) {
  const [loading, setLoading] = useState(false)
  const [recommendable, setRecommendable] = useState(isRecommendable)

  const handleToggle = async () => {
    setLoading(true)
    try {
      const next = !recommendable
      const res = await fetch(`/api/admin/games/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_recommendable: next }),
      })
      if (res.ok) {
        setRecommendable(next)
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
        recommendable
          ? 'bg-purple-100 text-purple-700 hover:bg-purple-200'
          : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
      }`}
    >
      {recommendable ? '占い対象' : '対象外'}
    </button>
  )
}
