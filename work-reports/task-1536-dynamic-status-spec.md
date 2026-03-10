# 動態工作狀態實作規格

**任務編號**: #1536  
**日期**: 2026-02-26  
**作者**: Blake (Builder)

---

## 一、技術架構

### 1.1 資料來源層

```
OpenClaw Gateway (本地)
  ├─ ~/.openclaw/agents/main/sessions/sessions.json  # Session 狀態
  └─ ~/.openclaw/subagents/runs.json                 # 任務執行記錄
```

### 1.2 API 層

```
/src/app/api/agents/route.ts
  ├─ GET /api/agents          # 取得所有 agents 狀態
  ├─ checkGatewayHealth()     # 檢查 Gateway 是否運行
  ├─ getMainAgentLastActivity()  # Travis 最後活動時間
  ├─ getSubagentStatus()      # 子代理狀態
  └─ buildAgentsData()        # 組合完整資料
```

### 1.3 UI 層

```
/src/app/agents/page.tsx
  ├─ Agent 卡片列表
  ├─ 狀態指示燈（綠/黃/紅/橙）
  ├─ 最後活動時間
  └─ 執行中任務數量
```

---

## 二、狀態定義

### 2.1 狀態類型

```typescript
type AgentStatus = 'active' | 'idle' | 'offline' | 'executing'
```

### 2.2 狀態判定邏輯

```typescript
// 時間閾值（毫秒）
const ACTIVE_THRESHOLD_MS = 10 * 60 * 1000;   // 10 分鐘
const IDLE_THRESHOLD_MS = 30 * 60 * 1000;     // 30 分鐘
const OFFLINE_THRESHOLD_MS = 60 * 60 * 1000;  // 60 分鐘

function determineStatus(
  lastActivityMs: number,
  isGatewayRunning: boolean,
  isCoordinator: boolean
): {
  status: AgentStatus;
  statusText: string;
  statusColor: string;
  pulse: boolean;
} {
  // 1. Gateway 未運行 → 離線
  if (!isGatewayRunning) {
    return {
      status: 'offline',
      statusText: '🔴 系統離線',
      statusColor: 'bg-red-500',
      pulse: false
    };
  }
  
  // 2. 無活動資料 → 協調者預設活躍，其他預設待機
  if (!lastActivityMs) {
    return isCoordinator ? {
      status: 'active',
      statusText: '🟢 協調者 - 隨時可對話',
      statusColor: 'bg-green-500',
      pulse: true
    } : {
      status: 'idle',
      statusText: '🟡 待機中',
      statusColor: 'bg-yellow-500',
      pulse: false
    };
  }
  
  const diffMs = Date.now() - lastActivityMs;
  
  // 3. 10 分鐘內 → 活躍（綠燈）
  if (diffMs < ACTIVE_THRESHOLD_MS) {
    return {
      status: 'active',
      statusText: isCoordinator 
        ? '🟢 協調者 - 隨時可對話'
        : '🟢 執行中',
      statusColor: 'bg-green-500',
      pulse: true
    };
  }
  
  // 4. 10-30 分鐘 → 待機（黃燈）
  if (diffMs < IDLE_THRESHOLD_MS) {
    const idleMinutes = Math.floor(diffMs / 60000);
    return {
      status: 'idle',
      statusText: isCoordinator
        ? `🟡 協調者 - 待機中（${idleMinutes}分鐘無對話）`
        : `🟡 待機中（${idleMinutes}分鐘無活動）`,
      statusColor: 'bg-yellow-500',
      pulse: false
    };
  }
  
  // 5. 30-60 分鐘 → 離線（紅燈）
  if (diffMs < OFFLINE_THRESHOLD_MS) {
    const idleMinutes = Math.floor(diffMs / 60000);
    return {
      status: 'offline',
      statusText: `🔴 離線（${idleMinutes}分鐘無活動）`,
      statusColor: 'bg-red-500',
      pulse: false
    };
  }
  
  // 6. >60 分鐘 → 系統停止
  return {
    status: 'offline',
    statusText: '🔴 系統停止',
    statusColor: 'bg-red-500',
    pulse: false
  };
}
```

---

## 三、新增 Agent 配置

### 3.1 完整 Agent 列表

