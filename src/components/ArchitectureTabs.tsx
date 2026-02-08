'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Cpu, Shield, Globe, ChevronDown, Download } from 'lucide-react'
import mermaid from 'mermaid'

const tabs = [
  {
    id: 'skills',
    label: 'Skills 調用',
    icon: Cpu,
    title: 'Skills 調用邏輯架構',
    description: '使用者訊息如何經過 Gateway、Session Manager、Skill Router，最終觸發合適的技能完成任務。',
    details: [
      { title: 'OpenClaw Gateway 🦞', desc: '接收來自 Telegram 的訊息，管理 session 與認證' },
      { title: 'Skill Router 🧭', desc: '根據意圖偵測結果，選擇最適合的技能組合（研究、開發、工作、金融、通訊）' },
      { title: 'Sub-Agent Spawning 🔄', desc: '複雜任務會 spawn 獨立的子代理，平行處理後回報' },
      { title: 'Memory System 🧠', desc: 'Daily Logs（短期）+ MEMORY.md（長期）+ qmd Semantic Search（語義搜尋）' },
    ],
    diagram: `graph TD
    User["👤 William / Telegram"] --> Gateway["🦞 OpenClaw Gateway"]
    Gateway --> Session["📋 Session Manager"]
    Session --> Agent["🤖 Travis / Claude Opus 4.6"]
    Agent --> Router["🧭 Skill Router"]
    Router --> Research["🔍 研究類<br/>tavily, perplexity, deep-research"]
    Router --> Coding["💻 開發類<br/>github, nextjs, react"]
    Router --> Work["📊 工作類<br/>gog, excel, zimbra"]
    Router --> Finance["💰 金融類<br/>yahoo-finance, stock-analysis"]
    Router --> Communication["📱 通訊類<br/>telegram, LINE, WeCom"]
    Agent --> SubAgent["🔄 Sub-Agent Spawning"]
    Agent --> Memory["🧠 Memory System"]
    Memory --> Daily["📝 Daily Logs"]
    Memory --> Long["📚 MEMORY.md"]
    Memory --> QMD["🔍 qmd Semantic Search"]
    SubAgent --> Agent`,
  },
  {
    id: 'security',
    label: '安全防護',
    icon: Shield,
    title: '安全性處理架構',
    description: '多層安全架構：從輸入過濾、認證、執行沙箱到記憶防篡改，確保系統安全運行。',
    details: [
      { title: 'Prompt Injection 防護 🛡️', desc: '偵測「忽略指令」等惡意注入，Content Sanitization 過濾外部內容' },
      { title: '三層認證 🔐', desc: 'Anthropic OAuth Token → Gateway Auth Token → Telegram Pairing' },
      { title: '執行沙箱 ⚙️', desc: 'Allowlist 模式限制可執行命令，Sandbox Isolation 隔離執行環境' },
      { title: '記憶安全 🧠', desc: 'Poisoning Prevention + File Integrity Check 防止記憶篡改' },
      { title: '外部 API 安全 🌐', desc: 'Google OAuth Scoping + Zimbra API Isolation 最小權限存取' },
      { title: '監控 📊', desc: 'Daily Security Digest + ClawHub Skill Audit 持續監控' },
    ],
    diagram: `graph TD
    Inbound["📨 Inbound Messages"] --> PIDetect["🛡️ Prompt Injection Detection"]
    PIDetect --> Sanitize["🧹 Content Sanitization"]
    Sanitize --> Agent["🤖 Agent Processing"]

    Auth["🔐 Authentication Layer"]
    Auth --> Anthropic["Anthropic OAuth Token"]
    Auth --> GW["Gateway Auth Token"]
    Auth --> TG["Telegram Pairing"]

    Exec["⚙️ Execution Security"]
    Exec --> Allowlist["Allowlist Mode"]
    Exec --> Sandbox["Sandbox Isolation"]

    MemSec["🧠 Memory Security"]
    MemSec --> Poison["Poisoning Prevention"]
    MemSec --> Integrity["File Integrity Check"]

    External["🌐 External API Security"]
    External --> Google["Google OAuth Scoping"]
    External --> Zimbra["Zimbra API Isolation"]

    Monitor["📊 Monitoring"]
    Monitor --> Digest["Daily Security Digest"]
    Monitor --> Audit["ClawHub Skill Audit"]`,
  },
  {
    id: 'webdev',
    label: '開發生態',
    icon: Globe,
    title: '網頁開發周邊工具架構',
    description: '完整的網頁開發與自動化生態系——從 Portal 到通知推送，所有工具如何協同運作。',
    details: [
      { title: 'Mac mini 🖥️', desc: 'OpenClaw Gateway 主機，運行 Scripts + Cron Jobs' },
      { title: 'Aurotek Portal 🌐', desc: 'Sales Portal（Next.js on Vercel），連接 Supabase PostgreSQL' },
      { title: 'Travis Daily 📰', desc: 'AI 專欄網站（Next.js on Vercel），透過 GitHub 自動部署' },
      { title: 'Google APIs 📧', desc: 'Calendar, Docs, Sheets, Drive 整合' },
      { title: 'Zimbra 📮', desc: 'Email + Calendar Sync（Aurotek 內部郵件）' },
      { title: 'LINE Push API 📱', desc: '業績通知推送' },
    ],
    diagram: `graph TD
    Mac["🖥️ Mac mini<br/>OpenClaw Gateway"] --> Scripts["📜 Scripts + Cron Jobs"]

    Portal["🌐 Aurotek Portal<br/>vercel.app"] --> Supabase[("🗄️ Supabase<br/>PostgreSQL")]
    Travis["📰 Travis Daily<br/>vercel.app"] --> GitHub["🐙 GitHub<br/>shimotmr"]

    Mac --> Google["📧 Google APIs<br/>Calendar, Docs, Sheets, Drive"]
    Mac --> Zimbra["📮 Zimbra<br/>Email + Calendar Sync"]
    Mac --> LINE["📱 LINE Push API<br/>業績通知"]

    GitHub --> Portal
    GitHub --> Travis

    Scripts --> Google
    Scripts --> Zimbra
    Scripts --> LINE
    Scripts --> Supabase`,
  },
]

