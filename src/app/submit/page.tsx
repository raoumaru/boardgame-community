'use client'

import { useState, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Suspense } from 'react'
import { Send, Star, Users, Clock, Gamepad2 } from 'lucide-react'
import { NavMenu } from '@/components/ui/NavMenu'
import { GENRES } from '@/lib/types'
import type { Metadata } from 'next'

const schema = z.object({
  title:              z.string().min(1, 'ゲーム名は必須です').max(100),
  submitter_nickname: z.string().min(1, 'ニックネームは必須です').max(50),
  image_consented:    z.literal(true, { error: '著作権への同意が必要です' }),
  description:        z.string().max(1000).optional(),
  min_players:        z.coerce.number().min(1).max(20).optional().or(z.literal('')),
  max_players:        z.coerce.number().min(1).max(20).optional().or(z.literal('')),
  play_time_min:      z.coerce.number().min(1).optional().or(z.literal('')),
  play_time_max:      z.coerce.number().min(1).optional().or(z.literal('')),
  genres:             z.array(z.string()).optional(),
  submitter_comment:  z.string().max(500).optional(),
  honeypot:           z.string().max(0),
  // 「管理者に任せる」フラグ
  omit_description:   z.boolean().optional(),
  omit_players:       z.boolean().optional(),
  omit_time:          z.boolean().optional(),
  omit_genres:        z.boolean().optional(),
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
        }, 'image/webp', quality,
      )
    }
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('画像読み込み失敗')) }
    img.src = url
  })
}

