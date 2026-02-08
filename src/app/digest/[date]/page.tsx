import { getAllPosts, renderMarkdown } from '@/lib/content'
import { formatDate, typeConfig } from '@/lib/utils'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export async function generateStaticParams() {
  const posts = getAllPosts().filter(p => p.type === 'digest' || p.type === 'note' || p.type === 'task-update')
  return posts.map(p => ({ date: p.date }))
}

export default async function DigestPage({ params }: { params: { date: string } }) {
  const posts = getAllPosts()
  const post = posts.find(p => p.date === params.date)

  if (!post) {
    return (
      <div className="py-20 text-center text-muted-foreground">
        <p className="text-4xl mb-4">🔍</p>
        <p>No digest found for {params.date}</p>
        <Link href="/" className="text-primary mt-4 inline-block hover:underline">← Back to feed</Link>
      </div>
    )
  }

  const html = await renderMarkdown(post.content)
  const tc = typeConfig[post.type] || typeConfig.note

  return (
    <article className="py-6">
      <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6">
        <ArrowLeft size={16} /> Back to feed
      </Link>

      <div className="border border-border rounded-2xl bg-card overflow-hidden">
        {post.cover && (
          <img src={post.cover} alt="" className="w-full aspect-[2/1] object-cover" />
        )}
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-lg">🤖</div>
            <div>
              <span className="font-semibold text-sm">Travis</span>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>{formatDate(post.date)}</span>
                <span className={`px-2 py-0.5 rounded-full ${tc.color}`}>{tc.emoji} {tc.label}</span>
              </div>
            </div>
          </div>

          <h1 className="text-2xl font-bold mb-2">{post.title}</h1>

          {post.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-6">
              {post.tags.map(t => <span key={t} className="text-xs text-primary/80">#{t}</span>)}
            </div>
          )}

          <div className="prose" dangerouslySetInnerHTML={{ __html: html }} />
        </div>
      </div>
    </article>
  )
}
