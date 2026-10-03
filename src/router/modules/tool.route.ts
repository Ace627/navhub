import type { RouteRecordRaw } from 'vue-router'

export const TOOL_ROUTES: RouteRecordRaw[] = [
  {
    path: '/tool',
    name: 'Tool',
    component: () => import('@/views/tool/index.vue'),
    meta: { title: '实用工具', icon: 'Tool' },
  },
  {
    path: '/tool/:key',
    name: 'ToolDetail',
    component: () => import('@/views/tool/detail.vue'),
    meta: { title: '工具详情', hidden: true },
  },
]
