# 悦动健身连锁数据中控台

基于 Next.js 16 App Router 的前端框架教学项目，参考晴天咖啡数据中控台架构，改造为健身连锁经营管理场景。

## 核心特性

- **全栈教学**：前端框架 + Mock 后端，单仓即可运行完整系统
- **三大新增功能**：会员卡管理、私教预约、器械巡检
- **RBAC 权限**：5 种角色 + 数据范围（全部/区域/门店）
- **服务端预取**：Dashboard 首屏无等待渲染
- **统一数据交互**：api.ts + api-server.ts + use-api.ts 三层模式
- **Redux 状态**：服务端注入预加载状态

## 技术栈

Next.js 16, React 19, TypeScript 6, TailwindCSS 4, Radix UI, Redux Toolkit, Axios, Recharts, TanStack Table, next-themes

## 快速开始

```bash
npm install
npm run dev
```

访问 http://localhost:5173/login

## 演示账号

| 用户名 | 密码 | 角色 |
|--------|------|------|
| admin | YueDong@123456 | 超级管理员 |
| east.manager | YueDong@123456 | 华东区域经理 |
| store.manager | YueDong@123456 | 门店店长 |

## 项目结构

```
app/
  (authenticated)/   受保护页面（16 个路由）
  login/             登录页
  help/              帮助中心
  status/            系统状态
  api/v1/[...path]/  统一 Mock API 路由
src/
  components/        UI + 壳层 + Provider + 权限边界
  views/             业务视图组件
  store/             Redux auth slice
  lib/               api.ts / api-server.ts
  hooks/             use-api.ts
  mock/              db.ts 种子数据 + handlers.ts 假后端
```

## 新增功能 vs 原项目

1. 会员卡管理：次卡/月卡/年卡办理、冻结、编辑
2. 私教预约：教练排课、待确认/已确认/已完成/已取消状态流转
3. 器械巡检：器械档案 + 巡检记录（通过/不合格/需维修）
