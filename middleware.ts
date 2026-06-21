import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const PROTECTED = ['/crm', '/analytics', '/prospeccion']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (PROTECTED.some((p) => pathname.startsWith(p))) {
    const auth = request.cookies.get('crm-auth')?.value
    const secret = process.env.CRM_SECRET

    if (!secret || auth !== secret) {
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('from', pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/crm/:path*', '/analytics/:path*', '/prospeccion/:path*'],
}
