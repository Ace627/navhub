import { MOBILE_MAX_WIDTH } from '@/common'
import { getSystemSetting } from '@/utils'
import type { Router } from 'vue-router'
import { RouterConstant } from './router.constant'

/**
 * 解析启动页重定向地址
 *
 * 移动端按用户配置的启动页落地默认标签页；桌面端固定主页。
 * 由布局路由的 redirect 在导航期调用，此时应用尚未挂载，直接读本地缓存而非设置 store，
 * 规避 pinia 安装时序问题
 *
 * @returns 启动页路由地址
 */
export function resolveStartupRedirect(): string {
  if (window.innerWidth - 1 < MOBILE_MAX_WIDTH) {
    const startupPage = getSystemSetting()?.startupPage
    if (startupPage === 'categories') return RouterConstant.MOBILE_CATEGORIES_URL
    if (startupPage === 'profile') return RouterConstant.MOBILE_PROFILE_URL
  }
  return RouterConstant.HOME_PAGE_URL
}

/**
 * 安装启动页守卫
 *
 * 布局路由的 redirect 只覆盖根路径访问，而用户书签普遍保存的是
 * 根路径跳转后的主页地址，直达时会绕过启动页配置。此守卫仅拦截
 * 「本次页面加载的首次导航」且落点为主页的场景，按启动页配置改道；
 * 站内切换标签页属后续 SPA 导航，不受影响。刷新与前进后退视为继续
 * 当前浏览位置，保持原地不重定向
 *
 * @param router 路由实例
 */
export function installStartupPageGuard(router: Router): void {
  /** 是否为本次页面加载的首次导航：守卫只对首次生效 */
  let isFirstNavigation = true

  router.beforeEach((to) => {
    const first = isFirstNavigation
    isFirstNavigation = false
    if (!first || to.path !== RouterConstant.HOME_PAGE_URL) return true
    // 刷新与前进后退沿用当前浏览位置，仅书签、新标签等新打开场景走启动页
    // getEntriesByType 返回宽泛的 PerformanceEntry，type 属性实际在 NavigationTiming 子类型上
    const navEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined
    if (navEntry?.type === 'reload' || navEntry?.type === 'back_forward') return true
    const startupPage = resolveStartupRedirect()
    // 启动页即主页时放行，避免自重定向
    return startupPage === to.fullPath ? true : startupPage
  })
}
