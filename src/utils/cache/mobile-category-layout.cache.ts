import { StorageCache } from './storage-cache'

/** 移动端分类页视图模式：宫格（图标网格）/ 列表（图标+名称行） */
export type MobileCategoryLayout = 'grid' | 'list'

/** 默认视图模式 */
export const DEFAULT_CATEGORY_LAYOUT: MobileCategoryLayout = 'grid'

/**
 * 校验缓存读出的视图模式值是否合法
 *
 * @param value 待校验值
 * @returns 合法时返回 true
 */
function isCategoryLayout(value: unknown): value is MobileCategoryLayout {
  return value === 'grid' || value === 'list'
}

/** 设置分类页视图模式 */
export function setMobileCategoryLayout(value: MobileCategoryLayout): void {
  StorageCache.set('mobileCategoryLayout', value)
}

/** 获取分类页视图模式 */
export function getMobileCategoryLayout(defaultValue = DEFAULT_CATEGORY_LAYOUT): MobileCategoryLayout {
  const value = StorageCache.get<MobileCategoryLayout>('mobileCategoryLayout')
  return isCategoryLayout(value) ? value : defaultValue
}
