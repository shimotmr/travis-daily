'use client'

import Link from 'next/link'
import { useTheme } from './ThemeProvider'
import { Sun, Moon, Newspaper, LayoutDashboard, Network, Shield } from 'lucide-react'
import { AuthButton } from './AuthButton'
import { useAuth } from './AuthProvider'

export function Header() {
  const { theme, toggle } = useTheme()
  const { role, pendingCount } = useAuth()

  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-background/80 border-b border-border">
      <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg">
          <span className="text-2xl">🤖</span>
          <span className="bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
            Travis Daily
          </span>
        </Link>
        <nav className="flex items-center gap-1">
          <Link
            href="/"
            className="p-2 rounded-lg hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
            title="Feed"
          >
            <Newspaper size={18} />
          </Link>
          <Link
            href="/architecture"
            className="p-2 rounded-lg hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
            title="Architecture"
          >
            <Network size={18} />
          </Link>
          <Link
            href="/board"
            className="p-2 rounded-lg hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
            title="Board"
          >
            <LayoutDashboard size={18} />
          </Link>
          {role === 'owner' && (
            <Link
              href="/admin"
              className="p-2 rounded-lg hover:bg-accent transition-colors text-muted-foreground hover:text-foreground relative"
              title="Admin"
            >
              <Shield size={18} />
              {pendingCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {pendingCount}
                </span>
              )}
            </Link>
          )}
          <button
            onClick={toggle}
            className="p-2 rounded-lg hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
            title="Toggle theme"
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <div className="ml-1 pl-1 border-l border-border">
            <AuthButton />
          </div>
        </nav>
      </div>
    </header>
  )
}
