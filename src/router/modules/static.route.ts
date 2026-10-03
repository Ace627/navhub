import Layout from '@/layout/index.vue'
import type { RouteRecordRaw } from 'vue-router'
import { RouterConstant } from '../router.constant'
import { TOOL_ROUTES } from './tool.route'

export const STATIC_ROUTE_LIST: RouteRecordRaw[] = [
  {
    name: RouterConstant.LAYOUT_NAME, // 布局路由配置 确保可以显示布局框架
    path: '',
    component: Layout,
    redirect: RouterConstant.HOME_PAGE_URL,
    children: [
      {
        name: RouterConstant.HOME_PAGE_NAME,
        path: 'dashboard',
        component: () => import('@/views/dashboard/index.vue'),
        meta: { title: '首页', icon: 'Home', affix: true },
      },

      ...TOOL_ROUTES,

      {
        name: 'About',
        path: 'about',
        component: () => import('@/views/about/index.vue'),
        meta: { title: '关于我们', icon: 'About' },
      },
    ],
  },

  {
    path: '/:pathMatch(.*)*', // 404页面（必须放在最后）
    component: () => import('@/views/core/404.vue'),
    meta: { hidden: true },
  },
]
