import { NextRequest, NextResponse } from 'next/server'

/**
 * シンプルなインメモリ・レート制限
 *
 * Vercelのサーバーレス環境では関数インスタンスごとに独立したメモリ空間を持つため、
 * 同一インスタンス内での急激なバースト攻撃を防ぐ。
 * 本格的な分散レート制限が必要な場合は Upstash Redis (@upstash/ratelimit) を使用すること。
 */
const rateMap = new Map<string, { count: number; expiresAt: number }>()

/** 古いエントリを定期クリーンアップ（メモリリーク防止） */
function cleanupExpired() {
  const now = Date.now()
  for (const [key, entry] of rateMap.entries()) {
    if (now > entry.expiresAt) rateMap.delete(key)
  }
}

let lastCleanup = Date.now()

/**
 * @param key      識別キー（IPアドレスなど）
 * @param limit    ウィンドウ内の最大リクエスト数
 * @param windowMs ウィンドウ幅（ミリ秒）
 * @returns true = 許可 / false = レート超過
 */
function checkRateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now()

  // 1分ごとにクリーンアップ
  if (now - lastCleanup > 60_000) {
    cleanupExpired()
    lastCleanup = now
  }

  const entry = rateMap.get(key)
  if (!entry || now > entry.expiresAt) {
    rateMap.set(key, { count: 1, expiresAt: now + windowMs })
    return true
  }
  if (entry.count >= limit) return false
  entry.count++
  return true
}

/** リクエスト元のIPを取得 */
function getClientIp(req: NextRequest): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0].trim() ??
    req.headers.get('x-real-ip') ??
    'unknown'
  )
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  const ip = getClientIp(req)

  // /api/recommend: 1分間に15リクエストまで
  if (pathname === '/api/recommend') {
    const allowed = checkRateLimit(`recommend:${ip}`, 15, 60_000)
    if (!allowed) {
      return NextResponse.json(
        { error: 'Too many requests. Please wait a moment.' },
        {
          status: 429,
          headers: {
            'Retry-After': '60',
            'X-RateLimit-Limit': '15',
            'X-RateLimit-Window': '60',
          },
        }
      )
    }
  }

  return NextResponse.next()
}

export const config = {
  // /api/recommend のみ適用（管理APIは認証で十分に保護されている）
  matcher: ['/api/recommend'],
}
