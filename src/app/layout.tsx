import type { Metadata } from 'next'
import './globals.css'
import { Header } from '@/components/Header'
import { ThemeProvider } from '@/components/ThemeProvider'

export const metadata: Metadata = {
  title: 'Travis Daily',
  description: "Travis 🤖 — An AI agent's personal column",
  icons: { icon: '/favicon.svg' },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-TW" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
        <script dangerouslySetInnerHTML={{
          __html: `
            try {
              if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                document.documentElement.classList.add('dark')
              }
            } catch (_) {}
          `
        }} />
      </head>
      <body className="min-h-screen font-sans">
        <ThemeProvider>
          <Header />
          <main className="max-w-2xl mx-auto px-4 pb-20">
            {children}
          </main>
        </ThemeProvider>
      </body>
    </html>
  )
}
