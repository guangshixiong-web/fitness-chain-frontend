import {
  getDb,
  nextId,
  type DataScope,
  type MockDb,
  type Order,
  type Product,
  type Store,
  type Role,
  type User,
} from './db'

export type AuthUser = {
  id: string
  username: string
  name: string
  regionId: string | null
  storeId: string | null
  permissions: string[]
  roles: { code: string; name: string; dataScope: string }[]
}

export type MockRequest = {
  method: string
  path: string
  searchParams: URLSearchParams
  cookieHeader?: string | null
  body?: unknown
  formData?: FormData | null
}

export type CookieAction =
  | { type: 'set'; name: string; value: string; maxAge: number }
  | { type: 'clear'; name: string }

export type MockResponse = {
  status: number
  body: unknown
  cookie?: CookieAction
}

const SESSION_COOKIE = 'yuedong_session'
const ok = <T>(data: T, cookie?: CookieAction): MockResponse => ({
  status: 200,
  body: { code: 0, message: 'success', data, requestId: `mock-${Date.now()}` },
  cookie,
})
const fail = (status: number, message: string): MockResponse => ({
  status,
  body: { code: status, message, requestId: `mock-${Date.now()}` },
})

function parseSessionUserId(cookieHeader?: string | null): string | null {
  if (!cookieHeader) return null
  const match = cookieHeader.match(/(?:^|;\s*)yuedong_session=([^;]+)/)
  if (!match) return null
  const value = decodeURIComponent(match[1])
  if (!value.startsWith('mock:')) return null
  return value.slice(5) || null
}

function roleOf(db: MockDb, roleId: string): Role | undefined {
  return db.roles.find((r) => r.id === roleId)
}

function userPermissions(db: MockDb, user: User): string[] {
  const codes = new Set<string>()
  for (const roleId of user.roleIds) {
    const role = roleOf(db, roleId)
    if (!role) continue
    for (const pid of role.permissionIds) {
      const perm = db.permissions.find((p) => p.id === pid)
      if (perm) codes.add(perm.code)
    }
  }
  return [...codes]
}

function toAuthUser(db: MockDb, user: User): AuthUser {
  return {
    id: user.id,
    username: user.username,
    name: user.name,
    regionId: user.regionId,
    storeId: user.storeId,
    permissions: userPermissions(db, user),
    roles: user.roleIds
      .map((id) => roleOf(db, id))
      .filter(Boolean)
      .map((r) => ({ code: r!.code, name: r!.name, dataScope: r!.dataScope })),
  }
}

function requireUser(db: MockDb, cookieHeader?: string | null): User | MockResponse {
  const userId = parseSessionUserId(cookieHeader)
  if (!userId) return fail(401, '未登录或会话已失效')
  const user = db.users.find((u) => u.id === userId && u.enabled)
  if (!user) return fail(401, '未登录或会话已失效')
  return user
}

function isFail(value: User | MockResponse): value is MockResponse {
  return 'status' in value && 'body' in value
}

function primaryScope(db: MockDb, user: User): DataScope {
  const scopes = user.roleIds.map((id) => roleOf(db, id)?.dataScope).filter(Boolean) as DataScope[]
  if (scopes.includes('ALL')) return 'ALL'
  if (scopes.includes('REGION')) return 'REGION'
  return 'STORE'
}

function filterStoreIds(db: MockDb, user: User): string[] | null {
  const scope = primaryScope(db, user)
  if (scope === 'ALL') return null
  if (scope === 'REGION') {
    if (!user.regionId) return []
    return db.stores.filter((s) => s.regionId === user.regionId).map((s) => s.id)
  }
  return user.storeId ? [user.storeId] : []
}

function pageOf<T>(items: T[], page: number, pageSize: number) {
  const start = (page - 1) * pageSize
  return { items: items.slice(start, start + pageSize), page, pageSize, total: items.length }
}

function asRecord(body: unknown): Record<string, unknown> {
  return body && typeof body === 'object' ? (body as Record<string, unknown>) : {}
}

function storeView(db: MockDb, store: Store) {
  const region = db.regions.find((r) => r.id === store.regionId)
  const manager = store.managerId ? db.users.find((u) => u.id === store.managerId) : null
  return {
    ...store,
    region: region ? { name: region.name } : null,
    manager: manager ? { id: manager.id, name: manager.name } : null,
  }
}

function productView(db: MockDb, product: Product) {
  const category = db.categories.find((c) => c.id === product.categoryId)
  return { ...product, category: category ? { name: category.name } : null }
}

function orderView(db: MockDb, order: Order) {
  const store = db.stores.find((s) => s.id === order.storeId)
  const region = store ? db.regions.find((r) => r.id === store.regionId) : null
  return {
    ...order,
    store: {
      name: store?.name ?? '-',
      region: { name: region?.name ?? '-' },
    },
    items: order.items.map((item) => {
      const product = db.products.find((p) => p.id === item.productId)
      return { ...item, product: { name: product?.name ?? '-' } }
    }),
  }
}

function userView(db: MockDb, user: User) {
  const region = user.regionId ? db.regions.find((r) => r.id === user.regionId) : null
  const store = user.storeId ? db.stores.find((s) => s.id === user.storeId) : null
  return {
    id: user.id,
    username: user.username,
    name: user.name,
    email: user.email,
    phone: user.phone,
    enabled: user.enabled,
    regionId: user.regionId,
    storeId: user.storeId,
    region: region ? { name: region.name } : null,
    store: store ? { name: store.name } : null,
    roles: user.roleIds.map((roleId) => {
      const role = roleOf(db, roleId)
      return { roleId, role: { name: role?.name ?? '-' } }
    }),
  }
}

