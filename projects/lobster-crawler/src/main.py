#!/usr/bin/env python3
# 🔒 AUDIT: 2026-03-08 | score=100/100 | full-audit
# -*- coding: utf-8 -*-
"""
龍蝦爬蟲大法系統 - 主程式
全自動跨平台情報流系統

功能：
1. 串接 Firecrawl 爬蟲，自動爬取目標網頁
2. 實現自動翻譯功能（中英互譯）
3. 上傳 GitHub 並同步資料
4. 產出分析報表

作者: Blake (OpenClaw Builder Agent)
版本: 1.0.0
"""

import os
import sys
import argparse
import logging
import yaml
from datetime import datetime
from pathlib import Path
from typing import List, Dict, Any, Optional

from rich.console import Console
from rich.panel import Panel
from rich.text import Text
from rich.progress import Progress, SpinnerColumn, TextColumn

# 導入自訂模組
from firecrawl_client import FirecrawlClient
from translator import Translator
from github_sync import GitHubSync
from analyzer import ReportGenerator

# 設定日誌
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

console = Console()


def load_config(config_path: str = "config/settings.yaml") -> Dict[str, Any]:
    """載入設定檔"""
    try:
        with open(config_path, 'r', encoding='utf-8') as f:
            return yaml.safe_load(f)
    except Exception as e:
        logger.warning(f"無法載入設定檔 {config_path}: {e}")
        return {}


def show_banner():
    """顯示程式橫幅"""
    banner = """
    🦞 龍蝦爬蟲大法系統 🦞
    ════════════════════════
    全自動跨平台情報流系統
    
    功能：
    🔥 Firecrawl 智慧爬蟲
    🌐 自動中英翻譯
    📊 分析報表產出
    🔄 GitHub 自動同步
    """
    console.print(Panel(banner, title="Lobster Crawler v1.0.0", border_style="blue"))


