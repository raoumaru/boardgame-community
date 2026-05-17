import { Mail } from 'lucide-react'

export function Footer() {
  return (
    <footer className="border-t border-white/5 px-6 py-8 text-center">
      <p className="mb-3 text-xs font-bold tracking-widest text-amber-400/40 uppercase">Contact</p>
      <a
        href="mailto:gute107080@gmail.com"
        className="inline-flex items-center gap-2 text-xs text-white/30 transition-colors hover:text-white/60"
      >
        <Mail className="h-3.5 w-3.5 shrink-0" />
        gute107080@gmail.com
      </a>
      <p className="mt-4 text-xs text-white/20">© {new Date().getFullYear()} ラ王のボドゲ倉庫</p>
    </footer>
  )
}