function roleView(db: MockDb, role: Role) {
  return {
    id: role.id,
    code: role.code,
    name: role.name,
    description: role.description,
    dataScope: role.dataScope,
    permissions: role.permissionIds.map((permissionId) => {
      const permission = db.permissions.find((p) => p.id === permissionId)
      return { permissionId, permission }
    }),
    _count: { users: db.users.filter((u) => u.roleIds.includes(role.id)).length },
  }
}

function addLog(db: MockDb, userId: string | null, module: string, action: string, success = true) {
  db.logs.unshift({
    id: nextId('log'),
    createdAt: new Date().toISOString(),
    module,
    action,
    success,
    ip: '127.0.0.1',
    userId,
  })
}

function completedOrders(db: MockDb, user: User, params: URLSearchParams) {
  const storeIds = filterStoreIds(db, user)
  const startDate = params.get('startDate')
  const endDate = params.get('endDate')
  const regionId = params.get('regionId') || ''
  const storeId = params.get('storeId') || ''

  return db.orders.filter((order) => {
    if (order.status !== 'COMPLETED') return false
    if (storeIds && !storeIds.includes(order.storeId)) return false
    const store = db.stores.find((s) => s.id === order.storeId)
    if (regionId && store?.regionId !== regionId) return false
    if (storeId && order.storeId !== storeId) return false
    const day = order.orderedAt.slice(0, 10)
    if (startDate && day < startDate) return false
    if (endDate && day > endDate) return false
    return true
  })
}

function computeOverview(db: MockDb, user: User, params: URLSearchParams) {
  const orders = completedOrders(db, user, params)
  const revenue = orders.reduce((sum, o) => sum + o.paidAmount, 0)
  const orderCount = orders.length
  const serviceSales = orders.reduce(
    (sum, o) => sum + o.items.reduce((s, i) => s + i.quantity, 0),
    0,
  )
  const storeIds = new Set(orders.map((o) => o.storeId))
  const activeCards = db.memberCards.filter((c) => c.status === 'ACTIVE').length
  return {
    revenue,
    orderCount,
    averageOrderValue: orderCount ? Number((revenue / orderCount).toFixed(2)) : 0,
    activeStores: storeIds.size || db.stores.filter((s) => s.enabled).length,
    serviceSales,
    activeCards,
    growthRate: 15.3,
  }
}

function computeCharts(db: MockDb, user: User, params: URLSearchParams) {
  const orders = completedOrders(db, user, params)
  const trendMap = new Map<string, { date: string; revenue: number; orders: number }>()
  const storeMap = new Map<string, number>()
  const productMap = new Map<string, number>()
  const categoryMap = new Map<string, number>()
  const hourlyMap = new Map<string, number>()

  for (const order of orders) {
    const date = order.orderedAt.slice(0, 10)
    const trend = trendMap.get(date) || { date, revenue: 0, orders: 0 }
    trend.revenue += order.paidAmount
    trend.orders += 1
    trendMap.set(date, trend)

    const store = db.stores.find((s) => s.id === order.storeId)
    if (store) storeMap.set(store.name, (storeMap.get(store.name) || 0) + order.paidAmount)

    const hour = `${new Date(order.orderedAt).getHours()}:00`
    hourlyMap.set(hour, (hourlyMap.get(hour) || 0) + 1)

    for (const item of order.items) {
      const product = db.products.find((p) => p.id === item.productId)
      if (!product) continue
      productMap.set(product.name, (productMap.get(product.name) || 0) + item.quantity)
      const category = db.categories.find((c) => c.id === product.categoryId)
      if (category)
        categoryMap.set(category.name, (categoryMap.get(category.name) || 0) + item.subtotal)
    }
  }

  const sortEntries = (map: Map<string, number>) =>
    [...map.entries()].sort((a, b) => b[1] - a[1]).map(([name, value]) => ({ name, value }))

  return {
    trend: [...trendMap.values()].sort((a, b) => a.date.localeCompare(b.date)),
    storeRanking: sortEntries(storeMap).slice(0, 8),
    productRanking: sortEntries(productMap).slice(0, 8),
    categoryShare: sortEntries(categoryMap),
    hourly: [...hourlyMap.entries()]
      .sort((a, b) => Number.parseInt(a[0], 10) - Number.parseInt(b[0], 10))
      .map(([name, value]) => ({ name, value })),
  }
}

function parseCsv(text: string) {
  const lines = text
    .replace(/^\ufeff/, '')
    .split(/\r?\n/)
    .filter((line) => line.trim())
  if (lines.length < 2)
    return {
      rows: [] as Record<string, string>[],
      errors: [{ rowNo: 1, message: 'CSV 至少需要表头和一行数据' }],
    }
  const headers = lines[0].split(',').map((h) => h.trim())
  const rows: Record<string, string>[] = []
  const errors: { rowNo: number; field?: string; message: string }[] = []
  for (let i = 1; i < lines.length; i += 1) {
    const cols = lines[i].split(',').map((c) => c.trim())
    const row: Record<string, string> = {}
    headers.forEach((h, idx) => {
      row[h] = cols[idx] ?? ''
    })
    if (!row.orderNo && !row.storeCode) {
      errors.push({ rowNo: i + 1, message: '缺少必要字段' })
    } else {
      rows.push(row)
    }
  }
  return { rows, errors }
}

