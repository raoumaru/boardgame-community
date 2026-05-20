'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Gamepad2, Sparkles } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { GENRES, DIFFICULTY_LABELS } from '@/lib/types'
import { slugify } from '@/lib/utils'
import type { GameSubmission } from '@/lib/types'

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
  is_popular:        z.boolean(),
  is_owned:          z.boolean(),
  sort_order:        z.coerce.number().default(0),
  external_url:      z.string().url('正しいURLを入力してください').optional().or(z.literal('')),
  use_submitted_image: z.boolean(),
})

type FormValues = z.infer<typeof schema>

async function compressToWebP(file: File, maxWidth = 800, quality = 0.85): Promise<File> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      URL.revokeObjectURL(url)
      const scale = Math.min(1, maxWidth / img.naturalWidth)
      const w = Math.round(img.naturalWidth * scale)
      const h = Math.round(img.naturalHeight * scale)
      const canvas = document.createElement('canvas')
      canvas.width = w; canvas.height = h
      canvas.getContext('2d')!.drawImage(img, 0, 0, w, h)
      canvas.toBlob(
        blob => {
          if (!blob) { reject(new Error('WebP変換失敗')); return }
          resolve(new File([blob], file.name.replace(/\.[^.]+$/, '.webp'), { type: 'image/webp' }))
        },
        'image/webp', quality,
      )
    }
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('画像の読み込みに失敗しました')) }
    img.src = url
  })
}

type Props = {
  submission: GameSubmission
  submittedImageUrl: string | null
}

