import { NextResponse, type NextRequest } from 'next/server'
import { handleMockApiAsync, type CookieAction } from '@/mock/handlers'

export const dynamic = 'force-dynamic'

type RouteContext = { params: Promise<{ path: string[] }> }

function applyCookie(response: NextResponse, cookie?: CookieAction) {
  if (!cookie) return
  if (cookie.type === 'clear') {
    response.cookies.set(cookie.name, '', {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 0,
    })
    return
  }
  response.cookies.set(cookie.name, cookie.value, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: cookie.maxAge,
  })
}

async function dispatch(request: NextRequest, context: RouteContext) {
  const { path } = await context.params
  const pathname = `/${path.join('/')}`
  const contentType = request.headers.get('content-type') || ''
  let body: unknown
  let formData: FormData | null = null

  if (request.method !== 'GET' && request.method !== 'HEAD') {
    if (contentType.includes('multipart/form-data')) {
      formData = await request.formData()
    } else if (contentType.includes('application/json')) {
      try {
        body = await request.json()
      } catch {
        body = undefined
      }
    }
  }

  const result = await handleMockApiAsync({
    method: request.method,
    path: pathname,
    searchParams: request.nextUrl.searchParams,
    cookieHeader: request.headers.get('cookie'),
    body,
    formData,
  })

  const response = NextResponse.json(result.body, { status: result.status })
  applyCookie(response, result.cookie)
  return response
}

export async function GET(request: NextRequest, context: RouteContext) {
  return dispatch(request, context)
}

export async function POST(request: NextRequest, context: RouteContext) {
  return dispatch(request, context)
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  return dispatch(request, context)
}

export async function PUT(request: NextRequest, context: RouteContext) {
  return dispatch(request, context)
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  return dispatch(request, context)
}
