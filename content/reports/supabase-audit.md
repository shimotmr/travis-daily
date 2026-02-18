---
title: Supabase 資料庫結構審計與優化報告
date: 2026-02-09
type: research
tags: [supabase, database, architecture, audit]
---

# Supabase 資料庫結構審計與優化報告

## 概覽

| 類別 | 表數 | 總筆數 |
|------|------|--------|
| 案件相關 | 3 | 2,556 |
| 人員/經銷商 | 3 | 42 |
| 產品相關 | 7 | 4,359 |
| 庫存 | 4 | 940 |
| 報價 | 2 | 0 |
| 數位資源 | 2 | 71 |
| Travis Daily | 3 | 3 |
| **合計** | **24** | **7,971** |

---

## 一、重複與冗餘分析

### 🔴 高優先 — `products_full` vs `pudu_products`

**問題**：兩張表 1274 筆，欄位幾乎完全重複。`products_full` 多了 `material_type_name`、`*_qty`（component/robot/overseas/total）、`product_types`、`product_tags`。

**判斷**：`products_full` 是 `pudu_products` + `material_types` + `inventory_summary` + `product_type/tag_mappings` 的聚合結果。

**建議**：
- 將 `products_full` 改為 **View** 或 **Materialized View**
- 保留 `pudu_products` 作為唯一的產品 source-of-truth 表
- View 定義：
  ```sql
  CREATE VIEW products_full AS
  SELECT p.*,
         mt.name AS material_type_name,
         inv.component_qty, inv.robot_qty, inv.overseas_qty, inv.total_qty,
         (SELECT array_agg(pt.name) FROM product_type_mappings ptm
          JOIN product_types pt ON pt.id = ptm.type_id
          WHERE ptm.product_id = p.id) AS product_types,
         (SELECT array_agg(tg.name) FROM product_tag_mappings tgm
          JOIN product_tags tg ON tg.id = tgm.tag_id
          WHERE tgm.product_id = p.id) AS product_tags
  FROM pudu_products p
  LEFT JOIN material_types mt ON mt.code = p.material_type
  LEFT JOIN inventory_summary inv ON inv.aurotek_pn = p.aurotek_pn;
  ```

### 🔴 高優先 — `inventory_summary` vs `inventory`

**問題**：`inventory_summary`（435 筆）的 `component_qty`、`robot_qty`、`overseas_qty`、`total_qty` 可由 `inventory` + `warehouses` 計算得出。

**建議**：改為 View：
```sql
CREATE VIEW inventory_summary AS
SELECT i.aurotek_pn,
       SUM(CASE WHEN w.type = 'component' THEN i.quantity ELSE 0 END) AS component_qty,
       SUM(CASE WHEN w.type = 'robot' THEN i.quantity ELSE 0 END) AS robot_qty,
       SUM(CASE WHEN w.type = 'overseas' THEN i.quantity ELSE 0 END) AS overseas_qty,
       SUM(i.quantity) AS total_qty
FROM inventory i
JOIN warehouses w ON w.code = i.warehouse_code
GROUP BY i.aurotek_pn;
```

### 🟡 中優先 — `cases_snapshots`

**現狀**：1674 筆，結構與 `cases` 幾乎一樣，多了 `snapshot_id` 和 `sync_week`。用途為每週同步時保存案件歷史快照。

**問題**：
- 每週全量快照 → 資料膨脹快（846 × 52 週 ≈ 44K 筆/年）
- 無法精確追蹤「什麼欄位在什麼時候改了」

**建議**：
- 短期保留 `cases_snapshots` 作為週度快照（用於週報比對）
- 新增 `case_changes` 表（見下方）記錄欄位級異動
- 長期可考慮只保留近 12 週快照，超過的歸檔或刪除

---

## 二、空表處理

| 表名 | 建議 | 理由 |
|------|------|------|
| `dealer_contacts` | ⏸ 保留但標記 | 經銷商聯繫人功能尚未開發，結構合理，留著備用 |
| `quotations` | ⏸ 保留 | 報價功能開發中，已有明確 schema |
| `quotation_items` | ⏸ 保留 | 同上 |
| `travis_daily_likes` | 🔀 遷移 | 見下方「分離建議」 |

---

## 三、Schema 分離建議

### `travis_daily_*` 系列（3 張表）

**問題**：個人網站資料與 Portal 業務資料混在同一個 Supabase 專案。

