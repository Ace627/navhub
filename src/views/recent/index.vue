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

    <!-- 记录网格：按最近浏览时间倒序排列，卡片下方展示该条记录的时间戳 -->
    <div v-if="recentSites.length" class="record-grid">
      <div v-for="entry in recentSites" :key="entry.record.key" class="record-item">
        <LinkCard v-if="isExternal(entry.record.key)" :item="entry.item" plain-link />
        <LinkCard v-else :item="entry.item" @click="handleInternalClick(entry)" />
        <span class="record-time">{{ entry.record.time }}</span>
      </div>
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
import { SITE_RECORD_LIMIT, isExternal, pruneSiteRecords } from '@/utils'
import type { SiteRecord } from '@/utils'
import { useSiteRecords } from '@/hooks/useSiteRecords'
import { useSiteIndex } from '@/hooks/useSiteIndex'
import type { SiteEntry } from '@/hooks/useSiteIndex'

/** 最近浏览条目：站点条目数据与其对应的浏览记录 */
type RecentSite = SiteEntry & { record: SiteRecord }

const router = useRouter()

/** 最近浏览共享记录列表：任意卡片点击写入后本页实时联动 */
const { records, clearRecords } = useSiteRecords()

/** 全站条目索引：记录键映射条目数据与所属分类路径 */
const siteIndex = useSiteIndex()

/** 最近浏览条目列表：记录顺序即最近浏览时间倒序，剔除站点已下架的残留记录 */
const recentSites = computed<RecentSite[]>(() => records.value.flatMap((record) => (siteIndex[record.key] ? [{ ...siteIndex[record.key], record }] : [])))

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

/* 记录网格：列宽与卡片栅格一致，每格内卡片下方补一行时间戳 */
.record-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 16px;
}

.record-item {
  min-width: 0;
}

.record-time {
  display: block;
  margin-top: 4px;
  padding-left: 4px;
  font-size: 12px;
  color: var(--el-text-color-secondary);
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

  .record-grid {
    grid-template-columns: repeat(4, 1fr);
    gap: 8px;
  }

  .record-time {
    padding-left: 0;
    font-size: 11px;
    text-align: center;
  }

  .empty-state {
    width: 100%;
  }
}
</style>