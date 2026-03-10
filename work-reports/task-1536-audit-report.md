# William Hub Agent 架構審查報告

**任務編號**: #1536  
**審查日期**: 2026-02-26  
**審查者**: Blake (Builder)  
**Repo**: https://github.com/shimotmr/travis-daily  
**網站**: https://travis-daily.vercel.app/

---

## 執行摘要

William Hub 的 Agent 定義與現行架構**嚴重不一致**。新舊架構並存，需要漸進式遷移策略。

---

## 一、現行 Agent 架構（正確版本）

根據 `~/clawd/TOOLS.md` 和實際任務派發記錄，現行架構為：

| Agent ID | 名稱 | 角色 | 模型 | 狀態 |
|----------|------|------|------|------|
| main | Travis | Manager | Claude Sonnet | ✅ 主要協調者 |
| blake | Blake | Builder | MiniMax | ✅ 程式開發 |
| rex | Rex | Thinker | Kimi/Grok | ✅ 研究分析 |
| oscar | Oscar | Operator | MiniMax | ✅ 行政營運 |
| warren | Warren | Trader | MiniMax | ✅ 交易風控 |
| griffin | Griffin | Guardian | MiniMax | ✅ 安全審查 |

---

## 二、Hub 現有定義（需更新）

### 2.1 `src/lib/agents-data.ts` (靜態資料)

| Agent ID | 名稱 | 角色 | 問題 |
|----------|------|------|------|
| travis | Travis | Main Agent | ✅ 正確 |
| analyst | Analyst | Data Analyst | ❌ 應為 Warren (Trader) |
| coder | Coder | Software Developer | ❌ 應為 Blake (Builder) |
| designer | Designer | UI/UX Designer | ⚠️ 保留（輔助角色） |
| inspector | Inspector | Quality Assurance | ❌ 應為 Griffin (Guardian) |
| researcher | Researcher | Research Specialist | ❌ 應為 Rex (Thinker) |
| secretary | Secretary | Personal Assistant | ❌ 應為 Oscar (Operator) |
| writer | Writer | Content Writer | ⚠️ 保留（輔助角色） |

### 2.2 `src/lib/showcase-agents-data.ts` (展示頁面)

與 `agents-data.ts` 相同問題。

### 2.3 `src/app/api/agents/route.ts` (動態 API)

| Agent ID | 名稱 | 角色 | 問題 |
|----------|------|------|------|
| main | Travis | 協調者 | ✅ 正確 |
| coder | Coder | 程式開發 | ❌ 應為 Blake |
| secretary | Secretary | 行政助理 | ❌ 應為 Oscar |
| writer | Writer | 內容創作 | ⚠️ 保留 |
| researcher | Researcher | 研究分析 | ❌ 應為 Rex |
| designer | Designer | 設計師 | ⚠️ 保留 |

**缺少**: Warren (Trader), Griffin (Guardian)

---

## 三、實際使用情況分析

查詢最近 7 天任務派發記錄 (`board_tasks` 表)：

| Agent | 任務數量 | 狀態 | 建議 |
|-------|---------|------|------|
| blake | 152 | ✅ 活躍 | 保留並標記為主要 |
| researcher | 78 | ⚠️ 活躍但舊 | 標記為「即將棄用，請用 Rex」 |
| rex | 65 | ✅ 活躍 | 保留並標記為主要 |
| coder | 59 | ⚠️ 活躍但舊 | 標記為「即將棄用，請用 Blake」 |
| griffin | 30 | ✅ 活躍 | 保留並標記為主要 |
| oscar | 26 | ✅ 活躍 | 保留並標記為主要 |
| secretary | 13 | ⚠️ 少量使用 | 標記為「即將棄用，請用 Oscar」 |
| designer | 8 | ⚠️ 少量使用 | 保留為輔助角色 |
| inspector | 7 | ⚠️ 少量使用 | 標記為「即將棄用，請用 Griffin」 |
| analyst | 4 | ⚠️ 極少使用 | 標記為「即將棄用，請用 Warren」 |

---

## 四、發現的問題

### 4.1 名稱不一致 ❌
- Hub 仍使用舊架構名稱（Coder, Secretary, Researcher 等）
- 缺少新架構 agents（Blake, Rex, Oscar, Warren, Griffin）

### 4.2 動態狀態不完整 ⚠️
- API route (`src/app/api/agents/route.ts`) 只追蹤 6 個 agents
- 缺少 Warren (Trader) 和 Griffin (Guardian)

