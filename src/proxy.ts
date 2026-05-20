import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// ─── レート制限（/api/recommend 向け） ──────────────────────────────────────
// シンプルなインメモリ実装（サーバーレスインスタンス内でのバースト攻撃を防ぐ）
// 本格的な分散レート制限が必要な場合は Upstash Redis を使用すること

const rateMap = new Map<string, { count: number; expiresAt: number }>()
let lastCleanup = Date.now()

function cleanupExpired() {
  const now = Date.now()
  for (const [key, entry] of rateMap.entries()) {
    if (now > entry.expiresAt) rateMap.delete(key)
  }
}

function checkRateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now()
  if (now - lastCleanup > 60_000) { cleanupExpired(); lastCleanup = now }

  const entry = rateMap.get(key)
  if (!entry || now > entry.expiresAt) {
    rateMap.set(key, { count: 1, expiresAt: now + windowMs })
    return true
  }
  if (entry.count >= limit) return false
  entry.count++
  return true
}

function getClientIp(req: NextRequest): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0].trim() ??
    req.headers.get('x-real-ip') ??
    'unknown'
  )
}

// ─── メインミドルウェア ────────────────────────────────────────────────────
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // /api/recommend: 1分間に15リクエストまで
  if (pathname === '/api/recommend') {
    const allowed = checkRateLimit(`recommend:${getClientIp(request)}`, 15, 60_000)
    if (!allowed) {
      return NextResponse.json(
        { error: 'Too many requests. Please wait a moment.' },
        { status: 429, headers: { 'Retry-After': '60', 'X-RateLimit-Limit': '15' } }
      )
    }
  }

  // /admin/* の認証チェック（Supabase セッション検証）
  if (pathname.startsWith('/admin') && !pathname.startsWith('/admin/login')) {
    let supabaseResponse = NextResponse.next({ request })

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return request.cookies.getAll() },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
            supabaseResponse = NextResponse.next({ request })
            cookiesToSet.forEach(({ name, value, options }) =>
              supabaseResponse.cookies.set(name, value, options)
            )
          },
        },
      }
    )

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
    if (user.email !== process.env.ADMIN_EMAIL) {
      await supabase.auth.signOut()
      return NextResponse.redirect(new URL('/admin/login?error=unauthorized', request.url))
    }

    return supabaseResponse
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/api/recommend'],
}
