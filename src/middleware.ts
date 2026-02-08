import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const PRIVATE_ROUTES = ['/board', '/architecture']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Only protect private routes
  const isPrivate = PRIVATE_ROUTES.some(r => pathname.startsWith(r))
  if (!isPrivate) return NextResponse.next()

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
    // Redirect to home with a message
    const url = request.nextUrl.clone()
    url.pathname = '/'
    url.searchParams.set('login', 'required')
    return NextResponse.redirect(url)
  }

  return response
}

export const config = {
  matcher: ['/board/:path*', '/architecture/:path*'],
}
