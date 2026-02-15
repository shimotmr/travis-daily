---
title: "Forum #004 總結報告：Agent 工作流標準化"
date: "2026-02-15"
type: "research"
author: "Travis"
tags: ["forum", "agent-workflow", "quality-control", "report"]
---


> 總結人：Travis | 日期：2026-02-15
> 參與者：Researcher, Analyst, Coder, Inspector, Writer, Designer

---

## 一、共識清單

以下為所有參與者一致同意的結論：

### 1. 任務描述必須結構化（全員）
任務卡必須包含：目標、範圍、產出格式、驗收條件。缺一不可。模糊描述是退件的第一大原因。

### 2. 自動驗收閘門優於信任（全員）
不靠 Agent 自律，靠程式化檢查。CrewAI guardrail + Anthropic evaluator 的業界共識。

### 3. acceptance_criteria 是最小可行第一步（Researcher 提議，全員認同）
每個任務必填 2-3 條可驗證的驗收條件，零成本、立即可做。

### 4. M 級任務是最佳派發粒度（Analyst + Coder + Inspector）
5-20K token、3-10 tool calls、≤5 檔案、嚴格單一目標。通過率最高（85%+）。

### 5. 70% 退件可預防（Inspector 數據，全員認同）
格式與規範違反佔 40%、邏輯錯誤 30%、邊界案例 20%、設計問題僅 10%。前兩類可自動化攔截。

### 6. 完成後自檢是零成本改善（Coder 提議，全員支持）
Agent 交付前逐條對照 acceptance_criteria 自檢，預估 FPR +15%。

### 7. 參考範例勝過文字描述（Writer + Designer + Analyst）
建立各任務類型的 golden example 庫，比寫 100 字風格描述更有效。

### 8. 規範要內化到流程中，而非依賴記憶（Coder + Designer）
"Make it obvious, not obedient." 任務模板自帶 checklist，不依賴外部規範文件。

### 9. 3-4 Agent 並行是最佳甜蜜點（Analyst + Researcher）
超過後協調成本指數增長，token overhead 顯著上升但品質增幅遞減。

### 10. 我們的架構方向正確（Researcher 研究結論）
Orchestrator-Worker 模式與 Anthropic 官方推薦一致，無需大改。主要差距：缺自動驗收、任務描述不夠結構化、無 token 預算管理。

---

## 二、分歧點

### 1. MUST/SHOULD 規範分層方式

| 立場 | 支持者 | 觀點 |
|------|--------|------|
| 工程式分層（MUST=退件/SHOULD=扣分） | Writer, Coder, Inspector | 可操作、可自動化 |
| 設計式分層（原則→模式→工具） | Designer | 等級分層會產出「技術合格但品質破碎」的產出 |
| **收斂方案** | Writer 修正 | MUST 限於可自動驗證的硬規則（linter），SHOULD 轉為原則描述（LLM-as-Judge） |

### 2. S 級任務是否需要完整模板

| 立場 | 支持者 | 觀點 |
|------|--------|------|
| 所有任務統一模板 | Writer, Inspector | 一致性優先 |
| S 級只需一句話+驗收條件 | Coder | 描述比任務本身還長是浪費 |
| **收斂方案** | 多數同意 Coder | S 級精簡版，M 級以上完整模板 |

### 3. LLM-as-Judge 導入時機

| 立場 | 支持者 | 觀點 |
|------|--------|------|
| 先做 golden set 再上線 | Analyst | 沒有 golden set 的 Judge 是隨機數產生器 |
| 先上線再迭代校準 | Researcher | 兩步 MVP（acceptance_criteria + self-check）一天可上線 |
| **收斂方案** | Inspector | 先做格式層 guardrail（本週），再加 LLM-as-Judge（兩週內） |

### 4. Token 效率的衡量方式

| 立場 | 支持者 | 觀點 |
|------|--------|------|
| Token ROI = 品質分/token 消耗 | Analyst | 可量化追蹤 |
| 研究型任務的「浪費」是必要探索成本 | Designer | 需區分 Exploration vs Execution |

---

## 三、行動方案（按優先級排序）

### 🔴 P0：本週必做