function MermaidDiagram({ chart, id }: { chart: string; id: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const [svg, setSvg] = useState('')

  useEffect(() => {
    mermaid.initialize({
      startOnLoad: false,
      theme: 'dark',
      themeVariables: {
        darkMode: true,
        background: 'transparent',
        primaryColor: '#6366f1',
        primaryTextColor: '#e2e8f0',
        primaryBorderColor: '#6366f1',
        lineColor: '#475569',
        secondaryColor: '#1e293b',
        tertiaryColor: '#0f172a',
        fontFamily: 'Inter, system-ui, sans-serif',
        fontSize: '13px',
      },
      flowchart: {
        htmlLabels: true,
        curve: 'basis',
        padding: 12,
        nodeSpacing: 30,
        rankSpacing: 40,
      },
    })

    const render = async () => {
      try {
        const { svg } = await mermaid.render(`mermaid-${id}`, chart)
        setSvg(svg)
      } catch (e) {
        console.error('Mermaid render error:', e)
      }
    }
    render()
  }, [chart, id])

  return (
    <div
      ref={ref}
      className="w-full overflow-x-auto rounded-xl bg-[#0a0a1a] border border-border p-4"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  )
}

async function saveAsImage(containerId: string, title: string) {
  // Dynamically import html2canvas
  const html2canvas = (await import('html2canvas')).default
  const el = document.getElementById(containerId)
  if (!el) return

  // Create a wrapper with title, diagram, and watermark
  const wrapper = document.createElement('div')
  wrapper.style.cssText = 'position:fixed;left:-9999px;top:0;background:#0a0a1a;padding:32px;min-width:800px;'

  // Title
  const titleEl = document.createElement('div')
  titleEl.style.cssText = 'font-size:24px;font-weight:bold;color:#e2e8f0;margin-bottom:20px;font-family:Inter,system-ui,sans-serif;text-align:center;'
  titleEl.textContent = title
  wrapper.appendChild(titleEl)

  // Clone diagram
  const clone = el.cloneNode(true) as HTMLElement
  clone.style.overflow = 'visible'
  wrapper.appendChild(clone)

  // Watermark
  const watermark = document.createElement('div')
  watermark.style.cssText = 'text-align:center;color:#64748b;font-size:14px;margin-top:24px;padding-top:16px;border-top:1px solid #1e293b;font-family:Inter,system-ui,sans-serif;'
  watermark.textContent = 'Edited by Travis 🤖 from William Hsiao'
  wrapper.appendChild(watermark)

  document.body.appendChild(wrapper)

  try {
    const canvas = await html2canvas(wrapper, {
      backgroundColor: '#0a0a1a',
      scale: 2,
      useCORS: true,
    })
    const link = document.createElement('a')
    link.download = `travis-architecture-${title}.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
  } finally {
    document.body.removeChild(wrapper)
  }
}

export function ArchitectureTabs() {
  const [active, setActive] = useState('skills')
  const [expandedDetail, setExpandedDetail] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const current = tabs.find(t => t.id === active)!

  const handleSave = useCallback(async () => {
    setSaving(true)
    try {
      await saveAsImage(`diagram-${current.id}`, current.title)
    } finally {
      setSaving(false)
    }
  }, [current])

  return (
    <div className="space-y-4">
      {/* Tab bar */}
      <div className="flex gap-1 p-1 rounded-xl bg-muted/50 border border-border">
        {tabs.map(tab => {
          const Icon = tab.icon
          const isActive = active === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => { setActive(tab.id); setExpandedDetail(null) }}
              className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon size={16} />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          )
        })}
      </div>

      {/* Content */}
      <div className="border border-border rounded-2xl bg-card overflow-hidden">
        {/* Description + Save button */}
        <div className="p-5 border-b border-border">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <current.icon size={20} className="text-primary" />
              <h2 className="font-bold text-lg">{current.title}</h2>
            </div>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors disabled:opacity-50"
            >
              <Download size={14} />
              {saving ? '儲存中...' : '📥 Save as Image'}
            </button>
          </div>
          <p className="text-sm text-muted-foreground">{current.description}</p>
        </div>

        {/* Diagram */}
        <div className="p-4" id={`diagram-${current.id}`}>
          <MermaidDiagram chart={current.diagram} id={current.id} />
        </div>

        {/* Credit */}
        <div className="text-center text-xs text-muted-foreground pb-3">
          Edited by Travis 🤖 from William Hsiao
        </div>

        {/* Component details */}
        <div className="border-t border-border">
          <div className="p-4 pb-2">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              Components
            </h3>
          </div>
          <div className="px-4 pb-4 space-y-1">
            {current.details.map(d => {
              const isOpen = expandedDetail === d.title
              return (
                <button
                  key={d.title}
                  onClick={() => setExpandedDetail(isOpen ? null : d.title)}
                  className="w-full text-left rounded-xl border border-border hover:bg-accent/30 transition-colors overflow-hidden"
                >
                  <div className="flex items-center justify-between p-3">
                    <span className="font-medium text-sm">{d.title}</span>
                    <ChevronDown
                      size={14}
                      className={`text-muted-foreground transition-transform ${isOpen ? 'rotate-180' : ''}`}
                    />
                  </div>
                  {isOpen && (
                    <div className="px-3 pb-3 pt-0 text-sm text-muted-foreground">
                      {d.desc}
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
