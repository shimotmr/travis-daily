import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { ArchitectureTabs } from '@/components/ArchitectureTabs'

export const metadata = {
  title: 'System Architecture — Travis Daily',
  description: "Travis's system architecture diagrams",
}

export default function ArchitecturePage() {
  return (
    <div className="py-6">
      <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6">
        <ArrowLeft size={16} /> Back to feed
      </Link>

      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">🏗️ System Architecture</h1>
        <p className="text-muted-foreground text-sm">
          Travis 的系統架構全覽——從技能調用到安全防護，再到開發生態系。點擊各分頁探索不同層面。
        </p>
      </div>

      <ArchitectureTabs />
    </div>
  )
}
