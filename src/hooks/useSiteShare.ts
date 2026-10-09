import type { LinkItem } from '@/components/LinkCard/types'
import { buildSiteShareText, isExternal } from '@/utils'
import { getCategoryRegistry } from '@/router/category.registry'

const { VITE_PUBLIC_PATH } = import.meta.env

/** 站内条目的分类路由路径索引：条目 key → 所属分类路径（如 /tool），懒构建一次后复用 */
let categoryPathIndex: Record<string, string> | null = null

/**
 * 获取站内条目的分类路由路径索引
 *
 * @description 遍历分类注册表建立 key 到分类路径的映射，首次调用时构建一次并缓存
 * @returns 条目 key 与分类路由路径的映射表
 */
function getCategoryPathIndex(): Record<string, string> {
  if (categoryPathIndex) return categoryPathIndex
  const index: Record<string, string> = {}
  for (const category of getCategoryRegistry()) {
    for (const item of category.data) index[item.key] = `/${category.path}`
  }
  categoryPathIndex = index
  return index
}

/**
 * 站点分享文案共享逻辑：卡片操作行与长按操作面板复用同一份地址解析与文案构建
 *
 * @returns 地址解析与文案构建方法
 */
export function useSiteShare() {
  /**
   * 解析条目对应的可访问地址
   *
   * @param key 条目唯一键（外链为完整 URL，自有页面为路由参数）
   * @returns 外链返回原地址；自有页面返回「当前域名 + 部署路径 + 分类路径 + 条目 key」；未命中注册表时兜底返回原 key
   */
  function resolveSiteAddress(key: string): string {
    if (isExternal(key)) return key
    const categoryPath = getCategoryPathIndex()[key]
    if (!categoryPath) return key
    const basePath = VITE_PUBLIC_PATH.replace(/\/+$/, '')
    return `${window.location.origin}${basePath}${categoryPath}/${key}`
  }

  /**
   * 构建条目分享文案
   *
   * @param item 链接条目
   * @returns 站点名称、地址与描述拼接后的分享文案
   */
  function buildShareText(item: LinkItem): string {
    return buildSiteShareText(item.title, resolveSiteAddress(item.key), item.description)
  }

  return { resolveSiteAddress, buildShareText }
}