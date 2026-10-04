import type { RouteRecordRaw } from 'vue-router'

export const SOFTWARE_ROUTES: RouteRecordRaw[] = [
  {
    path: '/software',
    name: 'Software',
    component: () => import('@/views/software/index.vue'),
    meta: { title: '电脑软件', icon: 'Software' },
  },
]
