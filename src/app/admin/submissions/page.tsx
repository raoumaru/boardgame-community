import { Suspense } from 'react'
import { connection } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { SubmissionsClient } from '@/components/admin/SubmissionsClient'

async function SubmissionsLoader() {
  await connection()
  const supabase = createAdminClient()
  const { data } = await supabase
    .from('game_submissions')
    .select('*')
    .order('created_at', { ascending: false })

  const submissions = data ?? []

  // 非公開バケットのため、サーバー側で署名付きURLを生成（有効期限1時間）
  const signedUrls: Record<string, string> = {}
  const paths = submissions.map(s => s.image_path).filter((p): p is string => !!p)
  if (paths.length > 0) {
    const { data: signed } = await supabase.storage
      .from('submission-images')
      .createSignedUrls(paths, 60 * 60)
    signed?.forEach(item => {
      if (item.path && item.signedUrl) signedUrls[item.path] = item.signedUrl
    })
  }

  return <SubmissionsClient submissions={submissions} signedUrls={signedUrls} />
}

export default function AdminSubmissionsPage() {
  return (
    <Suspense fallback={<div className="p-6 text-gray-500">読み込み中...</div>}>
      <SubmissionsLoader />
    </Suspense>
  )
}
