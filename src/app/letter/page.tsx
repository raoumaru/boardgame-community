import Link from 'next/link'
import { Suspense } from 'react'
import { NavMenu } from '@/components/ui/NavMenu'
import { BookOpen, Clock, ArrowRight } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'ボドゲレター',
  description: 'ボードゲームについて深く掘り下げるコラム・入門記事。マーダーミステリー、協力ゲーム、名作解説など。',
  openGraph: {
    title: 'ボドゲレター | ラ王のボドゲ倉庫',
    description: 'ボードゲームについて深く掘り下げるコラム・入門記事。',
  },
}

type Article = {
  vol: string
  slug: string
  title: string
  subtitle: string
  date: string
  readTime: string
  tags: string[]
  excerpt: string
  href: string
}

const ARTICLES: Article[] = [
  {
    vol: 'Vol.002',
    slug: 'vol009-murder-mystery',
    title: 'あなたは今夜、探偵になる。',
    subtitle: 'Murder Mystery',
    date: '2025.05.18',
    readTime: '約7分',
    tags: ['入門', '完全ガイド', 'マーダーミステリー'],
    excerpt: 'ある夜、密室で殺人が起きた。参加者全員に動機がある。全員に嘘がある。そして、その中の誰かが——犯人だ。マーダーミステリーとは何か、どう遊ぶのかを徹底解説。',
    href: '/letters/vol009-murder-mystery.html',
  },
  {
    vol: 'Vol.001',
    slug: 'vol001-what-is-boardgame',
    title: '箱を開けると、友達になれるもの。',
    subtitle: 'What is Board Game',
    date: '2026.05.18',
    readTime: '約8分',
    tags: ['入門', '完全ガイド', 'ボードゲームとは'],
    excerpt: 'スマートフォンを伏せて、テーブルの向こうにいる人の顔を見る。それだけで、もうゲームは始まっている。ボードゲームとは何か、なぜ面白いのかを徹底解説。',
    href: '/letters/vol001-what-is-boardgame.html',
  },
]

export default function LetterPage() {
  return (
    <div className="min-h-dvh px-4 py-8">
      <Suspense fallback={null}><NavMenu /></Suspense>

      <div className="mx-auto max-w-2xl">

        {/* ヘッダー */}
        <div className="mb-10 pt-4">
          <p className="mb-2 text-xs tracking-[0.3em] text-amber-400/50 uppercase">Boardgame Letter</p>
          <h1 className="mb-3 text-3xl font-black tracking-wide text-amber-100">ボドゲレター</h1>
          <p className="text-sm text-white/40">ボードゲームを深く知るためのコラム・入門記事</p>
        </div>

        {/* 記事一覧 */}
        <div className="space-y-4">
          {ARTICLES.map(article => (
            <a
              key={article.slug}
              href={article.href}
              target="_blank"
              rel="noopener noreferrer"
              className="group block overflow-hidden rounded-2xl border border-white/10 bg-white/5 transition-all hover:border-amber-400/30 hover:bg-white/8"
            >
              {/* ヘッダーバー */}
              <div className="flex items-center justify-between border-b border-white/5 px-5 py-3">
                <span className="font-mono text-xs tracking-widest text-amber-400/50">{article.vol}</span>
                <div className="flex items-center gap-3 text-white/30">
                  <span className="flex items-center gap-1 text-xs">
                    <Clock className="h-3 w-3" />{article.readTime}
                  </span>
                  <span className="text-xs">{article.date}</span>
                </div>
              </div>

              {/* 本文 */}
              <div className="p-5">
                <div className="mb-1 font-mono text-xs tracking-widest text-red-400/60 uppercase">{article.subtitle}</div>
                <h2 className="mb-3 text-lg font-bold leading-snug text-amber-100 group-hover:text-amber-300 transition-colors">
                  {article.title}
                </h2>
                <p className="mb-4 text-sm leading-relaxed text-white/40 line-clamp-2">{article.excerpt}</p>

                {/* タグ */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap gap-1.5">
                    {article.tags.map(tag => (
                      <span key={tag} className="rounded-full border border-white/10 px-2.5 py-0.5 text-xs text-white/30">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <span className="flex items-center gap-1 text-xs text-amber-400/50 group-hover:text-amber-400 transition-colors">
                    <BookOpen className="h-3.5 w-3.5" />
                    読む
                    <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </div>
              </div>
            </a>
          ))}
        </div>

        {/* 記事が少ないときのメッセージ */}
        {ARTICLES.length < 3 && (
          <p className="mt-8 text-center text-xs text-white/20">新しい記事を準備中...</p>
        )}

      </div>
    </div>
  )
}
