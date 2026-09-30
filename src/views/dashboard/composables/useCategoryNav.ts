import webs from '@/database/webs.json'

/** 分类区块的 DOM id 前缀 */
export const CATEGORY_SECTION_PREFIX = 'category-'

/** 分类导航项 */
export interface CategoryItem {
  /** 分类唯一标识，用于 DOM 锚点 id */
  key: string
  /** 分类名称 */
  name: string
  /** 分类下的站点数量 */
  count: number
}

/** useCategoryNav 可选项 */
export interface UseCategoryNavOptions {
  /** 吸顶元素高度，用于修正高亮判定线 */
  topOffset?: number
}

/** 高亮判定线相对视口高度的比例：分类顶部越过该线即视为当前分类 */
const TRIGGER_LINE_RATE = 1 / 3

/** 点击定位期间锁住滚动高亮的时长（毫秒），需大于平滑滚动耗时 */
const HIGHLIGHT_LOCK_DURATION = 700

/** 获取分类区块的 DOM id */
export function getCategorySectionId(key: string) {
  return `${CATEGORY_SECTION_PREFIX}${key}`
}

/** 系统是否开启了减弱动效偏好 */
function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/**
 * 分类导航：分类列表、激活态、点击定位与滚动高亮
 * @param options 可选项
 */
export function useCategoryNav(options: UseCategoryNavOptions = {}) {
  const topOffset = options.topOffset ?? 0

  /** 分类列表 */
  const categories: CategoryItem[] = webs.map(function (group) {
    return { key: group.category, name: group.category, count: group.children.length }
  })

  /** 当前激活的分类 key */
  const activeKey = ref(categories[0]?.key ?? '')

  let listening = false
  let lockUntil = 0
  let ticking = false

  /** 获取分类对应的区块元素 */
  function getSectionEl(key: string) {
    return document.getElementById(getCategorySectionId(key))
  }

  /** 滚动到指定分类 */
  function scrollToCategory(key: string) {
    const target = getSectionEl(key)
    if (!target) return
    // 平滑滚动期间先锁住高亮，否则途经的分类会把激活态反复改写
    lockUntil = Date.now() + HIGHLIGHT_LOCK_DURATION
    activeKey.value = key
    target.scrollIntoView({
      behavior: prefersReducedMotion() ? 'auto' : 'smooth',
      block: 'start',
    })
  }

  /** 页面是否已滚动到最底部 */
  function isScrolledToBottom() {
    return window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4
  }

  /** 依据各分类区块的位置更新激活态，取判定线以上最靠后的一个 */
  function syncActiveKey() {
    const line = topOffset + window.innerHeight * TRIGGER_LINE_RATE
    let current = categories[0]?.key ?? ''

    categories.forEach(function (item) {
      const el = getSectionEl(item.key)
      if (el && el.getBoundingClientRect().top <= line) current = item.key
    })

    // 触底兜底：末段过短时判定线可能够不到最后一个分类
    if (isScrolledToBottom()) current = categories[categories.length - 1]?.key ?? current

    activeKey.value = current
  }

  /** 滚动处理：用 rAF 节流，避免高频重排 */
  function handleScroll() {
    if (ticking) return
    ticking = true
    requestAnimationFrame(function () {
      ticking = false
      if (Date.now() < lockUntil) return
      syncActiveKey()
    })
  }

  /** 注册滚动高亮监听 */
  function observeCategories() {
    if (listening) return
    listening = true
    window.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('resize', handleScroll, { passive: true })
    syncActiveKey()
  }

  /** 卸载滚动高亮监听 */
  function unobserveCategories() {
    if (!listening) return
    listening = false
    window.removeEventListener('scroll', handleScroll)
    window.removeEventListener('resize', handleScroll)
  }

  onMounted(() => observeCategories())
  onBeforeUnmount(() => unobserveCategories())

  return { categories, activeKey, scrollToCategory, observeCategories, unobserveCategories }
}
