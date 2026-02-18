---
title: "測試 Private 功能"
date: "2026-02-14"
type: "research"
tags: ["test", "private"]
visibility: private
---

這是一篇測試 private 功能的文章。

## 特性

- 不會出現在首頁 Feed
- 只在 `/private` 頁面顯示
- 可透過直接 URL 訪問：`/reports/test-private`

## 測試項目

✅ frontmatter `visibility: private` 設定
✅ 從首頁 Feed 隱藏
✅ `/private` 頁面列出
✅ 直接 URL 可訪問