```typescript
const agentsConfig = [
  // 主要 Agents（新架構）
  {
    id: 'main',
    name: 'Travis',
    emoji: '🤖',
    role: 'Manager',
    description: 'William 的主要 AI 助手，負責任務派發與流水線管理',
    color: '#8B5CF6',
    skills: ['任務派發', '流水線管理', '決策', '協調'],
    model: 'claude-sonnet-4-20250514',
    quote: '協調者上線 - 隨時可對話',
    isCoordinator: true,
    priority: 'primary'
  },
  {
    id: 'blake',
    name: 'Blake',
    emoji: '🔨',
    role: 'Builder',
    description: '專注於程式開發和前端實現',
    color: '#10B981',
    skills: ['程式開發', '前端實作', 'GitHub 整合', 'Vercel 部署'],
    model: 'minimax/MiniMax-M2.5',
    quote: '程式碼是詩，邏輯是藝術。',
    priority: 'primary'
  },
  {
    id: 'rex',
    name: 'Rex',
    emoji: '🧠',
    role: 'Thinker',
    description: '負責深度研究、市場分析、報告產出',
    color: '#3B82F6',
    skills: ['研究分析', '市場調查', '報告產出', '趨勢追蹤'],
    model: 'kimi/moonshot-v1-128k',
    quote: '數據驅動決策，洞見創造價值。',
    priority: 'primary'
  },
  {
    id: 'oscar',
    name: 'Oscar',
    emoji: '📋',
    role: 'Operator',
    description: '負責行政事務、監控通知、流程優化',
    color: '#EC4899',
    skills: ['行政事務', '監控通知', '流程優化', '文檔管理'],
    model: 'minimax/MiniMax-M2.5',
    quote: '效率是成功的關鍵。',
    priority: 'primary'
  },
  {
    id: 'warren',
    name: 'Warren',
    emoji: '📈',
    role: 'Trader',
    description: '負責投資分析、交易策略、風險控管',
    color: '#F59E0B',
    skills: ['投資分析', '交易策略', '風險控管', '績效追蹤'],
    model: 'minimax/MiniMax-M2.5',
    quote: '風險來自於你不知道自己在做什麼。',
    priority: 'primary'
  },
  {
    id: 'griffin',
    name: 'Griffin',
    emoji: '🛡️',
    role: 'Guardian',
    description: '負責安全審查、品質把關、合規檢查',
    color: '#EF4444',
    skills: ['安全審查', '品質把關', '合規檢查', '風險評估'],
    model: 'minimax/MiniMax-M2.5',
    quote: '品質是唯一標準。',
    priority: 'primary'
  },
  
  // 舊 Agents（即將棄用）
  {
    id: 'coder',
    name: 'Coder',
    emoji: '💻',
    role: 'Software Developer (已棄用)',
    description: '已被 Blake 取代',
    color: '#10B981',
    skills: ['程式開發', '重構', '調試'],
    model: 'minimax/MiniMax-M2.5',
    quote: '請改用 Blake',
    priority: 'deprecated',
    deprecated: true,
    replacedBy: 'blake'
  },
  {
    id: 'researcher',
    name: 'Researcher',
    emoji: '🔬',
    role: 'Research Specialist (已棄用)',
    description: '已被 Rex 取代',
    color: '#3B82F6',
    skills: ['研究分析', '市場調查'],
    model: 'minimax/MiniMax-M2.5',
    quote: '請改用 Rex',
    priority: 'deprecated',
    deprecated: true,
    replacedBy: 'rex'
  },
  {
    id: 'secretary',
    name: 'Secretary',
    emoji: '📋',
    role: 'Personal Assistant (已棄用)',
    description: '已被 Oscar 取代',
    color: '#EC4899',
    skills: ['郵件管理', '行程安排'],
    model: 'minimax/MiniMax-M2.5',
    quote: '請改用 Oscar',
    priority: 'deprecated',
    deprecated: true,
    replacedBy: 'oscar'
  },
  {
    id: 'inspector',
    name: 'Inspector',
    emoji: '🔍',
    role: 'Quality Assurance (已棄用)',
    description: '已被 Griffin 取代',
    color: '#EF4444',
    skills: ['功能測試', '內容審查'],
    model: 'claude-sonnet-4-20250514',
    quote: '請改用 Griffin',
    priority: 'deprecated',
    deprecated: true,
    replacedBy: 'griffin'
  },
  {
    id: 'analyst',
    name: 'Analyst',
    emoji: '📊',
    role: 'Data Analyst (已棄用)',
    description: '已被 Warren 取代',
    color: '#F59E0B',
    skills: ['數據分析', '業績追蹤'],
    model: 'claude-sonnet-4-20250514',
    quote: '請改用 Warren',
    priority: 'deprecated',
    deprecated: true,
    replacedBy: 'warren'
  },
  
  // 輔助 Agents（保留）
  {
    id: 'designer',
    name: 'Designer',
    emoji: '🎨',
    role: 'UI/UX Designer',
    description: '負責視覺設計和使用者體驗優化',
    color: '#06B6D4',
    skills: ['UI設計', 'UX優化', '品牌設計'],
    model: 'minimax/MiniMax-M2.5',
    quote: '設計讓世界更美好。',
    priority: 'secondary'
  },
  {
    id: 'writer',
    name: 'Writer',
    emoji: '✍️',
    role: 'Content Writer',
    description: '負責文章撰寫、報告產出、文案優化',
    color: '#F97316',
    skills: ['寫作', '編輯', '翻譯'],
    model: 'moonshot/moonshot-v1-128k',
    quote: '文字的力量，改變世界的起點。',
    priority: 'secondary'
  }
];
```

---

