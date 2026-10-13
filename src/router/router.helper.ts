import { MOBILE_MAX_WIDTH } from '@/common'
import { getSystemSetting } from '@/utils'
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