export default function SubmitPage() {
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [imageError, setImageError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(schema) as any,
    defaultValues: {
      genres: [],
      omit_description: false,
      omit_players: false,
      omit_time: false,
      omit_genres: false,
    },
  })

  const watchedGenres      = watch('genres') ?? []
  const omitDescription    = watch('omit_description')
  const omitPlayers        = watch('omit_players')
  const omitTime           = watch('omit_time')
  const omitGenres         = watch('omit_genres')

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const ALLOWED = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    if (!ALLOWED.includes(file.type)) { setImageError('JPEG・PNG・WebP・GIF形式のみ対応しています'); e.target.value = ''; return }
    if (file.size > 5 * 1024 * 1024) { setImageError('5MB以下の画像を選択してください'); e.target.value = ''; return }
    setImageError('')
    setImageFile(file)
    setPreviewUrl(URL.createObjectURL(file))
  }

  const onSubmit = async (values: FormValues) => {
    if (!imageFile) { setImageError('画像は必須です'); return }
    setSubmitting(true)
    setSubmitError('')
    try {
      const compressed = await compressToWebP(imageFile)
      const formData = new FormData()
      formData.append('image', compressed)
      formData.append('title',              values.title)
      formData.append('submitter_nickname', values.submitter_nickname)
      if (!values.omit_description && values.description)
        formData.append('description', values.description)
      if (!values.omit_players) {
        if (values.min_players) formData.append('min_players', String(values.min_players))
        if (values.max_players) formData.append('max_players', String(values.max_players))
      }
      if (!values.omit_time) {
        if (values.play_time_min) formData.append('play_time_min', String(values.play_time_min))
        if (values.play_time_max) formData.append('play_time_max', String(values.play_time_max))
      }
      if (!values.omit_genres && watchedGenres.length > 0)
        formData.append('genres', JSON.stringify(watchedGenres))
      if (values.submitter_comment)
        formData.append('submitter_comment', values.submitter_comment)
      formData.append('honeypot', values.honeypot ?? '')

      const res = await fetch('/api/submit', { method: 'POST', body: formData })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error ?? '送信に失敗しました')
      }
      setSubmitted(true)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (e) {
      setSubmitError(e instanceof Error ? e.message : '送信に失敗しました')
    } finally {
      setSubmitting(false)
    }
  }

  const inputClass = "w-full rounded-xl border border-white/20 bg-white/10 px-3 py-2.5 text-sm text-white placeholder-white/30 focus:border-amber-400/60 focus:outline-none focus:ring-2 focus:ring-amber-400/20"
  const labelClass = "mb-1 block text-sm font-medium text-white/80"
  const errorClass = "mt-1 text-xs text-red-400"

  if (submitted) {
    return (
      <div className="min-h-dvh px-4 py-12">
        <Suspense fallback={null}><NavMenu /></Suspense>
        <div className="mx-auto max-w-lg text-center">
          <div className="mb-6 flex justify-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-500/20 border border-green-400/30">
              <Star className="h-10 w-10 text-green-300" />
            </div>
          </div>
          <h1 className="mb-3 text-3xl font-bold text-amber-100">申請ありがとうございます！</h1>
          <p className="mb-2 text-white/70">
            ボードゲームの申請を受け付けました。<br />
            管理者が内容を確認後、承認されればサイトに掲載されます。
          </p>
          <p className="mb-8 text-sm text-white/40">通常1〜3営業日以内に審査いたします。</p>
          <a
            href="/games"
            className="inline-flex items-center gap-2 rounded-full bg-amber-500 px-8 py-3 text-sm font-bold text-white transition hover:bg-amber-400"
          >
            ゲーム一覧に戻る
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-dvh px-4 py-8">
      <Suspense fallback={null}><NavMenu /></Suspense>

      <div className="mx-auto max-w-lg">
        {/* ヒーローセクション */}
        <div className="mb-8 text-center">
          <div className="mb-4 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-500/20 border border-amber-400/30">
              <Send className="h-8 w-8 text-amber-300" />
            </div>
          </div>
          <h1 className="mb-3 text-3xl font-bold text-amber-100">ボドゲ登録申請</h1>
          <p className="mb-2 text-white/70 leading-relaxed">
            「このゲーム、絶対みんなに遊んでほしい！」<br />
            そんなボードゲームがあれば、ぜひ教えてください。
          </p>
          <p className="text-sm text-white/50 leading-relaxed">
            審査を通過したゲームはサイトに掲載され、<br />
            あなたのニックネームとともに紹介されます。
          </p>
        </div>

        {/* 注意書き */}
        <div className="mb-6 rounded-xl border border-amber-400/20 bg-amber-500/10 p-4">
          <p className="flex items-start gap-2 text-xs text-amber-200/80 leading-relaxed">
            <span className="mt-0.5 shrink-0 text-amber-400">📌</span>
            <span>
              <strong>ニックネームは公開情報です。</strong>登録が承認されると「○○さんおすすめ」としてゲームページに表示されます。個人名や連絡先は入力しないでください。
            </span>
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* ハニーポット */}
          <input type="text" {...register('honeypot')} className="hidden" tabIndex={-1} autoComplete="off" />

          {/* ゲーム名 */}
          <div>
            <label className={labelClass}>ゲーム名 <span className="text-red-400">*</span></label>
            <input {...register('title')} className={inputClass} placeholder="例：カタン、ドミニオン" />
            {errors.title && <p className={errorClass}>{errors.title.message}</p>}
          </div>

          {/* ニックネーム */}
          <div>
            <label className={labelClass}>ニックネーム <span className="text-red-400">*</span></label>
            <input {...register('submitter_nickname')} className={inputClass} placeholder="例：ボドゲ好きのたろう" />
            {errors.submitter_nickname && <p className={errorClass}>{errors.submitter_nickname.message}</p>}
          </div>

          {/* 画像 */}
          <div>
            <label className={labelClass}>ゲーム画像 <span className="text-red-400">*</span></label>
            <p className="mb-2 text-xs text-white/50">ゲーム全体が映っている写真をアップロードしてください。</p>
            <div
              className="cursor-pointer rounded-xl border-2 border-dashed border-white/20 bg-white/5 p-5 text-center transition hover:border-amber-400/40 hover:bg-white/10"
              onClick={() => fileInputRef.current?.click()}
            >
              {previewUrl ? (
                <img src={previewUrl} alt="プレビュー" className="mx-auto h-32 object-contain rounded-lg" />
              ) : (
                <>
                  <Gamepad2 className="mx-auto mb-2 h-8 w-8 text-white/30" />
                  <p className="text-sm text-white/50">クリックして画像を選択</p>
                  <p className="mt-1 text-xs text-white/30">JPEG・PNG・WebP・GIF / 5MB以下</p>
                </>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
            {imageError && <p className={errorClass}>{imageError}</p>}
            {/* 著作権同意 */}
            <label className="mt-3 flex cursor-pointer items-start gap-2">
              <input
                type="checkbox"
                {...register('image_consented')}
                className="mt-0.5 shrink-0 rounded border-white/30 bg-white/10 text-amber-500"
              />
              <span className="text-xs text-white/60 leading-relaxed">
                この画像は私が撮影したもの、または著作権フリーの素材です。第三者の著作権を侵害していないことを確認しました。
              </span>
            </label>
            {errors.image_consented && <p className={errorClass}>{errors.image_consented.message}</p>}
          </div>

          {/* 説明 */}
          <div>
            <div className="mb-1 flex items-center justify-between">
              <label className={`${labelClass} mb-0`}>ゲームの説明</label>
              <label className="flex cursor-pointer items-center gap-1.5 text-xs text-white/40">
                <input type="checkbox" {...register('omit_description')} className="rounded border-white/30 bg-white/10 text-amber-500" />
                管理者に任せる
              </label>
            </div>
            <textarea
              {...register('description')}
              rows={3}
              disabled={omitDescription}
              className={`${inputClass} disabled:opacity-30`}
              placeholder="どんなゲームか教えてください"
            />
          </div>

          {/* プレイ人数 */}
          <div>
            <div className="mb-1 flex items-center justify-between">
              <label className={`${labelClass} mb-0 flex items-center gap-1.5`}>
                <Users className="h-3.5 w-3.5" />プレイ人数
              </label>
              <label className="flex cursor-pointer items-center gap-1.5 text-xs text-white/40">
                <input type="checkbox" {...register('omit_players')} className="rounded border-white/30 bg-white/10 text-amber-500" />
                管理者に任せる
              </label>
            </div>
            <div className={`flex items-center gap-2 ${omitPlayers ? 'opacity-30' : ''}`}>
              <input
                type="number" {...register('min_players')} min={1} max={20}
                disabled={omitPlayers}
                className={`${inputClass} w-24`} placeholder="最小"
              />
              <span className="text-white/40">〜</span>
              <input
                type="number" {...register('max_players')} min={1} max={20}
                disabled={omitPlayers}
                className={`${inputClass} w-24`} placeholder="最大"
              />
              <span className="text-sm text-white/40">人</span>
            </div>
          </div>

          {/* プレイ時間 */}
          <div>
            <div className="mb-1 flex items-center justify-between">
              <label className={`${labelClass} mb-0 flex items-center gap-1.5`}>
                <Clock className="h-3.5 w-3.5" />プレイ時間目安
              </label>
              <label className="flex cursor-pointer items-center gap-1.5 text-xs text-white/40">
                <input type="checkbox" {...register('omit_time')} className="rounded border-white/30 bg-white/10 text-amber-500" />
                管理者に任せる
              </label>
            </div>
            <div className={`flex items-center gap-2 ${omitTime ? 'opacity-30' : ''}`}>
              <input
                type="number" {...register('play_time_min')} min={1}
                disabled={omitTime}
                className={`${inputClass} w-24`} placeholder="最短"
              />
              <span className="text-white/40">〜</span>
              <input
                type="number" {...register('play_time_max')} min={1}
                disabled={omitTime}
                className={`${inputClass} w-24`} placeholder="最長"
              />
              <span className="text-sm text-white/40">分</span>
            </div>
          </div>


          {/* ジャンル */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className={`${labelClass} mb-0`}>ジャンル</label>
              <label className="flex cursor-pointer items-center gap-1.5 text-xs text-white/40">
                <input type="checkbox" {...register('omit_genres')} className="rounded border-white/30 bg-white/10 text-amber-500" />
                管理者に任せる
              </label>
            </div>
            <div className={`flex flex-wrap gap-2 ${omitGenres ? 'opacity-30 pointer-events-none' : ''}`}>
              {GENRES.map(g => (
                <label key={g.value} className="flex cursor-pointer items-center gap-1.5 rounded-full border border-white/20 px-3 py-1 text-xs text-white/70 transition hover:border-amber-400/40">
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
                    disabled={omitGenres}
                    className="rounded border-white/30 text-amber-500"
                  />
                  {g.label}
                </label>
              ))}
            </div>
          </div>

          {/* 管理者へのコメント */}
          <div>
            <label className={labelClass}>管理者へのコメント（任意）</label>
            <textarea
              {...register('submitter_comment')}
              rows={2}
              className={inputClass}
              placeholder="「自分で遊んで一番盛り上がったゲームです」など、一言あれば"
            />
          </div>

          {submitError && (
            <div className="rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {submitError}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-full bg-amber-500 py-3.5 text-base font-bold text-white shadow-lg shadow-amber-900/50 transition hover:bg-amber-400 disabled:opacity-50"
          >
            {submitting ? '送信中...' : '申請する 🎲'}
          </button>
        </form>
      </div>
    </div>
  )
}
