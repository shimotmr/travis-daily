'use client'

import { LikeButton } from './LikeButton'
import { CommentSection } from './CommentSection'

export function PostInteractions({ slug }: { slug: string }) {
  return (
    <div className="mt-8 pt-6 border-t border-border">
      <div className="flex items-center gap-4 mb-2">
        <LikeButton slug={slug} />
      </div>
      <CommentSection slug={slug} />
    </div>
  )
}
