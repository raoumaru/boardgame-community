'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Suspense } from 'react'
import { NavMenu } from '@/components/ui/NavMenu'
import { Send, CheckCircle2 } from 'lucide-react'

const schema = z.object({
  senderType: z.enum(['user', 'cafe', 'other'], { message: '送信者タイプを選択してください' }),
  category:   z.enum(['game', 'bug', 'collab', 'other'], { message: 'カテゴリを選択してください' }),
  name:       z.string().min(1, 'お名前を入力してください').max(100),
  email:      z.string().email('正しいメールアドレスを入力してください').optional().or(z.literal('')),
  message:    z.string().min(1, 'メッセージを入力してください').max(2000, '2000文字以内で入力してください'),
  honeypot:   z.string().max(0),
})

type FormValues = z.infer<typeof schema>

const SENDER_TYPE_OPTIONS = [
  { value: 'user',  label: '一般ユーザー' },
  { value: 'cafe',  label: 'カフェ・施設関係者' },
  { value: 'other', label: 'その他' },
] as const

const CATEGORY_OPTIONS = [
  { value: 'game',   label: 'ゲームについて' },
  { value: 'bug',    label: '不具合・要望' },
  { value: 'collab', label: '取材・コラボ' },
  { value: 'other',  label: 'その他' },
] as const

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false)
  const [serverError, setServerError] = useState('')

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(schema) as any,
    defaultValues: { senderType: 'user', honeypot: '' },
  })

  const onSubmit = async (values: FormValues) => {
    setServerError('')
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error ?? '送信に失敗しました')
      }
      setSubmitted(true)
    } catch (e) {
      setServerError(e instanceof Error ? e.message : '送信に失敗しました')
    }
  }

  const inputClass = "w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/30 focus:border-amber-400/60 focus:outline-none focus:ring-2 focus:ring-amber-400/20 transition"
  const labelClass = "mb-1.5 block text-sm font-medium text-white/70"
  const errorClass = "mt-1 text-xs text-red-400"

  return (
    <div className="min-h-dvh bg-[linear-gradient(160deg,#1a0a00_0%,#0d0500_40%,#050200_100%)]">
      <Suspense fallback={null}>
        <NavMenu />
      </Suspense>

      <div className="mx-auto max-w-xl px-4 py-12 sm:px-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-amber-300">お問い合わせ</h1>
          <p className="mt-2 text-sm text-white/50">ゲームのご質問・ご意見・コラボのご相談など、お気軽にどうぞ。</p>
        </div>

        {submitted ? (
          <div className="flex flex-col items-center gap-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-6 py-12 text-center">
            <CheckCircle2 className="h-12 w-12 text-emerald-400" />
            <p className="text-lg font-bold text-emerald-300">送信しました！</p>
            <p className="text-sm text-white/60">お問い合わせありがとうございます。内容を確認次第、必要に応じてご連絡いたします。</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
            {/* ハニーポット（隠しフィールド） */}
            <input type="text" {...register('honeypot')} className="hidden" tabIndex={-1} autoComplete="off" />

            {/* 送信者タイプ */}
            <div>
              <p className={labelClass}>あなたは？ *</p>
              <div className="flex flex-wrap gap-3">
                {SENDER_TYPE_OPTIONS.map(opt => (
                  <label key={opt.value} className="flex cursor-pointer items-center gap-2">
                    <input
                      type="radio"
                      value={opt.value}
                      {...register('senderType')}
                      className="accent-amber-400"
                    />
                    <span className="text-sm text-white/80">{opt.label}</span>
                  </label>
                ))}
              </div>
              {errors.senderType && <p className={errorClass}>{errors.senderType.message}</p>}
            </div>

            {/* カテゴリ */}
            <div>
              <label className={labelClass}>カテゴリ *</label>
              <select {...register('category')} className={inputClass}>
                {CATEGORY_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value} className="bg-[#1a0a00] text-white">
                    {opt.label}
                  </option>
                ))}
              </select>
              {errors.category && <p className={errorClass}>{errors.category.message}</p>}
            </div>

            {/* お名前 */}
            <div>
              <label className={labelClass}>お名前 *</label>
              <input
                {...register('name')}
                type="text"
                placeholder="山田 太郎"
                className={inputClass}
              />
              {errors.name && <p className={errorClass}>{errors.name.message}</p>}
            </div>

            {/* メールアドレス */}
            <div>
              <label className={labelClass}>メールアドレス <span className="text-white/30">（返信を希望する場合のみ）</span></label>
              <input
                {...register('email')}
                type="email"
                placeholder="example@email.com"
                className={inputClass}
              />
              {errors.email && <p className={errorClass}>{errors.email.message}</p>}
            </div>

            {/* メッセージ */}
            <div>
              <label className={labelClass}>メッセージ *</label>
              <textarea
                {...register('message')}
                rows={6}
                placeholder="お問い合わせ内容をご記入ください"
                className={inputClass}
              />
              {errors.message && <p className={errorClass}>{errors.message.message}</p>}
            </div>

            {serverError && (
              <p className="rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-400">{serverError}</p>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-amber-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-amber-600 disabled:opacity-50"
            >
              <Send className="h-4 w-4 shrink-0" />
              {isSubmitting ? '送信中...' : '送信する'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
