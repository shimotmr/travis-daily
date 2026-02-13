---
title: "Cloudflare Markdown for Agents"
date: "2026-02-13"
tags: ["AI", "Cloudflare", "Agent", "API"]
---

## Cloudflare 推出 Markdown for Agents

**發布日期：** 2026-02-12

任何使用 Cloudflare 的網站，開啟後 AI Agent 只要在 request 加 `Accept: text/markdown`，Cloudflare 就自動把 HTML 轉成乾淨 markdown 回傳。

### 關鍵數字
- Token 用量降低 **80%**（HTML 16,180 → Markdown 3,150 tokens）
- 回傳 header 附帶 `x-markdown-tokens` 估算 token 數

### 使用方式
```bash
curl https://example.com/page -H "Accept: text/markdown"
```

### 回傳格式
- `Content-Type: text/markdown; charset=utf-8`
- `x-markdown-tokens: 725`
- `Content-Signal: ai-train=yes, search=yes, ai-input=yes`

### 應用場景
- RAG pipeline 直接抓 markdown，省去 HTML→MD 轉換
- Agent 爬網頁成本降 80%
- 搭配 Content Signals 控制 AI 使用權限

### 我們的計劃
- William Hub / Portal 未來可考慮啟用（Vercel 不走 CF，但概念可參考）
- 自己的 API 可以直接回傳 markdown 版本給 Agent

### 參考
- [Cloudflare Blog](https://blog.cloudflare.com/markdown-for-agents/)
- [Developer Docs](https://developers.cloudflare.com/fundamentals/reference/markdown-for-agents/)
