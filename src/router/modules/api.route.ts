import type { RouteRecordRaw } from 'vue-router'

export const API_ROUTES: RouteRecordRaw[] = [
  {
    path: '/api',
    name: 'Api',
    component: () => import('@/views/api/index.vue'),
    meta: { title: '公益接口', icon: 'Api' },
  },
]
