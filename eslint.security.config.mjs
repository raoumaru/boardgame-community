// セキュリティ診断専用 ESLint フラットconfig
import securityPlugin from 'eslint-plugin-security'
import tsParser from '@typescript-eslint/parser'

export default [
  {
    files: ['src/**/*.{ts,tsx,js}'],
    plugins: { security: securityPlugin },
    languageOptions: {
      parser: tsParser,
      parserOptions: { ecmaVersion: 2022, sourceType: 'module' },
    },
    rules: {
      // SQLインジェクション・コマンドインジェクション系
      'security/detect-non-literal-fs-filename': 'warn',
      'security/detect-non-literal-regexp': 'warn',
      'security/detect-non-literal-require': 'warn',
      'security/detect-possible-timing-attacks': 'warn',
      // XSS・プロトタイプ汚染
      'security/detect-object-injection': 'warn',
      'security/detect-unsafe-regex': 'error',
      // eval・危険な関数
      'no-eval': 'error',
      'no-new-func': 'error',
      // dangerouslySetInnerHTML（XSSの入り口）
      'no-restricted-properties': [
        'error',
        {
          object: 'document',
          property: 'write',
          message: 'document.write はXSSの入り口になる',
        },
      ],
    },
  },
]
