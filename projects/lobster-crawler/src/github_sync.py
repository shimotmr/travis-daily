#!/usr/bin/env python3
# 🔒 AUDIT: 2026-03-08 | score=100/100 | full-audit
# -*- coding: utf-8 -*-
"""
GitHub 同步模組
負責將資料上傳至 GitHub 並進行版本控制
"""

import os
import json
import base64
import logging
from datetime import datetime
from typing import Dict, List, Optional, Any
from pathlib import Path

from github import Github, GithubException
from rich.console import Console

console = Console()
logger = logging.getLogger(__name__)


class GitHubSync:
    """GitHub 同步管理器"""
    
    def __init__(self, token: Optional[str] = None, config: Optional[Dict] = None):
        """
        初始化 GitHub 同步器
        
        Args:
            token: GitHub Personal Access Token
            config: 設定字典
        """
        self.token = token or os.getenv("GITHUB_TOKEN")
        if not self.token:
            raise ValueError("需要提供 GitHub Token")
        
        self.config = config or {}
        self.g = Github(self.token)
        self.repo_owner = self.config.get("repo_owner")
        self.repo_name = self.config.get("repo_name", "lobster-intelligence")
        self.branch = self.config.get("branch", "main")
        self.data_path = self.config.get("data_path", "data")
        self.reports_path = self.config.get("reports_path", "reports")
        
        self.repo = None
        self._init_repo()
        
        logger.info(f"GitHub 同步器已初始化 (倉庫: {self.repo_owner}/{self.repo_name})")
    
    def _init_repo(self):
        """初始化 GitHub 倉庫"""
        try:
            if self.repo_owner:
                self.repo = self.g.get_repo(f"{self.repo_owner}/{self.repo_name}")
            else:
                # 使用當前用戶
                user = self.g.get_user()
                self.repo_owner = user.login
                try:
                    self.repo = self.g.get_repo(f"{self.repo_owner}/{self.repo_name}")
                except GithubException:
                    # 倉庫不存在，創建新倉庫
                    console.print(f"[yellow]倉庫不存在，創建新倉庫: {self.repo_name}[/yellow]")
                    self.repo = user.create_repo(
                        self.repo_name,
                        description="🦞 龍蝦爬蟲大法 - 自動情報收集系統",
                        private=False,
                        auto_init=True
                    )
                    console.print(f"[bold green]✓ 創建倉庫成功[/bold green]")
        except Exception as e:
            logger.error(f"初始化倉庫失敗: {str(e)}")
            raise
    
    def upload_file(
        self, 
        local_path: str, 
        remote_path: Optional[str] = None,
        commit_message: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        上傳檔案到 GitHub
        
        Args:
            local_path: 本地檔案路徑
            remote_path: 遠端路徑（預設與本地相同）
            commit_message: 提交訊息
            
        Returns:
            上傳結果
        """
        remote_path = remote_path or local_path
        commit_message = commit_message or f"[龍蝦爬蟲] 更新 {os.path.basename(remote_path)}"
        
        try:
            with open(local_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # 檢查檔案是否已存在
            try:
                file = self.repo.get_contents(remote_path, ref=self.branch)
                # 更新檔案
                self.repo.update_file(
                    path=remote_path,
                    message=commit_message,
                    content=content,
                    sha=file.sha,
                    branch=self.branch
                )
                action = "更新"
            except GithubException:
                # 創建新檔案
                self.repo.create_file(
                    path=remote_path,
                    message=commit_message,
                    content=content,
                    branch=self.branch
                )
                action = "創建"
            
            logger.info(f"已{action}檔案: {remote_path}")
            return {
                "success": True,
                "action": action,
                "path": remote_path,
                "message": commit_message
            }
            
        except Exception as e:
            logger.error(f"上傳失敗 {local_path}: {str(e)}")
            return {
                "success": False,
                "path": remote_path,
                "error": str(e)
            }
    
    def upload_data(
        self, 
        data: Dict[str, Any], 
        filename: str,
        subfolder: Optional[str] = None,
        commit_message: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        上傳資料（JSON 格式）
        
        Args:
            data: 要上傳的資料
            filename: 檔案名稱
            subfolder: 子資料夾
            commit_message: 提交訊息
            
        Returns:
            上傳結果
        """
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        
        # 構建路徑
        remote_dir = f"{self.data_path}"
        if subfolder:
            remote_dir = f"{remote_dir}/{subfolder}"
        
        # 加入日期資料夾
        date_folder = datetime.now().strftime("%Y/%m/%d")
        remote_path = f"{remote_dir}/{date_folder}/{filename}"
        
        commit_message = commit_message or f"[龍蝦爬蟲] 自動更新情報 {timestamp}"
        
        try:
            content = json.dumps(data, ensure_ascii=False, indent=2)
            
            # 嘗試更新或創建
            try:
                file = self.repo.get_contents(remote_path, ref=self.branch)
                self.repo.update_file(
                    path=remote_path,
                    message=commit_message,
                    content=content,
                    sha=file.sha,
                    branch=self.branch
                )
                action = "更新"
            except GithubException:
                self.repo.create_file(
                    path=remote_path,
                    message=commit_message,
                    content=content,
                    branch=self.branch
                )
                action = "創建"
            
            console.print(f"[bold green]✓ 已{action}: {remote_path}[/bold green]")
            
            return {
                "success": True,
                "action": action,
                "path": remote_path,
                "url": f"https://github.com/{self.repo_owner}/{self.repo_name}/blob/{self.branch}/{remote_path}"
            }
            
        except Exception as e:
            logger.error(f"上傳資料失敗: {str(e)}")
            return {
                "success": False,
                "error": str(e)
            }
    
    def upload_report(
        self, 
        report_content: str, 
        report_name: str,
        report_type: str = "markdown"
    ) -> Dict[str, Any]:
        """
        上傳分析報告
        
        Args:
            report_content: 報告內容
            report_name: 報告名稱
            report_type: 報告類型 (markdown, html)
            
        Returns:
            上傳結果
        """
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        date_folder = datetime.now().strftime("%Y/%m/%d")
        
        ext = "md" if report_type == "markdown" else "html"
        filename = f"{report_name}_{timestamp}.{ext}"
        remote_path = f"{self.reports_path}/{date_folder}/{filename}"
        
        commit_message = f"[龍蝦爬蟲] 新增報告 {report_name}"
        
        try:
            self.repo.create_file(
                path=remote_path,
                message=commit_message,
                content=report_content,
                branch=self.branch
            )
            
            url = f"https://github.com/{self.repo_owner}/{self.repo_name}/blob/{self.branch}/{remote_path}"
            console.print(f"[bold green]✓ 報告已上傳: {url}[/bold green]")
            
            return {
                "success": True,
                "path": remote_path,
                "url": url
            }
            
        except Exception as e:
            logger.error(f"上傳報告失敗: {str(e)}")
            return {
                "success": False,
                "error": str(e)
            }
    
    def sync_batch(
        self, 
        items: List[Dict[str, Any]],
        batch_name: str = "batch"
    ) -> Dict[str, Any]:
        """
        批次同步多個資料項目
        
        Args:
            items: 資料項目列表
            batch_name: 批次名稱
            
        Returns:
            同步結果
        """
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        batch_data = {
            "batch_name": batch_name,
            "timestamp": datetime.now().isoformat(),
            "total_items": len(items),
            "items": items
        }
        
        filename = f"{batch_name}_{timestamp}.json"
        result = self.upload_data(batch_data, filename, commit_message=f"[龍蝦爬蟲] 批次同步 {batch_name}")
        
        return result
    
    def get_latest_commit(self) -> Optional[str]:
        """取得最新 commit SHA"""
        try:
            commits = self.repo.get_commits(sha=self.branch)
            return commits[0].sha if commits.totalCount > 0 else None
        except Exception as e:
            logger.error(f"取得最新 commit 失敗: {str(e)}")
            return None
    
    def create_tag(self, tag_name: str, message: str) -> Dict[str, Any]:
        """
        建立 Git Tag
        
        Args:
            tag_name: 標籤名稱
            message: 標籤訊息
            
        Returns:
            建立結果
        """
        try:
            sha = self.get_latest_commit()
            if not sha:
                return {"success": False, "error": "無法取得最新 commit"}
            
            self.repo.create_git_tag_and_release(
                tag=tag_name,
                tag_message=message,
                release_name=tag_name,
                release_message=message,
                object=sha,
                type="commit"
            )
            
            return {
                "success": True,
                "tag": tag_name,
                "sha": sha
            }
            
        except Exception as e:
            logger.error(f"建立標籤失敗: {str(e)}")
            return {"success": False, "error": str(e)}
