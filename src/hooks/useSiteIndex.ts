import type { LinkItem } from '@/components/LinkCard/types'
import { getCategoryRegistry } from '@/router/category.registry'

/**
 * 全站条目定义：链接条目 + 所属分类路由路径（站内条目跳转时拼接使用）
 */
export interface SiteEntry {
  /** 链接条目 */
  item: LinkItem
  /** 所属分类路由路径，如 /tool */
  categoryPath: string
}

/** 全站条目索引：以条目 key（外链为 URL，站内为路由参数）为键，模块加载时构建一次 */
const siteIndex: Record<string, SiteEntry> = Object.fromEntries(
  getCategoryRegistry().flatMap((entry) => entry.data.map((item) => [item.key, { item, categoryPath: `/${entry.path}` }])),
)

/**
 * 全站条目索引：按条目 key 取条目及其所属分类路径，注册表在引导阶段装配完成，索引仅构建一次
 *
 * @returns 全站条目索引（只读）
 */
export function useSiteIndex(): Record<string, SiteEntry> {
  return siteIndex
}