import type { RouteRecordRaw } from 'vue-router'

export const SOFTWARE_ROUTES: RouteRecordRaw[] = [
  {
    path: '/software',
    name: 'Software',
    component: () => import('@/views/software/index.vue'),
    meta: { title: '好软推荐', icon: 'Software' },
  },
]
