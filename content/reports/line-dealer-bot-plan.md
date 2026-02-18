---
title: "專案規劃：LINE 經銷商智能助理 + 產品知識庫"
date: "2026-02-09"
type: "research"
tags: ["line-bot", "dealer", "rag", "knowledge-base", "pudu", "architecture"]
---

## 概述

兩個相互關聯的專案：LINE 經銷商智能助理負責監控群組對話並自動回覆，產品知識庫提供回覆所需的資料基礎。

---

## 專案一：LINE 經銷商智能助理

### 目標

監控 LINE 經銷商群組對話，自動分析分類，精準回覆常見問題，無法處理則通知人工。

### 系統架構

```
經銷商群組訊息
    ↓ webhook
意圖路由器 (Semantic Router)
    ↓
┌─────────────────────────────────────┐
│  產品規格查詢  → Supabase 產品庫     │
│  報價/價格     → 報價系統 + 價目表    │
│  庫存查詢      → ERP/庫存資料        │
│  技術問題      → 技術文件 RAG        │
│  維修/客訴     → 客服 SOP + 通知人工  │
│  訂單進度      → ERP/案件系統        │
│  無法匹配      → 通知 William        │
└─────────────────────────────────────┘
    ↓
自動回覆 or 人工通知（附建議回覆草稿）
```

### 回覆決策流程

1. **觸發判斷**：是否 @Bot 或關鍵字觸發？No → 靜默記錄，不回覆
2. **意圖分類**：Semantic Router 分類意圖
3. **信心度判斷**：
   - 匹配 + 信心度 > 80% → 直接回覆
   - 匹配 + 信心度低 → 回覆 + 標記待確認
   - 無匹配 → 通知 William（附原始訊息 + 分析摘要 + 建議回覆草稿）

### 與 OpenClaw 架構對照

| OpenClaw 架構 | LINE Bot 對應 |
|---|---|
| Skill Router | 意圖分類器（embedding 匹配） |
| SKILL.md | 每個技能的回覆模板 + 資料源 |
| Sub-agent | 複雜問題丟給 LLM 分析後組合回覆 |
| HEARTBEAT | 定期摘要經銷商動態 |
| 記憶系統 | 每個群組的對話脈絡 + 經銷商偏好 |

### 技能資料庫

| 技能 | 資料源 | 優先級 |
|------|--------|--------|
| 產品規格 | Supabase products 表（已有 1,274 筆） | 高 |
| 報價查詢 | 報價系統（開發中） | 高 |
| 技術 FAQ | 原廠知識庫 RAG（待建立） | 中 |
| 維修 SOP | 維修流程文件（待建立） | 中 |
| 庫存查詢 | ERP API（待評估可行性） | 低 |

### 資料表設計

```sql
-- 群組對話紀錄
line_group_messages (
  id, group_id, group_name,
  user_id, user_name,
  message_type, content,
  category, priority,
  needs_reply, replied,
  created_at
)

-- 經銷商群組對照
dealer_groups (
  group_id, dealer_id, dealer_name,
  bot_joined_at, status
)
```

### 實作階段

| 階段 | 內容 | 依賴 |
|------|------|------|
| Phase 1 | Bot 進群 + 靜默記錄 + 每日摘要 | LINE Bot 設定 |
| Phase 2 | 意圖路由器 + 產品規格自動回覆 | 產品知識庫 |
| Phase 3 | 接報價系統 + 技術 FAQ RAG | 報價系統 + 知識庫 |
| Phase 4 | 人工通知 + 建議回覆草稿 | Phase 1-3 |

---

## 專案二：產品知識庫（原廠資料鏡像）

### 目標

爬取原廠網站的產品手冊、QA/FAQ、技術文件，建立本地知識庫，供 LINE Bot RAG 查詢和 Portal 產品搜尋使用。

### 首發品牌：普渡 (Pudu Robotics)

### 資料處理流程

```
原廠網站（需登入）
  ↓ Playwright 爬蟲
本地資料庫
  ├→ PDF 手冊 → markitdown 轉文字 → 向量化
  ├→ QA/FAQ → 結構化存入 Supabase
  └→ 定期同步（偵測更新）
      ↓
  LINE Bot RAG / Portal 查詢
```

### 資料分類與儲存

| 資料類型 | 處理方式 | 儲存位置 |
|----------|----------|----------|
| PDF 手冊 | markitdown → markdown → 向量化 | Supabase + 本地 |
| QA/FAQ | 結構化（問題/答案/產品/分類） | Supabase `product_faq` |
| 產品規格 | 補充現有 products 表 | Supabase `products` |
| 圖片/圖表 | 下載儲存 | Supabase Storage |

### 資料表設計

```sql
product_documents (
  id, product_id, brand,
  doc_type,         -- manual/faq/spec/video
  title, content,
  source_url, file_path,
  embedding,        -- pgvector 向量
  last_synced_at, created_at
)

product_faq (
  id, product_id, brand,
  question, answer,
  category, source_url,
  embedding, created_at
)
```

### 同步策略

| 項目 | 策略 |
|------|------|
| 首次 | 全量爬取 |
| 定期 | 每週差異更新（比對頁面 hash） |
| 儲存 | 本地 markdown + Supabase 雙備份 |

### 應用場景

1. LINE Bot 經銷商群組自動回覆
2. Portal 產品技術查詢
3. 業務人員客戶現場即時查資料
4. 新進業務培訓資料庫

---

## 待確認事項

| 項目 | 狀態 |
|------|------|
| LINE Bot 能否加入群組 | 待確認 |
| 先用哪個經銷商群組測試 | 待確認 |
| 普渡後台登入資訊 | 待提供 |
| 要爬取的頁面路徑 | 待提供 |
| 經銷商對 Bot 的接受度 | 待評估 |

---

*規劃日期：2026-02-09 | Travis*
