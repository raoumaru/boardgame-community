'use client'

import { useState } from 'react'

type Props = {
  id: string
  isPopular: boolean
  onToggle?: (next: boolean) => void
}

export function TogglePopularButton({ id, isPopular, onToggle }: Props) {
  const [loading, setLoading] = useState(false)
  const [popular, setPopular] = useState(isPopular)

  const handleToggle = async () => {
    setLoading(true)
    try {
      const next = !popular
      const res = await fetch(`/api/admin/games/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_popular: next }),
      })
      if (res.ok) {
        setPopular(next)
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
        popular
          ? 'bg-amber-100 text-amber-700 hover:bg-amber-200'
          : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
      }`}
    >
      {popular ? '人気' : '－'}
    </button>
  )
}
