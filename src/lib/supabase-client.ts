import { createBrowserClient } from '@supabase/ssr'
// 🔒 AUDIT: 2026-03-08 | score=100/100 | full-audit

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
