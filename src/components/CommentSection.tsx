'use client'

import { useAuth } from './AuthProvider'
import { createClient } from '@/lib/supabase-client'
import { useEffect, useState } from 'react'
import { MessageCircle, Send, Reply, X } from 'lucide-react'

interface Comment {
  id: string
  user_name: string
  user_avatar: string
  content: string
  created_at: string
  agent_id?: string
  parent_id?: string
  replies?: Comment[]
}

// Flatten nested comments into a single list with parent reference
function flattenComments(comments: Comment[]): (Comment & { replyToName?: string })[] {
  const flat: (Comment & { replyToName?: string })[] = []
  const nameById: Record<string, string> = {}

  // First pass: build name map from top-level
  function collectNames(list: Comment[]) {
    for (const c of list) {
      nameById[c.id] = c.user_name
      if (c.replies) collectNames(c.replies)
    }
  }
  collectNames(comments)

  // Second pass: flatten
  function walk(list: Comment[], parentName?: string) {
    for (const c of list) {
      flat.push({ ...c, replyToName: parentName })
      if (c.replies && c.replies.length > 0) {
        walk(c.replies, c.user_name)
      }
    }
  }
  walk(comments)
  return flat
}

export function CommentSection({ slug }: { slug: string }) {
  const { user } = useAuth()
  const [comments, setComments] = useState<Comment[]>([])
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)
  const [show, setShow] = useState(true)
  const [replyTo, setReplyTo] = useState<{ id: string; name: string } | null>(null)
  const supabase = createClient()

  const fetchComments = async () => {
    const res = await fetch(`/api/comments?slug=${encodeURIComponent(slug)}`)
    if (res.ok) {
      const data = await res.json()
      setComments(data)
    }
  }

  useEffect(() => {
    if (show) fetchComments()
  }, [slug, show])

  const submit = async () => {
    if (!user || !text.trim() || loading) return
    setLoading(true)
    await supabase.from('travis_daily_comments').insert({
      post_slug: slug,
      user_id: user.id,
      user_name: user.user_metadata?.user_name || user.email || 'Anonymous',
      user_avatar: user.user_metadata?.avatar_url || '',
      content: text.trim(),
      parent_id: replyTo?.id || null,
    })
    setText('')
    setReplyTo(null)
    await fetchComments()
    setLoading(false)
  }

  const relTime = (d: string) => {
    const diff = Date.now() - new Date(d).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 1) return 'just now'
    if (mins < 60) return `${mins}m ago`
    const hrs = Math.floor(mins / 60)
    if (hrs < 24) return `${hrs}h ago`
    return `${Math.floor(hrs / 24)}d ago`
  }

  const flat = flattenComments(comments)

  return (
    <div className="mt-6">
      <button
        onClick={() => setShow(!show)}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <MessageCircle size={16} />
        <span>{show ? 'Hide' : 'Show'} comments ({flat.length})</span>
      </button>

      {show && (
        <div className="mt-4 space-y-1">
          {/* Comment input */}
          {user ? (
            <div className="mb-4">
              {replyTo && (
                <div className="flex items-center gap-2 mb-2 text-xs text-muted-foreground">
                  <Reply size={12} />
                  <span>Replying to <strong>{replyTo.name}</strong></span>
                  <button onClick={() => setReplyTo(null)} className="text-red-400 hover:text-red-300"><X size={12} /></button>
                </div>
              )}
              <div className="flex gap-3">
                {user.user_metadata?.avatar_url && (
                  <img src={user.user_metadata.avatar_url} alt="" className="w-8 h-8 rounded-full shrink-0" />
                )}
                <div className="flex-1 flex gap-2">
                  <textarea
                    value={text}
                    onChange={e => {
                      setText(e.target.value)
                      e.target.style.height = 'auto'
                      e.target.style.height = Math.min(e.target.scrollHeight, 160) + 'px'
                    }}
                    onKeyDown={e => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault()
                        submit()
                      }
                    }}
                    placeholder={replyTo ? `Reply to ${replyTo.name}...` : 'Write a comment...'}
                    rows={3}
                    className="flex-1 bg-muted border border-border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 ring-primary/30 resize-none"
                  />
                  <button
                    onClick={submit}
                    disabled={!text.trim() || loading}
                    className="p-2 rounded-lg bg-primary text-primary-foreground disabled:opacity-50 hover:opacity-90 transition-opacity"
                  >
                    <Send size={14} />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground mb-4">Login to leave a comment</p>
          )}

          {/* Flat comments list — X/Threads style */}
          {flat.map(c => (
            <div key={c.id} className="py-3 border-b border-border/50 last:border-0">
              <div className="flex gap-3">
                {c.user_avatar ? (
                  <img src={c.user_avatar} alt="" className="w-9 h-9 rounded-full shrink-0" />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-muted shrink-0 flex items-center justify-center text-xs font-medium">
                    {c.user_name?.[0]?.toUpperCase() || '?'}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium">{c.user_name}</span>
                    {c.agent_id && (
                      <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-primary/15 text-primary uppercase tracking-wider">
                        AI Agent
                      </span>
                    )}
                    <span className="text-xs text-muted-foreground">{relTime(c.created_at)}</span>
                  </div>
                  {c.replyToName && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      <span className="text-primary/70">↩ {c.replyToName}</span>
                    </p>
                  )}
                  <p className="text-sm text-foreground/90 mt-1 whitespace-pre-wrap break-words">{c.content}</p>
                  <button
                    onClick={() => setReplyTo({ id: c.id, name: c.user_name })}
                    className="flex items-center gap-1.5 mt-1.5 text-xs text-muted-foreground hover:text-primary transition-colors"
                  >
                    <Reply size={12} />
                    Reply
                  </button>
                </div>
              </div>
            </div>
          ))}

          {flat.length === 0 && (
            <div className="text-center py-8">
              <MessageCircle size={24} className="mx-auto mb-2 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">No comments yet</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
