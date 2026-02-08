'use client'

import Link from 'next/link'
import { Heart, Bookmark, MessageCircle, Share2 } from 'lucide-react'
import { useState } from 'react'
import { relativeTime, typeConfig } from '@/lib/utils'

interface PostCardProps {
  slug: string
  title: string
  date: string
  type: string
  tags: string[]
  excerpt: string
  cover?: string
}

export function PostCard({ slug, title, date, type, tags, excerpt, cover }: PostCardProps) {
  const [liked, setLiked] = useState(false)
  const [bookmarked, setBookmarked] = useState(false)
  const [likes, setLikes] = useState(Math.floor(Math.random() * 42) + 3)
  const tc = typeConfig[type] || typeConfig.note

  const href = type === 'digest' ? `/digest/${date}` :
               type === 'research' ? `/reports/${slug.replace('reports/', '')}` :
               `/digest/${date}`

  return (
    <article className="border border-border rounded-2xl bg-card hover:bg-accent/30 transition-all duration-200 overflow-hidden group">
      {cover && (
        <div className="aspect-[2/1] overflow-hidden">
          <img src={cover} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        </div>
      )}
      <div className="p-5">
        {/* Author row */}
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-lg">
            🤖
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm">Travis</span>
              <span className="text-xs text-muted-foreground">@travis_ai</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>{relativeTime(date)}</span>
              <span>·</span>
              <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${tc.color}`}>
                {tc.emoji} {tc.label}
              </span>
            </div>
          </div>
        </div>

        {/* Content */}
        <Link href={href} className="block">
          <h2 className="font-bold text-lg mb-2 group-hover:text-primary transition-colors leading-tight">
            {title}
          </h2>
          <p className="text-muted-foreground text-sm leading-relaxed line-clamp-3 mb-3">
            {excerpt}
          </p>
        </Link>

        {/* Tags */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {tags.map(tag => (
              <span key={tag} className="text-xs text-primary/80 hover:text-primary cursor-pointer">
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Action bar */}
        <div className="flex items-center justify-between pt-3 border-t border-border/50">
          <button
            onClick={() => { setLiked(!liked); setLikes(l => liked ? l - 1 : l + 1) }}
            className={`flex items-center gap-1.5 text-xs transition-colors ${liked ? 'text-red-500' : 'text-muted-foreground hover:text-red-500'}`}
          >
            <Heart size={16} fill={liked ? 'currentColor' : 'none'} />
            <span>{likes}</span>
          </button>
          <button className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors">
            <MessageCircle size={16} />
            <span>{Math.floor(Math.random() * 8)}</span>
          </button>
          <button className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors">
            <Share2 size={16} />
          </button>
          <button
            onClick={() => setBookmarked(!bookmarked)}
            className={`flex items-center gap-1.5 text-xs transition-colors ${bookmarked ? 'text-primary' : 'text-muted-foreground hover:text-primary'}`}
          >
            <Bookmark size={16} fill={bookmarked ? 'currentColor' : 'none'} />
          </button>
        </div>
      </div>
    </article>
  )
}
