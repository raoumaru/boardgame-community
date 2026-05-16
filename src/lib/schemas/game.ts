import { z } from 'zod'

/**
 * ゲームAPIのサーバーサイドバリデーションスキーマ
 * GameForm.tsx のクライアント側スキーマと対応させること
 */
export const gameApiSchema = z.object({
  title:            z.string().min(1, 'タイトルは必須').max(255),
  slug:             z.string().min(1).max(100).regex(/^[a-z0-9-]+$/, 'スラッグは半角英数字とハイフンのみ'),
  description:      z.string().max(2000).optional().nullable(),
  rules:            z.string().max(5000).optional().nullable(),
  recommended_for:  z.string().max(500).optional().nullable(),
  min_players:      z.coerce.number().int().min(1).max(20),
  max_players:      z.coerce.number().int().min(1).max(30),
  play_time_min:    z.coerce.number().int().min(1).max(600),
  play_time_max:    z.coerce.number().int().min(1).max(600).optional().nullable(),
  difficulty:       z.enum(['easy', 'medium', 'hard']).optional().nullable(),
  genres:           z.array(z.string().max(50)).max(10).optional(),
  is_published:     z.boolean().optional(),
  is_recommendable: z.boolean().optional(),
  is_popular:       z.boolean().optional(),
  sort_order:       z.coerce.number().int().min(0).max(9999).optional(),
  external_url:     z.string().url().max(500).optional().nullable().or(z.literal('')).or(z.null()),
  image_path:       z.string().max(500).optional().nullable(),
})

export type GameApiInput = z.infer<typeof gameApiSchema>
