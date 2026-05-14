'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/client'
import { GENRES, DIFFICULTY_LABELS } from '@/lib/types'
import { slugify } from '@/lib/utils'
import type { Game } from '@/lib/types'

const schema = z.object({
  title:           z.string().min(1, 'タイトルは必須です'),
  slug:            z.string().min(1, 'スラッグは必須です').regex(/^[a-z0-9-]+$/, '半角英数字とハイフンのみ'),
  description:     z.string().optional(),
  rules:           z.string().optional(),
  recommended_for: z.string().optional(),
  min_players:     z.coerce.number().min(1).max(20),
  max_players:     z.coerce.number().min(1).max(20),
  play_time_min:   z.coerce.number().min(1),
  play_time_max:   z.coerce.number().optional().nullable(),
  difficulty:      z.enum(['easy', 'medium', 'hard']).optional().nullable(),
  genres:          z.array(z.string()).optional(),
  is_published:      z.boolean(),
  is_recommendable:  z.boolean(),
  sort_order:        z.coerce.number().default(0),
})

type FormValues = z.infer<typeof schema>

type Props = {
  game?: Game
}

export function GameForm({ game }: Props) {
  const router = useRouter()
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    game?.image_path
      ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/game-images/${game.image_path}`
      : null
  )
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<FormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(schema) as any,
    defaultValues: {
      title:           game?.title ?? '',
      slug:            game?.slug ?? '',
      description:     game?.description ?? '',
      rules:           game?.rules ?? '',
      recommended_for: game?.recommended_for ?? '',
      min_players:     game?.min_players ?? 2,
      max_players:     game?.max_players ?? 4,
      play_time_min:   game?.play_time_min ?? 30,
      play_time_max:   game?.play_time_max ?? null,
      difficulty:      (game?.difficulty as 'easy'|'medium'|'hard'|null) ?? null,
      genres:          game?.genres ?? [],
      is_published:      game?.is_published ?? true,
      is_recommendable:  game?.is_recommendable ?? true,
      sort_order:        game?.sort_order ?? 0,
    },
  })

  const watchedGenres = watch('genres') ?? []

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImageFile(file)
    setPreviewUrl(URL.createObjectURL(file))
  }

  const uploadImage = async (gameId: string): Promise<string | null> => {
    if (!imageFile) return game?.image_path ?? null
    const supabase = createClient()
    const ext = imageFile.name.split('.').pop() ?? 'jpg'
    const path = `games/${gameId}.${ext}`
    const { error } = await supabase.storage
      .from('game-images')
      .upload(path, imageFile, { upsert: true })
    if (error) throw new Error(error.message)
    return path
  }

  const onSubmit = async (values: FormValues) => {
    setSaving(true)
    setError('')
    try {
      const isEdit = !!game

      // 新規の場合は仮IDでパスを生成し、後でDBに保存
      const targetId = game?.id ?? crypto.randomUUID()
      const imagePath = await uploadImage(targetId)

      const payload = { ...values, image_path: imagePath, id: isEdit ? undefined : targetId }

      const res = await fetch(
        isEdit ? `/api/admin/games/${game.id}` : '/api/admin/games',
        {
          method: isEdit ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }
      )

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error ?? '保存に失敗しました')
      }

      router.push('/admin/games')
      router.refresh()
    } catch (e) {
      setError(e instanceof Error ? e.message : '保存に失敗しました')
      setSaving(false)
    }
  }

  const inputClass = "w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/30"
  const labelClass = "mb-1 block text-sm font-medium text-gray-700"
  const errorClass = "mt-1 text-xs text-red-500"

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* タイトル & スラッグ */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass}>タイトル *</label>
          <input
            {...register('title')}
            className={inputClass}
            onChange={e => {
              setValue('title', e.target.value)
              if (!game) setValue('slug', slugify(e.target.value))
            }}
          />
          {errors.title && <p className={errorClass}>{errors.title.message}</p>}
        </div>
        <div>
          <label className={labelClass}>スラッグ（URL用）*</label>
          <input {...register('slug')} className={inputClass} />
          {errors.slug && <p className={errorClass}>{errors.slug.message}</p>}
        </div>
      </div>

      {/* 人数・時間 */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div>
          <label className={labelClass}>最小人数 *</label>
          <input type="number" {...register('min_players')} className={inputClass} min={1} max={20} />
        </div>
        <div>
          <label className={labelClass}>最大人数 *</label>
          <input type="number" {...register('max_players')} className={inputClass} min={1} max={20} />
        </div>
        <div>
          <label className={labelClass}>最短時間(分) *</label>
          <input type="number" {...register('play_time_min')} className={inputClass} min={1} />
        </div>
        <div>
          <label className={labelClass}>最長時間(分)</label>
          <input type="number" {...register('play_time_max')} className={inputClass} min={1} placeholder="省略可" />
        </div>
      </div>

      {/* 難易度 */}
      <div>
        <label className={labelClass}>難易度</label>
        <select {...register('difficulty')} className={inputClass}>
          <option value="">未設定</option>
          {(Object.entries(DIFFICULTY_LABELS) as [keyof typeof DIFFICULTY_LABELS, string][]).map(([v, l]) => (
            <option key={v} value={v}>{l}</option>
          ))}
        </select>
      </div>

      {/* ジャンル */}
      <div>
        <label className={labelClass}>ジャンル</label>
        <div className="flex flex-wrap gap-2">
          {GENRES.map(g => (
            <label key={g.value} className="flex cursor-pointer items-center gap-1.5">
              <input
                type="checkbox"
                value={g.value}
                checked={watchedGenres.includes(g.value)}
                onChange={e => {
                  const next = e.target.checked
                    ? [...watchedGenres, g.value]
                    : watchedGenres.filter(v => v !== g.value)
                  setValue('genres', next)
                }}
                className="rounded border-gray-300 text-amber-500 focus:ring-amber-400"
              />
              <span className="text-sm text-gray-700">{g.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* 説明 */}
      <div>
        <label className={labelClass}>短い説明</label>
        <textarea {...register('description')} rows={2} className={inputClass} />
      </div>

      {/* ルール */}
      <div>
        <label className={labelClass}>🎲 どんなゲーム？（ルール説明）</label>
        <textarea {...register('rules')} rows={4} className={inputClass} placeholder="ワクワクする文体でどんなゲームか書いてね！" />
      </div>

      {/* おすすめ */}
      <div>
        <label className={labelClass}>✨ こんな人におすすめ</label>
        <textarea {...register('recommended_for')} rows={2} className={inputClass} />
      </div>

      {/* 画像 */}
      <div>
        <label className={labelClass}>ゲーム画像</label>
        <div className="flex items-start gap-4">
          {previewUrl && (
            <img src={previewUrl} alt="プレビュー" className="h-24 w-24 rounded-lg object-contain border border-gray-200" />
          )}
          <input type="file" accept="image/*" onChange={handleImageChange} className="text-sm text-gray-600" />
        </div>
      </div>

      {/* 並び順 & 公開 */}
      <div className="flex items-center gap-6">
        <div>
          <label className={labelClass}>並び順</label>
          <input type="number" {...register('sort_order')} className={`${inputClass} w-24`} />
        </div>
        <label className="flex cursor-pointer items-center gap-2">
          <input type="checkbox" {...register('is_published')} className="rounded border-gray-300 text-amber-500" />
          <span className="text-sm font-medium text-gray-700">公開する</span>
        </label>
        <label className="flex cursor-pointer items-center gap-2">
          <input type="checkbox" {...register('is_recommendable')} className="rounded border-gray-300 text-purple-500" />
          <span className="text-sm font-medium text-gray-700">占い対象にする</span>
        </label>
      </div>

      {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-amber-500 px-6 py-2.5 text-sm font-semibold text-white hover:bg-amber-600 disabled:opacity-50"
        >
          {saving ? '保存中...' : '保存する'}
        </button>
        <button
          type="button"
          onClick={() => router.push('/admin/games')}
          className="rounded-lg border border-gray-200 px-6 py-2.5 text-sm text-gray-600 hover:bg-gray-50"
        >
          キャンセル
        </button>
      </div>
    </form>
  )
}
