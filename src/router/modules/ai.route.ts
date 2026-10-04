import type { RouteRecordRaw } from 'vue-router'

export const AI_ROUTES: RouteRecordRaw[] = [
  {
    path: '/ai',
    name: 'AI',
    component: () => import('@/views/ai/index.vue'),
    meta: { title: '人工智能', icon: 'ChatGPT' },
  },
]
