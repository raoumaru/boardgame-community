'use client'

import { useState, useEffect, useCallback } from 'react'

const STORAGE_KEY = 'bookmarked_games'
const CHANGE_EVENT = 'bookmarks-changed'

function readStorage(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as string[]) : []
  } catch {
    return []
  }
}

function writeStorage(ids: string[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(ids))
  window.dispatchEvent(new CustomEvent<string[]>(CHANGE_EVENT, { detail: ids }))
}

export function useBookmarks() {
  const [ids, setIds] = useState<string[]>([])

  useEffect(() => {
    setIds(readStorage())
    const handler = (e: Event) => setIds((e as CustomEvent<string[]>).detail)
    window.addEventListener(CHANGE_EVENT, handler)
    return () => window.removeEventListener(CHANGE_EVENT, handler)
  }, [])

  const toggle = useCallback((id: string) => {
    setIds(prev => {
      const next = prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
      writeStorage(next)
      return next
    })
  }, [])

  const isBookmarked = useCallback((id: string) => ids.includes(id), [ids])

  return { ids, toggle, isBookmarked, count: ids.length }
}
