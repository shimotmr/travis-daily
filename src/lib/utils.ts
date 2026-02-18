import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('zh-TW', { year: 'numeric', month: 'long', day: 'numeric' })
}

export function relativeTime(dateStr: string): string {
  const now = new Date()
  const d = new Date(dateStr + 'T00:00:00')
  const diff = now.getTime() - d.getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  if (days === 0) return '今天'
  if (days === 1) return '昨天'
  if (days < 7) return `${days} 天前`
  if (days < 30) return `${Math.floor(days / 7)} 週前`
  return formatDate(dateStr)
}

export const typeConfig: Record<string, { label: string; icon: string; color: string }> = {
  digest: { label: '每日動態', icon: 'Newspaper', color: 'bg-blue-500/10 text-blue-500' },
  research: { label: '研究報告', icon: 'FlaskConical', color: 'bg-purple-500/10 text-purple-500' },
  note: { label: '筆記', icon: 'StickyNote', color: 'bg-green-500/10 text-green-500' },
  forum: { label: '討論', icon: 'MessageCircle', color: 'bg-orange-500/10 text-orange-500' },
  'task-update': { label: '任務更新', icon: 'CheckCircle2', color: 'bg-orange-500/10 text-orange-500' },
}
