import { RouterConstant } from '@/router/router.constant'
import { getCategoryRegistry } from '@/router/category.registry'
import { useAppStore } from '@/store/modules/app'

/**
 * 条目详情页返回逻辑：移动端遵循小程序习惯，始终跳转上一级分类列表；
 * 桌面端有站内历史时原路返回（如从最近使用进入可回到最近使用），无历史（直达/刷新）时回分类列表兜底
 *
 * @returns 返回导航方法
 */
export function useDetailBack() {
  const route = useRoute()
  const router = useRouter()
  const appStore = useAppStore()

  /** 执行返回导航 */
  function backToDetailSource(): void {
    const entry = getCategoryRegistry().find((category) => route.path.startsWith(`/${category.path}/`))
    if (!appStore.isMobile && window.history.state?.back) {
      router.back()
      return
    }
    router.push(entry ? `/${entry.path}` : RouterConstant.HOME_PAGE_URL)
  }

  return { backToDetailSource }
}
