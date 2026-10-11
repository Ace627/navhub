import type { LinkItem } from '@/components/LinkCard/types'
import { copyText } from '@/utils'
import { useSiteFavorites } from '@/hooks/useSiteFavorites'
import { useSiteShare } from '@/hooks/useSiteShare'

/**
 * 条目操作菜单项：桌面端右键菜单与移动端长按操作面板共用同一份结构
 */
export interface LinkMenuAction {
  /** 菜单项文案 */
  name: string
  /** 点击回调，由各端自行决定点击后是否收起浮层 */
  callback: () => void
}

/**
 * 条目操作菜单选项：构建参数
 */
export interface LinkMenuActionOptions {
  /** 是否隐藏收藏项；默认 false，无收藏语义的非站点条目（如最近浏览入口）置 true */
  hideFavorite?: boolean
}

/**
 * 条目操作菜单共享逻辑：桌面右键菜单与移动端长按面板复用同一份选项生成与执行规则，
 * 避免两端各写一套文案与收藏判定
 *
 * @returns 菜单项构建方法
 */
export function useLinkMenuActions() {
  const { isFavorite, toggleFavorite } = useSiteFavorites()
  const { buildShareText } = useSiteShare()

  /**
   * 构建条目的操作菜单项
   *
   * @param item 链接条目
   * @param options 构建参数
   * @returns 菜单项列表：收藏项在已收藏时文案为「取消收藏」
   */
  function buildLinkMenuActions(item: LinkItem, options: LinkMenuActionOptions = {}): LinkMenuAction[] {
    const actions: LinkMenuAction[] = [
      {
        name: '复制网站',
        callback: () => copyText(buildShareText(item)),
      },
    ]
    if (!options.hideFavorite) {
      actions.push({
        name: isFavorite(item.key) ? '取消收藏' : '收藏网站',
        callback: () => {
          const added = toggleFavorite(item.key)
          ElMessage.success(added ? `已收藏「${item.title}」` : `已取消收藏「${item.title}」`)
        },
      })
    }
    return actions
  }

  return { buildLinkMenuActions }
}
