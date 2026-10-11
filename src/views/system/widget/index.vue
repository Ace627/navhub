<template>
  <div class="app-content widget-page">
    <p class="page-tip">收藏后会出现在首页卡片区，可在首页调整顺序或取消收藏。</p>
    <div class="widget-grid">
      <LinkCard v-for="widget in SYSTEM_WIDGETS" :key="widget.key" :item="widget.item" :hide-header="widget.hideHeader" :bare="widget.bare" skip-record>
        <template #icon>
          <SvgIcon :name="widget.icon" :size="32" />
        </template>
        <template #body>
          <component :is="widget.component" />
        </template>
        <template #actions>
          <el-link type="primary" underline="never" @click="handleToggleFavorite(widget, $event)">{{ isFavorite(widget.key) ? '已收藏' : '收藏' }}</el-link>
        </template>
      </LinkCard>
    </div>
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: 'SystemWidgetPage' })
import { SYSTEM_WIDGETS } from './components/registry'
import type { SystemWidget } from './components/registry'
import { useSiteFavorites } from '@/hooks/useSiteFavorites'

/** 收藏共享状态：系统组件管理页与首页卡片区实时联动 */
const { isFavorite, toggleFavorite } = useSiteFavorites()

/**
 * 小组件收藏切换点击：切换收藏状态并提示结果，同时阻断卡片自身的跳转行为
 *
 * @param widget 目标小组件
 * @param event 点击事件对象
 */
function handleToggleFavorite(widget: SystemWidget, event: MouseEvent): void {
  event.preventDefault()
  event.stopPropagation()
  const added = toggleFavorite(widget.key)
  ElMessage.success(added ? `已收藏「${widget.item.title}」` : `已取消收藏「${widget.item.title}」`)
}
</script>

<style lang="scss" scoped>
.page-tip {
  margin: 0 0 12px;
  font-size: var(--el-font-size-base);
  color: var(--el-text-color-secondary);
}

.widget-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 16px;
}

html[data-device='mobile'] {
  .widget-grid {
    grid-template-columns: 1fr;
    gap: 8px;
  }
}
</style>

