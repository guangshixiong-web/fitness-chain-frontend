import 'server-only'
import { cookies } from 'next/headers'
import type { AuthUser } from '@/store/store'
import { getAuthUserFromCookie, handleMockApi } from '@/mock/handlers'

export class ServerApiError extends Error {
  constructor(
    message: string,
    readonly status?: number,
  ) {
    super(message)
    this.name = 'ServerApiError'
  }
}

/**
 * 服务端直接调用内存 Mock，避免再 HTTP 请求自身。
 * 路径形如 `/metrics/overview?startDate=...`
 */
export async function serverApiFetch<T>(
  path: string,
  init: RequestInit & { next?: { revalidate?: number } } = {},
): Promise<T> {
  const [pathname, query = ''] = path.split('?')
  let cookieHeader = (await getSessionCookieHeader()) || ''
  const headers = init.headers
  if (headers instanceof Headers && headers.has('cookie')) {
    cookieHeader = headers.get('cookie') || cookieHeader
  } else if (headers && typeof headers === 'object' && 'cookie' in headers) {
    cookieHeader = String((headers as Record<string, string>).cookie || cookieHeader)
  }

  const result = handleMockApi({
    method: (init.method || 'GET').toUpperCase(),
    path: pathname,
    searchParams: new URLSearchParams(query),
    cookieHeader,
    body: init.body ? JSON.parse(String(init.body)) : undefined,
  })

  if (result.status >= 400) {
    const message =
      result.body && typeof result.body === 'object' && 'message' in result.body
        ? String((result.body as { message: string }).message)
        : `请求失败（${result.status}）`
    throw new ServerApiError(message, result.status)
  }

  const envelope = result.body as { data: T }
  return envelope.data
}

export async function getSessionCookieHeader(): Promise<string | null> {
  const cookieStore = await cookies()
  const session = cookieStore.get('yuedong_session')
  return session ? `${session.name}=${session.value}` : null
}

export async function authenticatedServerFetch<T>(path: string): Promise<T> {
  const cookie = await getSessionCookieHeader()
  if (!cookie) throw new ServerApiError('登录会话不存在', 401)
  return serverApiFetch<T>(path, { headers: { cookie }, cache: 'no-store' })
}

export async function loadAuthenticatedUser(): Promise<AuthUser | null> {
  const cookie = await getSessionCookieHeader()
  return getAuthUserFromCookie(cookie)
}
