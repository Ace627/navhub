<template>
  <div class="app-content">
    <div class="card-grid">
      <div v-for="(item, index) in TOOL_LIST" :key="index" class="tool-card flex-center flex-col" :title="isExternal(item.key) ? '将在新窗口打开' : undefined" @click="handleClickTool(item)">
        <SvgIcon v-if="isExternal(item.key)" name="External" :size="12" class="tool-card__external" />
        <div class="tool-card__title">{{ item.title }}</div>
      </div>
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
 * 点击工具卡片，跳转到对应工具详情页
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

.tool-card {
  position: relative;
  padding: 16px 0;
  border-radius: 8px;
  background-color: var(--el-bg-color);
  box-shadow: var(--el-box-shadow-light);
  cursor: pointer;
  transition:
    transform var(--n-transition-duration-fast),
    box-shadow var(--n-transition-duration-fast);

  &:hover {
    transform: translateY(-2px);
    box-shadow: var(--el-box-shadow);
  }

  /* 外链工具角标：示意新窗口打开 */
  &__external {
    position: absolute;
    top: 8px;
    right: 8px;
    color: var(--el-text-color-secondary);
  }

  &__title {
    font-size: 16px;
    font-weight: 600;
    color: var(--el-text-color-primary);
  }
}

html[data-device='mobile'] {
  .card-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;
  }
}
</style>
