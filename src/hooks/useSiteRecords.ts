import { buildSiteRecord, getSiteRecords, setSiteRecords, SITE_RECORD_LIMIT } from '@/utils'
import type { SiteRecord } from '@/utils'

/** 全站共享的最近浏览记录列表（模块级单例，响应式；按最近浏览时间倒序；首次调用时从本地缓存初始化） */
const records = ref<SiteRecord[]>([])

/** 共享列表是否已完成初始化 */
let initialized = false

/**
 * 初始化共享列表：仅执行一次，把本地缓存中的记录灌入响应式列表
 */
function ensureInitialized(): void {
  if (initialized) return
  records.value = getSiteRecords()
  initialized = true
}

/**
 * 持久化共享列表到本地缓存
 */
function persist(): void {
  setSiteRecords(records.value)
}

/**
 * 最近浏览站点共享状态：卡片点击写入、首页入口与最近浏览页订阅同一份响应式列表，状态全站实时同步
 *
 * @returns 记录列表与读写方法
 */
export function useSiteRecords() {
  ensureInitialized()

  /**
   * 记录一次站点访问：同键旧记录移除后新记录置顶（去重），超出上限后丢弃最旧记录，并同步写回本地缓存
   *
   * @param key 站点唯一键
   */
  function recordVisit(key: string): void {
    if (typeof key !== 'string' || !key.trim()) return
    records.value = [buildSiteRecord(key), ...records.value.filter((record) => record.key !== key)].slice(0, SITE_RECORD_LIMIT)
    persist()
  }

  /**
   * 移除单条最近浏览记录
   *
   * @param key 站点唯一键
   */
  function removeRecord(key: string): void {
    if (!records.value.some((record) => record.key === key)) return
    records.value = records.value.filter((record) => record.key !== key)
    persist()
  }

  /**
   * 清空最近浏览记录
   */
  function clearRecords(): void {
    if (!records.value.length) return
    records.value = []
    persist()
  }

  return { records, recordVisit, removeRecord, clearRecords }
}