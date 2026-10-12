import { StorageCache } from './storage-cache'

/** 自定义下班时间在本地存储中的键名 */
const OFF_WORK_STORAGE_KEY = 'offWorkTime'

/** 下班时间格式校验（HH:mm，24 小时制） */
const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/

/**
 * 读取自定义下班时间
 *
 * @returns HH:mm 格式的下班时间；未自定义、存储异常或数据非法时返回 null（由调用方回退默认值）
 */
export function getOffWorkTime(): string | null {
  try {
    const time = StorageCache.get<string>(OFF_WORK_STORAGE_KEY)
    return typeof time === 'string' && TIME_PATTERN.test(time) ? time : null
  } catch {
    return null
  }
}

/**
 * 保存自定义下班时间
 *
 * @param time HH:mm 格式的下班时间，非法入参静默忽略
 */
export function setOffWorkTime(time: string): void {
  try {
    if (!TIME_PATTERN.test(time)) return
    StorageCache.set(OFF_WORK_STORAGE_KEY, time)
  } catch {
    // 缓存层容错：写入失败不影响页面交互
  }
}

/**
 * 清除自定义下班时间，恢复默认值
 */
export function removeOffWorkTime(): void {
  try {
    StorageCache.remove(OFF_WORK_STORAGE_KEY)
  } catch {
    // 缓存层容错：清理失败不影响页面交互
  }
}

/** 自定义上班时间在本地存储中的键名 */
const WORK_START_STORAGE_KEY = 'workStartTime'

/**
 * 读取自定义上班时间
 *
 * @returns HH:mm 格式的上班时间；未自定义、存储异常或数据非法时返回 null（由调用方回退默认值）
 */
export function getWorkStartTime(): string | null {
  try {
    const time = StorageCache.get<string>(WORK_START_STORAGE_KEY)
    return typeof time === 'string' && TIME_PATTERN.test(time) ? time : null
  } catch {
    return null
  }
}

/**
 * 保存自定义上班时间
 *
 * @param time HH:mm 格式的上班时间，非法入参静默忽略
 */
export function setWorkStartTime(time: string): void {
  try {
    if (!TIME_PATTERN.test(time)) return
    StorageCache.set(WORK_START_STORAGE_KEY, time)
  } catch {
    // 缓存层容错：写入失败不影响页面交互
  }
}

/**
 * 清除自定义上班时间，恢复默认值
 */
export function removeWorkStartTime(): void {
  try {
    StorageCache.remove(WORK_START_STORAGE_KEY)
  } catch {
    // 缓存层容错：清理失败不影响页面交互
  }
}
