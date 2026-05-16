import type { NextConfig } from "next";

const securityHeaders = [
  // コンテンツセキュリティポリシー（XSSの被害範囲を制限）
  // Next.js はハイドレーションのため unsafe-inline が必要
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",           // Next.js ハイドレーション用
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: blob: https://*.supabase.co",          // ゲーム画像（Supabase Storage）
      "connect-src 'self' https://*.supabase.co https://*.vercel-insights.com https://vitals.vercel-insights.com",
      "frame-ancestors 'none'",                                     // iframeへの埋め込みを禁止
      "base-uri 'self'",
      "form-action 'self'",
    ].join('; '),
  },
  // クリックジャッキング防止（iframeへの埋め込みを禁止）
  { key: 'X-Frame-Options', value: 'DENY' },
  // MIMEスニッフィング防止
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  // リファラ情報の制限（外部サイトへの遷移時にURLを漏らさない）
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  // HTTPSを強制（Vercel本番環境で有効）
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  // 権限ポリシー（不要なブラウザAPIをブロック）
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=()' },
  // XSS Protection（旧ブラウザ向け）
  { key: 'X-XSS-Protection', value: '1; mode=block' },
  // Flash等のクロスドメインポリシーファイルを禁止
  { key: 'X-Permitted-Cross-Domain-Policies', value: 'none' },
  // 他オリジンのリソースとのクロスオリジン分離（タブナビ間の情報漏洩防止）
  { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
  // このサイトのリソースが他オリジンから埋め込まれることを禁止
  { key: 'Cross-Origin-Resource-Policy', value: 'same-origin' },
]

const nextConfig: NextConfig = {
  // X-Powered-By: Next.js ヘッダーを非表示（フレームワーク情報の漏洩防止）
  poweredByHeader: false,
  cacheComponents: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
  async headers() {
    return [
      {
        // 全ページにセキュリティヘッダーを適用
        source: '/(.*)',
        headers: securityHeaders,
      },
    ]
  },
};

export default nextConfig;
