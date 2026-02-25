#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Firecrawl 爬蟲客戶端模組
負責與 Firecrawl API 互動，進行網頁爬取
"""

import os
import time
import logging
from typing import Dict, List, Optional, Any
from datetime import datetime

from firecrawl import FirecrawlApp
from rich.console import Console
from rich.progress import Progress, SpinnerColumn, TextColumn

console = Console()
logger = logging.getLogger(__name__)


class FirecrawlClient:
    """Firecrawl 爬蟲客戶端"""
    
    def __init__(self, api_key: Optional[str] = None, config: Optional[Dict] = None):
        """
        初始化 Firecrawl 客戶端
        
        Args:
            api_key: Firecrawl API Key
            config: 其他設定
        """
        self.api_key = api_key or os.getenv("FIRECRAWL_API_KEY")
        if not self.api_key:
            raise ValueError("需要提供 Firecrawl API Key")
        
        self.config = config or {}
        self.app = FirecrawlApp(api_key=self.api_key)
        self.rate_limit = self.config.get("rate_limit", 10)
        self.timeout = self.config.get("timeout", 60)
        self.delay = self.config.get("delay", 1.0)
        
        logger.info("Firecrawl 客戶端已初始化")
    
    def scrape_url(
        self, 
        url: str, 
        formats: Optional[List[str]] = None,
        extract_schema: Optional[Dict] = None
    ) -> Dict[str, Any]:
        """
        爬取單一網頁
        
        Args:
            url: 目標網址
            formats: 輸出格式 (markdown, html, screenshot, etc.)
            extract_schema: 結構化資料提取的 schema
            
        Returns:
            爬取結果字典
        """
        formats = formats or ["markdown"]
        
        with Progress(
            SpinnerColumn(),
            TextColumn("[bold blue]正在爬取: {task.description}"),
            console=console,
        ) as progress:
            task = progress.add_task(url, total=None)
            
            try:
                params = {
                    "formats": formats,
                    "onlyMainContent": True,
                    "waitFor": 2000,
                    "timeout": self.timeout,
                }
                
                if extract_schema:
                    params["extract"] = {"schema": extract_schema}
                
                result = self.app.scrape_url(url, params=params)
                
                # 速率限制
                time.sleep(self.delay)
                
                progress.update(task, completed=True)
                
                return {
                    "success": True,
                    "url": url,
                    "data": result,
                    "timestamp": datetime.now().isoformat(),
                    "formats": formats
                }
                
            except Exception as e:
                progress.update(task, completed=True)
                logger.error(f"爬取失敗 {url}: {str(e)}")
                return {
                    "success": False,
                    "url": url,
                    "error": str(e),
                    "timestamp": datetime.now().isoformat()
                }
    
    def crawl_website(
        self, 
        url: str, 
        max_pages: int = 10,
        include_paths: Optional[List[str]] = None,
        exclude_paths: Optional[List[str]] = None
    ) -> Dict[str, Any]:
        """
        爬取整個網站
        
        Args:
            url: 起始網址
            max_pages: 最大頁數
            include_paths: 包含的路徑模式
            exclude_paths: 排除的路徑模式
            
        Returns:
            爬取結果
        """
        console.print(f"[bold yellow]開始爬取網站: {url}[/bold yellow]")
        
        try:
            params = {
                "limit": max_pages,
                "scrapeOptions": {
                    "formats": ["markdown"],
                    "onlyMainContent": True
                }
            }
            
            if include_paths:
                params["includePaths"] = include_paths
            if exclude_paths:
                params["excludePaths"] = exclude_paths
            
            # 啟動爬取任務
            crawl_result = self.app.crawl_url(url, params=params)
            
            return {
                "success": True,
                "url": url,
                "data": crawl_result,
                "total_pages": len(crawl_result.get("data", [])),
                "timestamp": datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"網站爬取失敗 {url}: {str(e)}")
            return {
                "success": False,
                "url": url,
                "error": str(e),
                "timestamp": datetime.now().isoformat()
            }
    
    def search_and_scrape(
        self, 
        query: str, 
        limit: int = 5
    ) -> List[Dict[str, Any]]:
        """
        搜尋並爬取結果
        
        Args:
            query: 搜尋關鍵字
            limit: 結果數量
            
        Returns:
            爬取結果列表
        """
        console.print(f"[bold cyan]搜尋: {query}[/bold cyan]")
        
        try:
            # 使用 Firecrawl 的搜尋功能
            results = self.app.search(query, params={"limit": limit})
            
            scraped_data = []
            for item in results.get("data", []):
                url = item.get("url")
                if url:
                    scraped = self.scrape_url(url, formats=["markdown"])
                    if scraped["success"]:
                        scraped_data.append(scraped)
            
            return scraped_data
            
        except Exception as e:
            logger.error(f"搜尋失敗: {str(e)}")
            return []
    
    def batch_scrape(
        self, 
        urls: List[str], 
        formats: Optional[List[str]] = None
    ) -> List[Dict[str, Any]]:
        """
        批次爬取多個網址
        
        Args:
            urls: 網址列表
            formats: 輸出格式
            
        Returns:
            爬取結果列表
        """
        results = []
        
        with Progress(
            SpinnerColumn(),
            TextColumn("[progress.description]{task.description}"),
            console=console,
        ) as progress:
            task = progress.add_task(f"批次爬取 {len(urls)} 個網址...", total=len(urls))
            
            for url in urls:
                result = self.scrape_url(url, formats=formats)
                results.append(result)
                progress.advance(task)
        
        successful = sum(1 for r in results if r["success"])
        console.print(f"[bold green]✓ 完成: {successful}/{len(urls)} 個網址[/bold green]")
        
        return results
