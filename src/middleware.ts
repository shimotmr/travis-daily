import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { NextResponse, type NextRequest } from 'next/server'

const PRIVATE_ROUTES = ['/board', '/architecture']
const ADMIN_ROUTES = ['/admin']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // 檢查是否請求 markdown 格式
  const acceptHeader = request.headers.get('accept') || ''
  if (acceptHeader.includes('text/markdown')) {
    // Rewrite 到 markdown API
    const url = request.nextUrl.clone()
    url.pathname = `/api/markdown${pathname}`
    return NextResponse.rewrite(url)
  }

  const isPrivate = PRIVATE_ROUTES.some(r => pathname.startsWith(r))
  const isAdmin = ADMIN_ROUTES.some(r => pathname.startsWith(r))
  if (!isPrivate && !isAdmin) return NextResponse.next()

  let response = NextResponse.next({ request: { headers: request.headers } })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          request.cookies.set({ name, value, ...options })
          response = NextResponse.next({ request: { headers: request.headers } })
          response.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: any) {
          request.cookies.set({ name, value: '', ...options })
          response = NextResponse.next({ request: { headers: request.headers } })
          response.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    const url = request.nextUrl.clone()
    url.pathname = '/'
    url.searchParams.set('login', 'required')
    return NextResponse.redirect(url)
  }

  // Look up user role using service client
  const serviceClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: userRecord } = await serviceClient
    .from('travis_daily_users')
    .select('role')
    .eq('auth_user_id', user.id)
    .maybeSingle()

  const role = userRecord?.role || 'pending'

  // Admin routes: owner only
  if (isAdmin && role !== 'owner') {
    const url = request.nextUrl.clone()
    url.pathname = '/'
    url.searchParams.set('access', 'denied')
    return NextResponse.redirect(url)
  }

  // Private routes: owner + member only
  if (isPrivate && role === 'pending') {
    const url = request.nextUrl.clone()
    url.pathname = '/'
    url.searchParams.set('access', 'pending')
    return NextResponse.redirect(url)
  }

  return response
}

export const config = {
  matcher: [
    '/board/:path*',
    '/architecture/:path*',
    '/admin/:path*',
    // Markdown API: 所有可能的文章路徑
    '/digest/:path*',
    '/research/:path*',
    '/notes/:path*',
    '/task-updates/:path*',
  ],
}
