<template>
  <div class="app-content">
    <div class="card-grid">
      <LinkCard v-for="item in sites" :key="item.key" :item="item" plain-link />
    </div>
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: 'Movie' })
import { DASHBOARD_LIST } from './movie.config'

/** 站点数据：直接取自免费追剧页配置列表，对齐 LinkCard 的 LinkItem 结构 */
const sites = DASHBOARD_LIST
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
