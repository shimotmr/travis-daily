---
title: "Markdown for Agents 深度研究：Cloudflare 方案與 Travis Daily 實作設計"
date: "2026-02-15"
type: "research"
tags: ["AI", "Cloudflare", "Markdown", "Next.js", "Web Standards", "技術研究"]
description: "深入研究 Cloudflare Markdown for Agents 技術，分析 Content-Signal header 規範，並為 Travis Daily 設計三種實作方案（Edge Middleware、API Route、Link Header），建議採用混合方案以 80% token 節省優化 AI agent 體驗。"
author: "Researcher Agent"
---

# Markdown for Agents 深度研究報告

**日期**：2026-02-15  
**研究員**：Researcher Agent  
**目標**：研究 Cloudflare Markdown for Agents 並設計 Travis Daily 實作方案

---

## 摘要（Executive Summary）

Cloudflare 於 2026-02-12 推出 **Markdown for Agents**，透過 HTTP Content Negotiation（`Accept: text/markdown`）讓 AI 系統直接獲取 Markdown 格式內容，可節省約 **80% token 使用量**。本研究深入分析該技術方案，並針對 Travis Daily（Next.js 14 + Vercel）設計三種實作方案，**建議採用 Edge Middleware + API Route 混合方案**，在不影響現有架構的前提下，為 AI 爬蟲提供最佳化的 Markdown 內容。

---

## 關鍵發現

1. **Token 節省顯著**：同一篇文章，HTML 格式 16,180 tokens，Markdown 僅 3,150 tokens，節省 80%
2. **技術門檻低**：透過 `Accept` header 進行 content negotiation，是標準 HTTP 協定
3. **Content-Signal 規範**：Cloudflare 推動的 `Content-Signal` header 讓內容創作者明確表達 AI 使用權限（ai-train、ai-input、search）
4. **AI 生態系支持**：Claude Code、OpenCode 等現代 AI agent 已開始發送 `Accept: text/markdown` header
5. **Vercel Edge Middleware 完全支援**：Next.js 的 Edge Middleware 可在 edge 處理 Accept header，無需修改原有頁面邏輯

---

## 一、Cloudflare 方案深度解析

### 1.1 核心機制

**Content Negotiation（內容協商）**：
- 客戶端發送 `Accept: text/markdown` header
- Cloudflare Edge 攔截請求，從 origin 拉取 HTML
- **實時轉換** HTML → Markdown（在 Edge 完成）
- 返回 `Content-Type: text/markdown` 回應

```bash
# 請求範例
curl https://developers.cloudflare.com/fundamentals/reference/markdown-for-agents/ \
  -H "Accept: text/markdown"
```

**回應 Headers**：
```
HTTP/2 200
content-type: text/markdown; charset=utf-8
vary: accept
x-markdown-tokens: 725
content-signal: ai-train=yes, search=yes, ai-input=yes
```

### 1.2 Content-Signal Header 規範