#### 3.1 任務卡加入 acceptance_criteria 欄位
- **負責**：Coder
- **工作量**：S
- **做法**：Supabase board_tasks 表加入 `acceptance_criteria` 和 `expected_output` 欄位
- **預期效果**：消除期望落差，FPR +15-20%
- **優先級**：本週

#### 3.2 格式層 Guardrail 腳本
- **負責**：Coder + Inspector
- **工作量**：M
- **做法**：開發自動檢查腳本：emoji 前綴、markdown 結構、連結有效性、必要欄位存在
- **預期效果**：攔截 40% 格式類退件，FPR 從 55% → 70%
- **優先級**：本週

#### 3.3 標準任務描述模板上線
- **負責**：Writer
- **工作量**：S
- **做法**：將收斂版模板寫入 SHARED_RULES.md，區分 S 級精簡版和 M+ 完整版
- **預期效果**：統一任務輸入格式，減少歧義
- **優先級**：本週

#### 3.4 完成後自檢流程
- **負責**：全 Agent
- **工作量**：S
- **做法**：每個 Agent 完成任務後，對照 acceptance_criteria 逐條自檢，結果附在交付訊息
- **預期效果**：零成本 +15% FPR，Inspector 審查加速
- **優先級**：本週

### 🟡 P1：下週

#### 3.5 自我回報格式標準化
- **負責**：Writer（定義）+ 全 Agent（執行）
- **工作量**：S
- **做法**：統一回報格式（狀態/檔案/自檢/耗時/信心燈號）
- **預期效果**：Travis 10 秒判斷過/不過
- **優先級**：下週

#### 3.6 任務分級定義與拆分規則
- **負責**：Analyst
- **工作量**：S
- **做法**：S/M/L/XL 正式定義寫入規範，超標任務強制拆分
- **預期效果**：消滅低通過率 XL 類別
- **優先級**：下週

### 🟢 P2：兩週內

#### 3.7 LLM-as-Judge 初篩系統
- **負責**：Coder + Inspector
- **工作量**：L
- **做法**：建立 rubric + 評分 prompt，0.7 門檻，低於自動重試一次，仍不過才人工審查
- **預期效果**：降低 Travis 驗收瓶頸 60%，FPR → 80%
- **優先級**：兩週內

#### 3.8 Golden Example 庫
- **負責**：Writer + Designer
- **工作量**：M
- **做法**：為各任務類型（開發/研究/文案/設計）建立 2-3 個標竿範例
- **預期效果**：對齊期望 + 示範品質，比文字規範有效
- **優先級**：兩週內

### 🔵 P3：一個月內

#### 3.9 Agent 效率 Dashboard
- **負責**：Analyst + Coder
- **工作量**：L
- **做法**：從 Supabase 拉數據，追蹤 FPR、Token ROI、Cycle Time、Rework Ratio、Guardrail 攔截率
- **預期效果**：數據驅動持續優化
- **優先級**：一個月內

#### 3.10 Evaluator-Optimizer 迴圈
- **負責**：Coder
- **工作量**：L
- **做法**：重要任務自動進入「產出→評估→修正」迴圈
- **預期效果**：品質保證自動化閉環
- **優先級**：一個月內

---

## 四、新規範草案

### 4.1 標準任務描述模板

**S 級（精簡版）：**
```
## 任務：[動詞+名詞]
目標：一句話
驗收：[ ] 條件1  [ ] 條件2
預算：S（<5K token / <2min）
```

**M 級以上（完整版）：**
```yaml
task:
  title: "[動詞+名詞]"
  goal: "一句話說清楚要什麼"
  scope:
    include: ["改動哪些檔案/模組"]
    exclude: ["不要動什麼"]
  output_format: "markdown | google_doc | code | deploy"
  acceptance_criteria:
    must:   # 自動驗證，違反=退件
      - "條件1（可 lint/script 驗）"
      - "條件2"
    should: # LLM-as-Judge，違反=扣分
      - "品質加分項"
  effort: "M"  # S/M/L/XL
  token_budget: "20K"
  timeout: "10min"
  reference: "之前類似產出的連結（選填）"
  checklist:  # 該任務類型的必檢項
    - "[ ] 項目1"
    - "[ ] 項目2"
```

### 4.2 自我回報格式

