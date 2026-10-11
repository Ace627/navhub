<template>
  <div class="app-content recent">
    <!-- 标题行：左侧标题，右侧记录条数与清空按钮 -->
    <div class="recent-header">
      <h2 class="recent-title">最近浏览</h2>
      <div class="recent-extra">
        <el-text type="info" size="small">共 {{ records.length }} 条，最多保留 {{ SITE_RECORD_LIMIT }} 条</el-text>
        <el-button v-if="records.length" size="small" @click="handleClear">清空</el-button>
      </div>
    </div>

    <!-- 记录列表：按浏览日期分组，两端均为单行条目（桌面端操作链接悬浮浮现，移动端长按出操作面板） -->
    <div v-if="recentSites.length" class="record-list">
      <section v-for="(group, index) in groupedSites" :key="`${group.label}-${index}`" class="record-group">
        <h3 class="group-title">{{ group.label }}</h3>
        <LinkCard layout="row" :item="entry.item" :plain-link="isExternal(entry.record.key)" @click="handleInternalClick(entry)" v-for="entry in group.entries" :key="entry.record.key">
          <template #actions>
            <el-link class="row-action" type="primary" underline="never" @click="handleCopy(entry, $event)">复制</el-link>
            <el-link class="row-action" type="primary" underline="never" @click="handleToggleFavorite(entry, $event)">{{ isFavorite(entry.item.key) ? '已收藏' : '收藏' }}</el-link>
            <span class="row-time">{{ formatRowTime(entry.record.time) }}</span>
          </template>
        </LinkCard>
      </section>
    </div>
    <div v-else class="empty-state">
      <SvgIcon name="Schedule" :size="48" class="empty-icon" />
      <p class="empty-text">暂无浏览记录，去各分类逛逛吧</p>
    </div>
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: RouterConstant.RECENT_PAGE_NAME })
import { RouterConstant } from '@/router/router.constant'
import { useAppStore } from '@/store/modules/app'
import { SITE_RECORD_LIMIT, copyText, isExternal, pruneSiteRecords } from '@/utils'
import type { SiteRecord } from '@/utils'
import { useSiteRecords } from '@/hooks/useSiteRecords'
import { useSiteShare } from '@/hooks/useSiteShare'
import { useSiteFavorites } from '@/hooks/useSiteFavorites'
import { useSiteIndex } from '@/hooks/useSiteIndex'
import type { SiteEntry } from '@/hooks/useSiteIndex'

/** 最近浏览条目：站点条目数据与其对应的浏览记录 */
type RecentSite = SiteEntry & { record: SiteRecord }

/** 日期分组：组头标签与组内最近浏览条目 */
type GroupedRecentSite = { label: string; entries: RecentSite[] }

/** 星期展示文案：按下标对应 Date.getDay() 返回值 */
const WEEKDAY_TEXT = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']

const router = useRouter()

/** 应用状态实例：移动端行内时间展示缩短为时分格式 */
const appStore = useAppStore()

/** 最近浏览共享记录列表：任意卡片点击写入后本页实时联动 */
const { records, clearRecords } = useSiteRecords()

/** 站点分享文案构建：行操作复制复用与 LinkCard 操作行一致的文案格式 */
const { buildShareText } = useSiteShare()

/** 收藏共享状态：行操作收藏切换与全站收藏实时同步 */
const { isFavorite, toggleFavorite } = useSiteFavorites()

/** 全站条目索引：记录键映射条目数据与所属分类路径 */
const siteIndex = useSiteIndex()

/** 最近浏览条目列表：记录顺序即最近浏览时间倒序，剔除站点已下架的残留记录 */
const recentSites = computed<RecentSite[]>(() => records.value.flatMap((record) => (siteIndex[record.key] ? [{ ...siteIndex[record.key], record }] : [])))

/** 按浏览日期分组的条目列表：记录已按时间倒序，同日条目必然连续，顺序遍历即可完成分组 */
const groupedSites = computed<GroupedRecentSite[]>(() => {
  const groups: GroupedRecentSite[] = []
  let currentLabel = ''
  for (const entry of recentSites.value) {
    const recordDate = new Date(entry.record.time.replace(' ', 'T'))
    const label = Number.isNaN(recordDate.getTime()) ? '更早' : buildDayLabel(recordDate, new Date())
    if (label !== currentLabel) {
      groups.push({ label, entries: [] })
      currentLabel = label
    }
    groups[groups.length - 1].entries.push(entry)
  }
  return groups
})

/**
 * 数字补零为两位字符串
 *
 * @param value 待补零的数字
 * @returns 两位字符串（如 7 → "07"）
 */
function pad2(value: number): string {
  return String(value).padStart(2, '0')
}

/**
 * 计算日期与今天相差的自然日天数（按当日零点截断，跨月跨年同样适用）
 *
 * @param date 目标日期
 * @param now 当前日期
 * @returns 自然日天数差，今天为 0、昨天为 1，未来日期为负数
 */
function getDayDiff(date: Date, now: Date): number {
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
  const startOfTarget = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime()
  return Math.floor((startOfToday - startOfTarget) / (24 * 60 * 60 * 1000))
}

/**
 * 构建分组组头标签：今天与昨天带前缀，其余按「M月D日 周X」展示（如「今天 - 10月11日 周日」）
 *
 * @param date 分组日期
 * @param now 当前日期
 * @returns 组头展示文案
 */
