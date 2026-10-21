/**
 * 内存 Mock 数据库：进程内共享，热重载时尽量保留。
 * 教学用途，数据刷新页面后仍在，重启 dev server 会重置。
 */

export type DataScope = 'ALL' | 'REGION' | 'STORE'

export type Permission = {
  id: string
  code: string
  name: string
  type: string
  path: string | null
}
export type Role = {
  id: string
  code: string
  name: string
  description: string
  dataScope: DataScope
  permissionIds: string[]
}
export type Region = { id: string; code: string; name: string; enabled: boolean }
export type Store = {
  id: string
  code: string
  name: string
  regionId: string
  address: string
  phone: string
  openedAt: string
  enabled: boolean
  managerId: string | null
}
export type Category = { id: string; code: string; name: string; sort: number; enabled: boolean }
export type Product = {
  id: string
  code: string
  name: string
  categoryId: string
  price: number
  costPrice: number
  imageUrl: string | null
  enabled: boolean
}
export type User = {
  id: string
  username: string
  password: string
  name: string
  email: string
  phone: string
  enabled: boolean
  regionId: string | null
  storeId: string | null
  roleIds: string[]
}
export type OrderItem = {
  id: string
  productId: string
  quantity: number
  unitPrice: number
  subtotal: number
}
export type Order = {
  id: string
  orderNo: string
  storeId: string
  orderedAt: string
  status: 'COMPLETED' | 'CANCELED'
  originalAmount: number
  discountAmount: number
  paidAmount: number
  items: OrderItem[]
}
export type MetricDefinition = {
  id: string
  code: string
  name: string
  description: string
  formula: string
  enabled: boolean
}
export type ImportError = { id: string; rowNo: number; field?: string; message: string }
export type ImportTask = {
  id: string
  fileName: string
  status: 'PREVIEW' | 'READY' | 'IMPORTED' | 'FAILED'
  totalRows: number
  successRows: number
  failedRows: number
  createdAt: string
  createdById: string
  errors: ImportError[]
  previewData: Record<string, string>[]
}
export type OperationLog = {
  id: string
  createdAt: string
  module: string
  action: string
  success: boolean
  ip: string
  userId: string | null
}

// ── 健身连锁新增实体 ──
export type MemberCardType = 'TIMES' | 'MONTHLY' | 'YEARLY'
export type MemberCard = {
  id: string
  cardNo: string
  memberName: string
  memberPhone: string
  storeId: string
  cardType: MemberCardType
  totalVisits: number | null
  remainingVisits: number | null
  price: number
  startDate: string
  endDate: string
  status: 'ACTIVE' | 'EXPIRED' | 'FROZEN'
  createdAt: string
}
export type Trainer = {
  id: string
  name: string
  phone: string
  specialty: string
  storeId: string
  enabled: boolean
}
export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED'
export type TrainerBooking = {
  id: string
  bookingNo: string
  memberName: string
  memberPhone: string
  trainerId: string
  storeId: string
  sessionDate: string
  timeSlot: string
  status: BookingStatus
  notes: string
  createdAt: string
}
export type EquipmentStatus = 'NORMAL' | 'WARNING' | 'MAINTENANCE'
export type Equipment = {
  id: string
  name: string
  model: string
  storeId: string
  location: string
  lastInspectedAt: string | null
  status: EquipmentStatus
}
export type InspectionStatus = 'PASS' | 'FAIL' | 'REPAIR_NEEDED'
export type EquipmentInspection = {
  id: string
  equipmentId: string
  inspectedAt: string
  inspectorId: string
  status: InspectionStatus
  notes: string
}

export type MockDb = {
  permissions: Permission[]
  roles: Role[]
  regions: Region[]
  stores: Store[]
  categories: Category[]
  products: Product[]
  users: User[]
  orders: Order[]
  metrics: MetricDefinition[]
  imports: ImportTask[]
  logs: OperationLog[]
  memberCards: MemberCard[]
  trainers: Trainer[]
  trainerBookings: TrainerBooking[]
  equipment: Equipment[]
  equipmentInspections: EquipmentInspection[]
  seq: number
}