export function handleMockApi(request: MockRequest): MockResponse {
  const db = getDb()
  const method = request.method.toUpperCase()
  const segments = request.path.replace(/^\/+/, '').split('/').filter(Boolean)
  const [root, second, third, fourth] = segments

  if (root === 'health' && method === 'GET') {
    return ok({
      status: 'ok',
      database: 'mock-memory',
      timestamp: new Date().toISOString(),
      uptime: Math.floor(process.uptime()),
    })
  }

  if (root === 'auth' && second === 'login' && method === 'POST') {
    const body = asRecord(request.body)
    const username = String(body.username || '')
    const password = String(body.password || '')
    const user = db.users.find((u) => u.username === username && u.enabled)
    if (!user || user.password !== password) {
      addLog(db, null, 'auth', 'login', false)
      return fail(401, '用户名或密码错误')
    }
    addLog(db, user.id, 'auth', 'login', true)
    return ok(
      { accessToken: `mock:${user.id}` },
      { type: 'set', name: SESSION_COOKIE, value: `mock:${user.id}`, maxAge: 60 * 60 * 8 },
    )
  }

  if (root === 'auth' && second === 'logout' && method === 'POST') {
    const user = requireUser(db, request.cookieHeader)
    if (!isFail(user)) addLog(db, user.id, 'auth', 'logout', true)
    return ok({ loggedOut: true }, { type: 'clear', name: SESSION_COOKIE })
  }

  if (root === 'auth' && second === 'me' && method === 'GET') {
    const user = requireUser(db, request.cookieHeader)
    if (isFail(user)) return user
    return ok(toAuthUser(db, user))
  }

  if (root === 'auth' && second === 'change-password' && method === 'POST') {
    const user = requireUser(db, request.cookieHeader)
    if (isFail(user)) return user
    const body = asRecord(request.body)
    const current = String(body.currentPassword || body.oldPassword || '')
    const next = String(body.newPassword || '')
    if (user.password !== current) return fail(400, '当前密码不正确')
    if (next.length < 6) return fail(400, '新密码至少 6 位')
    user.password = next
    addLog(db, user.id, 'auth', 'change-password', true)
    return ok({ changed: true })
  }

  const authed = requireUser(db, request.cookieHeader)
  if (isFail(authed)) return authed
  const user = authed

  if (root === 'metrics' && second === 'overview' && method === 'GET') {
    return ok(computeOverview(db, user, request.searchParams))
  }
  if (root === 'metrics' && second === 'charts' && method === 'GET') {
    return ok(computeCharts(db, user, request.searchParams))
  }
  if (root === 'metrics' && second === 'definitions' && !third && method === 'GET') {
    return ok(db.metrics)
  }
  if (
    root === 'metrics' &&
    second === 'definitions' &&
    third &&
    fourth === 'status' &&
    method === 'PATCH'
  ) {
    const metric = db.metrics.find((m) => m.id === third)
    if (!metric) return fail(404, '指标不存在')
    metric.enabled = Boolean(asRecord(request.body).enabled)
    return ok(metric)
  }

  if (root === 'regions' && !second && method === 'GET') {
    const keyword = (request.searchParams.get('keyword') || '').toLowerCase()
    return ok(
      db.regions
        .filter(
          (region) => !keyword || `${region.code}${region.name}`.toLowerCase().includes(keyword),
        )
        .map((region) => ({
          ...region,
          _count: { stores: db.stores.filter((s) => s.regionId === region.id).length },
        })),
    )
  }
  if (root === 'regions' && !second && method === 'POST') {
    const body = asRecord(request.body)
    const region = {
      id: nextId('region'),
      code: String(body.code || ''),
      name: String(body.name || ''),
      enabled: body.enabled !== false,
    }
    db.regions.push(region)
    addLog(db, user.id, 'region', 'create')
    return ok({ ...region, _count: { stores: 0 } })
  }
  if (root === 'regions' && second && !third && method === 'PATCH') {
    const region = db.regions.find((r) => r.id === second)
    if (!region) return fail(404, '区域不存在')
    const body = asRecord(request.body)
    if (body.code != null) region.code = String(body.code)
    if (body.name != null) region.name = String(body.name)
    if (body.enabled != null) region.enabled = Boolean(body.enabled)
    return ok({
      ...region,
      _count: { stores: db.stores.filter((s) => s.regionId === region.id).length },
    })
  }
  if (root === 'regions' && second && third === 'status' && method === 'PATCH') {
    const region = db.regions.find((r) => r.id === second)
    if (!region) return fail(404, '区域不存在')
    region.enabled = Boolean(asRecord(request.body).enabled)
    return ok({
      ...region,
      _count: { stores: db.stores.filter((s) => s.regionId === region.id).length },
    })
  }

  if (root === 'stores' && !second && method === 'GET') {
    const keyword = (request.searchParams.get('keyword') || '').toLowerCase()
    const regionId = request.searchParams.get('regionId') || ''
    const enabled = request.searchParams.get('enabled')
    const page = Math.max(1, Number(request.searchParams.get('page') || 1))
    const pageSize = Math.max(1, Number(request.searchParams.get('pageSize') || 20))
    const allowed = filterStoreIds(db, user)
    let list = db.stores.filter((store) => {
      if (allowed && !allowed.includes(store.id)) return false
      if (regionId && store.regionId !== regionId) return false
      if (enabled === 'true' && !store.enabled) return false
      if (enabled === 'false' && store.enabled) return false
      if (keyword && !`${store.code}${store.name}`.toLowerCase().includes(keyword)) return false
      return true
    })
    return ok(
      pageOf(
        list.map((s) => storeView(db, s)),
        page,
        pageSize,
      ),
    )
  }
  if (root === 'stores' && !second && method === 'POST') {
    const body = asRecord(request.body)
    const store: Store = {
      id: nextId('store'),
      code: String(body.code || ''),
      name: String(body.name || ''),
      regionId: String(body.regionId || ''),
      address: String(body.address || ''),
      phone: String(body.phone || ''),
      openedAt: body.openedAt
        ? new Date(String(body.openedAt)).toISOString()
        : new Date().toISOString(),
      enabled: body.enabled !== false,
      managerId: null,
    }
    db.stores.push(store)
    addLog(db, user.id, 'store', 'create')
    return ok(storeView(db, store))
  }
  if (root === 'stores' && second && !third && method === 'PATCH') {
    const store = db.stores.find((s) => s.id === second)
    if (!store) return fail(404, '门店不存在')
    const body = asRecord(request.body)
    Object.assign(store, {
      ...(body.code != null ? { code: String(body.code) } : {}),
      ...(body.name != null ? { name: String(body.name) } : {}),
      ...(body.regionId != null ? { regionId: String(body.regionId) } : {}),
      ...(body.address != null ? { address: String(body.address) } : {}),
      ...(body.phone != null ? { phone: String(body.phone) } : {}),
      ...(body.openedAt != null ? { openedAt: new Date(String(body.openedAt)).toISOString() } : {}),
      ...(body.enabled != null ? { enabled: Boolean(body.enabled) } : {}),
    })
    return ok(storeView(db, store))
  }
  if (root === 'stores' && second && third === 'status' && method === 'PATCH') {
    const store = db.stores.find((s) => s.id === second)
    if (!store) return fail(404, '门店不存在')
    store.enabled = Boolean(asRecord(request.body).enabled)
    return ok(storeView(db, store))
  }

  if (root === 'service-categories' && !second && method === 'GET') {
    const keyword = (request.searchParams.get('keyword') || '').toLowerCase()
    return ok(
      db.categories
        .filter(
          (category) =>
            !keyword || `${category.code}${category.name}`.toLowerCase().includes(keyword),
        )
        .slice()
        .sort((a, b) => a.sort - b.sort)
        .map((category) => ({
          ...category,
          _count: { products: db.products.filter((p) => p.categoryId === category.id).length },
        })),
    )
  }
  if (root === 'service-categories' && !second && method === 'POST') {
    const body = asRecord(request.body)
    const category = {
      id: nextId('cat'),
      code: String(body.code || ''),
      name: String(body.name || ''),
      sort: Number(body.sort || 0),
      enabled: body.enabled !== false,
    }
    db.categories.push(category)
    return ok({ ...category, _count: { products: 0 } })
  }
  if (root === 'service-categories' && second && method === 'PATCH') {
    const category = db.categories.find((c) => c.id === second)
    if (!category) return fail(404, '分类不存在')
    const body = asRecord(request.body)
    if (body.code != null) category.code = String(body.code)
    if (body.name != null) category.name = String(body.name)
    if (body.sort != null) category.sort = Number(body.sort)
    if (body.enabled != null) category.enabled = Boolean(body.enabled)
    return ok({
      ...category,
      _count: { products: db.products.filter((p) => p.categoryId === category.id).length },
    })
  }

  if (root === 'services' && !second && method === 'GET') {
    const keyword = (request.searchParams.get('keyword') || '').toLowerCase()
    const categoryId = request.searchParams.get('categoryId') || ''
    const page = Math.max(1, Number(request.searchParams.get('page') || 1))
    const pageSize = Math.max(1, Number(request.searchParams.get('pageSize') || 20))
    const list = db.products.filter((product) => {
      if (categoryId && product.categoryId !== categoryId) return false
      if (keyword && !`${product.code}${product.name}`.toLowerCase().includes(keyword)) return false
      return true
    })
    return ok(
      pageOf(
        list.map((p) => productView(db, p)),
        page,
        pageSize,
      ),
    )
  }
  if (root === 'services' && !second && method === 'POST') {
    const body = asRecord(request.body)
    const product: Product = {
      id: nextId('prod'),
      code: String(body.code || ''),
      name: String(body.name || ''),
      categoryId: String(body.categoryId || ''),
      price: Number(body.price || 0),
      costPrice: Number(body.costPrice || 0),
      imageUrl: body.imageUrl ? String(body.imageUrl) : null,
      enabled: body.enabled !== false,
    }
    db.products.push(product)
    return ok(productView(db, product))
  }
  if (root === 'services' && second && !third && method === 'PATCH') {
    const product = db.products.find((p) => p.id === second)
    if (!product) return fail(404, '服务不存在')
    const body = asRecord(request.body)
    Object.assign(product, {
      ...(body.code != null ? { code: String(body.code) } : {}),
      ...(body.name != null ? { name: String(body.name) } : {}),
      ...(body.categoryId != null ? { categoryId: String(body.categoryId) } : {}),
      ...(body.price != null ? { price: Number(body.price) } : {}),
      ...(body.costPrice != null ? { costPrice: Number(body.costPrice) } : {}),
      ...(body.imageUrl !== undefined
        ? { imageUrl: body.imageUrl ? String(body.imageUrl) : null }
        : {}),
      ...(body.enabled != null ? { enabled: Boolean(body.enabled) } : {}),
    })
    return ok(productView(db, product))
  }
  if (root === 'services' && second && third === 'status' && method === 'PATCH') {
    const product = db.products.find((p) => p.id === second)
    if (!product) return fail(404, '服务不存在')
    product.enabled = Boolean(asRecord(request.body).enabled)
    return ok(productView(db, product))
  }

  if (root === 'orders' && !second && method === 'GET') {
    const keyword = (request.searchParams.get('keyword') || '').toLowerCase()
    const status = request.searchParams.get('status') || ''
    const page = Math.max(1, Number(request.searchParams.get('page') || 1))
    const pageSize = Math.max(1, Number(request.searchParams.get('pageSize') || 20))
    const allowed = filterStoreIds(db, user)
    const list = db.orders
      .filter((order) => {
        if (allowed && !allowed.includes(order.storeId)) return false
        if (status && order.status !== status) return false
        if (keyword && !order.orderNo.toLowerCase().includes(keyword)) return false
        return true
      })
      .sort((a, b) => b.orderedAt.localeCompare(a.orderedAt))
    return ok(
      pageOf(
        list.map((o) => orderView(db, o)),
        page,
        pageSize,
      ),
    )
  }
  if (root === 'orders' && !second && method === 'POST') {
    const body = asRecord(request.body)
    const storeId = String(body.storeId || '')
    const productId = String(body.productId || '')
    const quantity = Number(body.quantity || 0)
    const status = (body.status === 'CANCELED' ? 'CANCELED' : 'COMPLETED') as Order['status']
    const product = db.products.find((p) => p.id === productId)
    const store = db.stores.find((s) => s.id === storeId)
    if (!product || !store || quantity < 1) return fail(400, '门店、服务或数量无效')
    const original = product.price * quantity
    const order: Order = {
      id: nextId('order'),
      orderNo: `DEMO-${Date.now()}`,
      storeId,
      orderedAt: new Date().toISOString(),
      status,
      originalAmount: original,
      discountAmount: 0,
      paidAmount: original,
      items: [
        {
          id: nextId('oi'),
          productId,
          quantity,
          unitPrice: product.price,
          subtotal: original,
        },
      ],
    }
    db.orders.unshift(order)
    addLog(db, user.id, 'order', 'create')
    return ok(orderView(db, order))
  }

  // ── 会员卡管理 ──
  if (root === 'member-cards' && !second && method === 'GET') {
    const keyword = (request.searchParams.get('keyword') || '').toLowerCase()
    const cardType = request.searchParams.get('cardType') || ''
    const status = request.searchParams.get('status') || ''
    const page = Math.max(1, Number(request.searchParams.get('page') || 1))
    const pageSize = Math.max(1, Number(request.searchParams.get('pageSize') || 20))
    const allowed = filterStoreIds(db, user)
    const list = db.memberCards
      .filter((card) => {
        if (allowed && !allowed.includes(card.storeId)) return false
        if (cardType && card.cardType !== cardType) return false
        if (status && card.status !== status) return false
        if (keyword && !`${card.cardNo}${card.memberName}${card.memberPhone}`.toLowerCase().includes(keyword)) return false
        return true
      })
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    const enriched = list.map((card) => ({
      ...card,
      store: storeView(db, db.stores.find((s) => s.id === card.storeId)!),
    }))
    return ok(pageOf(enriched, page, pageSize))
  }
  if (root === 'member-cards' && !second && method === 'POST') {
    const body = asRecord(request.body)
    const storeId = String(body.storeId || '')
    const cardType = String(body.cardType || 'MONTHLY')
    const totalVisits = cardType === 'TIMES' ? Number(body.totalVisits || 30) : null
    const card: typeof db.memberCards[0] = {
      id: nextId('card'),
      cardNo: `YD-${Date.now().toString().slice(-6)}`,
      memberName: String(body.memberName || ''),
      memberPhone: String(body.memberPhone || ''),
      storeId,
      cardType: cardType as typeof db.memberCards[0]['cardType'],
      totalVisits,
      remainingVisits: totalVisits,
      price: Number(body.price || 0),
      startDate: String(body.startDate || new Date().toISOString().slice(0, 10)),
      endDate: String(body.endDate || new Date().toISOString().slice(0, 10)),
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
    }
    db.memberCards.unshift(card)
    addLog(db, user.id, 'member-card', 'create')
    return ok({ ...card, store: storeView(db, db.stores.find((s) => s.id === storeId)!) })
  }
  if (root === 'member-cards' && second && !third && method === 'PATCH') {
    const card = db.memberCards.find((c) => c.id === second)
    if (!card) return fail(404, '会员卡不存在')
    const body = asRecord(request.body)
    if (body.memberName != null) card.memberName = String(body.memberName)
    if (body.memberPhone != null) card.memberPhone = String(body.memberPhone)
    if (body.remainingVisits != null) card.remainingVisits = Number(body.remainingVisits)
    if (body.endDate != null) card.endDate = String(body.endDate)
    if (body.status != null) card.status = String(body.status) as typeof card.status
    return ok({ ...card, store: storeView(db, db.stores.find((s) => s.id === card.storeId)!) })
  }
  if (root === 'member-cards' && second && third === 'status' && method === 'PATCH') {
    const card = db.memberCards.find((c) => c.id === second)
    if (!card) return fail(404, '会员卡不存在')
    card.status = String(asRecord(request.body).status || 'ACTIVE') as typeof card.status
    return ok({ ...card, store: storeView(db, db.stores.find((s) => s.id === card.storeId)!) })
  }

  // ── 私教预约 ──
  if (root === 'trainer-bookings' && !second && method === 'GET') {
    const keyword = (request.searchParams.get('keyword') || '').toLowerCase()
    const status = request.searchParams.get('status') || ''
    const trainerId = request.searchParams.get('trainerId') || ''
    const page = Math.max(1, Number(request.searchParams.get('page') || 1))
    const pageSize = Math.max(1, Number(request.searchParams.get('pageSize') || 20))
    const allowed = filterStoreIds(db, user)
    const list = db.trainerBookings
      .filter((bk) => {
        if (allowed && !allowed.includes(bk.storeId)) return false
        if (status && bk.status !== status) return false
        if (trainerId && bk.trainerId !== trainerId) return false
        if (keyword && !`${bk.bookingNo}${bk.memberName}${bk.memberPhone}`.toLowerCase().includes(keyword)) return false
        return true
      })
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    const enriched = list.map((bk) => {
      const trainer = db.trainers.find((t) => t.id === bk.trainerId)
      return { ...bk, trainer: trainer ? { id: trainer.id, name: trainer.name, specialty: trainer.specialty } : null, store: storeView(db, db.stores.find((s) => s.id === bk.storeId)!) }
    })
    return ok(pageOf(enriched, page, pageSize))
  }
  if (root === 'trainer-bookings' && !second && method === 'POST') {
    const body = asRecord(request.body)
    const trainerId = String(body.trainerId || '')
    const storeId = String(body.storeId || '')
    const trainer = db.trainers.find((t) => t.id === trainerId)
    const booking: typeof db.trainerBookings[0] = {
      id: nextId('bk'),
      bookingNo: `PT-${Date.now().toString().slice(-6)}`,
      memberName: String(body.memberName || ''),
      memberPhone: String(body.memberPhone || ''),
      trainerId,
      storeId,
      sessionDate: String(body.sessionDate || new Date().toISOString().slice(0, 10)),
      timeSlot: String(body.timeSlot || '09:00-10:00'),
      status: 'PENDING',
      notes: String(body.notes || ''),
      createdAt: new Date().toISOString(),
    }
    db.trainerBookings.unshift(booking)
    addLog(db, user.id, 'trainer-booking', 'create')
    return ok({ ...booking, trainer: trainer ? { id: trainer.id, name: trainer.name, specialty: trainer.specialty } : null, store: storeView(db, db.stores.find((s) => s.id === storeId)!) })
  }
  if (root === 'trainer-bookings' && second && !third && method === 'PATCH') {
    const booking = db.trainerBookings.find((b) => b.id === second)
    if (!booking) return fail(404, '预约不存在')
    const body = asRecord(request.body)
    if (body.status != null) booking.status = String(body.status) as typeof booking.status
    if (body.trainerId != null) booking.trainerId = String(body.trainerId)
    if (body.sessionDate != null) booking.sessionDate = String(body.sessionDate)
    if (body.timeSlot != null) booking.timeSlot = String(body.timeSlot)
    if (body.notes != null) booking.notes = String(body.notes)
    const trainer = db.trainers.find((t) => t.id === booking.trainerId)
    return ok({ ...booking, trainer: trainer ? { id: trainer.id, name: trainer.name, specialty: trainer.specialty } : null, store: storeView(db, db.stores.find((s) => s.id === booking.storeId)!) })
  }

  // ── 器械与巡检 ──
  if (root === 'equipment' && !second && method === 'GET') {
    const keyword = (request.searchParams.get('keyword') || '').toLowerCase()
    const status = request.searchParams.get('status') || ''
    const allowed = filterStoreIds(db, user)
    const list = db.equipment.filter((eq) => {
      if (allowed && !allowed.includes(eq.storeId)) return false
      if (status && eq.status !== status) return false
      if (keyword && !`${eq.name}${eq.model}${eq.location}`.toLowerCase().includes(keyword)) return false
      return true
    })
    return ok(
      list.map((eq) => {
        const store = db.stores.find((s) => s.id === eq.storeId)
        return { ...eq, store: store ? { id: store.id, name: store.name } : null }
      }),
    )
  }
  if (root === 'equipment' && !second && method === 'POST') {
    const body = asRecord(request.body)
    const storeId = String(body.storeId || '')
    const eq: typeof db.equipment[0] = {
      id: nextId('eq'),
      name: String(body.name || ''),
      model: String(body.model || ''),
      storeId,
      location: String(body.location || ''),
      lastInspectedAt: null,
      status: 'NORMAL',
    }
    db.equipment.push(eq)
    addLog(db, user.id, 'equipment', 'create')
    return ok({ ...eq, store: storeView(db, db.stores.find((s) => s.id === storeId)!) })
  }
  if (root === 'equipment' && second && !third && method === 'PATCH') {
    const eq = db.equipment.find((e) => e.id === second)
    if (!eq) return fail(404, '器械不存在')
    const body = asRecord(request.body)
    if (body.name != null) eq.name = String(body.name)
    if (body.model != null) eq.model = String(body.model)
    if (body.location != null) eq.location = String(body.location)
    if (body.status != null) eq.status = String(body.status) as typeof eq.status
    return ok({ ...eq, store: storeView(db, db.stores.find((s) => s.id === eq.storeId)!) })
  }

  if (root === 'equipment-inspections' && !second && method === 'GET') {
    const keyword = (request.searchParams.get('keyword') || '').toLowerCase()
    const page = Math.max(1, Number(request.searchParams.get('page') || 1))
    const pageSize = Math.max(1, Number(request.searchParams.get('pageSize') || 20))
    const list = db.equipmentInspections
      .filter((insp) => {
        if (keyword) {
          const eq = db.equipment.find((e) => e.id === insp.equipmentId)
          if (eq && `${eq.name}${eq.model}`.toLowerCase().includes(keyword)) return true
          const inspector = db.users.find((u) => u.id === insp.inspectorId)
          if (inspector && `${inspector.name}`.toLowerCase().includes(keyword)) return true
          return false
        }
        return true
      })
      .sort((a, b) => b.inspectedAt.localeCompare(a.inspectedAt))
    const enriched = list.map((insp) => {
      const eq = db.equipment.find((e) => e.id === insp.equipmentId)
      const inspector = db.users.find((u) => u.id === insp.inspectorId)
      return {
        ...insp,
        equipment: eq ? { id: eq.id, name: eq.name, model: eq.model, location: eq.location } : null,
        inspector: inspector ? { id: inspector.id, name: inspector.name } : null,
      }
    })
    return ok(pageOf(enriched, page, pageSize))
  }
  if (root === 'trainers' && method === 'GET') {
    return ok(
      db.trainers.map((t) => {
        const store = db.stores.find((s) => s.id === t.storeId)
        return { ...t, store: store ? { id: store.id, name: store.name } : null }
      }),
    )
  }

  if (root === 'equipment-inspections' && !second && method === 'POST') {
    const body = asRecord(request.body)
    const equipmentId = String(body.equipmentId || '')
    const eq = db.equipment.find((e) => e.id === equipmentId)
    if (!eq) return fail(404, '器械不存在')
    const inspection: typeof db.equipmentInspections[0] = {
      id: nextId('insp'),
      equipmentId,
      inspectedAt: new Date().toISOString(),
      inspectorId: user.id,
      status: String(body.status || 'PASS') as typeof db.equipmentInspections[0]['status'],
      notes: String(body.notes || ''),
    }
    db.equipmentInspections.unshift(inspection)
    eq.lastInspectedAt = inspection.inspectedAt
    if (inspection.status === 'FAIL') eq.status = 'MAINTENANCE'
    else if (inspection.status === 'REPAIR_NEEDED') eq.status = 'WARNING'
    else eq.status = 'NORMAL'
    addLog(db, user.id, 'equipment-inspection', 'create')
    return ok({
      ...inspection,
      equipment: { id: eq.id, name: eq.name, model: eq.model, location: eq.location },
      inspector: { id: user.id, name: user.name },
    })
  }

  if (root === 'data-imports' && second === 'template' && method === 'GET') {
    return ok({
      content: 'orderNo,storeCode,productCode,quantity,status\nDEMO-1,SH001,P001,2,COMPLETED\n',
      fileName: 'orders-import-template.csv',
    })
  }
  if (root === 'data-imports' && second === 'upload' && method === 'POST') {
    const file = request.formData?.get('file')
    if (!(file instanceof File)) return fail(400, '请上传 CSV 文件')
    if (file.size > 2 * 1024 * 1024) return fail(400, '文件不能超过 2MB')
    const text = awaitableText(file)
    const { rows, errors } = parseCsv(text)
    const task = {
      id: nextId('import'),
      fileName: file.name,
      status: (errors.length && !rows.length ? 'FAILED' : 'PREVIEW') as 'PREVIEW' | 'FAILED',
      totalRows: rows.length + errors.length,
      successRows: rows.length,
      failedRows: errors.length,
      createdAt: new Date().toISOString(),
      createdById: user.id,
      errors: errors.map((e) => ({ id: nextId('ie'), ...e })),
      previewData: rows.slice(0, 20),
    }
    db.imports.unshift(task)
    return ok({
      ...task,
      createdBy: { name: user.name },
    })
  }
  if (root === 'data-imports' && second && third === 'confirm' && method === 'POST') {
    const task = db.imports.find((t) => t.id === second)
    if (!task) return fail(404, '导入任务不存在')
    if (task.status === 'FAILED') return fail(400, '失败任务无法确认导入')
    task.status = 'IMPORTED'
    addLog(db, user.id, 'data-import', 'confirm')
    return ok({ ...task, createdBy: { name: user.name } })
  }
  if (root === 'data-imports' && !second && method === 'GET') {
    const page = Math.max(1, Number(request.searchParams.get('page') || 1))
    const pageSize = Math.max(1, Number(request.searchParams.get('pageSize') || 20))
    const list = db.imports.map((task) => {
      const creator = db.users.find((u) => u.id === task.createdById)
      return { ...task, createdBy: { name: creator?.name ?? '-' } }
    })
    return ok(pageOf(list, page, pageSize))
  }

  if (root === 'system' && second === 'users' && !third && method === 'GET') {
    return ok(db.users.map((u) => userView(db, u)))
  }
  if (root === 'system' && second === 'users' && !third && method === 'POST') {
    const body = asRecord(request.body)
    const created: User = {
      id: nextId('user'),
      username: String(body.username || ''),
      password: String(body.password || 'YueDong@123456'),
      name: String(body.name || ''),
      email: String(body.email || ''),
      phone: String(body.phone || ''),
      enabled: true,
      regionId: body.regionId ? String(body.regionId) : null,
      storeId: body.storeId ? String(body.storeId) : null,
      roleIds: body.roleId ? [String(body.roleId)] : [],
    }
    if (!created.username || !created.name) return fail(400, '用户名和姓名必填')
    if (db.users.some((u) => u.username === created.username)) return fail(400, '用户名已存在')
    db.users.push(created)
    addLog(db, user.id, 'user', 'create')
    return ok({ id: created.id, username: created.username, name: created.name })
  }
  if (root === 'system' && second === 'users' && third && method === 'PATCH') {
    const target = db.users.find((u) => u.id === third)
    if (!target) return fail(404, '用户不存在')
    const body = asRecord(request.body)
    if (body.name != null) target.name = String(body.name)
    if (body.email != null) target.email = String(body.email)
    if (body.phone != null) target.phone = String(body.phone)
    if (body.regionId !== undefined) target.regionId = body.regionId ? String(body.regionId) : null
    if (body.storeId !== undefined) target.storeId = body.storeId ? String(body.storeId) : null
    if (body.enabled != null) target.enabled = Boolean(body.enabled)
    if (body.roleId != null) target.roleIds = body.roleId ? [String(body.roleId)] : []
    if (body.password) target.password = String(body.password)
    return ok(userView(db, target))
  }

  if (root === 'system' && second === 'roles' && !third && method === 'GET') {
    return ok(db.roles.map((role) => roleView(db, role)))
  }
  if (root === 'system' && second === 'roles' && !third && method === 'POST') {
    const body = asRecord(request.body)
    const role: Role = {
      id: nextId('role'),
      code: String(body.code || ''),
      name: String(body.name || ''),
      description: String(body.description || ''),
      dataScope: (['ALL', 'REGION', 'STORE'].includes(String(body.dataScope))
        ? String(body.dataScope)
        : 'ALL') as DataScope,
      permissionIds: Array.isArray(body.permissionIds) ? body.permissionIds.map(String) : [],
    }
    db.roles.push(role)
    return ok(roleView(db, role))
  }
  if (root === 'system' && second === 'roles' && third && method === 'PATCH') {
    const role = db.roles.find((r) => r.id === third)
    if (!role) return fail(404, '角色不存在')
    const body = asRecord(request.body)
    if (body.code != null) role.code = String(body.code)
    if (body.name != null) role.name = String(body.name)
    if (body.description != null) role.description = String(body.description)
    if (body.dataScope != null) role.dataScope = String(body.dataScope) as DataScope
    if (Array.isArray(body.permissionIds)) role.permissionIds = body.permissionIds.map(String)
    return ok(roleView(db, role))
  }

  if (root === 'system' && second === 'permissions' && method === 'GET') {
    return ok(db.permissions)
  }

  if (root === 'system' && second === 'logs' && method === 'GET') {
    const keyword = (request.searchParams.get('keyword') || '').toLowerCase()
    const page = Math.max(1, Number(request.searchParams.get('page') || 1))
    const pageSize = Math.max(1, Number(request.searchParams.get('pageSize') || 20))
    const list = db.logs
      .filter((log) => {
        if (!keyword) return true
        const actor = db.users.find((u) => u.id === log.userId)
        return `${actor?.name || ''}${actor?.username || ''}${log.module}${log.action}`
          .toLowerCase()
          .includes(keyword)
      })
      .map((log) => {
        const actor = db.users.find((u) => u.id === log.userId)
        return {
          ...log,
          user: actor ? { name: actor.name, username: actor.username } : null,
        }
      })
    return ok(pageOf(list, page, pageSize))
  }

  return fail(404, `未实现的 Mock 接口：${method} /${segments.join('/')}`)
}

function awaitableText(file: File): string {
  if (typeof (file as File & { _mockText?: string })._mockText === 'string') {
    return (file as File & { _mockText?: string })._mockText || ''
  }
  return ''
}

export async function handleMockApiAsync(request: MockRequest): Promise<MockResponse> {
  if (
    request.method.toUpperCase() === 'POST' &&
    request.path.replace(/^\/+/, '').startsWith('data-imports/upload') &&
    request.formData
  ) {
    const file = request.formData.get('file')
    if (file instanceof File) {
      const text = await file.text()
      ;(file as File & { _mockText?: string })._mockText = text
    }
  }
  return handleMockApi(request)
}

export function getAuthUserFromCookie(cookieHeader?: string | null): AuthUser | null {
  const db = getDb()
  const userId = parseSessionUserId(cookieHeader)
  if (!userId) return null
  const user = db.users.find((u) => u.id === userId && u.enabled)
  return user ? toAuthUser(db, user) : null
}
