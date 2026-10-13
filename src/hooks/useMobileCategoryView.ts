import type { MobileCategoryLayout } from '@/utils'
import { getMobileCategoryLayout, setMobileCategoryLayout } from '@/utils'

/** 模块级共享视图模式：本地缓存初始化，Navbar 与分类页订阅同一份状态 */
const viewMode = ref<MobileCategoryLayout>(getMobileCategoryLayout())

/** 模块级共享切换对话框可见性：Navbar 顶栏图标触发，分类页内弹窗消费 */
const switcherVisible = ref(false)

/**
 * 移动端分类页视图模式共享状态：顶栏切换图标与页面弹窗跨组件联动
 *
 * @returns 视图模式、对话框可见性与确认方法
 */
export function useMobileCategoryView() {
  /**
   * 确认视图模式：更新共享状态并持久化到本地缓存
   *
   * @param mode 视图模式
   */
  function applyViewMode(mode: MobileCategoryLayout): void {
    viewMode.value = mode
    setMobileCategoryLayout(mode)
  }

  return { viewMode, switcherVisible, applyViewMode }
}
