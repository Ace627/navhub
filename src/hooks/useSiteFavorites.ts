import { getSiteFavorites, setSiteFavorites } from '@/utils'

/** 全站共享的收藏站点键集合（模块级单例，响应式；首次调用时从本地缓存初始化） */
const favorites = reactive(new Set<string>())

/** 共享集合是否已完成初始化 */
let initialized = false

/**
 * 初始化共享集合：仅执行一次，把本地缓存中的收藏键灌入响应式集合
 */
function ensureInitialized(): void {
  if (initialized) return
  for (const key of getSiteFavorites()) favorites.add(key)
  initialized = true
}

/**
 * 持久化共享集合到本地缓存
 */
function persist(): void {
  setSiteFavorites([...favorites])
}

/**
 * 收藏站点共享状态：卡片操作行、底部操作面板与首页常用区订阅同一份响应式集合，状态全站实时同步
 *
 * @returns 收藏集合与读写方法
 */
export function useSiteFavorites() {
  ensureInitialized()

  /**
   * 判断站点当前是否已收藏
   *
   * @param key 站点唯一键
   * @returns 已收藏时返回 true
   */
  function isFavorite(key: string): boolean {
    return favorites.has(key)
  }

  /**
   * 切换站点收藏状态：已收藏则移除，未收藏则追加到末尾，并同步写回本地缓存
   *
   * @param key 站点唯一键
   * @returns 切换后是否处于收藏状态
   */
  function toggleFavorite(key: string): boolean {
    const next = !favorites.has(key)
    if (next) favorites.add(key)
    else favorites.delete(key)
    persist()
    return next
  }

  /**
   * 判断站点在收藏集合中的位置是否允许按指定方向移动（位于首位不可前移、位于末位不可后移）
   *
   * @param key 站点唯一键
   * @param offset 移动方向，-1 表示前移一位，1 表示后移一位
   * @returns 可移动时返回 true
   */
  function canMoveFavorite(key: string, offset: -1 | 1): boolean {
    const index = [...favorites].indexOf(key)
    if (index < 0) return false
    const target = index + offset
    return target >= 0 && target < favorites.size
  }

  /**
   * 调整站点在收藏集合中的位置：按指定方向与相邻条目交换，并同步写回本地缓存
   *
   * 集合整体清空后按新顺序回填，保证迭代顺序即展示顺序；处于首尾无可移动时直接返回。
   *
   * @param key 站点唯一键
   * @param offset 移动方向，-1 表示前移一位，1 表示后移一位
   * @returns 是否实际发生移动
   */
  function moveFavorite(key: string, offset: -1 | 1): boolean {
    if (!canMoveFavorite(key, offset)) return false
    const keys = [...favorites]
    const target = keys.indexOf(key) + offset
    keys.splice(target, 0, ...keys.splice(keys.indexOf(key), 1))
    favorites.clear()
    for (const item of keys) favorites.add(item)
    persist()
    return true
  }

  return { favorites, isFavorite, toggleFavorite, canMoveFavorite, moveFavorite }
}
