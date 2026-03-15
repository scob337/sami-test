import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Debug: log pathname and cookie keys
  try {
    const cookieNames = request.cookies.getAll().map((c) => c.name)
    console.log('[proxy] pathname=', pathname, 'cookies=', cookieNames)
  } catch (e) {
    console.log('[proxy] pathname=', pathname, 'cookies=unavailable')
  }

  // Check for auth cookie (Supabase tokens)
  const cookieNames = request.cookies.getAll().map((c) => c.name)
  const hasSupabaseCookie = cookieNames.some((name) => {
    // supabase uses project-specific cookie names like sb-<project-ref>-auth-token.0
    return name === 'sb-access-token' || name === 'supabase-auth-token' || /sb-.*-auth-token/.test(name)
  })
  const hasSession = Boolean(hasSupabaseCookie)
  console.log('[proxy] hasSession=', hasSession)

  const protectedRoutes = ['/dashboard', '/checkout', '/admin']
  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route))

  // Auth pages (should only be accessible when logged out)
  const authRoutes = ['/auth/login', '/auth/register']
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route))

  // 1. If user is logged in and trying to access auth pages, redirect to dashboard
  if (hasSession && isAuthRoute) {
    console.log('[proxy] redirecting auth route -> /dashboard')
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // 2. If user is NOT logged in and trying to access protected pages, redirect to login
  if (!hasSession && isProtectedRoute) {
    console.log('[proxy] redirecting protected route -> /auth/login')
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  return NextResponse.next()
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
