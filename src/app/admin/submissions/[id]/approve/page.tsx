import { notFound } from 'next/navigation'
import { connection } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { SubmissionApproveForm } from '@/components/admin/SubmissionApproveForm'

type Props = { params: Promise<{ id: string }> }

export default async function SubmissionApprovePage({ params }: Props) {
  await connection()
  const { id } = await params
  const supabase = createAdminClient()

  const { data: submission } = await supabase
    .from('game_submissions')
    .select('*')
    .eq('id', id)
    .single()

  if (!submission) notFound()
  if (submission.status !== 'pending') {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-8 text-center text-sm text-gray-500">
        この申請はすでに審査済みです。
      </div>
    )
  }

  // 申請画像の署名付きURL生成
  let submittedImageUrl: string | null = null
  if (submission.image_path) {
    const { data } = await supabase.storage
      .from('submission-images')
      .createSignedUrl(submission.image_path, 60 * 60)
    submittedImageUrl = data?.signedUrl ?? null
  }

  return (
    <div>
      <div className="mb-6">
        <a href="/admin/submissions" className="text-sm text-amber-600 hover:text-amber-700">
          ← 申請一覧に戻る
        </a>
        <h1 className="mt-2 text-xl font-bold text-gray-800">
          申請を審査：{submission.title}
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          申請者：{submission.submitter_nickname}さん ／ 申請日：{new Date(submission.created_at).toLocaleDateString('ja-JP')}
        </p>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <SubmissionApproveForm
          submission={submission}
          submittedImageUrl={submittedImageUrl}
        />
      </div>
    </div>
  )
}
