import { NextResponse, type NextRequest } from 'next/server'

const publicPaths = new Set(['/login', '/help', '/status'])

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const hasSession = request.cookies.has('yuedong_session')

  if (!hasSession && !publicPaths.has(pathname)) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (hasSession && pathname === '/login') {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
