import type { RouteRecordRaw } from 'vue-router'

export const FRONTEND_ROUTES: RouteRecordRaw[] = [
  {
    path: '/frontend',
    name: 'Frontend',
    component: () => import('@/views/frontend/index.vue'),
    meta: { title: '前端专家', icon: 'Frontend' },
  },
  {
    path: '/frontend/:key',
    name: 'FrontendDetail',
    component: () => import('@/views/frontend/detail.vue'),
    meta: { title: '详情', hidden: true },
  },
]
