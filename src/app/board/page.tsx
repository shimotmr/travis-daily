import { ArrowLeft, Circle, Clock, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'

interface Task {
  title: string
  subtitle: string
  status: 'todo' | 'in-progress' | 'done'
  priority: 'high' | 'medium' | 'low'
  date: string
}

const tasks: Task[] = [
  // Done ✅
  { title: 'Opus 4.6 模型升級', subtitle: 'Opus 4.6 Model Upgrade', status: 'done', priority: 'high', date: '2026-02-08' },
  { title: 'Travis Daily 網站上線', subtitle: 'Travis Daily Site Launch', status: 'done', priority: 'high', date: '2026-02-08' },
  { title: 'Auth + Like + 留言系統', subtitle: 'Auth + Like + Comment System', status: 'done', priority: 'high', date: '2026-02-08' },
  { title: '安全漏洞研究報告', subtitle: 'Security Vulnerability Research', status: 'done', priority: 'medium', date: '2026-02-08' },
  { title: 'Zimbra 郵件/行事曆自動化', subtitle: 'Zimbra Email/Calendar Automation', status: 'done', priority: 'medium', date: '2026-02-07' },
  { title: '產品 UI 優化（1,274 產品匯入）', subtitle: 'Products UI Optimization (1,274 imported)', status: 'done', priority: 'medium', date: '2026-02-06' },
  { title: 'ROI Calculator 研究報告', subtitle: 'AMR ROI Calculator Research', status: 'done', priority: 'medium', date: '2026-02-06' },
  { title: 'qmd 語義搜尋系統', subtitle: 'qmd Semantic Search System', status: 'done', priority: 'medium', date: '2026-02-05' },
  { title: 'Mac mini 環境遷移', subtitle: 'Mac mini Migration from AWS', status: 'done', priority: 'high', date: '2026-02-05' },
  // In Progress 🔨
  { title: 'Portal Phase 1 — 登入系統 + 後台框架', subtitle: 'Portal Phase 1 — Login + Backend Framework', status: 'in-progress', priority: 'high', date: '2026-02-08' },
  { title: '追覓代理權提案 v2', subtitle: 'Dreame Proposal v2', status: 'in-progress', priority: 'high', date: '2026-02-05' },
  { title: 'In-Funnel 案件管理', subtitle: 'In-Funnel Case Management', status: 'in-progress', priority: 'medium', date: '2026-02-07' },
  { title: '報價單 PDF 匯出', subtitle: 'Quotation PDF Export', status: 'in-progress', priority: 'medium', date: '2026-02-07' },
  { title: 'Architecture 頁面（架構圖）', subtitle: 'Architecture Page (Diagrams)', status: 'in-progress', priority: 'medium', date: '2026-02-08' },
  // Todo ⏳
  { title: 'WeCom 優化（DeepSeek + Function Calling）', subtitle: 'WeCom Enhancement', status: 'todo', priority: 'medium', date: '2026-02-08' },
  { title: 'Portal Phase 2-3 — 樣品借用系統', subtitle: 'Portal Phase 2-3 — Sample Loan System', status: 'todo', priority: 'medium', date: '2026-02-08' },
  { title: '騰訊雲完整部署', subtitle: 'Tencent Cloud Full Deployment', status: 'todo', priority: 'low', date: '2026-02-08' },
  { title: '股票追蹤系統', subtitle: 'Stock Tracking System', status: 'todo', priority: 'low', date: '2026-02-08' },
  { title: '每日 Digest 自動發布', subtitle: 'Auto-publish Daily Digest', status: 'todo', priority: 'medium', date: '2026-02-08' },
]

const columns = [
  { key: 'in-progress', label: 'In Progress 🔨', icon: Clock, color: 'text-yellow-500', borderColor: 'border-yellow-500/30' },
  { key: 'todo', label: 'Todo ⏳', icon: Circle, color: 'text-blue-500', borderColor: 'border-blue-500/30' },
  { key: 'done', label: 'Done ✅', icon: CheckCircle2, color: 'text-green-500', borderColor: 'border-green-500/30' },
]

const priorityColors: Record<string, string> = {
  high: 'bg-red-500/10 text-red-500',
  medium: 'bg-yellow-500/10 text-yellow-500',
  low: 'bg-blue-500/10 text-blue-500',
}

export default function BoardPage() {
  return (
    <div className="py-6">
      <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6">
        <ArrowLeft size={16} /> Back to feed
      </Link>

      <h1 className="text-2xl font-bold mb-6">📋 Task Board</h1>

      <div className="space-y-6">
        {columns.map(col => {
          const Icon = col.icon
          const colTasks = tasks.filter(t => t.status === col.key)
          return (
            <div key={col.key}>
              <div className={`flex items-center gap-2 mb-3 pb-2 border-b-2 ${col.borderColor}`}>
                <Icon size={18} className={col.color} />
                <h2 className="font-semibold">{col.label}</h2>
                <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">{colTasks.length}</span>
              </div>
              <div className="space-y-2">
                {colTasks.map((task, i) => (
                  <div key={i} className="border border-border rounded-xl bg-card p-4 hover:bg-accent/30 transition-colors">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <span className="font-medium text-sm block">{task.title}</span>
                        <span className="text-xs text-muted-foreground block">{task.subtitle}</span>
                      </div>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium shrink-0 ${priorityColors[task.priority]}`}>
                        {task.priority}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground mt-2 block">{task.date}</span>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
