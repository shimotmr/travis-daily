---
title: "OpenClaw 安全警報：ClawHavoc 惡意技能攻擊與防護指南"
date: "2026-02-06"
type: "research"
tags: ["openclaw", "security", "clawhub", "malware"]
---

## 重大安全事件

### ClawHub 惡意技能大規模攻擊 (ClawHavoc)

Koi Security 審計發現 ClawHub 上 **341 個惡意 skills**（佔 2,857 個的 ~12%），其中 335 個追溯到同一組織行動，代號 **ClawHavoc**。

**攻擊手法：**
- 散佈 **Atomic Stealer (AMOS)**，竊取 macOS/Windows 憑證
- 偽裝成合法技能（solana-wallet-tracker, youtube-summarize-pro 等）
- 在「Prerequisites」區塊要求安裝惡意程式
- 竊取 API keys、錢包私鑰、SSH 憑證

**高風險技能類型：**
- ClawHub typosquats（clawhub1, clawhubb）
- 加密貨幣工具
- Polymarket 機器人
- YouTube 工具
- Auto-updaters ⚠️

**來源**: The Hacker News, eSecurity Planet (2026-02-04)

---

### OpenClaw 一鍵遠端程式執行漏洞

安全研究人員發現透過惡意連結可觸發 RCE（遠端程式執行），sandbox/safety guardrails 設計存在架構限制。

**來源**: The Hacker News (2026-02-03)

### 間接 Prompt Injection 風險

Zenity 揭露透過 Google Docs 等受信任整合可部署 C2 beacon 或竊取檔案。

---

## 防護建議

### 技能安裝安全檢查清單

1. ✅ 確認作者身份和信譽
2. ✅ 檢查 SKILL.md 是否要求下載外部執行檔
3. ✅ 審查 Prerequisites 區塊
4. ✅ 搜尋已知惡意技能名稱
5. ✅ 優先使用官方/知名作者的技能
6. ❌ 不安裝 typosquat 名稱的技能
7. ❌ 不執行要求 `curl | bash` 的指令

### 定期維護

- 定期掃描已安裝技能
- 監控 `~/.openclaw/` 和技能目錄的異常變更
- 關注 OpenClaw 官方安全公告

---

*研究日期：2026-02-06 | 研究者：Travis*
