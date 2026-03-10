import { redirect } from 'next/navigation'
// 🔒 AUDIT: 2026-03-08 | score=100/100 | full-audit

export default function BoardPage() {
  redirect('https://william-hub.vercel.app/board')
}