**建議**：
- **最佳方案**：遷移到獨立 Supabase 專案（Travis Daily 專用）
- **次佳方案**：使用 PostgreSQL schema 隔離：
  ```sql
  CREATE SCHEMA travis_daily;
  ALTER TABLE travis_daily_users SET SCHEMA travis_daily;
  ALTER TABLE travis_daily_comments SET SCHEMA travis_daily;
  ALTER TABLE travis_daily_likes SET SCHEMA travis_daily;
  ```
- 資料量極小（3 筆），遷移成本低

---

## 四、缺少的表 — 建議新增

### 1. `case_changes`（案件異動記錄）

追蹤案件欄位級變更，取代純快照模式。

```sql
CREATE TABLE case_changes (
  id          BIGSERIAL PRIMARY KEY,
  case_id     INTEGER NOT NULL REFERENCES cases(id),
  field_name  TEXT NOT NULL,         -- 'stage', 'amount', 'probability' 等
  old_value   TEXT,
  new_value   TEXT,
  changed_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  change_source TEXT DEFAULT 'sync'  -- 'sync', 'manual', 'api'
);

CREATE INDEX idx_case_changes_case_id ON case_changes(case_id);
CREATE INDEX idx_case_changes_changed_at ON case_changes(changed_at);
```

### 2. `activity_log`（系統操作日誌）

```sql
CREATE TABLE activity_log (
  id          BIGSERIAL PRIMARY KEY,
  actor       TEXT NOT NULL,          -- 'system', 'william', 'jarvis'
  action      TEXT NOT NULL,          -- 'sync_funnel', 'update_case', 'send_alert'
  target_type TEXT,                   -- 'case', 'product', 'inventory'
  target_id   TEXT,
  metadata    JSONB,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_activity_log_created ON activity_log(created_at);
```

### 3. `sync_history`（同步歷史）

```sql
CREATE TABLE sync_history (
  id            BIGSERIAL PRIMARY KEY,
  sync_type     TEXT NOT NULL,        -- 'funnel', 'inventory', 'products'
  status        TEXT NOT NULL,        -- 'success', 'failed', 'partial'
  records_total INTEGER,
  records_new   INTEGER,
  records_updated INTEGER,
  error_message TEXT,
  started_at    TIMESTAMPTZ NOT NULL,
  completed_at  TIMESTAMPTZ
);
```

---

## 五、外鍵關係建議

目前推測多數表**缺乏外鍵約束**。建議補上：

```sql
-- cases → team
ALTER TABLE cases ADD CONSTRAINT fk_cases_rep
  FOREIGN KEY (rep) REFERENCES team(name);

-- cases → dealers
ALTER TABLE cases ADD CONSTRAINT fk_cases_dealer
  FOREIGN KEY (dealer) REFERENCES dealers(name);

-- targets → team
ALTER TABLE targets ADD CONSTRAINT fk_targets_rep
  FOREIGN KEY (rep_id) REFERENCES team(id);

-- inventory → warehouses
ALTER TABLE inventory ADD CONSTRAINT fk_inventory_warehouse
  FOREIGN KEY (warehouse_code) REFERENCES warehouses(code);

-- inventory → pudu_products
ALTER TABLE inventory ADD CONSTRAINT fk_inventory_product
  FOREIGN KEY (aurotek_pn) REFERENCES pudu_products(aurotek_pn);

-- product_type_mappings
ALTER TABLE product_type_mappings ADD CONSTRAINT fk_ptm_product
  FOREIGN KEY (product_id) REFERENCES pudu_products(id);
ALTER TABLE product_type_mappings ADD CONSTRAINT fk_ptm_type
  FOREIGN KEY (type_id) REFERENCES product_types(id);

-- product_tag_mappings
ALTER TABLE product_tag_mappings ADD CONSTRAINT fk_ptagm_product
  FOREIGN KEY (product_id) REFERENCES pudu_products(id);
ALTER TABLE product_tag_mappings ADD CONSTRAINT fk_ptagm_tag
  FOREIGN KEY (tag_id) REFERENCES product_tags(id);

-- cases_snapshots → cases
ALTER TABLE cases_snapshots ADD CONSTRAINT fk_snapshot_case
  FOREIGN KEY (case_id) REFERENCES cases(id);

-- quotation_items → quotations
ALTER TABLE quotation_items ADD CONSTRAINT fk_qi_quotation
  FOREIGN KEY (quotation_id) REFERENCES quotations(id);
```

> ⚠️ **注意**：`cases.rep` 和 `cases.dealer` 如果存的是名稱字串而非 ID，需先確認資料一致性，或改存 ID。

---

## 六、索引建議

