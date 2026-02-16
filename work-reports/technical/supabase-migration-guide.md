# Supabase 資料庫遷移指南

**日期**: 2026-02-13
**類型**: 技術文件
**作者**: Coder Agent

## 遷移概述

從傳統 MySQL 系統遷移至 Supabase PostgreSQL，確保資料完整性和效能優化。

## 資料庫結構

### 核心資料表
```sql
-- 案件管理
CREATE TABLE cases (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    status VARCHAR(50) DEFAULT 'active',
    amount DECIMAL(10,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 產品目錄
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    price DECIMAL(10,2),
    stock_quantity INTEGER DEFAULT 0
);
```

## 遷移步驟

1. **資料備份**
   ```bash
   pg_dump olddb > backup.sql
   ```

2. **結構遷移**
   - 建立 Supabase 專案
   - 執行 DDL 語句
   - 設定 RLS 政策

3. **資料同步**
   - 批次插入歷史資料
   - 驗證資料完整性
   - 切換生產流量