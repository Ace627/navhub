import Layout from '@/layout/index.vue'
import type { RouteRecordRaw } from 'vue-router'
import { RouterConstant } from '../router.constant'
import { TOOL_ROUTES } from './tool.route'
import { API_ROUTES } from './api.route'
import { STUDY_ROUTES } from './study.route'
import { SOFTWARE_ROUTES } from './software.route'
import { WALLPAPER_ROUTES } from './wallpaper.route'
import { FRONTEND_ROUTES } from './frontend.route'
import { AI_ROUTES } from './ai.route'

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
        meta: { title: '最近使用', icon: 'Home', affix: true },
      },

      {
        name: 'Movie',
        path: 'movie',
        component: () => import('@/views/movie/index.vue'),
        meta: { title: '免费追剧', icon: 'Movie' },
      },

      ...AI_ROUTES,

      ...FRONTEND_ROUTES,

      ...SOFTWARE_ROUTES,

      ...TOOL_ROUTES,

      ...API_ROUTES,

      ...STUDY_ROUTES,

      ...WALLPAPER_ROUTES,

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
    meta: { hidden: true, title: '页面不存在' },
  },
]
