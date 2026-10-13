import { RouterConstant } from '@/router/router.constant'
import { getCategoryRegistry } from '@/router/category.registry'
import { useAppStore } from '@/store/modules/app'

/**
 * 顶栏返回逻辑：有站内历史时原路返回（首页进的回首页、分类进的回分类，小程序式）；
 * 无历史（直达/刷新）时按层级兜底：详情页回所属分类列表，移动端其余回分类聚合页，桌面端回主页
 *
 * @returns 返回导航方法
 */
export function useDetailBack() {
  const route = useRoute()
  const router = useRouter()
  const appStore = useAppStore()

  /** 执行返回导航 */
  function backToDetailSource(): void {
    if (window.history.state?.back) {
      router.back()
      return
    }
    const entry = getCategoryRegistry().find((category) => route.path.startsWith(`/${category.path}/`))
    if (entry) {
      router.push(`/${entry.path}`)
      return
    }
    if (appStore.isMobile && route.path.startsWith('/system/')) {
      router.push(RouterConstant.MOBILE_PROFILE_URL)
      return
    }
    router.push(appStore.isMobile ? RouterConstant.MOBILE_CATEGORIES_URL : RouterConstant.HOME_PAGE_URL)
  }

  return { backToDetailSource }
}
