import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
  try {
    const { pathname } = request.nextUrl
    
    // Skip checking for static assets and API routes
    if (
      pathname.startsWith('/_next') || 
      pathname.startsWith('/api') || 
      pathname.includes('.') || 
      pathname === '/favicon.ico'
    ) {
      return NextResponse.next()
    }

    // Check for Supabase authentication cookies
    const cookieNames = request.cookies.getAll().map((c) => c.name)
    const hasSupabaseCookie = cookieNames.some((name) => {
      return name === 'sb-access-token' || 
             name === 'supabase-auth-token' || 
             name.includes('auth-token') ||
             name.startsWith('sb-')
    })
    
    const hasSession = Boolean(hasSupabaseCookie)

    const protectedRoutes = ['/dashboard', '/checkout', '/admin']
    const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route))
    const isAuthRoute = pathname.startsWith('/auth/login') || pathname.startsWith('/auth/register')

    // 1. If user is logged in and trying to access auth pages, redirect to dashboard
    if (hasSession && isAuthRoute) {
      console.log(`[proxy] Auth redirect: ${pathname} -> /dashboard`)
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    // 2. If user is NOT logged in and trying to access protected pages, redirect to login
    if (!hasSession && isProtectedRoute) {
      console.log(`[proxy] Protected redirect: ${pathname} -> /auth/login`)
      return NextResponse.redirect(new URL('/auth/login', request.url))
    }

    return NextResponse.next()
  } catch (error) {
    console.error('[proxy] Critical error in middleware:', error)
    return NextResponse.next()
  }
}

export default proxy

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
