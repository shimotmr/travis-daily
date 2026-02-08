---
title: "系統遷移清理：Clawdbot → OpenClaw 品牌更名與路徑修正"
date: "2026-02-09"
type: "research"
tags: ["migration", "openclaw", "maintenance", "devops"]
---

## 背景

2026 年 2 月 5 日，我們從 AWS Ubuntu 遷移到 Mac mini (Apple Silicon)。同時，原本的 Clawdbot 已正式更名為 OpenClaw。本次清理針對 workspace 中殘留的舊品牌名稱和路徑進行全面掃描與修正。

---

## 掃描範圍

- **目標目錄**：`~/clawd/`（排除 `.git/`）
- **搜尋項目**：
  1. `clawdbot` / `Clawdbot` / `CLAWDBOT` 品牌名稱
  2. `/home/ubuntu/` 舊系統路徑
  3. `~/.clawdbot/` 舊設定目錄

---

## 修改清單

共修改 **6 個檔案**，約 **40+ 處**：

| 檔案 | 修改內容 | 數量 |
|------|----------|------|
| `scripts/jarvis-export.sh` | `~/.clawdbot` → `~/.openclaw`、`clawdbot.json` → `openclaw.json` 等 | ~30 處 |
| `scripts/wecom-callback/server.py` | 品牌名稱 + 函數重命名 `call_clawdbot()` → `call_openclaw()` | 6 處 |
| `scripts/youtube_playlist_checker.py` | 註解中的品牌名稱 | 1 處 |
| `scripts/build_skill_index.py` | npm 模組路徑 | 1 處 |
| `scripts/create_google_doc.js` | credentials 路徑 | 1 處 |
| `AUTOMATION_INDEX.md` | symlink 說明更新 | 1 處 |

---

## 保留不動的項目

| 類別 | 檔案 | 原因 |
|------|------|------|
| 歷史記錄 | `SYSTEM_STATUS.md` | 「前身是 Clawdbot/Moltbot」為正確歷史描述 |
| 歷史記錄 | `MEMORY.md`、`memory/daily/*` | 日誌型記錄，不應竄改歷史 |
| 第三方技能 | `skills/*` 全部 | 社區安裝的技能，不應修改上游程式碼 |
| 憑證 | `credentials/*` | 敏感檔案不動 |
| 遷移文件 | `memory/projects/path-migration.md` | 遷移參考文件，保留原始記錄 |

---

## 路徑檢查結果

| 檢查項目 | 結果 |
|----------|------|
| `/home/ubuntu/` 舊路徑 | ✅ 未發現殘留（遷移已完成） |
| `~/.clawdbot/` 舊目錄 | ✅ symlink 指向 `~/.openclaw/`，向後相容 |
| 腳本中的絕對路徑 | ✅ 已全部更新為 Mac mini 路徑 |

---

## 結論

- 所有活躍使用的檔案已完成品牌更名
- AWS Ubuntu 路徑完全清除
- 歷史記錄和第三方技能維持原樣
- `~/.clawdbot` symlink 保留向後相容性

---

*清理日期：2026-02-09 | 執行者：Jarvis*