class LobsterCrawler:
    """龍蝦爬蟲主控制器"""
    
    def __init__(self, config: Dict[str, Any]):
        """
        初始化爬蟲系統
        
        Args:
            config: 設定字典
        """
        self.config = config
        
        # 初始化各模組
        self.firecrawl_config = config.get("firecrawl", {})
        self.translation_config = config.get("translation", {})
        self.github_config = config.get("github", {})
        self.report_config = config.get("report", {})
        
        # 建立輸出目錄
        Path("data").mkdir(exist_ok=True)
        Path("reports").mkdir(exist_ok=True)
        
        logger.info("龍蝦爬蟲系統已初始化")
    
    def crawl_url(
        self, 
        url: str, 
        translate: bool = True,
        category: str = "general"
    ) -> Dict[str, Any]:
        """
        爬取單一網址
        
        Args:
            url: 目標網址
            translate: 是否翻譯
            category: 分類
            
        Returns:
            處理結果
        """
        console.print(f"\n[bold blue]🚀 開始處理: {url}[/bold blue]")
        
        try:
            # 1. 使用 Firecrawl 爬取
            firecrawl = FirecrawlClient(
                api_key=self.firecrawl_config.get("api_key"),
                config=self.firecrawl_config
            )
            
            result = firecrawl.scrape_url(url, formats=["markdown", "html"])
            
            if not result["success"]:
                console.print(f"[bold red]✗ 爬取失敗: {result.get('error')}[/bold red]")
                return result
            
            # 提取內容
            data = result["data"]
            content = ""
            title = ""
            
            if isinstance(data, dict):
                if "markdown" in data:
                    content = data["markdown"]
                elif "html" in data:
                    content = data["html"]
                elif "content" in data:
                    content = data["content"]
                
                title = data.get("metadata", {}).get("title", "")
                if not title and "title" in data:
                    title = data["title"]
            
            # 2. 翻譯（如果需要）
            processed_data = {
                "url": url,
                "title": title,
                "content": content,
                "category": category,
                "crawled_at": datetime.now().isoformat(),
                "source_data": data
            }
            
            if translate and self.translation_config.get("enabled", True):
                console.print("[bold yellow]🌐 進行翻譯...[/bold yellow]")
                translator = Translator(
                    service=self.translation_config.get("service", "google"),
                    config=self.translation_config
                )
                
                # 翻譯文件
                fields = ["title", "content"]
                processed_data = translator.translate_document(processed_data, fields)
                
                console.print(f"[bold green]✓ 翻譯完成[/bold green]")
            
            return {
                "success": True,
                "data": processed_data
            }
            
        except Exception as e:
            logger.error(f"處理失敗: {str(e)}")
            return {
                "success": False,
                "url": url,
                "error": str(e)
            }
    
    def crawl_multiple(
        self, 
        urls: List[str], 
        translate: bool = True,
        category: str = "general"
    ) -> List[Dict[str, Any]]:
        """
        爬取多個網址
        
        Args:
            urls: 網址列表
            translate: 是否翻譯
            category: 分類
            
        Returns:
            處理結果列表
        """
        results = []
        
        with Progress(
            SpinnerColumn(),
            TextColumn("[progress.description]{task.description}"),
            console=console,
        ) as progress:
            task = progress.add_task(f"處理 {len(urls)} 個網址...", total=len(urls))
            
            for url in urls:
                result = self.crawl_url(url, translate, category)
                if result["success"]:
                    results.append(result["data"])
                progress.advance(task)
        
        return results
    
    def sync_to_github(self, items: List[Dict[str, Any]], batch_name: str = "batch") -> Dict[str, Any]:
        """
        同步資料到 GitHub
        
        Args:
            items: 資料項目列表
            batch_name: 批次名稱
            
        Returns:
            同步結果
        """
        if not self.github_config.get("token"):
            console.print("[yellow]⚠ 未設定 GitHub Token，跳過同步[/yellow]")
            return {"success": False, "skipped": True}
        
        console.print("\n[bold blue]🔄 開始同步到 GitHub...[/bold blue]")
        
        try:
            github = GitHubSync(
                token=self.github_config.get("token"),
                config=self.github_config
            )
            
            result = github.sync_batch(items, batch_name)
            
            if result["success"]:
                console.print(f"[bold green]✓ GitHub 同步成功[/bold green]")
                console.print(f"[dim]URL: {result.get('url', 'N/A')}[/dim]")
            else:
                console.print(f"[bold red]✗ GitHub 同步失敗[/bold red]")
            
            return result
            
        except Exception as e:
            logger.error(f"GitHub 同步失敗: {str(e)}")
            return {"success": False, "error": str(e)}
    
    def generate_report(
        self, 
        items: List[Dict[str, Any]],
        report_name: str = "情報報告",
        output_format: str = "markdown",
        upload_to_github: bool = True
    ) -> Dict[str, Any]:
        """
        產生分析報表
        
        Args:
            items: 資料項目列表
            report_name: 報告名稱
            output_format: 輸出格式
            upload_to_github: 是否上傳到 GitHub
            
        Returns:
            報告結果
        """
        console.print("\n[bold blue]📊 產生分析報表...[/bold blue]")
        
        try:
            generator = ReportGenerator(config=self.report_config)
            
            # 顯示摘要
            generator.display_summary(items)
            
            # 產生報告
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            
            if output_format == "markdown":
                content = generator.generate_markdown_report(items, report_name)
                ext = "md"
            else:
                content = generator.generate_html_report(items, report_name)
                ext = "html"
            
            filename = f"{report_name.replace(' ', '_')}_{timestamp}.{ext}"
            
            # 儲存到本地
            local_path = generator.save_report(content, filename, "reports")
            console.print(f"[bold green]✓ 報告已儲存: {local_path}[/bold green]")
            
            # 上傳到 GitHub
            github_url = None
            if upload_to_github and self.github_config.get("token"):
                try:
                    github = GitHubSync(
                        token=self.github_config.get("token"),
                        config=self.github_config
                    )
                    result = github.upload_report(content, report_name, output_format)
                    if result["success"]:
                        github_url = result.get("url")
                except Exception as e:
                    logger.error(f"報告上傳失敗: {str(e)}")
            
            return {
                "success": True,
                "local_path": local_path,
                "github_url": github_url,
                "format": output_format,
                "total_items": len(items)
            }
            
        except Exception as e:
            logger.error(f"報表產生失敗: {str(e)}")
            return {"success": False, "error": str(e)}
    
    def run_intelligence_flow(
        self, 
        urls: List[str],
        category: str = "general",
        report_name: str = "情報分析報告",
        skip_github: bool = False
    ) -> Dict[str, Any]:
        """
        執行完整情報流
        
        Args:
            urls: 目標網址列表
            category: 分類
            report_name: 報告名稱
            skip_github: 是否跳過 GitHub 同步
            
        Returns:
            執行結果
        """
        show_banner()
        
        start_time = datetime.now()
        console.print(f"\n[dim]開始時間: {start_time.strftime('%Y-%m-%d %H:%M:%S')}\n[/dim]")
        
        # Step 1: 爬取
        console.print("[bold cyan]═══ Step 1: 智慧爬取 ═══[/bold cyan]")
        items = self.crawl_multiple(urls, translate=True, category=category)
        
        if not items:
            console.print("[bold red]✗ 沒有成功爬取的資料[/bold red]")
            return {"success": False, "error": "無資料"}
        
        # Step 2: 儲存本地資料
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        local_data_path = f"data/crawled_{timestamp}.json"
        
        import json
        with open(local_data_path, 'w', encoding='utf-8') as f:
            json.dump(items, f, ensure_ascii=False, indent=2)
        console.print(f"[dim]資料已儲存: {local_data_path}[/dim]")
        
        # Step 3: GitHub 同步
        github_result = None
        if not skip_github:
            console.print("\n[bold cyan]═══ Step 2: GitHub 同步 ═══[/bold cyan]")
            github_result = self.sync_to_github(items, category)
        
        # Step 4: 產生報表
        console.print("\n[bold cyan]═══ Step 3: 產生報表 ═══[/bold cyan]")
        report_result = self.generate_report(
            items, 
            report_name,
            upload_to_github=not skip_github
        )
        
        # 完成摘要
        end_time = datetime.now()
        duration = (end_time - start_time).total_seconds()
        
        console.print(f"\n[bold green]═══════════════════════════════════[/bold green]")
        console.print(f"[bold green]🎉 情報流執行完成！[/bold green]")
        console.print(f"[bold green]═══════════════════════════════════[/bold green]")
        console.print(f"處理時間: {duration:.1f} 秒")
        console.print(f"爬取項目: {len(items)} 個")
        
        if report_result.get("success"):
            console.print(f"報告位置: {report_result.get('local_path')}")
            if report_result.get("github_url"):
                console.print(f"GitHub: {report_result['github_url']}")
        
        return {
            "success": True,
            "items_count": len(items),
            "duration": duration,
            "local_data_path": local_data_path,
            "github_result": github_result,
            "report_result": report_result
        }