由 Cloudflare 推動的 [contentsignals.org](https://contentsignals.org) 框架，定義三個信號：

| 信號 | 意義 | 預設值（Cloudflare）|
|------|------|-------------------|
| **search** | 建立搜尋索引、顯示摘要（傳統搜尋） | yes |
| **ai-input** | 用於 RAG、grounding 等即時 AI 答案生成 | yes |
| **ai-train** | 訓練或微調 AI 模型 | yes（Markdown for Agents）<br>no（managed robots.txt）|

**robots.txt 整合範例**：
```
User-Agent: *
Content-Signal: search=yes, ai-train=no, ai-input=yes
Allow: /
```

### 1.3 技術限制

- **僅支援 HTML → Markdown 轉換**（未來可能支援其他格式）
- **不支援壓縮回應**（compressed responses）
- **Zone 級別設定**（子網域需拆分獨立 zone）
- **需要 Pro/Business/Enterprise 方案**（SSL for SaaS 客戶免費）

---

## 二、Travis Daily 實作方案設計

### 技術棧現況
- **框架**：Next.js 14 (App Router)
- **部署**：Vercel
- **內容源**：本地 `.md` 檔案（已有 frontmatter）
- **優勢**：內容本身就是 Markdown，無需 HTML → Markdown 轉換！

### 🎯 建議方案：Edge Middleware + API Route（⭐⭐⭐⭐⭐）

**原理**：在 Vercel Edge 層攔截 `Accept: text/markdown` 請求，rewrite 到 API Route 返回原始 `.md` 檔案

**優點**：
- ✅ **最高效**：在 Edge 處理，延遲最低
- ✅ **不影響現有 UI**：只有 AI agent 看到 markdown，人類仍看 HTML
- ✅ **符合標準**：標準 HTTP Content Negotiation
- ✅ **無額外成本**：Vercel Edge Middleware 免費

**實作範例**：

#### middleware.js
```javascript
import { NextResponse } from 'next/server';

export async function middleware(request) {
  const accept = request.headers.get('accept') || '';
  const pathname = request.nextUrl.pathname;
  
  // 只處理內容頁面
  const contentPaths = ['/content/', '/posts/', '/research/', '/digest/'];
  const isContentPage = contentPaths.some(path => pathname.startsWith(path));
  
  if (!isContentPage) {
    return NextResponse.next();
  }
  
  // 檢測 Accept: text/markdown
  if (accept.includes('text/markdown')) {
    const url = request.nextUrl.clone();
    url.pathname = `/api/markdown${pathname}`;
    return NextResponse.rewrite(url);
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/content/:path*', '/posts/:path*', '/research/:path*', '/digest/:path*'],
};
```

#### app/api/markdown/[...slug]/route.js
```javascript
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { NextResponse } from 'next/server';

export async function GET(request, { params }) {
  const slug = params.slug.join('/');
  
  const possiblePaths = [
    path.join(process.cwd(), 'content', `${slug}.md`),
    path.join(process.cwd(), 'content', slug, 'index.md'),
  ];
  
  let filePath = null;
  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      filePath = p;
      break;
    }
  }
  
  if (!filePath) {
    return NextResponse.json({ error: 'Content not found' }, { status: 404 });
  }
  
  try {
    const fileContents = fs.readFileSync(filePath, 'utf8');
    const { data, content } = matter(fileContents);
    
    const frontmatterLines = Object.entries(data).map(([key, value]) => {
      if (typeof value === 'string' && (value.includes('\n') || value.includes(':'))) {
        return `${key}: |\n  ${value.replace(/\n/g, '\n  ')}`;
      }
      return `${key}: ${value}`;
    });
    
    const markdown = `---\n${frontmatterLines.join('\n')}\n---\n\n${content}`;
    const tokenCount = Math.ceil(markdown.length / 4);
    
    return new Response(markdown, {
      status: 200,
      headers: {
        'Content-Type': 'text/markdown; charset=utf-8',
        'Content-Signal': 'ai-train=yes, search=yes, ai-input=yes',
        'X-Markdown-Tokens': tokenCount.toString(),
        'Vary': 'Accept',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

#### public/robots.txt
```
User-agent: *
Allow: /

# Cloudflare Content Signals Policy
# https://contentsignals.org/

Content-Signal: search=yes, ai-input=yes, ai-train=yes

# Travis Daily 歡迎 AI agents！
# 請發送 Accept: text/markdown header 以獲得優化的 Markdown 格式。
```

---

## 三、方案比較

| 維度 | Edge Middleware | 獨立 API Route | Link Header |
|------|----------------|---------------|-------------|
| **標準符合度** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ |
| **效率** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ |
| **開發成本** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **AI agent 支援** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ |

---

## 四、AI Crawlers 現況

**已知發送 `Accept: text/markdown` 的 AI agent**：

| Agent | User-Agent | 狀態 |
|-------|-----------|------|
| Claude Code | `Claude-Code/*` | ✅ 已支援 |
| OpenCode | `OpenCode/*` | ✅ 已支援 |
| OAI-Searchbot | `OAI-Searchbot/*` | 🟡 可能支援 |
| GPTBot | `GPTBot/*` | ❓ 待確認 |

---

## 五、成效預估

### Token 節省

假設 Travis Daily 一篇文章平均：
- **HTML 渲染**：~8,000 tokens（含 UI、導航）
- **純 Markdown**：~1,500 tokens

**節省比例**：81%

### 對 Travis Daily 的好處

1. **SEO 升級**：未來 AI 搜尋引擎可能優先索引支援 markdown 的網站
2. **品牌形象**：展示技術前瞻性
3. **數據洞察**：透過 `X-Markdown-Tokens` header 收集訪問數據
4. **內容傳播**：AI agent 更容易引用、摘要我們的內容

---

## 六、實作步驟

### 第一階段（核心功能）
1. 建立 `middleware.js` 攔截內容頁面
2. 建立 `app/api/markdown/[...slug]/route.js`
3. 加入 `Content-Signal` 和 `X-Markdown-Tokens` headers
4. 測試：`curl -H "Accept: text/markdown" https://travis-daily.vercel.app/content/xxx`

### 第二階段（優化）
1. 更新 `public/robots.txt` 加入 Content Signals Policy
2. 監控 Vercel Analytics 追蹤 markdown 請求
3. 考慮加入快取機制

### 第三階段（推廣）
1. 撰寫部落格介紹這功能
2. 在首頁加入 `<link rel="alternate" type="text/markdown">`
3. 提交到 AI crawler 目錄

---

## 七、參考資料

### 官方文檔
- [Cloudflare Markdown for Agents - Docs](https://developers.cloudflare.com/fundamentals/reference/markdown-for-agents/)
- [Cloudflare Blog - Introducing Markdown for Agents](https://blog.cloudflare.com/markdown-for-agents/)
- [Content Signals Policy](https://blog.cloudflare.com/content-signals-policy/)

### 技術標準
- [MDN - HTTP Content Negotiation](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Content_negotiation)
- [Robots Exclusion Protocol (RFC 9309)](https://www.rfc-editor.org/rfc/rfc9309.html)

---

## 測試命令

```bash
# 本地測試
curl -v -H "Accept: text/markdown" http://localhost:3000/content/test

# 生產測試
curl -v -H "Accept: text/markdown" https://travis-daily.vercel.app/content/xxx

# 比較 token 數
echo "HTML tokens:"
curl -s https://travis-daily.vercel.app/content/test | wc -c | awk '{print $1/4}'

echo "Markdown tokens:"
curl -s -H "Accept: text/markdown" https://travis-daily.vercel.app/content/test | wc -c | awk '{print $1/4}'
```

---

**報告完成時間**：2026-02-15 05:43 GMT+8
