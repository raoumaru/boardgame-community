import { createClient } from '@/lib/supabase/server'

const BASE_URL = 'https://boardgame-community-iota.vercel.app'

export default async function sitemap() {
  const supabase = await createClient()
  const { data: games } = await supabase
    .from('games')
    .select('slug, updated_at')
    .eq('is_published', true)

  const gameUrls = (games ?? []).map(g => ({
    url: `${BASE_URL}/games/${g.slug}`,
    lastModified: g.updated_at,
  }))

  return [
    { url: `${BASE_URL}/`,      lastModified: new Date() },
    { url: `${BASE_URL}/games`, lastModified: new Date() },
    ...gameUrls,
  ]
}
