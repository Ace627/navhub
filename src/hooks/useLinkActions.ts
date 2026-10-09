import type { LinkItem } from '@/components/LinkCard/types'

/** 长按操作面板当前操作的条目（模块级单例，全站仅挂载一个面板实例） */
const currentItem = ref<LinkItem | null>(null)

/** 长按操作面板共享可见状态 */
const panelVisible = ref(false)

/**
 * 站点卡片长按操作面板共享状态：卡片只负责写入待操作条目并打开面板，面板实例全局唯一
 *
 * @returns 面板状态与开关方法
 */
export function useLinkActions() {
  /**
   * 打开条目操作面板
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

  return { currentItem, panelVisible, openLinkActions, closeLinkActions }
}
