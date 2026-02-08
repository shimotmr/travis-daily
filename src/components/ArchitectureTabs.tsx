'use client'

import { useState, useEffect, useRef } from 'react'
import { Cpu, Shield, Globe, ChevronDown } from 'lucide-react'
import mermaid from 'mermaid'

const tabs = [
  {
    id: 'skills',
    label: 'Skills 調用',
    icon: Cpu,
    description: '使用者訊息如何經過意圖偵測、技能路由，最終觸發合適的 Skill 完成任務。',
    details: [
      { title: 'OpenClaw Gateway', desc: '接收來自 Telegram / Web 的訊息，管理 session 與認證' },
      { title: 'Skill Router', desc: '根據意圖偵測結果，選擇最適合的技能組合' },
      { title: 'Sub-Agent', desc: '複雜任務會 spawn 獨立的子代理，平行處理後回報' },
      { title: 'Memory System', desc: 'MEMORY.md（長期）+ Daily Logs（短期）+ qmd（語義搜尋）' },
    ],
    diagram: `graph TD
  subgraph Input["📱 Input Channels"]
    TG["Telegram"]
    WEB["WebChat"]
  end

  subgraph Gateway["⚡ OpenClaw Gateway"]
    GW["Gateway Daemon"]
    AUTH["Auth & Session"]
    GW --> AUTH
  end

  subgraph Agent["🤖 Agent Core"]
    MAIN["Main Session"]
    ROUTER["Skill Router<br/><i>Intent Detection</i>"]
    SUB["Sub-Agent Pool"]
    MAIN --> ROUTER
    ROUTER -->|complex| SUB
  end

  subgraph Skills["🧰 Available Skills"]
    direction LR
    S1["🔍 Research<br/>tavily / perplexity"]
    S2["💻 Coding<br/>exec / edit"]
    S3["🌐 Web<br/>fetch / search"]
    S4["📧 Email<br/>zimbra"]
    S5["📅 Calendar<br/>google-calendar"]
    S6["💰 Finance<br/>yahoo-finance"]
    S7["📊 Docs<br/>google-docs"]
  end

  subgraph Memory["🧠 Memory System"]
    LT["MEMORY.md<br/><i>Long-term</i>"]
    DL["Daily Logs<br/><i>memory/daily/</i>"]
    QMD["qmd RAG<br/><i>Semantic Search</i>"]
  end

  TG --> GW
  WEB --> GW
  AUTH --> MAIN
  ROUTER --> S1 & S2 & S3 & S4 & S5 & S6 & S7
  SUB --> Skills
  MAIN <--> Memory

  style Input fill:#1e1b4b,stroke:#6366f1,color:#e0e7ff
  style Gateway fill:#172554,stroke:#3b82f6,color:#dbeafe
  style Agent fill:#1a2e05,stroke:#84cc16,color:#ecfccb
  style Skills fill:#3b0764,stroke:#a855f7,color:#f3e8ff
  style Memory fill:#431407,stroke:#f97316,color:#fff7ed`,
  },
  {
    id: 'security',
    label: '安全防護',
    icon: Shield,
    description: '多層安全架構：從輸入過濾、認證、執行沙箱到記憶防篡改，確保系統安全運行。',
    details: [
      { title: 'Prompt Injection 防護', desc: '偵測「忽略指令」等惡意注入，外部內容不直接執行' },
      { title: '三層認證', desc: 'Anthropic OAuth → Gateway Token → Telegram Pairing' },
      { title: '執行沙箱', desc: 'Allowlist 模式限制可執行命令，危險操作需確認' },
      { title: '記憶防篡改', desc: '外部來源不直接寫入記憶，定期完整性檢查' },
    ],
    diagram: `graph TD
  subgraph Inbound["🛡️ Inbound Defense"]
    MSG["Incoming Message"]
    PI["Prompt Injection<br/>Detection"]
    CS["Content<br/>Sanitization"]
    MSG --> PI --> CS
  end

  subgraph Auth["🔑 Authentication"]
    A1["Anthropic OAuth<br/><i>Identity</i>"]
    A2["Gateway Auth Token<br/><i>Session</i>"]
    A3["Telegram Pairing<br/><i>Channel</i>"]
    A1 --> A2 --> A3
  end

  subgraph Exec["⚙️ Execution Control"]
    AL["Allowlist Mode<br/><i>Command Filter</i>"]
    SB["Sandbox<br/><i>Isolated Exec</i>"]
    CF["Confirmation<br/><i>Destructive Ops</i>"]
    AL --> SB
    AL --> CF
  end

  subgraph MemSec["🧠 Memory Security"]
    MP["Poisoning<br/>Prevention"]
    FI["File Integrity<br/>Check"]
    TS["Time-shifted<br/>Attack Block"]
  end

  subgraph External["🌐 External API Security"]
    GO["Google OAuth<br/><i>Scoped Access</i>"]
    ZI["Zimbra API<br/><i>Isolated</i>"]
    SK["Skill Audit<br/><i>ClawHub Review</i>"]
  end

  subgraph Monitor["📊 Monitoring"]
    DG["Daily Security<br/>Digest"]
    LOG["Audit Logs"]
    DG --> LOG
  end

  CS --> Auth
  A3 --> Exec
  SB --> MemSec & External
  MemSec --> Monitor
  External --> Monitor

  style Inbound fill:#450a0a,stroke:#ef4444,color:#fef2f2
  style Auth fill:#422006,stroke:#f59e0b,color:#fefce8
  style Exec fill:#052e16,stroke:#22c55e,color:#f0fdf4
  style MemSec fill:#1e1b4b,stroke:#6366f1,color:#e0e7ff
  style External fill:#172554,stroke:#3b82f6,color:#dbeafe
  style Monitor fill:#3b0764,stroke:#a855f7,color:#f3e8ff`,
  },
  {
    id: 'webdev',
    label: '開發生態',
    icon: Globe,
    description: '完整的網頁開發與自動化生態系——從 Portal 到通知推送，所有工具如何協同運作。',
    details: [
      { title: 'Mac mini', desc: 'OpenClaw Gateway 主機，運行 cron jobs、腳本、備份' },
      { title: 'Vercel', desc: '託管 Sales Portal 與 Travis Daily，GitHub push 自動部署' },
      { title: 'Supabase', desc: 'PostgreSQL 資料庫，儲存案件、業績、用戶資料' },
      { title: 'Google APIs', desc: 'Calendar + Docs + Sheets + Drive 全套整合' },
    ],
    diagram: `graph TD
  subgraph Mac["🖥️ Mac mini"]
    OC["OpenClaw<br/>Gateway"]
    CRON["Cron Jobs<br/><i>Scheduled Tasks</i>"]
    SCRIPTS["Scripts<br/><i>Python / Shell</i>"]
    MEM["Memory<br/><i>~/clawd/</i>"]
    OC --- CRON & SCRIPTS & MEM
  end

  subgraph Vercel["▲ Vercel"]
    PORTAL["Sales Portal<br/><i>Next.js</i>"]
    TRAVIS["Travis Daily<br/><i>Next.js</i>"]
  end

  subgraph Data["💾 Data Layer"]
    SUPA["Supabase<br/><i>PostgreSQL</i>"]
    GH["GitHub<br/><i>shimotmr</i>"]
  end

  subgraph Google["🔵 Google APIs"]
    GCAL["Calendar"]
    GDOC["Docs"]
    GSHEET["Sheets"]
    GDRIVE["Drive"]
  end

  subgraph Comms["💬 Communication"]
    ZIMBRA["Zimbra<br/><i>Email + 簽核</i>"]
    LINE["LINE Push<br/><i>業績通知</i>"]
    TG2["Telegram<br/><i>日常對話</i>"]
  end

  PORTAL --> SUPA
  TRAVIS --> GH
  GH -->|auto deploy| Vercel
  SCRIPTS --> SUPA & Google & ZIMBRA & LINE
  OC <--> TG2
  CRON --> SCRIPTS
  MEM -->|backup| GDRIVE

  style Mac fill:#172554,stroke:#3b82f6,color:#dbeafe
  style Vercel fill:#052e16,stroke:#22c55e,color:#f0fdf4
  style Data fill:#1a2e05,stroke:#84cc16,color:#ecfccb
  style Google fill:#422006,stroke:#f59e0b,color:#fefce8
  style Comms fill:#3b0764,stroke:#a855f7,color:#f3e8ff`,
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

export function ArchitectureTabs() {
  const [active, setActive] = useState('skills')
  const [expandedDetail, setExpandedDetail] = useState<string | null>(null)
  const current = tabs.find(t => t.id === active)!

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
        {/* Description */}
        <div className="p-5 border-b border-border">
          <div className="flex items-center gap-2 mb-2">
            <current.icon size={20} className="text-primary" />
            <h2 className="font-bold text-lg">{current.label}架構</h2>
          </div>
          <p className="text-sm text-muted-foreground">{current.description}</p>
        </div>

        {/* Diagram */}
        <div className="p-4">
          <MermaidDiagram chart={current.diagram} id={current.id} />
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
