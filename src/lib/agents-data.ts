// src/lib/agents-data.ts

export interface Agent {
  id: string
  name: string
  role: string
  description: string
  expertise: string[]
  model: string
  status: 'online' | 'offline' | 'busy'
  avatar: string
  avatarPosition?: string // 用於調整頭像裁切位置
  recentTasks?: string[]
}

export const agents: Agent[] = [
  {
    id: 'travis',
    name: 'Travis',
    role: 'Main Agent',
    description: 'William 的主要 AI 助手，負責協調其他 agents、處理複雜任務、做出決策。',
    expertise: ['任務編排', '決策制定', '系統監控', '記憶管理'],
    model: 'Claude Opus 4.6',
    status: 'online',
    avatar: '/avatars/travis.png',
    avatarPosition: 'center center',
    recentTasks: [
      '協調網站修復任務',
      '每日記憶備份',
      '業績報表監控'
    ]
  },
  {
    id: 'analyst',
    name: 'Analyst',
    role: 'Data Analyst',
    description: '專注於數據分析、業績追蹤、趨勢洞察。',
    expertise: ['數據分析', '業績追蹤', 'Pipeline 風險評估', '趨勢預測'],
    model: 'Claude Sonnet 4.5',
    status: 'online',
    avatar: '/avatars/analyst.png',
    avatarPosition: 'center 30%',
    recentTasks: [
      '週度 Pipeline 風險分析',
      'Funnel 報表同步',
      '業績達成率監控'
    ]
  },
  {
    id: 'coder',
    name: 'Coder',
    role: 'Software Developer',
    description: '負責程式開發、bug 修復、功能實作。',
    expertise: ['Next.js', 'React', 'TypeScript', 'Tailwind CSS'],
    model: 'Claude Sonnet 4.5',
    status: 'online',
    avatar: '/avatars/coder.png',
    avatarPosition: 'center 35%',
    recentTasks: [
      '實作 Agent 詳情頁',
      '修復頭像裁切問題',
      'Vercel 部署優化'
    ]
  },
  {
    id: 'designer',
    name: 'Designer',
    role: 'UI/UX Designer',
    description: '負責視覺設計、使用者體驗、品牌一致性審查。',
    expertise: ['UI 設計', 'UX 審查', '響應式設計', '品牌一致性'],
    model: 'Claude Sonnet 4.5',
    status: 'online',
    avatar: '/avatars/designer.png',
    avatarPosition: 'center 40%',
    recentTasks: [
      '審查 Agent 卡片設計',
      '優化手機版排版',
      '暗色主題調整'
    ]
  },
  {
    id: 'inspector',
    name: 'Inspector',
    role: 'Quality Assurance',
    description: '負責功能測試、內容審查、連結驗證。',
    expertise: ['功能測試', '內容審查', 'Bug 追蹤', '品質控制'],
    model: 'Claude Sonnet 4.5',
    status: 'online',
    avatar: '/avatars/inspector.png',
    avatarPosition: 'center 25%',
    recentTasks: [
      '每日網站巡檢',
      'Vercel 部署驗證',
      '功能完整性測試'
    ]
  },
  {
    id: 'researcher',
    name: 'Researcher',
    role: 'Research Specialist',
    description: '負責深度研究、技能發掘、市場調查。',
    expertise: ['深度研究', '技能評估', '市場分析', '趨勢追蹤'],
    model: 'Claude Sonnet 4.5',
    status: 'online',
    avatar: '/avatars/researcher.png',
    avatarPosition: 'center 30%',
    recentTasks: [
      '每日掃描錯誤日誌',
      '尋找合適的 Skills',
      '技術趨勢研究'
    ]
  },
  {
    id: 'secretary',
    name: 'Secretary',
    role: 'Personal Assistant',
    description: '負責郵件處理、行程管理、文件整理。',
    expertise: ['郵件管理', '行程安排', '文件整理', '提醒通知'],
    model: 'Claude Sonnet 4.5',
    status: 'online',
    avatar: '/avatars/secretary.png',
    avatarPosition: 'center 35%',
    recentTasks: [
      '早晨郵件摘要',
      'Zimbra 簽核檢查',
      '行事曆同步'
    ]
  },
  {
    id: 'writer',
    name: 'Writer',
    role: 'Content Writer',
    description: '負責文章撰寫、報告產出、文案優化。',
    expertise: ['文章撰寫', '報告產出', 'SEO 優化', '內容策劃'],
    model: 'Claude Sonnet 4.5',
    status: 'online',
    avatar: '/avatars/writer.png',
    avatarPosition: 'center 30%',
    recentTasks: [
      '撰寫週度研究報告',
      '優化專欄文章',
      '產出技術文件'
    ]
  }
]

export function getAgent(id: string): Agent | undefined {
  return agents.find(a => a.id === id)
}
