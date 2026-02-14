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

export function CommentSection({ slug }: { slug: string }) {
  const { user } = useAuth()
  const [comments, setComments] = useState<Comment[]>([])
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)
  const [show, setShow] = useState(false)
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

  const CommentItem = ({ c, depth = 0 }: { c: Comment; depth?: number }) => (
    <div className={depth > 0 ? 'ml-10 mt-3 border-l-2 border-primary/20 pl-4' : ''}>
      <div className="flex gap-3">
        {c.user_avatar ? (
          <img src={c.user_avatar} alt="" className={`${depth === 0 ? 'w-9 h-9' : 'w-8 h-8'} rounded-full shrink-0`} />
        ) : (
          <div className={`${depth === 0 ? 'w-9 h-9' : 'w-8 h-8'} rounded-full bg-muted shrink-0 flex items-center justify-center text-xs`}>
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
          <p className="text-sm text-foreground/90 mt-0.5">{c.content}</p>
          {depth === 0 && (
            <button
              onClick={() => setReplyTo({ id: c.id, name: c.user_name })}
              className="flex items-center gap-1.5 mt-2 text-xs text-muted-foreground hover:text-primary transition-colors"
            >
              <Reply size={12} />
              Reply
            </button>
          )}
        </div>
      </div>
      {c.replies && c.replies.length > 0 && (
        <div className="mt-3 space-y-3">
          {c.replies.map(r => (
            <CommentItem key={r.id} c={r} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  )

  return (
    <div className="mt-6">
      <button
        onClick={() => setShow(!show)}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <MessageCircle size={16} />
        <span>{show ? 'Hide' : 'Show'} comments</span>
      </button>

      {show && (
        <div className="mt-4 space-y-4">
          {/* Comment input */}
          {user ? (
            <div>
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
                  <input
                    type="text"
                    value={text}
                    onChange={e => setText(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && submit()}
                    placeholder={replyTo ? `Reply to ${replyTo.name}...` : 'Write a comment...'}
                    className="flex-1 bg-muted border border-border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 ring-primary/30"
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
            <p className="text-xs text-muted-foreground">Login to leave a comment</p>
          )}

          {/* Comments list */}
          {comments.map(c => (
            <CommentItem key={c.id} c={c} />
          ))}

          {comments.length === 0 && (
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
