import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  const path = request.nextUrl.pathname

  // 1. Handle Admin Route Protection (uses JWT metadata)
  if (path.startsWith('/admin') && !path.startsWith('/admin-login')) {
      console.log(`[Middleware Check] Path: ${path}, User: ${user?.email || 'None'}`);
      
      if (!user) {
        console.warn(`[Middleware Admin] No user found. Redirecting to /admin-login`)
        return NextResponse.redirect(new URL('/admin-login', request.url))
      }

      // Check role from JWT metadata
      const isAdmin = user.app_metadata?.role === 'admin' || user.user_metadata?.role === 'admin'
      console.log(`[Middleware Admin] IsAdmin: ${isAdmin}`)
      
      if (!isAdmin) {
        console.warn(`[Middleware Admin] Attempted access by non-admin: ${user.email}`)
        return NextResponse.redirect(new URL('/', request.url))
      }
    }

  // 2. Handle Client Dashboard Protection
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    if (!user) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  return response
}