### 4.3 雙重定義 ❌
- 靜態資料 (`agents-data.ts`) 和動態 API (`api/agents/route.ts`) 定義不同
- Showcase 頁面 (`showcase-agents-data.ts`) 又是另一套

### 4.4 過渡期混淆 ⚠️
- 新舊 agents 並存，但 Hub 沒有標示
- William 可能不清楚哪些 agents 是主要、哪些即將棄用

---

## 五、改進建議

### 方案 A：全面遷移（推薦）✅

**優點**: 一次性解決，架構清晰  
**缺點**: 需要修改多個檔案

**步驟**:
1. 更新 `agents-data.ts` - 加入所有 6 個主要 agents
2. 更新 `showcase-agents-data.ts` - 同步更新
3. 更新 `api/agents/route.ts` - 補上 Warren, Griffin
4. 舊 agents 標記為 `deprecated: true`
5. 在 UI 上顯示「已棄用」標籤

### 方案 B：新舊並存（過渡期）

**優點**: 不影響現有功能  
**缺點**: 架構混亂，維護成本高

**步驟**:
1. 保留所有舊 agents
2. 新增 6 個主要 agents
3. 用 `priority: 'primary' | 'secondary'` 標記
4. UI 上主要 agents 排前面

### 方案 C：動態載入（最佳長期方案）

**優點**: 單一資料來源，自動同步  
**缺點**: 需要後端支援

**步驟**:
1. 從 Supabase `agents` 表讀取（需新建）
2. 移除所有靜態定義
3. API route 成為唯一資料來源
4. 支援即時更新

---

## 六、動態工作狀態實作方案

### 現有機制 ✅

API route (`api/agents/route.ts`) 已實作動態狀態：

- **資料來源**: `~/.openclaw/agents/main/sessions/sessions.json`
- **資料來源**: `~/.openclaw/subagents/runs.json`
- **狀態定義**:
  - `active`: 10 分鐘內有活動（綠燈）
  - `idle`: 10-30 分鐘（黃燈）
  - `offline`: >30 分鐘（紅燈）
  - `executing`: 正在執行任務（橙燈）

### 需要改進 ⚠️

1. **補上缺少的 agents** - Warren, Griffin
2. **統一狀態邏輯** - Travis (coordinator) 的特殊處理
3. **增加視覺提示** - 棄用標籤、主要/次要標記
4. **錯誤處理** - Gateway 離線時的 fallback

---

## 七、建議執行順序

### Phase 1: 緊急修復（今天）
1. ✅ 更新 `api/agents/route.ts` - 補上 Warren, Griffin
2. ✅ 更新 `agents-data.ts` - 加入 6 個主要 agents
3. ✅ Push 到 GitHub

### Phase 2: UI 優化（本週）
1. ⚠️ 在 Hub 顯示「主要/次要」標籤
2. ⚠️ 舊 agents 顯示「即將棄用」提示
3. ⚠️ 優化狀態顯示（顏色、動畫）

### Phase 3: 架構重構（下週）
1. 🔄 遷移到 Supabase 動態載入
2. 🔄 移除所有靜態定義
3. 🔄 建立 `agents` 表和管理介面

---

## 八、風險評估

| 風險 | 等級 | 緩解措施 |
|------|------|----------|
| 破壞現有功能 | 低 | 漸進式更新，保留舊 agents |
| William 混淆 | 中 | 清楚標示「主要/即將棄用」 |
| 資料不一致 | 低 | 單一資料來源（API route） |
| 部署失敗 | 低 | Vercel 自動 rollback |

---

## 九、附錄：檔案清單

需要更新的檔案：

```
src/lib/agents-data.ts                      # 靜態 agent 定義
src/lib/showcase-agents-data.ts             # Showcase 頁面定義
src/app/api/agents/route.ts                 # 動態 API
src/app/agents/page.tsx                     # Agents 列表頁（可能）
src/components/ArchitectureTabs.tsx         # 架構頁面（可能）
```

---

## 十、結論

William Hub 的 Agent 定義**嚴重落後**現行架構，需要立即更新。建議採用**方案 A（全面遷移）**，一次性解決問題，避免長期維護成本。

**下一步**: 等待 Travis 或 William 確認執行方案，我已準備好直接修改代碼。

---

**報告完成時間**: 2026-02-26 21:55  
**預計修復時間**: 30 分鐘（Phase 1）
