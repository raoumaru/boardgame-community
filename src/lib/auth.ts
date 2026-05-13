import type { User } from '@supabase/supabase-js'

export function isAdmin(user: User | null): boolean {
  if (!user) return false
  return user.email === process.env.ADMIN_EMAIL
}
