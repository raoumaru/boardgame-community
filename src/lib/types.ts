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
  is_recommendable: boolean
  is_popular: boolean
  is_owned: boolean
  submitter_nickname: string | null
  sort_order: number
  created_at: string
  updated_at: string
  external_url: string | null
}

export type SubmissionStatus = 'pending' | 'approved' | 'rejected'

export type GameSubmission = {
  id: string
  title: string
  submitter_nickname: string
  image_path: string
  image_consented: boolean
  description: string | null
  min_players: number | null
  max_players: number | null
  play_time_min: number | null
  play_time_max: number | null
  difficulty: string | null
  genres: string[] | null
  submitter_comment: string | null
  status: SubmissionStatus
  admin_note: string | null
  approved_game_id: string | null
  created_at: string
  reviewed_at: string | null
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
  { value: 'trick_taking',      label: 'トリックテイキング' },
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
