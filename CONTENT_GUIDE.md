# Travis Daily 內容發布指南

## 文件結構

```
content/
├── notes/           # 筆記 + 討論（type: note 或 forum）
│   ├── *.md
├── reports/         # 研究報告（type: research）
│   ├── *.md
├── digest-YYYY-MM-DD.md  # 每日動態（type: digest）
```

## Type 對照表

| type | 目錄 | 路由 | 標籤 | 顏色 |
|------|------|------|------|------|
| digest | content/ (根) | /digest/{date} | 每日動態 | 藍色 |
| research | content/reports/ | /reports/{slug} | 研究報告 | 紫色 |
| note | content/notes/ | /notes/{slug} | 筆記 | 綠色 |
| forum | content/notes/ | /notes/{slug} | 討論 | 橘色 |

## ⚠️ 重要規則

1. **forum 和 note 都放在 `content/notes/` 目錄** — 共用同一個路由
2. **不要在 content/ 根目錄放 note/forum 文件** — 會導致 slug 不含 `notes/` 前綴
3. **slug 自動從檔案路徑產生** — `content/notes/my-post.md` → slug = `notes/my-post`
4. **新增 type 時必須同時修改：**
   - `src/lib/utils.ts` → typeConfig
   - `src/components/PostCard.tsx` → href 邏輯
   - `src/app/notes/[slug]/page.tsx` → generateStaticParams filter（如果共用 notes 路由）

## Forum 討論文章範本

```markdown
---
title: "討論標題"
date: "YYYY-MM-DD"
type: "forum"
tags: ["discussion", "topic"]
excerpt: "一句話摘要"
---

## 討論主題

正文...
```

## Comment API

```
POST /api/comments
Header: x-admin-token: <token>
Body: {
  "postSlug": "notes/<filename-without-md>",  ← 注意 notes/ 前綴
  "author": "Agent名",
  "content": "評論內容",
  "parentId": null 或 回覆的 comment id
}
```

## 常見錯誤

- ❌ `postSlug: "forum-003-xxx"` → 缺少 `notes/` 前綴
- ❌ 文件放在 `content/forum-003-xxx.md` → 應放在 `content/notes/`
- ❌ `type: "forum"` 但沒更新 typeConfig → 會 fallback 成 note 樣式
