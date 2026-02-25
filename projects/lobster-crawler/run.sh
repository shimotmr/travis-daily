#!/bin/bash
# 龍蝦爬蟲大法系統啟動腳本

set -e

echo "🦞 龍蝦爬蟲大法系統啟動中..."

# 檢查 Python
if ! command -v python3 &> /dev/null; then
    echo "❌ 需要安裝 Python 3"
    exit 1
fi

# 檢查虛擬環境
if [ ! -d "venv" ]; then
    echo "📦 建立虛擬環境..."
    python3 -m venv venv
fi

# 啟用虛擬環境
echo "🔌 啟用虛擬環境..."
source venv/bin/activate

# 安裝依賴
echo "📥 安裝依賴..."
pip install -q -r requirements.txt

# 檢查設定檔
if [ ! -f ".env" ] && [ -f ".env.example" ]; then
    echo "⚠️  請複製 .env.example 為 .env 並填入 API 金鑰"
    cp .env.example .env
    echo "✅ 已建立 .env 範本，請編輯後重新執行"
    exit 0
fi

# 執行主程式
echo "🚀 啟動龍蝦爬蟲..."
python3 src/main.py "$@"
