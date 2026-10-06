import { StorageCache } from './storage-cache'

/**
 * 记录一次站点外链点击（对应计数 +1）
 *
 * 键为站点唯一标识（即链接 URL），数据结构为 { [url: string]: number }，永久存储。
 * key 为空或非法时静默忽略；任何异常均吞掉不抛出，避免影响页面跳转。
 *
 * @param key 站点唯一键（即链接 URL）
 */
export function recordSiteClick(key: string): void {
  try {
    if (typeof key !== 'string' || !key.trim()) return
    const counts = getSiteClickCounts()
    counts[key] = (counts[key] ?? 0) + 1
    StorageCache.set('siteClickCounts', counts)
  } catch {
    // 缓存层容错：统计失败不影响外链跳转
  }
}

/**
 * 获取全部站点外链点击计数
 *
 * @returns 以 URL 为键、点击次数为值的对象；存储异常或数据非法时返回空对象
 */
export function getSiteClickCounts(): Record<string, number> {
  try {
    const counts = StorageCache.get<Record<string, number>>('siteClickCounts')
    return counts && typeof counts === 'object' ? counts : {}
  } catch {
    return {}
  }
}

/**
 * 清除全部站点外链点击计数
 */
export function clearSiteClickCounts(): void {
  StorageCache.remove('siteClickCounts')
}

/**
 * 裁剪站点点击计数：移除合法键集合之外的残留条目
 *
 * 用于站点从数据文件中移除后清理其残留计数，避免脏键永久占用存储；
 * 合法键为空时视为异常入参，静默跳过不裁剪；任何异常均吞掉不抛出。
 *
 * @param validKeys 合法站点键集合（即当前数据文件中存在的站点键）
 */
export function pruneSiteClickCounts(validKeys: string[]): void {
  try {
    if (!Array.isArray(validKeys) || !validKeys.length) return
    const counts = getSiteClickCounts()
    const validSet = new Set(validKeys)
    const invalidKeys = Object.keys(counts).filter((key) => !validSet.has(key))
    if (!invalidKeys.length) return
    for (const key of invalidKeys) delete counts[key]
    StorageCache.set('siteClickCounts', counts)
  } catch {
    // 缓存层容错：清理失败不影响正常读取与展示
  }
}
