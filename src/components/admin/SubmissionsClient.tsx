'use client'

import { useState, useMemo } from 'react'
import { Check, X, ChevronDown, ChevronUp, ClipboardEdit } from 'lucide-react'
import type { GameSubmission } from '@/lib/types'
import { DIFFICULTY_LABELS, GENRES } from '@/lib/types'


const STATUS_LABELS: Record<string, string> = {
  pending:  '🟡 審査待ち',
  approved: '✅ 承認済み',
  rejected: '❌ 却下',
}

type Tab = 'pending' | 'all'

type Props = { submissions: GameSubmission[]; signedUrls: Record<string, string> }

export function SubmissionsClient({ submissions: initial, signedUrls }: Props) {
  const [submissions, setSubmissions] = useState(initial)
  const [tab, setTab] = useState<Tab>('pending')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [processingId, setProcessingId] = useState<string | null>(null)
  const [adminNotes, setAdminNotes] = useState<Record<string, string>>({})

  const filtered = useMemo(() =>
    tab === 'pending'
      ? submissions.filter(s => s.status === 'pending')
      : submissions
  , [submissions, tab])

  const pendingCount = submissions.filter(s => s.status === 'pending').length

  const handleApprove = async (s: GameSubmission) => {
    setProcessingId(s.id)
    try {
      const res = await fetch(`/api/admin/submissions/${s.id}/approve`, { method: 'POST' })
      if (!res.ok) { const d = await res.json(); throw new Error(d.error) }
      setSubmissions(prev => prev.map(x => x.id === s.id ? { ...x, status: 'approved' } : x))
      setExpandedId(null)
    } catch (e) {
      alert(e instanceof Error ? e.message : '承認に失敗しました')
    } finally {
      setProcessingId(null)
    }
  }

  const handleReject = async (s: GameSubmission) => {
    const note = adminNotes[s.id] ?? ''
    setProcessingId(s.id)
    try {
      const res = await fetch(`/api/admin/submissions/${s.id}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ admin_note: note }),
      })
      if (!res.ok) { const d = await res.json(); throw new Error(d.error) }
      setSubmissions(prev => prev.map(x => x.id === s.id ? { ...x, status: 'rejected', admin_note: note } : x))
      setExpandedId(null)
    } catch (e) {
      alert(e instanceof Error ? e.message : '却下に失敗しました')
    } finally {
      setProcessingId(null)
    }
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-800">
          ボドゲ申請管理
          {pendingCount > 0 && (
            <span className="ml-2 rounded-full bg-amber-500 px-2 py-0.5 text-xs text-white">{pendingCount}</span>
          )}
        </h1>
      </div>

      {/* タブ */}
      <div className="mb-4 flex gap-1 rounded-lg border border-gray-200 bg-white p-1 w-fit">
        {(['pending', 'all'] as Tab[]).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
              tab === t ? 'bg-amber-500 text-white' : 'text-gray-500 hover:bg-gray-100'
            }`}
          >
            {t === 'pending' ? `審査待ち（${pendingCount}）` : `すべて（${submissions.length}）`}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white p-12 text-center text-sm text-gray-400">
          {tab === 'pending' ? '審査待ちの申請はありません 🎉' : '申請がありません'}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(s => {
            const isExpanded = expandedId === s.id
            const isProcessing = processingId === s.id
            const imageUrl = signedUrls[s.image_path] ?? null

            return (
              <div key={s.id} className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                {/* ヘッダー行（クリックで展開） */}
                <button
                  className="flex w-full items-center gap-4 px-4 py-3 text-left hover:bg-gray-50 transition"
                  onClick={() => setExpandedId(isExpanded ? null : s.id)}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-gray-800 truncate">{s.title}</span>
                      <span className="text-xs text-gray-400">{s.submitter_nickname}さん</span>
                    </div>
                    <div className="mt-0.5 flex items-center gap-3 text-xs text-gray-400">
                      <span>{STATUS_LABELS[s.status]}</span>
                      <span>{new Date(s.created_at).toLocaleDateString('ja-JP')}</span>
                    </div>
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="h-4 w-4 shrink-0 text-gray-400" />
                  ) : (
                    <ChevronDown className="h-4 w-4 shrink-0 text-gray-400" />
                  )}
                </button>

                {/* 詳細（展開時） */}
                {isExpanded && (
                  <div className="border-t border-gray-100 p-4 space-y-4">
                    {/* 画像 */}
                    <div className="flex gap-4">
                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt={s.title}
                          className="h-32 w-32 rounded-lg object-contain border border-gray-200 bg-gray-50 shrink-0"
                        />
                      ) : (
                        <div className="h-32 w-32 shrink-0 rounded-lg border border-gray-200 bg-gray-100 flex items-center justify-center text-xs text-gray-400">
                          画像なし
                        </div>
                      )}
                      <div className="space-y-1 text-sm">
                        <p><span className="font-medium text-gray-600">申請者：</span>{s.submitter_nickname}</p>
                        {s.description && <p><span className="font-medium text-gray-600">説明：</span>{s.description}</p>}
                        {(s.min_players || s.max_players) && (
                          <p><span className="font-medium text-gray-600">人数：</span>{s.min_players}〜{s.max_players}人</p>
                        )}
                        {s.play_time_min && (
                          <p><span className="font-medium text-gray-600">時間：</span>{s.play_time_min}{s.play_time_max ? `〜${s.play_time_max}` : ''}分</p>
                        )}
                        {s.difficulty && (
                          <p><span className="font-medium text-gray-600">難易度：</span>{DIFFICULTY_LABELS[s.difficulty as keyof typeof DIFFICULTY_LABELS] ?? s.difficulty}</p>
                        )}
                        {s.genres && s.genres.length > 0 && (
                          <p><span className="font-medium text-gray-600">ジャンル：</span>
                            {s.genres.map(g => GENRES.find(x => x.value === g)?.label ?? g).join('・')}
                          </p>
                        )}
                      </div>
                    </div>

                    {s.submitter_comment && (
                      <div className="rounded-lg bg-amber-50 border border-amber-100 px-3 py-2 text-sm text-gray-700">
                        <span className="font-medium text-amber-700">コメント：</span>{s.submitter_comment}
                      </div>
                    )}

                    {/* 審査ボタン（pending のみ） */}
                    {s.status === 'pending' && (
                      <div className="space-y-2">
                        <div className="flex gap-2">
                          <a
                            href={`/admin/submissions/${s.id}/approve`}
                            className="flex items-center gap-1.5 rounded-lg bg-green-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-600"
                          >
                            <ClipboardEdit className="h-4 w-4" />
                            内容を確認して承認
                          </a>
                          <button
                            onClick={() => handleReject(s)}
                            disabled={isProcessing}
                            className="flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-100 disabled:opacity-50"
                          >
                            <X className="h-4 w-4" />
                            却下
                          </button>
                        </div>
                        <div>
                          <label className="mb-1 block text-xs font-medium text-gray-500">却下メモ（任意）</label>
                          <input
                            type="text"
                            value={adminNotes[s.id] ?? ''}
                            onChange={e => setAdminNotes(prev => ({ ...prev, [s.id]: e.target.value }))}
                            placeholder="例：情報が不足しているため"
                            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-amber-400 focus:outline-none"
                          />
                        </div>
                      </div>
                    )}

                    {/* 却下メモ表示 */}
                    {s.status === 'rejected' && s.admin_note && (
                      <div className="rounded-lg bg-red-50 border border-red-100 px-3 py-2 text-sm text-red-700">
                        <span className="font-medium">却下理由：</span>{s.admin_note}
                      </div>
                    )}

                    {s.status === 'approved' && (
                      <div className="rounded-lg bg-green-50 border border-green-100 px-3 py-2 text-sm text-green-700">
                        ✅ 承認済み・ゲームに追加されました
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
