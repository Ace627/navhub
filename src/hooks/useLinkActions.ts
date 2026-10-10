import type { LinkItem } from '@/components/LinkCard/types'

/** 长按操作面板当前操作的条目（模块级单例，全站仅挂载一个面板实例） */
const currentItem = ref<LinkItem | null>(null)

/** 长按操作面板共享可见状态 */
const panelVisible = ref(false)

/** 长按操作面板是否展示顺序调整项：由触发方按所处场景决定（仅收藏卡片可调整） */
const reorderable = ref(false)

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
   * @param options 面板选项，reorderable 为 true 时展示前移/后移项，默认 false
   */
  function openLinkActions(item: LinkItem, options: { reorderable?: boolean } = {}): void {
    currentItem.value = item
    reorderable.value = options.reorderable ?? false
    panelVisible.value = true
  }

  /**
   * 关闭条目操作面板
   */
  function closeLinkActions(): void {
    panelVisible.value = false
    reorderable.value = false
  }

  return { currentItem, panelVisible, reorderable, openLinkActions, closeLinkActions }
}
