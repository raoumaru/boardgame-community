'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV_ITEMS = [
  { href: '/games',     label: 'ゲーム一覧', emoji: '🎲' },
  { href: '/recommend', label: 'ゲーム占い', emoji: '🔮' },
]

export function NavMenu() {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const pathname = usePathname()

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Close on route change
  useEffect(() => { setOpen(false) }, [pathname])

  return (
    <div ref={ref} className="fixed right-4 top-4 z-50">
      {/* Hamburger button */}
      <button
        onClick={() => setOpen(v => !v)}
        className="flex h-10 w-10 flex-col items-center justify-center gap-1.5 rounded-full bg-black/40 backdrop-blur-sm border border-white/10 transition-all hover:bg-black/60 hover:border-amber-400/30"
        aria-label="メニュー"
      >
        <span className={`block h-0.5 w-5 rounded-full bg-amber-300 transition-all duration-200 ${open ? 'translate-y-2 rotate-45' : ''}`} />
        <span className={`block h-0.5 w-5 rounded-full bg-amber-300 transition-all duration-200 ${open ? 'opacity-0' : ''}`} />
        <span className={`block h-0.5 w-5 rounded-full bg-amber-300 transition-all duration-200 ${open ? '-translate-y-2 -rotate-45' : ''}`} />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="animate-fade-in absolute right-0 mt-2 w-44 rounded-2xl border border-white/10 bg-black/70 backdrop-blur-md shadow-2xl overflow-hidden">
          {NAV_ITEMS.map(item => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 text-sm transition-colors ${
                  isActive
                    ? 'bg-amber-500/20 text-amber-300 font-medium'
                    : 'text-white/70 hover:bg-white/10 hover:text-white'
                }`}
              >
                <span>{item.emoji}</span>
                <span>{item.label}</span>
                {isActive && <span className="ml-auto text-xs text-amber-400">●</span>}
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
