import type { MetadataRoute } from 'next'
import { createAdminClient } from '@/lib/supabase/admin'
import { TYPES } from './mbti/data'
import { SITE_URL } from '@/lib/constants'

const BASE_URL = SITE_URL

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // ── 静的ページ ──────────────────────────────────────
  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE_URL,                lastModified: '2026-05-18', changeFrequency: 'weekly',  priority: 1.0 },
    { url: `${BASE_URL}/games`,     lastModified: '2026-05-18', changeFrequency: 'daily',   priority: 0.9 },
    { url: `${BASE_URL}/mbti`,      lastModified: '2026-05-18', changeFrequency: 'weekly',  priority: 0.9 },
    { url: `${BASE_URL}/recommend`, lastModified: '2026-05-18', changeFrequency: 'weekly',  priority: 0.8 },
    { url: `${BASE_URL}/letter`,    lastModified: '2026-05-18', changeFrequency: 'weekly',  priority: 0.7 },
  ]

  // ── ボドゲMBTI タイプ詳細 16ページ ────────────────────
  const mbtiPages: MetadataRoute.Sitemap = Object.keys(TYPES).map(code => ({
    url: `${BASE_URL}/mbti/${code.toLowerCase()}`,
    lastModified: '2026-05-18',
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }))

  // ── ゲーム詳細ページ（公開済み全件）────────────────────
  const supabase = createAdminClient()
  const { data: games } = await supabase
    .from('games')
    .select('slug, updated_at')
    .eq('is_published', true)

  const gamePages: MetadataRoute.Sitemap = (games ?? []).map(g => ({
    url: `${BASE_URL}/games/${g.slug}`,
    lastModified: g.updated_at ?? '2026-05-18',
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }))

  return [...staticPages, ...mbtiPages, ...gamePages]
}