const DEMO_PASSWORD = 'YueDong@123456'

function id(prefix: string, n: number) {
  return `${prefix}_${String(n).padStart(3, '0')}`
}

export function createSeedDb(): MockDb {
  const permissionSeeds: Array<[string, string, string, string | null]> = [
    ['dashboard:view', '经营总览', 'MENU', '/dashboard'],
    ['region:view', '区域查看', 'MENU', '/regions'],
    ['region:create', '区域新增', 'BUTTON', null],
    ['region:edit', '区域编辑', 'BUTTON', null],
    ['store:view', '门店查看', 'MENU', '/stores'],
    ['store:create', '门店新增', 'BUTTON', null],
    ['store:edit', '门店编辑', 'BUTTON', null],
    ['service-category:view', '服务分类查看', 'MENU', '/service-categories'],
    ['service-category:edit', '服务分类维护', 'BUTTON', null],
    ['service:view', '服务查看', 'MENU', '/services'],
    ['service:create', '服务新增', 'BUTTON', null],
    ['service:edit', '服务编辑', 'BUTTON', null],
    ['order:view', '订单查看', 'MENU', '/orders'],
    ['order:create', '演示订单', 'BUTTON', null],
    ['member-card:view', '会员卡查看', 'MENU', '/member-cards'],
    ['member-card:create', '会员卡办理', 'BUTTON', null],
    ['member-card:edit', '会员卡编辑', 'BUTTON', null],
    ['trainer-booking:view', '私教预约查看', 'MENU', '/trainer-bookings'],
    ['trainer-booking:create', '私教预约新增', 'BUTTON', null],
    ['trainer-booking:edit', '私教预约编辑', 'BUTTON', null],
    ['equipment:view', '器械查看', 'MENU', '/equipment-inspections'],
    ['equipment:edit', '器械编辑', 'BUTTON', null],
    ['equipment-inspection:view', '巡检记录查看', 'MENU', '/equipment-inspections/records'],
    ['equipment-inspection:create', '巡检录入', 'BUTTON', null],
    ['data-import:create', '数据导入', 'MENU', '/data-imports'],
    ['data-import:view', '导入记录', 'MENU', '/data-imports/history'],
    ['metric:view', '指标查看', 'MENU', '/metrics'],
    ['metric:edit', '指标启停', 'BUTTON', null],
    ['user:view', '用户查看', 'MENU', '/system/users'],
    ['user:edit', '用户维护', 'BUTTON', null],
    ['role:view', '角色查看', 'MENU', '/system/roles'],
    ['role:edit', '角色维护', 'BUTTON', null],
    ['log:view', '日志查看', 'MENU', '/system/logs'],
  ]

  const permissions = permissionSeeds.map(([code, name, type, path], i) => ({
    id: id('perm', i + 1),
    code,
    name,
    type,
    path,
  }))
  const allCodes = permissions.map((p) => p.code)
  const byCode = (codes: string[]) =>
    permissions.filter((p) => codes.includes(p.code)).map((p) => p.id)

  const roles: Role[] = [
    {
      id: 'role_admin',
      code: 'SUPER_ADMIN',
      name: '超级管理员',
      description: '拥有全部菜单、按钮和数据权限',
      dataScope: 'ALL',
      permissionIds: permissions.map((p) => p.id),
    },
    {
      id: 'role_operator',
      code: 'HQ_OPERATOR',
      name: '总部运营',
      description: '管理经营基础数据',
      dataScope: 'ALL',
      permissionIds: byCode(
        allCodes.filter((c) => !c.startsWith('user:') && !c.startsWith('role:')),
      ),
    },
    {
      id: 'role_region',
      code: 'REGION_MANAGER',
      name: '区域经理',
      description: '查看所属区域经营数据',
      dataScope: 'REGION',
      permissionIds: byCode([
        'dashboard:view',
        'store:view',
        'service:view',
        'order:view',
        'metric:view',
        'member-card:view',
        'trainer-booking:view',
        'equipment:view',
        'equipment-inspection:view',
      ]),
    },
    {
      id: 'role_store',
      code: 'STORE_MANAGER',
      name: '门店店长',
      description: '查看所属门店数据',
      dataScope: 'STORE',
      permissionIds: byCode([
        'dashboard:view',
        'service:view',
        'order:view',
        'member-card:view',
        'member-card:create',
        'trainer-booking:view',
        'trainer-booking:create',
        'equipment:view',
        'equipment-inspection:view',
        'equipment-inspection:create',
      ]),
    },
    {
      id: 'role_analyst',
      code: 'ANALYST',
      name: '数据分析员',
      description: '查看经营分析数据',
      dataScope: 'ALL',
      permissionIds: byCode([
        'dashboard:view',
        'store:view',
        'service:view',
        'order:view',
        'metric:view',
        'member-card:view',
        'trainer-booking:view',
        'data-import:view',
      ]),
    },
  ]

  const regions: Region[] = [
    { id: 'region_east', code: 'EAST', name: '华东区域', enabled: true },
    { id: 'region_south', code: 'SOUTH', name: '华南区域', enabled: true },
    { id: 'region_north', code: 'NORTH', name: '华北区域', enabled: true },
  ]

  const stores: Store[] = [
    {
      id: 'store_sh001',
      code: 'SH001',
      name: '上海静安旗舰店',
      regionId: 'region_east',
      address: '上海市静安区南京西路',
      phone: '021-60000001',
      openedAt: '2024-01-08T00:00:00.000Z',
      enabled: true,
      managerId: 'user_store',
    },
    {
      id: 'store_hz001',
      code: 'HZ001',
      name: '杭州西湖店',
      regionId: 'region_east',
      address: '杭州市西湖区北山街',
      phone: '0571-60000002',
      openedAt: '2024-03-18T00:00:00.000Z',
      enabled: true,
      managerId: null,
    },
    {
      id: 'store_gz001',
      code: 'GZ001',
      name: '广州天河店',
      regionId: 'region_south',
      address: '广州市天河区体育西路',
      phone: '020-60000003',
      openedAt: '2024-05-20T00:00:00.000Z',
      enabled: true,
      managerId: null,
    },
    {
      id: 'store_bj001',
      code: 'BJ001',
      name: '北京朝阳店',
      regionId: 'region_north',
      address: '北京市朝阳区建国路',
      phone: '010-60000004',
      openedAt: '2024-07-01T00:00:00.000Z',
      enabled: true,
      managerId: null,
    },
  ]

  const categories: Category[] = [
    { id: 'cat_group', code: 'GROUP', name: '团课', sort: 1, enabled: true },
    { id: 'cat_pt', code: 'PT', name: '私教服务', sort: 2, enabled: true },
    { id: 'cat_card', code: 'CARD', name: '会员卡', sort: 3, enabled: true },
    { id: 'cat_spa', code: 'SPA', name: 'SPA理疗', sort: 4, enabled: true },
  ]

  const products: Product[] = [
    {
      id: 'prod_p001',
      code: 'P001',
      name: '瑜伽精品课',
      categoryId: 'cat_group',
      price: 128,
      costPrice: 45,
      imageUrl: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400',
      enabled: true,
    },
    {
      id: 'prod_p002',
      code: 'P002',
      name: '动感单车课',
      categoryId: 'cat_group',
      price: 98,
      costPrice: 30,
      imageUrl: 'https://images.unsplash.com/photo-1558611848-73f7eb4001a1?w=400',
      enabled: true,
    },
    {
      id: 'prod_p003',
      code: 'P003',
      name: '私教一对一体验',
      categoryId: 'cat_pt',
      price: 380,
      costPrice: 150,
      imageUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400',
      enabled: true,
    },
    {
      id: 'prod_p004',
      code: 'P004',
      name: '游泳月卡',
      categoryId: 'cat_card',
      price: 568,
      costPrice: 200,
      imageUrl: 'https://images.unsplash.com/photo-1530549387789-4c1017266635?w=400',
      enabled: true,
    },
    {
      id: 'prod_p005',
      code: 'P005',
      name: '深层肌肉放松SPA',
      categoryId: 'cat_spa',
      price: 268,
      costPrice: 100,
      imageUrl: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=400',
      enabled: true,
    },
  ]

  const users: User[] = [
    {
      id: 'user_admin',
      username: 'admin',
      password: DEMO_PASSWORD,
      name: '系统管理员',
      email: 'admin@yuedongfitness.local',
      phone: '',
      enabled: true,
      regionId: null,
      storeId: null,
      roleIds: ['role_admin'],
    },
    {
      id: 'user_east',
      username: 'east.manager',
      password: DEMO_PASSWORD,
      name: '华东区域经理',
      email: 'east@yuedongfitness.local',
      phone: '',
      enabled: true,
      regionId: 'region_east',
      storeId: null,
      roleIds: ['role_region'],
    },
    {
      id: 'user_store',
      username: 'store.manager',
      password: DEMO_PASSWORD,
      name: '门店店长',
      email: 'store@yuedongfitness.local',
      phone: '',
      enabled: true,
      regionId: 'region_east',
      storeId: 'store_sh001',
      roleIds: ['role_store'],
    },
  ]

  const orders: Order[] = []
  const now = new Date()
  let orderSeq = 1
  for (let day = 20; day >= 0; day -= 1) {
    for (let index = 0; index < stores.length; index += 1) {
      const orderedAt = new Date(now)
      orderedAt.setDate(now.getDate() - day)
      orderedAt.setHours(8 + ((day + index * 3) % 12), 20, 0, 0)
      const product = products[(day + index) % products.length]
      const quantity = 1 + ((day + index) % 3)
      const original = product.price * quantity
      const discount = day % 5 === 0 ? 20 : 0
      orders.push({
        id: id('order', orderSeq++),
        orderNo: `SEED-${String(day).padStart(2, '0')}-${index}`,
        storeId: stores[index].id,
        orderedAt: orderedAt.toISOString(),
        status: day % 11 === 0 ? 'CANCELED' : 'COMPLETED',
        originalAmount: original,
        discountAmount: discount,
        paidAmount: original - discount,
        items: [
          {
            id: id('oi', orderSeq),
            productId: product.id,
            quantity,
            unitPrice: product.price,
            subtotal: original,
          },
        ],
      })
    }
  }

  const metrics: MetricDefinition[] = [
    {
      id: 'metric_revenue',
      code: 'REVENUE',
      name: '营业额',
      description: '已完成订单实付金额之和',
      formula: 'SUM(orders.paidAmount)',
      enabled: true,
    },
    {
      id: 'metric_orders',
      code: 'ORDER_COUNT',
      name: '订单量',
      description: '已完成订单数量',
      formula: 'COUNT(DISTINCT orders.id)',
      enabled: true,
    },
    {
      id: 'metric_aov',
      code: 'AVG_ORDER_VALUE',
      name: '平均客单价',
      description: '营业额除以订单量',
      formula: 'REVENUE / ORDER_COUNT',
      enabled: true,
    },
    {
      id: 'metric_sales',
      code: 'SERVICE_SALES',
      name: '服务销量',
      description: '已完成订单服务数量之和',
      formula: 'SUM(orderItems.quantity)',
      enabled: true,
    },
    {
      id: 'metric_members',
      code: 'ACTIVE_MEMBERS',
      name: '活跃会员',
      description: '持有有效会员卡且30天内到店',
      formula: 'COUNT(DISTINCT memberCards.memberName)',
      enabled: true,
    },
  ]

  // ── 健身连锁种子数据 ──
  const memberCards: MemberCard[] = []
  const memberNames = [
    '张伟', '李娜', '王芳', '刘洋', '陈静', '杨帆', '赵磊', '黄敏',
    '周强', '吴倩', '徐阳', '孙丽', '马俊', '朱琳', '胡斌', '郭婷',
  ]
  const memberPhones = ['138****8001', '139****8002', '150****8003', '158****8004', '186****8005']
  const cardTypes: MemberCardType[] = ['TIMES', 'MONTHLY', 'YEARLY']
  const cardPrices = { TIMES: 1980, MONTHLY: 580, YEARLY: 3980 }
  const cardVisits = { TIMES: 30, MONTHLY: null, YEARLY: null }

  let cardSeq = 1
  for (let i = 0; i < 36; i += 1) {
    const store = stores[i % stores.length]
    const type = cardTypes[i % cardTypes.length]
    const start = new Date(now)
    start.setDate(now.getDate() - (i * 3 + 10))
    const end = new Date(start)
    if (type === 'MONTHLY') end.setMonth(start.getMonth() + 1)
    else if (type === 'YEARLY') end.setFullYear(start.getFullYear() + 1)
    else end.setDate(start.getDate() + 180)

    const totalVisits = cardVisits[type]
    const used = type === 'TIMES' ? (i * 7) % 30 : null
    const remaining = totalVisits !== null ? Math.max(0, totalVisits - (used ?? 0)) : null
    const isExpired = end < now

    memberCards.push({
      id: id('card', cardSeq++),
      cardNo: `YD-${String(cardSeq - 1).padStart(4, '0')}`,
      memberName: memberNames[i % memberNames.length],
      memberPhone: memberPhones[i % memberPhones.length],
      storeId: store.id,
      cardType: type,
      totalVisits,
      remainingVisits: remaining,
      price: cardPrices[type],
      startDate: start.toISOString().slice(0, 10),
      endDate: end.toISOString().slice(0, 10),
      status: isExpired ? 'EXPIRED' : i % 8 === 0 ? 'FROZEN' : 'ACTIVE',
      createdAt: start.toISOString(),
    })
  }

  const trainers: Trainer[] = [
    { id: 'trainer_001', name: '阿凯', phone: '138****1001', specialty: '力量训练', storeId: 'store_sh001', enabled: true },
    { id: 'trainer_002', name: 'Mia', phone: '139****1002', specialty: '瑜伽普拉提', storeId: 'store_sh001', enabled: true },
    { id: 'trainer_003', name: '大熊', phone: '150****1003', specialty: 'CrossFit', storeId: 'store_hz001', enabled: true },
    { id: 'trainer_004', name: 'Luna', phone: '158****1004', specialty: '游泳教练', storeId: 'store_gz001', enabled: true },
    { id: 'trainer_005', name: 'Leo', phone: '186****1005', specialty: '康复训练', storeId: 'store_bj001', enabled: true },
    { id: 'trainer_006', name: 'Sophia', phone: '137****1006', specialty: '减脂塑形', storeId: 'store_sh001', enabled: true },
  ]

  const trainerBookings: TrainerBooking[] = []
  const timeSlots = ['09:00-10:00', '10:00-11:00', '14:00-15:00', '16:00-17:00', '19:00-20:00']
  let bookingSeq = 1
  for (let i = 0; i < 24; i += 1) {
    const trainer = trainers[i % trainers.length]
    const bookingDate = new Date(now)
    bookingDate.setDate(now.getDate() + (i % 5 - 2))
    const status = i % 7 === 0 ? 'CANCELLED' : i % 3 === 0 ? 'COMPLETED' : i % 2 === 0 ? 'CONFIRMED' : 'PENDING'
    trainerBookings.push({
      id: id('bk', bookingSeq++),
      bookingNo: `PT-${String(bookingSeq - 1).padStart(4, '0')}`,
      memberName: memberNames[i % memberNames.length],
      memberPhone: memberPhones[i % memberPhones.length],
      trainerId: trainer.id,
      storeId: trainer.storeId,
      sessionDate: bookingDate.toISOString().slice(0, 10),
      timeSlot: timeSlots[i % timeSlots.length],
      status,
      notes: i % 3 === 0 ? '首次体验课' : '',
      createdAt: new Date(now.getTime() - 86400000).toISOString(),
    })
  }

  const equipment: Equipment[] = [
    { id: 'eq_001', name: '跑步机', model: 'LifeFitness T5', storeId: 'store_sh001', location: '有氧区A-01', lastInspectedAt: '2026-10-10T08:00:00.000Z', status: 'NORMAL' },
    { id: 'eq_002', name: '跑步机', model: 'LifeFitness T5', storeId: 'store_sh001', location: '有氧区A-02', lastInspectedAt: '2026-10-12T08:00:00.000Z', status: 'NORMAL' },
    { id: 'eq_003', name: '椭圆机', model: 'Precor EFX 835', storeId: 'store_sh001', location: '有氧区A-05', lastInspectedAt: '2026-10-08T08:00:00.000Z', status: 'WARNING' },
    { id: 'eq_004', name: '史密斯架', model: 'Technogym MD45', storeId: 'store_sh001', location: '力量区B-01', lastInspectedAt: '2026-10-05T08:00:00.000Z', status: 'NORMAL' },
    { id: 'eq_005', name: '哑铃套装', model: 'Rogue Rubber Hex', storeId: 'store_hz001', location: '自由重量区C-01', lastInspectedAt: '2026-10-11T08:00:00.000Z', status: 'NORMAL' },
    { id: 'eq_006', name: '动感单车', model: 'Keiser M3i', storeId: 'store_gz001', location: '单车房D-10', lastInspectedAt: '2026-09-28T08:00:00.000Z', status: 'MAINTENANCE' },
    { id: 'eq_007', name: '划船机', model: 'Concept2 Model D', storeId: 'store_bj001', location: '有氧区A-08', lastInspectedAt: '2026-10-09T08:00:00.000Z', status: 'NORMAL' },
    { id: 'eq_008', name: '龙门架', model: 'Matrix G3-MS80', storeId: 'store_sh001', location: '力量区B-03', lastInspectedAt: '2026-10-14T08:00:00.000Z', status: 'NORMAL' },
  ]

  const equipmentInspections: EquipmentInspection[] = []
  const inspectionStatuses: InspectionStatus[] = ['PASS', 'PASS', 'PASS', 'FAIL', 'REPAIR_NEEDED']
  const inspectors = ['user_admin', 'user_store']
  let inspSeq = 1
  for (let i = 0; i < 20; i += 1) {
    const eq = equipment[i % equipment.length]
    const inspDate = new Date(now)
    inspDate.setDate(now.getDate() - (i * 2 + 1))
    equipmentInspections.push({
      id: id('insp', inspSeq++),
      equipmentId: eq.id,
      inspectedAt: inspDate.toISOString(),
      inspectorId: inspectors[i % inspectors.length],
      status: inspectionStatuses[i % inspectionStatuses.length],
      notes: i % 4 === 0 ? '皮带磨损需要关注' : i % 4 === 1 ? '运行正常' : i % 4 === 2 ? '螺丝已紧固' : '',
    })
    eq.lastInspectedAt = inspDate.toISOString()
  }

  const logs: OperationLog[] = [
    {
      id: 'log_001',
      createdAt: new Date(Date.now() - 3600_000).toISOString(),
      module: 'auth',
      action: 'login',
      success: true,
      ip: '127.0.0.1',
      userId: 'user_admin',
    },
    {
      id: 'log_002',
      createdAt: new Date(Date.now() - 7200_000).toISOString(),
      module: 'member-card',
      action: 'create',
      success: true,
      ip: '127.0.0.1',
      userId: 'user_admin',
    },
  ]

  return {
    permissions,
    roles,
    regions,
    stores,
    categories,
    products,
    users,
    orders,
    metrics,
    imports: [],
    logs,
    memberCards,
    trainers,
    trainerBookings,
    equipment,
    equipmentInspections,
    seq: 1000,
  }
}

type GlobalMock = typeof globalThis & { __yuedongFrontendMockDb?: MockDb }

export function getDb(): MockDb {
  const g = globalThis as GlobalMock
  if (!g.__yuedongFrontendMockDb) {
    g.__yuedongFrontendMockDb = createSeedDb()
  }
  return g.__yuedongFrontendMockDb
}

export function nextId(prefix: string) {
  const db = getDb()
  db.seq += 1
  return id(prefix, db.seq)
}

export function resetDb() {
  const g = globalThis as GlobalMock
  g.__yuedongFrontendMockDb = createSeedDb()
  return g.__yuedongFrontendMockDb
}
