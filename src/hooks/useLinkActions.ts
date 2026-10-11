import type { LinkItem } from '@/components/LinkCard/types'
import type { LinkMenuActionOptions } from '@/hooks/useLinkMenuActions'

/** 操作面板与右键菜单当前操作的条目（模块级单例，全站仅挂载一个面板实例与一个菜单实例） */
const currentItem = ref<LinkItem | null>(null)

/** 移动端长按操作面板共享可见状态 */
const panelVisible = ref(false)

/** 桌面端右键菜单共享可见状态：全局单例，天然保证同一时刻仅一处菜单可见 */
const menuVisible = ref(false)

/** 桌面端右键菜单弹出位置：以指针视口坐标作为浮层锚点 */
const menuPoint = ref({ x: 0, y: 0 })

/** 桌面端右键菜单项构建参数：由发起右键的卡片传入（如隐藏收藏项） */
const menuOptions = ref<LinkMenuActionOptions>({})

/**
 * 站点条目操作共享状态：移动端长按面板与桌面端右键菜单共用同一份待操作条目，
 * 两者均为全局单例，卡片只负责写入待操作条目并选择唤起方式
 *
 * @returns 状态与开关方法
 */
export function useLinkActions() {
  /**
   * 打开条目操作面板（移动端长按）
   *
   * @param item 待操作的链接条目
   */
  function openLinkActions(item: LinkItem): void {
    currentItem.value = item
    panelVisible.value = true
  }

  /**
   * 关闭条目操作面板
   */
  function closeLinkActions(): void {
    panelVisible.value = false
  }

  /**
   * 在指针位置打开条目右键菜单（桌面端）
   *
   * @param item 待操作的链接条目
   * @param point 指针视口坐标
   * @param options 菜单项构建参数
   */
  async function openLinkMenu(item: LinkItem, point: { x: number; y: number }, options: LinkMenuActionOptions = {}): Promise<void> {
    currentItem.value = item
    menuOptions.value = options
    // 菜单已展开时先收起，促使浮层按新坐标重新定位后再展开
    if (menuVisible.value) {
      menuVisible.value = false
      await nextTick()
    }
    menuPoint.value = point
    menuVisible.value = true
  }

  /**
   * 关闭条目右键菜单
   */
  function closeLinkMenu(): void {
    menuVisible.value = false
  }

  return { currentItem, panelVisible, menuVisible, menuPoint, menuOptions, openLinkActions, closeLinkActions, openLinkMenu, closeLinkMenu }
}
