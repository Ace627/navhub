/** 单条访客统计（标签 + 数值） */
export interface VisitorStat {
  /** 统计项名称，如「今日访问量」 */
  label: string
  /** 统计项数值，由 widget 以文本形式提供 */
  value: string
}

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

/** 全站共享的访客统计（模块级单例）：数据由第三方脚本注入的 widget 解析而来 */
const stats = ref<VisitorStat[]>([])

/** 是否已启动抓取：全站只启动一次，重复调用直接复用已有数据 */
let started = false

/** 监听 widget 注入的观察器，取到数据后置空 */
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

/**
 * 启动抓取：优先取页面中已存在的 widget，否则监听其异步注入
 *
 * 抓取结果写入模块级单例，原 widget 节点立即移除，避免第三方统计条残留在页面上
 */
function start(): void {
  if (started) return
  started = true

  const existing = document.querySelector(WIDGET_SELECTOR)
  if (existing) {
    takeOverWidget(existing)
    return
  }

  // 开发环境下 widget 不可用时先用默认数据展示，若 widget 随后注入仍会被真实数据覆盖
  if (import.meta.env.DEV) stats.value = DEV_DEFAULT_STATS

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
}

/**
 * 访客统计共享状态：数据源自第三方脚本注入的 widget，全站由根组件启动一次抓取，
 * 关于页订阅同一份响应式数据渲染图表
 *
 * @returns 访客统计数据
 */
export function useVisitorStats() {
  onMounted(start)

  return { stats }
}
