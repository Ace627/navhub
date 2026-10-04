<template>
  <div class="app-content">
    <div class="card-grid">
      <LinkCard v-for="item in FRONTEND_LIST" :key="item.key" :item="item" @click="handleClickItem(item)" />
    </div>
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: 'Frontend' })
import { FRONTEND_LIST } from './frontend.config'
import type { FrontendItem } from './frontend.config'

/**
 * 点击条目卡片，外部站点新窗口打开
 *
 * @param item 被点击的前端条目
 */
function handleClickItem(item: FrontendItem) {
  window.open(item.key, '_blank')
}
</script>

<style lang="scss" scoped>
.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 16px;
}

html[data-device='mobile'] {
  .card-grid {
    grid-template-columns: repeat(4, 1fr);
    gap: 8px;
  }
}
</style>
