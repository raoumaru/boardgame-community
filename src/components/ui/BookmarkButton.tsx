'use client'

import { Heart } from 'lucide-react'
import { useBookmarks } from '@/hooks/useBookmarks'

type Props = {
  gameId: string
  size?: 'sm' | 'md'
  className?: string
}

export function BookmarkButton({ gameId, size = 'sm', className = '' }: Props) {
  const { isBookmarked, toggle } = useBookmarks()
  const bookmarked = isBookmarked(gameId)

  return (
    <button
      type="button"
      onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggle(gameId) }}
      aria-label={bookmarked ? 'お気に入りから削除' : 'お気に入りに追加'}
      className={`flex items-center justify-center rounded-full transition-all ${
        bookmarked
          ? 'bg-red-500 text-white shadow-md scale-110'
          : 'bg-black/25 text-white/80 hover:bg-black/40 hover:text-white'
      } ${size === 'sm' ? 'h-7 w-7' : 'h-9 w-9'} ${className}`}
    >
      <Heart className={`${size === 'sm' ? 'h-3.5 w-3.5' : 'h-5 w-5'} ${bookmarked ? 'fill-white' : ''}`} />
    </button>
  )
}
