<template>
  <div class="px-16px py-8px">
    <span v-for="(item, index) in stats" :key="item.label" class="stat-item">
      <span class="stat-item__label">{{ item.label }}</span>
      <span class="stat-item__value">{{ item.value }}</span>
      <el-divider v-if="index < stats.length - 1" direction="vertical" />
    </span>
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: 'AppFooter' })

/** 单条访客统计（标签 + 数值） */
interface VisitorStat {
  label: string
  value: string
}

const stats = ref<VisitorStat[]>([])

/** la-widget 数据容器选择器 */
const WIDGET_SELECTOR = '.la-widget.la-data-widget__container'

/** 监听 widget 注入的观察器，取到数据或组件卸载后置空 */
let observer: MutationObserver | null = null

/**
 * 解析 la-widget 数据容器的直接子元素，提取各统计项的标签与数值
 *
 * 容器结构固定：每个顶层 span 内含两个子 span，依次为标签与数值
 *
 * @param container la-widget 数据容器元素
 * @returns 统计项数组，按 DOM 顺序排列
 */
function extractStats(container: Element): VisitorStat[] {
  return Array.from(container.children)
    .map((item) => {
      const [label, value] = Array.from(item.children)
      return {
        label: label?.textContent?.trim() ?? '',
        value: value?.textContent?.trim() ?? '',
      }
    })
    .filter((item) => item.label !== '' && item.value !== '')
}

/**
 * 提取统计数据并移除原 widget 节点
 *
 * @param widget la-widget 数据容器元素
 */
function takeOverWidget(widget: Element): void {
  stats.value = extractStats(widget)
  widget.remove()
}

onMounted(() => {
  const existing = document.querySelector(WIDGET_SELECTOR)
  if (existing) {
    takeOverWidget(existing)
    return
  }

  // widget 由第三方脚本异步注入，监听 DOM 变化等待其出现
  observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      for (const node of mutation.addedNodes) {
        if (!(node instanceof Element)) continue
        const widget = node.matches(WIDGET_SELECTOR) ? node : node.querySelector(WIDGET_SELECTOR)
        if (!widget) continue
        observer?.disconnect()
        observer = null
        takeOverWidget(widget)
        return
      }
    }
  })
  observer.observe(document.documentElement, { childList: true, subtree: true })
})

onUnmounted(() => {
  observer?.disconnect()
  observer = null
})
</script>

<style lang="scss" scoped>
.stat-item {
  &__label {
    color: var(--el-text-color-secondary);
  }

  &__value {
    margin-left: 6px;
    font-weight: bold;
    color: var(--el-text-color-primary);
  }
}

/* 移动端仅展示前三条统计 */
html[data-device='mobile'] {
  .stat-item:nth-child(n + 4) {
    display: none;
  }

  /* 第三条的分隔线原本衔接第四条，移动端作为末尾竖线一并隐藏 */
  .stat-item:nth-child(3) .el-divider {
    display: none;
  }
}
</style>
