import type { RouteRecordRaw } from 'vue-router'
import Layout from '@/layout/index.vue'
import { RouterConstant } from './router.constant'
import { buildCategoryRoutes } from './category.registry'
import { resolveStartupRedirect } from './router.helper'

/**
 * 构建静态路由表
 *
 * 须在引导阶段 initCategoryRegistry 执行完成后调用，分类路由依赖注册表数据
 *
 * @returns 完整静态路由列表
 */
export function buildStaticRouteList(): RouteRecordRaw[] {
  return [
    {
      name: RouterConstant.LAYOUT_NAME, // 布局路由配置 确保可以显示布局框架
      path: '',
      component: Layout,
      // 启动页：移动端按用户配置的默认标签页落地，桌面端固定主页，解析逻辑见 router.helper
      redirect: resolveStartupRedirect,
      children: [
        {
          name: RouterConstant.HOME_PAGE_NAME,
          path: 'dashboard',
          component: () => import('@/views/dashboard/index.vue'),
          meta: { title: '首页', icon: 'Home', affix: true },
        },

        // 分类页路由：由分类注册表生成（detail 模式分类自动附带详情子路由），全部指向通用列表页/详情页
        ...buildCategoryRoutes(),

        // 移动端专用页面：底部标签栏（TabBar）的「分类」「我的」落点，hidden 对桌面侧栏不可见
        {
          name: RouterConstant.MOBILE_CATEGORIES_NAME,
          path: 'mobile/categories',
          component: () => import('@/views/mobile/categories/index.vue'),
          meta: { title: '分类', hidden: true },
        },
        {
          name: RouterConstant.MOBILE_PROFILE_NAME,
          path: 'mobile/profile',
          component: () => import('@/views/mobile/profile/index.vue'),
          meta: { title: '我的', hidden: true },
        },
      ],
    },

    {
      name: 'System',
      path: '/system',
      component: Layout,
      redirect: '/404',
      meta: { icon: 'Setting', title: '系统管理' },
      children: [
        {
          name: 'Setting',
          path: 'setting',
          component: () => import('@/views/system/setting/index.vue'),
          meta: { title: '系统设置', icon: 'ConfigSetting' },
        },
        {
          name: 'Icon',
          path: 'icon',
          component: () => import('@/views/system/icon/index.vue'),
          meta: { title: '图标管理', icon: 'Image' },
        },
        {
          name: 'About',
          path: 'about',
          component: () => import('@/views/system/about/index.vue'),
          meta: { title: '关于我们', icon: 'About' },
        },
      ],
    },

    {
      path: '/:pathMatch(.*)*', // 404页面（必须放在最后）
      component: () => import('@/views/system/exception/index.vue'),
      meta: { hidden: true, title: '页面不存在' },
    },
  ]
}
