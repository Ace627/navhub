import { StorageCache } from './storage-cache'

/** 收藏站点在本地存储中的键名 */
const FAVORITES_STORAGE_KEY = 'siteFavorites'

/**
 * 读取收藏站点键列表
 *
 * @returns 收藏站点键数组（外链为链接 URL，站内为路由参数），按收藏先后排序；存储异常或数据非法时返回空数组
 */
export function getSiteFavorites(): string[] {
  try {
    const keys = StorageCache.get<string[]>(FAVORITES_STORAGE_KEY)
    return Array.isArray(keys) ? keys.filter((key) => typeof key === 'string' && key.trim()) : []
  } catch {
    return []
  }
}

/**
 * 保存收藏站点键列表
 *
 * 全量覆盖写入，自动去重并剔除空值；任何异常均吞掉不抛出，避免影响卡片交互。
 *
 * @param keys 收藏站点键数组
 */
export function setSiteFavorites(keys: string[]): void {
  try {
    if (!Array.isArray(keys)) return
    StorageCache.set(FAVORITES_STORAGE_KEY, [...new Set(keys.filter((key) => typeof key === 'string' && key.trim()))])
  } catch {
    // 缓存层容错：写入失败不影响页面交互
  }
}

/**
 * 裁剪收藏站点键列表：移除合法键集合之外的残留条目
 *
 * 用于站点从数据文件中移除后清理其残留收藏，避免脏键永久占用存储；
 * 合法键为空时视为异常入参，静默跳过不裁剪；任何异常均吞掉不抛出。
 *
 * @param validKeys 合法站点键集合（即当前数据文件中存在的站点键）
 */
export function pruneSiteFavorites(validKeys: string[]): void {
  try {
    if (!Array.isArray(validKeys) || !validKeys.length) return
    const validSet = new Set(validKeys)
    const keys = getSiteFavorites()
    const nextKeys = keys.filter((key) => validSet.has(key))
    if (nextKeys.length === keys.length) return
    setSiteFavorites(nextKeys)
  } catch {
    // 缓存层容错：清理失败不影响正常读取与展示
  }
}
