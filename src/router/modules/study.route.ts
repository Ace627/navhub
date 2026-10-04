import type { RouteRecordRaw } from 'vue-router'

export const STUDY_ROUTES: RouteRecordRaw[] = [
  {
    path: '/study',
    name: 'Study',
    component: () => import('@/views/study/index.vue'),
    meta: { title: '自我提升', icon: 'Study' },
  },
]