def main():
    """主程式入口"""
    parser = argparse.ArgumentParser(
        description="🦞 龍蝦爬蟲大法系統 - 全自動跨平台情報流",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
範例:
  # 爬取單一網頁
  python src/main.py --url "https://example.com"
  
  # 爬取多個網頁並產生報告
  python src/main.py --urls "url1,url2,url3" --report "科技新聞"
  
  # 爬取但不翻譯
  python src/main.py --url "https://example.com" --no-translate
  
  # 本地模式（不上傳 GitHub）
  python src/main.py --url "https://example.com" --local
        """
    )
    
    parser.add_argument("--url", type=str, help="單一網址")
    parser.add_argument("--urls", type=str, help="多個網址（逗號分隔）")
    parser.add_argument("--category", type=str, default="general", help="分類")
    parser.add_argument("--report", type=str, default="情報報告", help="報告名稱")
    parser.add_argument("--format", type=str, default="markdown", choices=["markdown", "html"], help="報告格式")
    parser.add_argument("--no-translate", action="store_true", help="不進行翻譯")
    parser.add_argument("--local", action="store_true", help="本地模式（不上傳 GitHub）")
    parser.add_argument("--config", type=str, default="config/settings.yaml", help="設定檔路徑")
    
    args = parser.parse_args()
    
    # 載入設定
    config = load_config(args.config)
    
    # 從環境變數取得 API 金鑰
    if not config.get("firecrawl", {}).get("api_key"):
        config["firecrawl"]["api_key"] = os.getenv("FIRECRAWL_API_KEY")
    
    if not config.get("github", {}).get("token"):
        config["github"]["token"] = os.getenv("GITHUB_TOKEN")
    
    # 準備網址列表
    urls = []
    if args.url:
        urls.append(args.url)
    if args.urls:
        urls.extend([u.strip() for u in args.urls.split(",")])
    
    if not urls:
        # 使用預設測試網址
        console.print("[yellow]未提供網址，使用預設測試網址...[/yellow]")
        urls = [
            "https://news.ycombinator.com",
            "https://www.reddit.com/r/MachineLearning"
        ]
    
    # 執行
    crawler = LobsterCrawler(config)
    result = crawler.run_intelligence_flow(
        urls=urls,
        category=args.category,
        report_name=args.report,
        skip_github=args.local
    )
    
    return 0 if result.get("success") else 1


if __name__ == "__main__":
    sys.exit(main())
