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
   * 裁剪收藏集合：移除合法键之外的残留条目并同步写回本地缓存
   *
   * 与存储层裁剪不同，本方法直接作用于内存中的响应式集合；幽灵键若不同步剔除，
   * 收藏顺序会与展示卡片错位，拖拽排序等按下标换序的功能会错位换卡。
   *
   * @param validKeys 合法站点键集合（即当前数据文件中存在的站点键），为空时视为异常入参直接跳过
   */
  function pruneFavorites(validKeys: string[]): void {
    if (!Array.isArray(validKeys) || !validKeys.length) return
    const validSet = new Set(validKeys)
    let changed = false
    for (const key of [...favorites]) {
      if (!validSet.has(key)) {
        favorites.delete(key)
        changed = true
      }
    }
    if (changed) persist()
  }

  /**
   * 将收藏条目从原位置移动到目标位置，并同步写回本地缓存
   *
   * 集合整体清空后按新顺序回填，保证迭代顺序即展示顺序；下标非法或位置未变化时直接返回。
   *
   * @param oldIndex 原位置下标
   * @param newIndex 目标位置下标
   * @returns 是否实际发生移动
   */
  function reorderFavorite(oldIndex: number, newIndex: number): boolean {
    if (oldIndex === newIndex) return false
    if (oldIndex < 0 || newIndex < 0 || oldIndex >= favorites.size || newIndex >= favorites.size) return false
    const keys = [...favorites]
    const [moved] = keys.splice(oldIndex, 1)
    keys.splice(newIndex, 0, moved)
    favorites.clear()
    for (const item of keys) favorites.add(item)
    persist()
    return true
  }

  return { favorites, isFavorite, toggleFavorite, reorderFavorite, pruneFavorites }
}
