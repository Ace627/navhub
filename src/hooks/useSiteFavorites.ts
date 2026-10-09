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

  return { favorites, isFavorite, toggleFavorite }
}
