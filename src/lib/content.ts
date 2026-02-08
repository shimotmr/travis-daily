import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { remark } from 'remark'
import html from 'remark-html'
import gfm from 'remark-gfm'

const contentDir = path.join(process.cwd(), 'content')

export interface Post {
  slug: string
  title: string
  date: string
  type: 'digest' | 'research' | 'note' | 'task-update'
  tags: string[]
  cover?: string
  content: string
  excerpt: string
}

function getFiles(dir: string): string[] {
  if (!fs.existsSync(dir)) return []
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  let files: string[] = []
  for (const e of entries) {
    const full = path.join(dir, e.name)
    if (e.isDirectory()) files = files.concat(getFiles(full))
    else if (e.name.endsWith('.md')) files.push(full)
  }
  return files
}

export function getAllPosts(): Post[] {
  const files = getFiles(contentDir)
  const posts = files.map(filePath => {
    const raw = fs.readFileSync(filePath, 'utf-8')
    const { data, content } = matter(raw)
    const rel = path.relative(contentDir, filePath)
    const slug = rel.replace(/\.md$/, '').replace(/\\/g, '/')

    const excerpt = content
      .replace(/^#.*$/gm, '')
      .replace(/\n{2,}/g, '\n')
      .trim()
      .slice(0, 200)

    return {
      slug,
      title: data.title || slug,
      date: data.date || '2026-01-01',
      type: data.type || 'note',
      tags: data.tags || [],
      cover: data.cover,
      content,
      excerpt,
    } as Post
  })

  return posts.sort((a, b) => (a.date > b.date ? -1 : 1))
}

export function getPostBySlug(slug: string): Post | null {
  const filePath = path.join(contentDir, `${slug}.md`)
  if (!fs.existsSync(filePath)) return null
  const raw = fs.readFileSync(filePath, 'utf-8')
  const { data, content } = matter(raw)
  return {
    slug,
    title: data.title || slug,
    date: data.date || '2026-01-01',
    type: data.type || 'note',
    tags: data.tags || [],
    cover: data.cover,
    content,
    excerpt: content.slice(0, 200),
  }
}

export async function renderMarkdown(md: string): Promise<string> {
  const result = await remark().use(gfm).use(html, { sanitize: false }).process(md)
  return result.toString()
}

export function getPostsByType(type: string): Post[] {
  return getAllPosts().filter(p => p.type === type)
}
