import fs from 'fs'
import path from 'path'

import matter from 'gray-matter'
import gfm from 'remark-gfm'
import rehypePrettyCode from 'rehype-pretty-code'
import rehypeStringify from 'rehype-stringify'
import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkRehype from 'remark-rehype'

const contentDir = path.join(process.cwd(), 'content')

export interface Post {
  slug: string
  title: string
  date: string
  type: 'digest' | 'research' | 'note' | 'forum' | 'task-update'
  tags: string[]
  cover?: string
  content: string
  excerpt: string
  visibility: 'public' | 'private'
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
      visibility: data.visibility || 'public',
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
    visibility: data.visibility || 'public',
  }
}

export function getPublicPosts(): Post[] {
  return getAllPosts().filter(p => p.visibility === 'public')
}

export function getPrivatePosts(): Post[] {
  return getAllPosts().filter(p => p.visibility === 'private')
}

export async function renderMarkdown(md: string): Promise<string> {
  const file = await unified()
    .use(remarkParse)
    .use(gfm)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypePrettyCode, {
      theme: 'github-dark',
      keepBackground: true,
      defaultLang: 'plaintext',
      onVisitLine(node: any) {
        // Prevent lines from collapsing in `display: grid` mode, and allow empty lines to be copy/pasted
        if (node.children.length === 0) {
          node.children = [{ type: 'text', value: ' ' }]
        }
      },
    })
    .use(rehypeStringify, { allowDangerousHtml: true })
    .process(md)
  
  return String(file)
}

export function getPostsByType(type: string): Post[] {
  return getAllPosts().filter(p => p.type === type)
}