## 四、UI 設計

### 4.1 狀態指示燈

```tsx
// 狀態燈組件
const StatusIndicator = ({ status, pulse }: { status: AgentStatus; pulse: boolean }) => {
  const colors = {
    active: 'bg-green-500',
    idle: 'bg-yellow-500',
    offline: 'bg-red-500',
    executing: 'bg-orange-500'
  };
  
  return (
    <div className={`w-3 h-3 rounded-full ${colors[status]} ${pulse ? 'animate-pulse' : ''}`} />
  );
};
```

### 4.2 Agent 卡片

```tsx
// Agent 卡片組件
const AgentCard = ({ agent }: { agent: Agent }) => {
  return (
    <div className={`p-4 rounded-lg border ${
      agent.priority === 'primary' ? 'border-blue-500' :
      agent.priority === 'deprecated' ? 'border-red-500 opacity-60' :
      'border-gray-300'
    }`}>
      {/* 標題列 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{agent.emoji}</span>
          <div>
            <h3 className="font-bold">{agent.name}</h3>
            <p className="text-sm text-gray-500">{agent.role}</p>
          </div>
        </div>
        <StatusIndicator status={agent.status} pulse={agent.pulse} />
      </div>
      
      {/* 棄用標籤 */}
      {agent.deprecated && (
        <div className="mt-2 p-2 bg-red-100 text-red-700 rounded text-sm">
          ⚠️ 已棄用 - 請改用 {agent.replacedBy}
        </div>
      )}
      
      {/* 狀態文字 */}
      <div className="mt-2 text-sm">
        {agent.statusText}
      </div>
      
      {/* 最後活動時間 */}
      <div className="mt-1 text-xs text-gray-400">
        最後活動: {formatRelativeTime(agent.lastRunAt)}
      </div>
      
      {/* 技能標籤 */}
      <div className="mt-3 flex flex-wrap gap-1">
        {agent.skills.map(skill => (
          <span key={skill} className="px-2 py-1 bg-gray-100 text-xs rounded">
            {skill}
          </span>
        ))}
      </div>
    </div>
  );
};
```

---

## 五、實作步驟

### Phase 1: API 更新（立即）

1. **更新 `src/app/api/agents/route.ts`**
   - 加入 Warren, Griffin 配置
   - 標記舊 agents 為 `deprecated`
   - 確保狀態邏輯正確

2. **測試 API**
   ```bash
   curl http://localhost:3000/api/agents
   ```

### Phase 2: 靜態資料更新（本週）

1. **更新 `src/lib/agents-data.ts`**
   - 同步 API 的 agent 配置
   - 加入 `priority` 和 `deprecated` 欄位

2. **更新 `src/lib/showcase-agents-data.ts`**
   - 同步更新展示頁面

### Phase 3: UI 優化（下週）

1. **更新 `src/app/agents/page.tsx`**
   - 顯示棄用標籤
   - 排序：primary → secondary → deprecated
   - 優化狀態顯示

2. **加入視覺提示**
   - 動畫效果（活躍狀態）
   - 棄用警告（紅色邊框）
   - 主要 agents（藍色邊框）

---

## 六、驗證標準

### 6.1 功能驗證

- [ ] API 回傳所有 12 個 agents
- [ ] 狀態正確反映實際情況
- [ ] 棄用 agents 標記清楚
- [ ] Travis (coordinator) 特殊處理正確

### 6.2 UI 驗證

- [ ] 主要 agents 排前面
- [ ] 棄用 agents 顯示警告
- [ ] 狀態燈正確顯示（綠/黃/紅/橙）
- [ ] 動畫效果正常（活躍狀態）

### 6.3 效能驗證

- [ ] API 回應時間 < 500ms
- [ ] 頁面載入時間 < 2s
- [ ] 無記憶體洩漏

---

## 七、風險與緩解

| 風險 | 等級 | 緩解措施 |
|------|------|----------|
| API 失敗 | 中 | Fallback 到靜態資料 |
| Gateway 離線 | 低 | 顯示「系統離線」狀態 |
| 舊 agents 仍在使用 | 高 | 清楚標示「已棄用」+ 替代方案 |
| UI 混亂 | 中 | 分組顯示（主要/次要/棄用） |

---

## 八、未來優化

### 8.1 Supabase 動態載入

```sql
-- 建立 agents 表
CREATE TABLE agents (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  emoji TEXT,
  role TEXT,
  description TEXT,
  color TEXT,
  skills TEXT[],
  model TEXT,
  quote TEXT,
  priority TEXT CHECK (priority IN ('primary', 'secondary', 'deprecated')),
  deprecated BOOLEAN DEFAULT FALSE,
  replaced_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 8.2 即時更新

- 使用 Supabase Realtime 訂閱狀態變化
- WebSocket 推送任務執行狀態
- 歷史記錄查詢

---

**文件完成時間**: 2026-02-26 22:00  
**預計實作時間**: 2 小時（Phase 1 + Phase 2）
