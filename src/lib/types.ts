export type Difficulty = 'easy' | 'medium' | 'hard'

export type Game = {
  id: string
  title: string
  slug: string
  description: string | null
  min_players: number
  max_players: number
  play_time_min: number
  play_time_max: number | null
  difficulty: Difficulty | null
  genres: string[] | null
  image_path: string | null
  title_kana: string | null
  rules: string | null
  recommended_for: string | null
  is_published: boolean
  sort_order: number
  created_at: string
  updated_at: string
}

export const GENRES = [
  { value: 'strategy',          label: '戦略' },
  { value: 'family',            label: 'ファミリー' },
  { value: 'party',             label: 'パーティー' },
  { value: 'cooperative',       label: '協力' },
  { value: 'puzzle',            label: 'パズル' },
  { value: 'hidden_role',       label: '正体隠匿' },
  { value: 'drafting',          label: 'ドラフト' },
  { value: 'deck_building',     label: 'デッキ構築' },
  { value: 'bluffing',          label: 'ブラフ' },
  { value: 'word_sense',        label: 'ワードセンス' },
] as const

export type GenreValue = typeof GENRES[number]['value']

export const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  easy:   'かんたん',
  medium: '普通',
  hard:   '難しい',
}

export const DIFFICULTY_COLORS: Record<Difficulty, string> = {
  easy:   'bg-green-100 text-green-800',
  medium: 'bg-yellow-100 text-yellow-800',
  hard:   'bg-orange-100 text-orange-800',
}
