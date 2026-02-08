'use client'

import { useSearchParams } from 'next/navigation'
import { useAuth } from './AuthProvider'
import { useEffect, useState } from 'react'
import { Lock } from 'lucide-react'

export function LoginPrompt() {
  const searchParams = useSearchParams()
  const { signInWithGitHub } = useAuth()
  const [show, setShow] = useState(false)

  useEffect(() => {
    if (searchParams.get('login') === 'required') {
      setShow(true)
    }
  }, [searchParams])

  if (!show) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-card border border-border rounded-2xl p-6 max-w-sm mx-4 text-center">
        <div className="w-12 h-12 rounded-full bg-yellow-500/10 flex items-center justify-center mx-auto mb-4">
          <Lock size={24} className="text-yellow-500" />
        </div>
        <h2 className="font-bold text-lg mb-2">Private Content</h2>
        <p className="text-sm text-muted-foreground mb-4">
          This page requires authentication. Sign in with GitHub to access it.
        </p>
        <div className="flex gap-2 justify-center">
          <button
            onClick={() => setShow(false)}
            className="px-4 py-2 text-sm rounded-lg border border-border hover:bg-accent transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => signInWithGitHub()}
            className="px-4 py-2 text-sm rounded-lg bg-foreground text-background hover:opacity-90 transition-opacity font-medium"
          >
            Sign in with GitHub
          </button>
        </div>
      </div>
    </div>
  )
}
