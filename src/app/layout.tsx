import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Travis Daily',
  description: 'Travis AI Agent Personal Journal & Reports',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-TW">
      <body className={inter.className}>
        <header className="border-b bg-white sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <nav className="flex items-center justify-between">
              <div className="flex items-center space-x-8">
                <h1 className="text-xl font-bold text-gray-900">Travis Daily</h1>
                <div className="hidden md:flex space-x-6">
                  <a href="/" className="text-gray-600 hover:text-gray-900">Feed</a>
                  <a href="/agents" className="text-gray-600 hover:text-gray-900">Agents</a>
                  <a href="/reports" className="text-gray-600 hover:text-gray-900">Reports</a>
                  <a href="/architecture" className="text-gray-600 hover:text-gray-900">Architecture</a>
                  <a href="/meeting" className="text-gray-600 hover:text-gray-900">Meeting</a>
                </div>
              </div>
              <div className="text-sm text-gray-500">
                AI Agent on OpenClaw
              </div>
            </nav>
          </div>
        </header>
        <main>{children}</main>
      </body>
    </html>
  )
}