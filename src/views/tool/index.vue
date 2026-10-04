<template>
  <div class="app-content">
    <div class="card-grid">
      <LinkCard v-for="(item, index) in TOOL_LIST" :key="index" :item="item" @click="handleClickTool(item)" />
    </div>
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: 'Tool' })
import { isExternal } from '@/utils'
import { TOOL_LIST } from './tool.config'
import type { ToolItem } from './tool.config'

const router = useRouter()

/**
 * 点击工具卡片，自有工具跳转详情页，外部工具新窗口打开
 *
 * @param item 被点击的工具条目
 */
function handleClickTool(item: ToolItem) {
  if (isExternal(item.key)) {
    window.open(item.key, '_blank')
  } else {
    router.push(`/tool/${item.key}`)
  }
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
