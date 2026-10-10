import type { RouteRecordRaw } from 'vue-router'
import Layout from '@/layout/index.vue'
import { RouterConstant } from './router.constant'
import { buildCategoryRoutes } from './category.registry'

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
      redirect: RouterConstant.HOME_PAGE_URL,
      children: [
        {
          name: RouterConstant.HOME_PAGE_NAME,
          path: 'dashboard',
          component: () => import('@/views/dashboard/index.vue'),
          meta: { title: '最近使用', icon: 'Home', affix: true },
        },

        // 分类页路由：由分类注册表生成（detail 模式分类自动附带详情子路由），全部指向通用列表页/详情页
        ...buildCategoryRoutes(),

        {
          name: 'SystemSetting',
          path: 'setting',
          component: () => import('@/views/system/setting/index.vue'),
          meta: { title: '系统设置', icon: 'Setting' },
        },

        {
          name: 'About',
          path: 'about',
          component: () => import('@/views/core/about.vue'),
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
}
