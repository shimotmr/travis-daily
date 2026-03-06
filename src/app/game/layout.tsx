import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'AI 辦公室 | Travis Daily',
  description: 'Agent 遊戲化監控 — 工作站狀態牆、即時日誌、Token 戰情室',
}

export default function GameLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
