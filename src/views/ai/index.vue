<template>
  <div class="app-content">
    <div class="card-grid">
      <LinkCard v-for="item in AI_LIST" :key="item.key" :item="item" @click="handleClickItem(item)" />
    </div>
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: 'AI' })
import { AI_LIST } from './ai.config'
import type { AiItem } from './ai.config'

/**
 * 点击条目卡片，外部站点新窗口打开
 *
 * @param item 被点击的人工智能条目
 */
function handleClickItem(item: AiItem) {
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