export function SubmissionApproveForm({ submission, submittedImageUrl }: Props) {
  const router = useRouter()
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(submittedImageUrl)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<FormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(schema) as any,
    defaultValues: {
      title:           submission.title,
      slug:            slugify(submission.title),
      description:     submission.description ?? '',
      rules:           submission.description ?? '',
      recommended_for: '',
      min_players:     submission.min_players  ?? 2,
      max_players:     submission.max_players  ?? 4,
      play_time_min:   submission.play_time_min ?? 30,
      play_time_max:   submission.play_time_max ?? null,
      difficulty:      (submission.difficulty as 'easy'|'medium'|'hard'|null) ?? null,
      genres:          submission.genres ?? [],
      is_published:      true,
      is_recommendable:  false,
      is_popular:        false,
      is_owned:          false,
      sort_order:        0,
      external_url:      '',
      use_submitted_image: !!submittedImageUrl,
    },
  })

  const watchedGenres          = watch('genres') ?? []
  const useSubmittedImage      = watch('use_submitted_image')

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImageFile(file)
    setPreviewUrl(URL.createObjectURL(file))
    setValue('use_submitted_image', false)
  }

  const onSubmit = async (values: FormValues) => {
    setSaving(true)
    setError('')
    try {
      const gameId    = crypto.randomUUID()
      let   imagePath: string | null = null

      if (imageFile) {
        // 新しい画像をアップロード
        const supabase   = createClient()
        const compressed = await compressToWebP(imageFile)
        const path       = `games/${gameId}.webp`
        const { error: upErr } = await supabase.storage
          .from('game-images')
          .upload(path, compressed, { upsert: true, contentType: 'image/webp' })
        if (upErr) throw new Error(upErr.message)
        imagePath = path
      } else if (values.use_submitted_image && submission.image_path) {
        // 申請画像を game-images にコピー（サーバー側で処理）
        imagePath = `games/${gameId}.webp` // approve API でコピー処理
      }

      const payload = {
        ...values,
        id:                 gameId,
        image_path:         imagePath,
        submitter_nickname: submission.submitter_nickname,
        submission_id:      submission.id,
        copy_submitted_image: !imageFile && values.use_submitted_image && !!submission.image_path,
        submitted_image_path: submission.image_path,
      }

      const res = await fetch(`/api/admin/submissions/${submission.id}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error ?? '保存に失敗しました')
      }

      router.push('/admin/submissions')
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

      {/* 申請者コメント */}
      {submission.submitter_comment && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <span className="font-medium">申請者コメント：</span>{submission.submitter_comment}
        </div>
      )}

      {/* タイトル & スラッグ */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass}>タイトル *</label>
          <input
            {...register('title')}
            className={inputClass}
            onChange={e => {
              setValue('title', e.target.value)
              setValue('slug', slugify(e.target.value))
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
          {(Object.entries(DIFFICULTY_LABELS) as [string, string][]).map(([v, l]) => (
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
        <label className={`${labelClass} flex items-center gap-1.5`}><Gamepad2 className="h-4 w-4" /> どんなゲーム？（ルール説明）</label>
        <textarea {...register('rules')} rows={4} className={inputClass} placeholder="ワクワクする文体でどんなゲームか書いてね！" />
      </div>

      {/* おすすめ */}
      <div>
        <label className={`${labelClass} flex items-center gap-1.5`}><Sparkles className="h-4 w-4" /> こんな人におすすめ</label>
        <textarea {...register('recommended_for')} rows={2} className={inputClass} />
      </div>

      {/* 外部リンク */}
      <div>
        <label className={labelClass}>外部リンク（公式サイトなど）</label>
        <input {...register('external_url')} type="url" className={inputClass} placeholder="https://example.com" />
        {errors.external_url && <p className={errorClass}>{errors.external_url.message}</p>}
      </div>

      {/* 画像 */}
      <div>
        <label className={labelClass}>ゲーム画像</label>

        {/* 申請画像プレビュー */}
        {submittedImageUrl && (
          <div className="mb-3 rounded-lg border border-gray-200 bg-gray-50 p-3">
            <p className="mb-2 text-xs font-medium text-gray-500">申請者が提出した画像：</p>
            <div className="flex items-center gap-3">
              <img src={submittedImageUrl} alt="申請画像" className="h-24 w-24 rounded-lg object-contain border border-gray-200 bg-white" />
              <label className="flex cursor-pointer items-center gap-2">
                <input type="checkbox" {...register('use_submitted_image')} className="rounded border-gray-300 text-amber-500" />
                <span className="text-sm text-gray-700">この画像を使用する</span>
              </label>
            </div>
          </div>
        )}

        {/* 差し替え画像 */}
        <div className="flex items-start gap-4">
          {!useSubmittedImage && previewUrl && !submittedImageUrl && (
            <img src={previewUrl} alt="プレビュー" className="h-24 w-24 rounded-lg object-contain border border-gray-200" />
          )}
          {imageFile && previewUrl && (
            <img src={previewUrl} alt="新しい画像プレビュー" className="h-24 w-24 rounded-lg object-contain border border-gray-200" />
          )}
          <div>
            <input type="file" accept="image/*" onChange={handleImageChange} className="text-sm text-gray-600" />
            <p className="mt-1 text-xs text-gray-400">差し替える場合は新しい画像を選択してください</p>
          </div>
        </div>
      </div>

      {/* 並び順 & 各種フラグ */}
      <div className="flex flex-wrap items-center gap-6">
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
        <label className="flex cursor-pointer items-center gap-2">
          <input type="checkbox" {...register('is_popular')} className="rounded border-gray-300 text-amber-500" />
          <span className="text-sm font-medium text-gray-700">人気バッジを付ける</span>
        </label>
        <label className="flex cursor-pointer items-center gap-2">
          <input type="checkbox" {...register('is_owned')} className="rounded border-gray-300 text-green-500" />
          <span className="text-sm font-medium text-gray-700">🎮 所持している</span>
        </label>
      </div>

      {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-green-500 px-6 py-2.5 text-sm font-semibold text-white hover:bg-green-600 disabled:opacity-50"
        >
          {saving ? '登録中...' : '✓ 承認してゲームに追加'}
        </button>
        <button
          type="button"
          onClick={() => router.push('/admin/submissions')}
          className="rounded-lg border border-gray-200 px-6 py-2.5 text-sm text-gray-600 hover:bg-gray-50"
        >
          キャンセル
        </button>
      </div>
    </form>
  )
}
