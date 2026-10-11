import { StorageCache } from './storage-cache'

/** 自定义发薪日在本地存储中的键名 */
const PAYDAY_STORAGE_KEY = 'payday'

/**
 * 读取自定义发薪日（每月几号）
 *
 * @returns 1-31 的日期数字；未自定义、存储异常或数据非法时返回 null（由调用方回退默认值）
 */
export function getPayday(): number | null {
  try {
    const day = StorageCache.get<number>(PAYDAY_STORAGE_KEY)
    return typeof day === 'number' && Number.isInteger(day) && day >= 1 && day <= 31 ? day : null
  } catch {
    return null
  }
}

/**
 * 保存自定义发薪日
 *
 * @param day 1-31 的日期数字，非法入参静默忽略
 */
export function setPayday(day: number): void {
  try {
    if (!Number.isInteger(day) || day < 1 || day > 31) return
    StorageCache.set(PAYDAY_STORAGE_KEY, day)
  } catch {
    // 缓存层容错：写入失败不影响页面交互
  }
}

/**
 * 清除自定义发薪日，恢复默认值
 */
export function removePayday(): void {
  try {
    StorageCache.remove(PAYDAY_STORAGE_KEY)
  } catch {
    // 缓存层容错：清理失败不影响页面交互
  }
}