function buildDayLabel(date: Date, now: Date): string {
  const dayDiff = getDayDiff(date, now)
  const prefix = dayDiff === 0 ? '今天 - ' : dayDiff === 1 ? '昨天 - ' : ''
  return `${prefix}${date.getMonth() + 1}月${date.getDate()}日 ${WEEKDAY_TEXT[date.getDay()]}`
}

/**
 * 格式化记录时间戳为相对时间文案：一分钟内为「刚刚」，一小时内为「n 分钟前」，今日为「n 小时前」，
 * 昨日为「昨天 HH:mm」，同年为「MM-DD HH:mm」，跨年保留「YYYY-MM-DD」；解析失败时原样返回
 *
 * @param time 记录的完整时间戳（YYYY-MM-DD HH:mm:ss）
 * @returns 按记录距今时间跨度格式化后的展示文案
 */
function formatRelativeTime(time: string): string {
  const recordDate = new Date(time.replace(' ', 'T'))
  if (Number.isNaN(recordDate.getTime())) return time
  const now = new Date()
  const elapsed = now.getTime() - recordDate.getTime()
  if (elapsed < 60 * 1000) return '刚刚'
  if (elapsed < 60 * 60 * 1000) return `${Math.floor(elapsed / (60 * 1000))} 分钟前`
  const dayDiff = getDayDiff(recordDate, now)
  if (dayDiff === 0) return `${recordDate.getHours()} 小时前`
  if (dayDiff === 1) return `昨天 ${pad2(recordDate.getHours())}:${pad2(recordDate.getMinutes())}`
  if (recordDate.getFullYear() === now.getFullYear()) return `${pad2(recordDate.getMonth() + 1)}-${pad2(recordDate.getDate())} ${pad2(recordDate.getHours())}:${pad2(recordDate.getMinutes())}`
  return `${recordDate.getFullYear()}-${pad2(recordDate.getMonth() + 1)}-${pad2(recordDate.getDate())}`
}

/**
 * 格式化行内时间展示文案：移动端已按日期分组，仅展示时分「HH:mm」；桌面端展示相对时间
 *
 * @param time 记录的完整时间戳（YYYY-MM-DD HH:mm:ss）
 * @returns 按设备适配后的行内时间文案
 */
function formatRowTime(time: string): string {
  if (!appStore.isMobile) return formatRelativeTime(time)
  const recordDate = new Date(time.replace(' ', 'T'))
  if (Number.isNaN(recordDate.getTime())) return time
  return `${pad2(recordDate.getHours())}:${pad2(recordDate.getMinutes())}`
}

/**
 * 行操作复制：复制站点分享文案（名称、地址与描述，格式与 LinkCard 一致）并阻断行自身的跳转行为
 *
 * @param entry 被操作的最近浏览条目
 * @param event 点击事件对象
 */
function handleCopy(entry: RecentSite, event: MouseEvent): void {
  event.preventDefault()
  event.stopPropagation()
  copyText(buildShareText(entry.item))
}

/**
 * 行操作收藏切换：切换站点收藏状态并提示结果，同时阻断行自身的跳转行为
 *
 * @param entry 被操作的最近浏览条目
 * @param event 点击事件对象
 */
function handleToggleFavorite(entry: RecentSite, event: MouseEvent): void {
  event.preventDefault()
  event.stopPropagation()
  const added = toggleFavorite(entry.item.key)
  ElMessage.success(added ? `已收藏「${entry.item.title}」` : `已取消收藏「${entry.item.title}」`)
}

/**
 * 站内条目点击跳转：路由跳转到所属分类的详情页
 *
 * @param entry 被点击的站内条目
 */
function handleInternalClick(entry: SiteEntry): void {
  router.push(`${entry.categoryPath}/${entry.item.key}`)
}

/**
 * 清空最近浏览记录并提示结果
 */
function handleClear(): void {
  clearRecords()
  ElMessage.success('已清空最近浏览记录')
}

/**
 * 刷新缓存一致性：以全站配置索引为合法键集合，裁剪站点被删除后残留的脏记录
 */
function refreshSiteCaches(): void {
  pruneSiteRecords(Object.keys(siteIndex))
}

onMounted(refreshSiteCaches)

onActivated(refreshSiteCaches)
</script>

<style lang="scss" scoped>
.recent-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.recent-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.recent-extra {
  display: flex;
  align-items: center;
  gap: 12px;
}

/* 记录列表：按浏览日期分组，条目为单行历史列表，行内时间常驻、操作链接悬浮浮现 */
.record-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.record-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.group-title {
  margin: 0;
  font-size: 13px;
  font-weight: 600;
  color: var(--el-text-color-secondary);
}

.row-time {
  flex-shrink: 0;
  margin-left: 4px;
  font-size: 12px;
  color: var(--el-text-color-secondary);
  white-space: nowrap;
}

.row-action {
  opacity: 0;
  transition: opacity 0.2s;
}

.link-card:hover .row-action {
  opacity: 1;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  width: 960px;
  margin: 0 auto;
  color: var(--el-text-color-secondary);

  .empty-icon {
    color: var(--el-border-color-darker);
  }

  .empty-text {
    margin: 0;
    font-size: var(--el-font-size-base);
  }
}

html[data-device='mobile'] {
  .recent-header {
    margin-bottom: 8px;
  }

  .row-action {
    display: none;
  }

  .empty-state {
    width: 100%;
  }
}
</style>