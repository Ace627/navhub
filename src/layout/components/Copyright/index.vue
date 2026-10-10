<template>
  <div class="flex-center">
    <span v-for="(item, index) in stats" :key="item.label" class="stat-item">
      <span class="stat-item__label">{{ item.label }}</span>
      <span class="stat-item__value">{{ item.value }}</span>
      <el-divider v-if="index < stats.length - 1" direction="vertical" />
    </span>
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: 'Copyright' })

/** 单条访客统计（标签 + 数值） */
interface VisitorStat {
  label: string
  value: string
}

const stats = ref<VisitorStat[]>([])

/** la-widget 数据容器选择器 */
const WIDGET_SELECTOR = '.la-widget.la-data-widget__container'

/** 开发环境默认统计数据，widget 不可用时便于本地调试 */
const DEV_DEFAULT_STATS: VisitorStat[] = [
  { label: '最近活跃访客', value: '5' },
  { label: '今日访问人数', value: '16' },
  { label: '今日访问量', value: '94' },
  { label: '昨日访问人数', value: '63' },
  { label: '昨日访问量', value: '367' },
  { label: '本月访问量', value: '713' },
  { label: '总访问量', value: '713' },
]

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

  // 开发环境下 widget 不可用时先用默认数据展示，若 widget 随后注入仍会被真实数据覆盖
  if (import.meta.env.DEV) {
    stats.value = DEV_DEFAULT_STATS
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
  font-size: var(--el-copyright-font-size);
  &__label {
    color: var(--el-copyright-label-color);
  }

  &__value {
    margin-left: var(--el-copyright-value-gap);
    font-weight: bold;
    color: var(--el-copyright-value-color);
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
