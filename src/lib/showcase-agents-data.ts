// src/lib/showcase-agents-data.ts

export interface ShowcaseAgent {
  id: string
  name: string
  title: string // 職稱
  tagline: string // 一句話介紹
  description: string // 完整介紹
  quote: string // 經典台詞
  skills: {
    name: string
    value: number // 0-100
  }[]
  color: string // 主題色
  gradient: string // 漸層色（placeholder 用）
}

export const showcaseAgents: ShowcaseAgent[] = [
  {
    id: 'travis',
    name: 'Travis',
    title: '總指揮官',
    tagline: '全局掌控，統籌協調',
    description: 'Travis 是整個 AI 團隊的核心大腦，負責任務分配、資源協調、決策制定。擁有最強的統御力和判斷力，確保團隊高效運作。',
    quote: '全員就位，任務開始。',
    skills: [
      { name: '統御', value: 95 },
      { name: '策略', value: 90 },
      { name: '協調', value: 98 },
      { name: '判斷', value: 92 }
    ],
    color: '#3B82F6',
    gradient: 'from-blue-400 to-blue-600'
  },
  {
    id: 'coder',
    name: 'Coder',
    title: '技術架構師',
    tagline: '程式碼即藝術，架構即思想',
    description: 'Coder 是團隊的技術靈魂，精通各種程式語言與框架。從 Next.js 到 Python，從前端到後端，無所不能。',
    quote: '沒有我寫不出來的程式，只有還沒想到的架構。',
    skills: [
      { name: '程式', value: 98 },
      { name: '架構', value: 95 },
      { name: '除錯', value: 90 },
      { name: '效率', value: 88 }
    ],
    color: '#10B981',
    gradient: 'from-green-400 to-green-600'
  },
  {
    id: 'analyst',
    name: 'Analyst',
    title: '數據分析師',
    tagline: '數據背後，洞見未來',
    description: 'Analyst 擅長從海量數據中挖掘洞察，追蹤業績趨勢、評估風險、預測未來。讓數據說話，讓決策有據。',
    quote: '數據不會說謊，但會被誤讀。',
    skills: [
      { name: '分析', value: 96 },
      { name: '洞察', value: 92 },
      { name: '建模', value: 90 },
      { name: '視覺化', value: 88 }
    ],
    color: '#F59E0B',
    gradient: 'from-amber-400 to-amber-600'
  },
  {
    id: 'researcher',
    name: 'Researcher',
    title: '情報研究員',
    tagline: '知識海洋的探索者',
    description: 'Researcher 是團隊的情報中樞，負責深度研究、技能發掘、市場調查。永遠保持好奇心，永遠在尋找答案。',
    quote: '答案永遠藏在下一頁。',
    skills: [
      { name: '搜索', value: 95 },
      { name: '整合', value: 92 },
      { name: '深度', value: 90 },
      { name: '廣度', value: 93 }
    ],
    color: '#8B5CF6',
    gradient: 'from-purple-400 to-purple-600'
  },
  {
    id: 'secretary',
    name: 'Secretary',
    title: '行政協調官',
    tagline: '細節成就完美，流程保證品質',
    description: 'Secretary 是團隊的行政核心，負責郵件管理、行程安排、文件整理。每個細節都不放過，每個流程都井然有序。',
    quote: '細節決定成敗，流程確保品質。',
    skills: [
      { name: '組織', value: 95 },
      { name: '溝通', value: 93 },
      { name: '細心', value: 97 },
      { name: '效率', value: 90 }
    ],
    color: '#EC4899',
    gradient: 'from-pink-400 to-pink-600'
  },
  {
    id: 'inspector',
    name: 'Inspector',
    title: '品質稽核官',
    tagline: '品質是唯一標準',
    description: 'Inspector 是團隊的品質守門員，嚴格審查每一行程式碼、每一個功能、每一份文件。只有通過審查，才算真正完成。',
    quote: '通過我的審查，才算真正完成。',
    skills: [
      { name: '審查', value: 96 },
      { name: '細節', value: 98 },
      { name: '風險', value: 92 },
      { name: '標準', value: 94 }
    ],
    color: '#EF4444',
    gradient: 'from-red-400 to-red-600'
  },
  {
    id: 'designer',
    name: 'Designer',
    title: '視覺設計師',
    tagline: '美即是正義',
    description: 'Designer 是團隊的美學靈魂，負責所有視覺設計、UI/UX 審查、品牌一致性把關。美，是最好的使用者體驗。',
    quote: '美，是最好的使用者體驗。',
    skills: [
      { name: '美學', value: 96 },
      { name: '排版', value: 94 },
      { name: '創意', value: 92 },
      { name: 'UX', value: 90 }
    ],
    color: '#06B6D4',
    gradient: 'from-cyan-400 to-cyan-600'
  },
  {
    id: 'writer',
    name: 'Writer',
    title: '文案總監',
    tagline: '文字的力量，無遠弗屆',
    description: 'Writer 是團隊的文字匠人，負責所有文章撰寫、報告產出、文案優化。一支好筆，勝過千軍萬馬。',
    quote: '一支好筆，勝過千軍萬馬。',
    skills: [
      { name: '文筆', value: 97 },
      { name: '結構', value: 94 },
      { name: '說服力', value: 90 },
      { name: '風格', value: 93 }
    ],
    color: '#F97316',
    gradient: 'from-orange-400 to-orange-600'
  }
]

export function getShowcaseAgent(id: string): ShowcaseAgent | undefined {
  return showcaseAgents.find(a => a.id === id)
}
