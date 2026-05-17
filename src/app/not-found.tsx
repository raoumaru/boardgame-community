import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-6 px-4 text-center">
      <div className="text-8xl font-black text-amber-400">404</div>
      <p className="text-xl font-bold text-amber-100">ページが見つかりません</p>
      <p className="text-sm text-amber-200/60">お探しのページは存在しないか、移動した可能性があります。</p>
      <Link
        href="/"
        className="rounded-full bg-amber-500 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-amber-900/50 transition hover:bg-amber-400"
      >
        トップページへ戻る
      </Link>
    </div>
  )
}
