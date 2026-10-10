import dayjs from 'dayjs'
import { StorageCache } from './storage-cache'

/** 最近浏览记录在本地存储中的键名 */
const RECORDS_STORAGE_KEY = 'siteRecords'

/** 最近浏览记录的条数上限：超出后按时间倒序丢弃最旧的记录 */
export const SITE_RECORD_LIMIT = 32

/** 最近浏览记录的时间格式 */
const SITE_RECORD_TIME_FORMAT = 'YYYY-MM-DD HH:mm:ss'

/**
 * 最近浏览记录定义
 */
export interface SiteRecord {
  /** 站点唯一键：外部站点填完整 URL，自有页面填路由参数 */
  key: string
  /** 最近浏览时间，格式 YYYY-MM-DD HH:mm:ss */
  time: string
}

/**
 * 创建一条最近浏览记录：以当前时间作为浏览时间戳
 *
 * @param key 站点唯一键
 * @returns 站点键与当前时间组成的记录
 */
export function buildSiteRecord(key: string): SiteRecord {
  return { key, time: dayjs().format(SITE_RECORD_TIME_FORMAT) }
}

/**
 * 读取最近浏览记录列表
 *
 * @returns 记录数组（按最近浏览时间倒序），存储异常或数据非法时返回空数组
 */
export function getSiteRecords(): SiteRecord[] {
  try {
    const records = StorageCache.get<SiteRecord[]>(RECORDS_STORAGE_KEY)
    if (!Array.isArray(records)) return []
    return records.filter((record) => record && typeof record.key === 'string' && record.key.trim())
  } catch {
    return []
  }
}

/**
 * 保存最近浏览记录列表
 *
 * 全量覆盖写入，自动去重并按上限截断；任何异常均吞掉不抛出，避免影响卡片交互。
 *
 * @param records 最近浏览记录数组
 */
export function setSiteRecords(records: SiteRecord[]): void {
  try {
    if (!Array.isArray(records)) return
    const uniqueKeys = new Set<string>()
    const nextRecords = records.filter((record) => {
      if (!record || typeof record.key !== 'string' || !record.key.trim() || uniqueKeys.has(record.key)) return false
      uniqueKeys.add(record.key)
      return true
    })
    StorageCache.set(RECORDS_STORAGE_KEY, nextRecords.slice(0, SITE_RECORD_LIMIT))
  } catch {
    // 缓存层容错：写入失败不影响页面交互
  }
}

/**
 * 裁剪最近浏览记录列表：移除合法键集合之外的残留条目
 *
 * 用于站点从数据文件中移除后清理其残留记录，避免脏键永久占用存储；
 * 合法键为空时视为异常入参，静默跳过不裁剪；任何异常均吞掉不抛出。
 *
 * @param validKeys 合法站点键集合（即当前数据文件中存在的站点键）
 */
export function pruneSiteRecords(validKeys: string[]): void {
  try {
    if (!Array.isArray(validKeys) || !validKeys.length) return
    const validSet = new Set(validKeys)
    const records = getSiteRecords()
    const nextRecords = records.filter((record) => validSet.has(record.key))
    if (nextRecords.length === records.length) return
    setSiteRecords(nextRecords)
  } catch {
    // 缓存层容错：清理失败不影响正常读取与展示
  }
}