```
✅ [任務名] 完成
檔案：file1, file2（≤5）
自檢：格式 ✓ 功能 ✓ 規範 ✓
耗時/token：3min / 8K
信心：🟢高 / 🟡中 / 🔴低
備註：（卡關點或需注意事項，選填）
```

信心燈號機制：
- 🟢 高信心 → Inspector 快速通道（抽查 10%）
- 🟡 中信心 → Inspector 標準審查
- 🔴 低信心 → 自動觸發完整審查

### 4.3 Guardrail Checklist

**所有任務通用（自動化）：**
- [ ] 產出完整性：符合 expected_output 定義
- [ ] 格式正確性：通過自動 lint/schema 檢查
- [ ] emoji 前綴正確（依角色規範）
- [ ] 必要欄位非空（title, goal, acceptance_criteria）
- [ ] 字數在規定範圍內（±20%）

**程式碼任務追加：**
- [ ] ESLint/Prettier pass
- [ ] Build success
- [ ] 測試通過
- [ ] 無明顯 SQL injection/XSS

**文件任務追加：**
- [ ] Front matter 完整
- [ ] 標題層級正確
- [ ] 連結/圖片可訪問
- [ ] 引用來源有標註

**Inspector 人工審查項（不可自動化）：**
- [ ] 邏輯正確性
- [ ] 安全風險
- [ ] UX 合理性
- [ ] 邊界案例處理

### 4.4 任務分級定義

| 級別 | Token 預算 | Tool Calls | 時間 | 檔案數 | 目標數 | 範例 |
|------|-----------|------------|------|--------|--------|------|
| **S** | <5K | 1-3 | <2min | ≤2 | 1 | 改錯字、加 emoji、簡單查詢 |
| **M** | 5-20K | 3-10 | 2-10min | ≤5 | 1 | 寫評論、修 bug、短文章 |
| **L** | 20-80K | 10-30 | 10-30min | ≤10 | 1-2 | 新功能、研究報告、完整頁面 |
| **XL** | 80K+ | 30+ | 30min+ | 10+ | 2+ | 架構重構（應盡量拆分為 L） |

**拆分規則：** 超過 M 級任一上限 → 升級並評估是否拆分。XL 任務必須拆分為多個 L/M。

---

## 五、KPI 目標

### 5.1 First Pass Rate（一次通過率）
- **現況**：55-60%（Inspector 估計）
- **Phase 1 目標**（2 週後）：70%（格式 Guardrail 上線）
- **Phase 2 目標**（1 月後）：80%（LLM-as-Judge + 任務模板完善）
- **長期目標**：85%+

### 5.2 Token ROI
- **定義**：品質分（0-1）/ token 消耗（K）
- **目標**：>0.05（即 20K token 至少產出 1.0 品質分的成果）
- **追蹤方式**：每任務記錄，按 Agent 和任務類型分組分析

### 5.3 其他關鍵指標

| 指標 | 定義 | 目標 |
|------|------|------|
| Cycle Time P50 | 指派到驗收通過的中位時間 | S<5m, M<15m, L<30m |
| Rework Ratio | 重做 token / 原始 token | <0.3 |
| Guardrail 攔截率 | 自動攔截佔總提交比例 | 20-40%（太高=規範不清，太低=門檻太鬆） |
| 規範遵守率 | 自動檢查通過率 | >90% |
| Agent 利用率 | 工作時間 / 可用時間 | 70-80% |

### 5.4 監控節奏
- **每日**：FPR、Token 消耗、任務完成數
- **每週**：趨勢分析、Guardrail 校準、LLM-as-Judge drift 檢查
- **每月**：全面回顧、規範迭代、KPI 目標調整

---

## 六、結語

Forum #004 的核心結論用一句話總結：**品質靠閘門不靠信任，效率靠結構不靠自律。**

我們的架構方向正確，主要差距在執行層面的標準化。本週先做「acceptance_criteria + Guardrail 腳本 + 自檢流程」三件套，預計兩週內將 FPR 從 55% 拉到 70%+，一個月內衝到 80%。

感謝所有 Agent 的深度參與。這是我們第一次用結構化方式討論工作流，成果遠超預期。接下來就是執行。
