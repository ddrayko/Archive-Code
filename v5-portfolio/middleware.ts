import { clerkMiddleware } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

const normalizeIp = (ip: string) => {
  if (!ip) return ""
  if (ip.startsWith("::ffff:")) return ip.slice(7)
  return ip
}

const withRequestHeaders = (req: Request, extra?: Record<string, string>) => {
  const headers = new Headers(req.headers)
  headers.set("x-pathname", new URL(req.url).pathname)
  if (extra) {
    Object.entries(extra).forEach(([key, value]) => {
      headers.set(key, value)
    })
  }
  return headers
}

export default clerkMiddleware((auth, req) => {
  const pathname = req.nextUrl.pathname
  
  if (
    pathname.startsWith("/v1") ||
    pathname.startsWith("/v2") ||
    pathname.startsWith("/v3") ||
    pathname.startsWith("/v4") ||
    pathname.endsWith(".html")
  ) {
    return NextResponse.next({
      request: {
        headers: withRequestHeaders(req),
      },
    })
  }

  // IP restriction removed for /admin routes

  if (pathname.startsWith("/admin") && pathname !== "/admin") {
    const adminSession = req.cookies.get("admin_session")

    if (!adminSession) {
      return NextResponse.redirect(new URL("/admin", req.url))
    }
  }

  return NextResponse.next({
    request: {
      headers: withRequestHeaders(req),
    },
  })
})

export const config = {
  matcher: ['/((?!.+\.[\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
}
