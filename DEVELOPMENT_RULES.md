# DEVELOPMENT_RULES.md — Travis Daily 開發與巡檢規範

> 所有 Agent（Coder、Inspector、Designer、Travis）開發或巡檢 Travis Daily 時必須遵守。

## 1. Markdown for Agents（AI 友善）

### 開發規範（Coder）
- **每個新頁面都必須同時支援 HTML 和 Markdown 輸出**
- 內容源頭是 `/content/` 目錄的 `.md` 檔案，這是天然優勢，保持它
- 新增動態路由頁面時，確認 `/api/markdown/[...slug]` 能正確回傳對應 markdown
- 新文章發布後，必須同步寫入 `post_visibility` 表（預設 public + markdown_api=true）
- Middleware 已設定攔截 `Accept: text/markdown` 請求，新路由不需額外處理
- 若頁面內容非來自 `.md` 檔（如動態生成），需在 API route 中提供等效 markdown 輸出

### 權限控制
- `post_visibility` 表控制每篇文章的存取權限
- `visibility`: public / private（private 返回 403）
- `markdown_api`: true / false（false 返回 404 for markdown requests）
- 管理員 API: `POST /api/admin/visibility`（需 Bearer ADMIN_TOKEN）

### Response Headers（必須包含）
- `Content-Type: text/markdown; charset=utf-8`
- `X-Markdown-Tokens`: 估算 token 數
- `Content-Signal: ai-input=yes, search=yes`

## 2. 巡檢重點（Inspector）

### Markdown API 巡檢項目
- [ ] 所有 public 文章的 markdown endpoint 可正常回傳
- [ ] Private 文章回傳 403（不洩漏內容）
- [ ] markdown_api=false 的文章回傳 404
- [ ] Response headers 完整（Content-Type、X-Markdown-Tokens、Content-Signal）
- [ ] 新文章已同步到 `post_visibility` 表
- [ ] Middleware rewrite 正常運作（Accept: text/markdown → /api/markdown/...）

### 巡檢指令範例
```bash
# 測試 public 文章 markdown 輸出
curl -s -o /dev/null -w "%{http_code}" -H "Accept: text/markdown" https://travis-daily.vercel.app/notes/first-note
# 預期: 200

# 測試 private 文章
curl -s -o /dev/null -w "%{http_code}" -H "Accept: text/markdown" https://travis-daily.vercel.app/reports/test-private
# 預期: 403

# 正常 HTML 不受影響
curl -s -o /dev/null -w "%{http_code}" https://travis-daily.vercel.app/notes/first-note
# 預期: 200 (HTML)
```

## 3. 通用開發規則

### UI
- **禁止使用 emoji** — 一律用 lucide-react SVG icon
- 深色主題優先，確保淺色主題也正常
- 手機優先設計（Mobile First）

### 內容
- 文章源頭一律放 `/content/` 目錄的 `.md` 檔
- frontmatter 必填：title、date、type、author
- type 可用值：digest、research、note、update（不要用 report）

### 部署
- Push to main → Vercel 自動部署
- 環境變數透過 Vercel API 管理（credentials 在 `~/.openclaw/credentials/vercel.json`）
- 部署後 Inspector + Designer 審查通過才算完成

---
*建立日期：2026-02-15*