```sql
-- cases：最常查詢的欄位
CREATE INDEX idx_cases_stage ON cases(stage);
CREATE INDEX idx_cases_rep ON cases(rep);
CREATE INDEX idx_cases_dealer ON cases(dealer);
CREATE INDEX idx_cases_expected ON cases(expected);      -- 預計成交月份
CREATE INDEX idx_cases_category ON cases(category);
CREATE INDEX idx_cases_updated ON cases(updated_at);

-- cases_snapshots
CREATE INDEX idx_snapshots_week ON cases_snapshots(sync_week);
CREATE INDEX idx_snapshots_case ON cases_snapshots(case_id);

-- pudu_products
CREATE INDEX idx_products_pn ON pudu_products(aurotek_pn);
CREATE INDEX idx_products_active ON pudu_products(is_active);
CREATE INDEX idx_products_sellable ON pudu_products(is_sellable);
CREATE INDEX idx_products_category ON pudu_products(category_code);

-- inventory
CREATE INDEX idx_inventory_pn ON inventory(aurotek_pn);
CREATE INDEX idx_inventory_warehouse ON inventory(warehouse_code);
CREATE UNIQUE INDEX idx_inventory_unique ON inventory(aurotek_pn, warehouse_code, year, month);

-- targets
CREATE INDEX idx_targets_rep_year ON targets(rep_id, year);

-- slides/videos（全文搜尋用）
CREATE INDEX idx_slides_category ON slides(category);
CREATE INDEX idx_videos_category ON videos(category);
```

---

## 七、優化後理想表結構

### 核心表（保留）— 14 張

| 表名 | 角色 | 備註 |
|------|------|------|
| `cases` | 案件主表 | rep/dealer 改存 ID |
| `cases_snapshots` | 週度快照 | 保留近 12 週 |
| `case_changes` | 🆕 欄位級異動 | 新增 |
| `targets` | 業績目標 | — |
| `team` | 業務人員 | — |
| `dealers` | 經銷商 | — |
| `dealer_contacts` | 經銷商聯繫人 | 待開發 |
| `pudu_products` | 產品主表 | 唯一 source-of-truth |
| `product_types` | 產品類型 | — |
| `product_tags` | 產品標籤 | — |
| `product_type_mappings` | 類型關聯 | — |
| `product_tag_mappings` | 標籤關聯 | — |
| `material_types` | 材料類型 | — |
| `exchange_rates` | 匯率 | — |

### 庫存（保留 2 張 + 1 View）

| 表名 | 角色 |
|------|------|
| `inventory` | 庫存明細 |
| `warehouses` | 倉庫定義 |
| `inventory_summary` | 🔄 改為 View |

### 產品聚合（改為 View）

| 表名 | 角色 |
|------|------|
| `products_full` | 🔄 改為 View |

### 報價（保留）

| 表名 | 角色 |
|------|------|
| `quotations` | 報價單 |
| `quotation_items` | 報價明細 |

### 數位資源（保留）

| 表名 | 角色 |
|------|------|
| `slides` | 簡報 |
| `videos` | 影片 |

### 新增系統表

| 表名 | 角色 |
|------|------|
| `case_changes` | 🆕 案件異動 |
| `activity_log` | 🆕 操作日誌 |
| `sync_history` | 🆕 同步記錄 |

### 遷出

| 表名 | 去向 |
|------|------|
| `travis_daily_users` | 獨立專案或 schema |
| `travis_daily_comments` | 同上 |
| `travis_daily_likes` | 同上 |

---

## 八、執行優先順序

| 順序 | 動作 | 風險 | 影響 |
|------|------|------|------|
| 1 | 補外鍵約束 | 低 | 資料完整性 |
| 2 | 補索引 | 低 | 查詢效能 |
| 3 | `inventory_summary` → View | 低 | 消除冗餘 |
| 4 | `products_full` → View | 中 | 需確認前端查詢是否受影響 |
| 5 | 新增 `case_changes` | 低 | 為異動追蹤做準備 |
| 6 | 新增 `activity_log` + `sync_history` | 低 | 系統可觀測性 |
| 7 | 遷移 `travis_daily_*` | 低 | Schema 整潔 |
| 8 | `cases` 欄位 rep/dealer 改為 ID 引用 | 高 | 需同步更新所有查詢和前端 |

---

## 九、總結

| 指標 | 現狀 | 優化後 |
|------|------|--------|
| 實體表 | 24 | 20（+3 新表 -4 改 View/遷出） |
| Views | 0 | 2（products_full, inventory_summary） |
| 外鍵約束 | ≈ 0 | 10+ |
| 冗餘資料表 | 2 | 0 |
| 無關資料表 | 3 | 0（遷出） |

核心原則：**單一資料來源（Single Source of Truth）**、**用 View 取代冗餘表**、**用 change log 取代全量快照**。
