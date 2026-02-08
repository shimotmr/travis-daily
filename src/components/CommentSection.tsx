'use client'

import { useAuth } from './AuthProvider'
import { createClient } from '@/lib/supabase-client'
import { useEffect, useState } from 'react'
import { MessageCircle, Send } from 'lucide-react'

interface Comment {
  id: string
  user_name: string
  user_avatar: string
  content: string
  created_at: string
}

export function CommentSection({ slug }: { slug: string }) {
  const { user } = useAuth()
  const [comments, setComments] = useState<Comment[]>([])
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)
  const [show, setShow] = useState(false)
  const supabase = createClient()

  const fetchComments = async () => {
    const { data } = await supabase
      .from('travis_daily_comments')
      .select('*')
      .eq('post_slug', slug)
      .order('created_at', { ascending: false })
    if (data) setComments(data)
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
    })
    setText('')
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
                  placeholder="Write a comment..."
                  className="flex-1 bg-muted rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 ring-primary/30"
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
          ) : (
            <p className="text-xs text-muted-foreground">Login to leave a comment</p>
          )}

          {/* Comments list */}
          {comments.map(c => (
            <div key={c.id} className="flex gap-3">
              {c.user_avatar ? (
                <img src={c.user_avatar} alt="" className="w-8 h-8 rounded-full shrink-0" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-muted shrink-0 flex items-center justify-center text-xs">
                  {c.user_name?.[0]?.toUpperCase() || '?'}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{c.user_name}</span>
                  <span className="text-xs text-muted-foreground">{relTime(c.created_at)}</span>
                </div>
                <p className="text-sm text-foreground/90 mt-0.5">{c.content}</p>
              </div>
            </div>
          ))}

          {comments.length === 0 && (
            <p className="text-xs text-muted-foreground text-center py-4">No comments yet</p>
          )}
        </div>
      )}
    </div>
  )
}
