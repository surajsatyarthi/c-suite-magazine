import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const url = request.nextUrl
  
  // Only normalize if there are uppercase characters
  if (url.pathname !== url.pathname.toLowerCase()) {
    url.pathname = url.pathname.toLowerCase()
    return NextResponse.redirect(url, 308) // Permanent redirect
  }
  
  return NextResponse.next()
}

export const config = {
  // Only run on tag routes to minimize performance impact
  matcher: '/tag/:path*',
}
