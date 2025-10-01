import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request })
  const { pathname } = request.nextUrl

  // Public routes that don't require authentication
  const publicRoutes = [
    "/api/health",
    "/api/auth/signin",
    "/api/auth/callback",
    "/auth/signin",
    "/auth/error",
    "/"
  ]

  // Check if the route is public
  const isPublicRoute = publicRoutes.some(route => 
    pathname.startsWith(route) || pathname === route
  )

  // If route is public, allow access
  if (isPublicRoute) {
    return NextResponse.next()
  }

  // If no token and route is protected, redirect to signin
  if (!token) {
    const signinUrl = new URL("/auth/signin", request.url)
    signinUrl.searchParams.set("callbackUrl", pathname)
    return NextResponse.redirect(signinUrl)
  }

  // Check if user has admin role for sensitive operations
  const adminRoutes = [
    "/api/rules-engine",
    "/api/field-calculator"
  ]

  const isAdminRoute = adminRoutes.some(route => pathname.startsWith(route))

  if (isAdminRoute && token.role !== "admin") {
    return NextResponse.json(
      { error: "Insufficient permissions" },
      { status: 403 }
    )
  }

  // Add security headers to all responses
  const response = NextResponse.next()
  response.headers.set("Content-Security-Policy", "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline';")
  response.headers.set("X-Content-Type-Options", "nosniff")
  response.headers.set("X-Frame-Options", "DENY")
  response.headers.set("X-XSS-Protection", "1; mode=block")
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin")

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
}
