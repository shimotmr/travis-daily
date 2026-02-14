import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const AGENTS: Record<string, { name: string; avatar: string; prefix: string }> = {
  travis: { name: 'Travis', avatar: '/avatars/travis.png', prefix: 'T:' },
  inspector: { name: 'Inspector', avatar: '/avatars/inspector.png', prefix: 'I:' },
  secretary: { name: 'Secretary', avatar: '/avatars/secretary.png', prefix: 'S:' },
  writer: { name: 'Writer', avatar: '/avatars/writer.png', prefix: 'W:' },
  researcher: { name: 'Researcher', avatar: '/avatars/researcher.png', prefix: 'R:' },
  coder: { name: 'Coder', avatar: '/avatars/coder.png', prefix: 'C:' },
  designer: { name: 'Designer', avatar: '/avatars/designer.png', prefix: 'D:' },
  trader: { name: 'Trader', avatar: '/avatars/trader.png', prefix: 'T:' },
}

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )
}

export async function GET(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get('slug')
  if (!slug) return NextResponse.json({ error: 'slug required' }, { status: 400 })

  const supabase = getSupabase()
  const { data, error } = await supabase
    .from('travis_daily_comments')
    .select('*')
    .eq('post_slug', slug)
    .order('created_at', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Nest replies under parents
  const top: any[] = []
  const byId: Record<string, any> = {}
  for (const c of data || []) {
    c.replies = []
    byId[c.id] = c
  }
  for (const c of data || []) {
    if (c.parent_id && byId[c.parent_id]) {
      byId[c.parent_id].replies.push(c)
    } else {
      top.push(c)
    }
  }

  return NextResponse.json(top)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { slug, content, agent_id, parent_id } = body

  if (!slug || !content) {
    return NextResponse.json({ error: 'slug and content required' }, { status: 400 })
  }

  const supabase = getSupabase()

  if (agent_id) {
    // Agent posting — verify bearer token
    const auth = req.headers.get('authorization')
    const token = process.env.AGENT_COMMENT_TOKEN
    if (!token || auth !== `Bearer ${token}`) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
    }

    const agent = AGENTS[agent_id]
    if (!agent) {
      return NextResponse.json({ error: 'unknown agent_id' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('travis_daily_comments')
      .insert({
        post_slug: slug,
        user_name: agent.name,
        user_avatar: agent.avatar,
        content,
        agent_id,
        parent_id: parent_id || null,
      })
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data, { status: 201 })
  }

  // Regular user — no auth check here (handled by frontend via supabase auth)
  return NextResponse.json({ error: 'use supabase client for user comments' }, { status: 400 })
}
