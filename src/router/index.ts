import type { App } from 'vue'
import { createRouter, createWebHashHistory, createWebHistory } from 'vue-router'
import { initCategoryRegistry } from './category.registry'
import { buildStaticRouteList } from './static.route'

const { VITE_ROUTER_MODE, VITE_PUBLIC_PATH } = import.meta.env

/**
 * 路由配置函数
 *
 * 先引导分类注册表（分类路由依赖注册表数据），再创建并注册路由实例；
 * 侧边栏菜单取自路由配置，因此分类路由必须在 createRouter 前就绪
 *
 * @param app Vue 应用实例
 */
export async function setupRouter(app: App) {
  // 引导分类注册表：从数据接口拉取分类与站点（接后端时仅接口层实现变化，此处无需调整）
  await initCategoryRegistry()

  // 创建路由实例
  const router = createRouter({
    history: VITE_ROUTER_MODE === 'hash' ? createWebHashHistory(VITE_PUBLIC_PATH) : createWebHistory(VITE_PUBLIC_PATH),
    routes: buildStaticRouteList(),
    // scrollBehavior: () => ({ left: 0, top: 0 }),
    scrollBehavior: () => new Promise((resolve) => setTimeout(() => resolve({ left: 0, top: 0 }), 160)),
  })

  // 配置路由全局前置守卫
  // router.beforeEach(globalRouterBeforeGuard)

  // 配置路由全局后置守卫
  // router.afterEach(globalRouterAfterGuard)

  // 注册挂载路由插件
  app.use(router)

  // 当路由准备好时再执行挂载 https://router.vuejs.org/zh/api/interfaces/Router.html#Methods-isReady
  await router.isReady()
}
