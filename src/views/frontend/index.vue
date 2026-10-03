<template>
  <div class="app-content flex flex-col gap-16px">
    <section v-for="(group, index) in FRONTEND_GROUPS" :id="`category-${index}`" :key="group.category" class="category">
      <h2 class="category-title">
        <span>{{ group.category }}</span>
        <el-tag size="small">x{{ group.children.length }}</el-tag>
      </h2>
      <div class="card-grid">
        <div v-for="item in group.children" :key="item.key" class="frontend-card" :title="isExternal(item.key) ? '将在新窗口打开' : undefined" @click="handleClickItem(item)">
          <div class="card-header">
            <img class="frontend-icon" :src="getIcon(item)" :alt="item.title" loading="lazy" draggable="false" referrerpolicy="no-referrer" @error="onIconError(item)" />
            <span class="frontend-title">{{ item.title }}</span>
            <SvgIcon v-if="isExternal(item.key)" name="External" :size="12" class="frontend-external" />
          </div>
          <ProTooltip :content="item.description">
            <span class="frontend-desc">{{ item.description }}</span>
          </ProTooltip>
        </div>
      </div>
    </section>

    <!-- 分类快速导航：右下角悬浮按钮，点击展开分类列表 -->
    <div class="anchor-float">
      <transition name="fade">
        <div v-show="panelVisible" class="anchor-panel">
          <button v-for="item in anchors" :key="item.id" type="button" :class="{ active: activeId === item.id }" @click="onAnchorSelect(item)">
            <span>{{ item.label }}</span>
            <em>{{ item.count }}</em>
          </button>
        </div>
      </transition>
      <button type="button" class="anchor-fab" aria-label="分类导航" @click="panelVisible = !panelVisible">
        <SvgIcon name="Search" :size="20" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: 'Frontend' })
import { isExternal } from '@/utils'
import { FRONTEND_GROUPS } from './frontend.config'
import type { FrontendItem } from './frontend.config'

/** 分类锚点项 */
interface AnchorItem {
  /** 锚点 id，对应分区元素的 DOM id */
  id: string
  /** 分类名 */
  label: string
  /** 该分类下的条目数 */
  count: number
}

const router = useRouter()

/** 分类锚点列表，由分组数据直接推导 */
const anchors = computed<AnchorItem[]>(() =>
  FRONTEND_GROUPS.map((group, index) => ({
    id: `category-${index}`,
    label: group.category,
    count: group.children.length,
  })),
)

/** 当前高亮的分类锚点 id */
const activeId = ref(anchors.value[0]?.id ?? '')

/** 跳转滚动期间是否锁定高亮跟随（防止滚动过程中锚点乱跳） */
const isLocked = ref(false)

/** 分类面板是否展开 */
const panelVisible = ref(false)

/** 当前图标已加载失败的条目 key 集合（组件内私有，命中即降级为首字占位图） */
const failedIcons = reactive(new Set<string>())

// 收集 src/assets/images/icons 下的本地图标，按文件名索引（key 为构建后资源地址）
const localIconMap: Record<string, string> = {}
for (const [path, url] of Object.entries(import.meta.glob<string>('/src/assets/images/icons/*.{png,ico,svg,jpg,jpeg,webp}', { eager: true, import: 'default' }))) {
  localIconMap[path.split('/').pop() || ''] = url
}

let observer: IntersectionObserver | null = null
let lockTimer: number | undefined

/**
 * 平滑滚动到指定分类分区，并锁定高亮跟随至滚动结束
 *
 * @param item 目标分类锚点项
 */
function scrollTo(item: AnchorItem) {
  lockObserver()
  activeId.value = item.id
  document.getElementById(item.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

/**
 * 分类面板选中分类：收起面板后滚动到目标分区
 *
 * @param item 目标分类锚点项
 */
function onAnchorSelect(item: AnchorItem) {
  panelVisible.value = false
  scrollTo(item)
}

/** 解除高亮锁定，并清理 scrollend 监听与兜底定时器 */
function unlockObserver() {
  isLocked.value = false
  window.removeEventListener('scrollend', unlockObserver)
  window.clearTimeout(lockTimer)
}

/** 进入锁定状态：scrollend 事件优先解锁，不支持时用定时器兜底 */
function lockObserver() {
  isLocked.value = true
  window.removeEventListener('scrollend', unlockObserver)
  window.clearTimeout(lockTimer)
  lockTimer = window.setTimeout(unlockObserver, 1200)
  window.addEventListener('scrollend', unlockObserver, { once: true })
}

/**
 * 分区可见性回调：取视口监测带内最靠上的分区作为当前高亮
 *
 * @param entries 本次发生交叉变化的分区条目
 */
function handleIntersect(entries: IntersectionObserverEntry[]) {
  if (isLocked.value) return
  const visible = entries.filter((entry) => entry.isIntersecting)
  if (!visible.length) return
  const topmost = visible.reduce((a, b) => (a.boundingClientRect.top <= b.boundingClientRect.top ? a : b))
  activeId.value = topmost.target.id
}

/** 注册分区可见性监听 */
function setupObserver() {
  observer = new IntersectionObserver(handleIntersect, {
    // 顶部让出导航栏，只认视口中部扫过的分区，避免分区刚露出头部就抢高亮
    rootMargin: '-25% 0px -65% 0px',
  })
  for (const item of anchors.value) {
    const el = document.getElementById(item.id)
    if (el) observer.observe(el)
  }
}

onMounted(setupObserver)

onUnmounted(() => {
  observer?.disconnect()
  observer = null
  window.clearTimeout(lockTimer)
  window.removeEventListener('scrollend', unlockObserver)
})

/**
 * 解析条目图标地址
 *
 * @param item 前端条目
 * @returns 加载失败降级为首字 SVG 占位；本地图标按文件名映射资源地址；其余原样返回
 */
function getIcon(item: FrontendItem) {
  if (failedIcons.has(item.key)) {
    const ch = item.title.trim().charAt(0) || '?'
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64"><rect width="64" height="64" rx="12" fill="#409eff"/><text x="32" y="43" font-size="32" text-anchor="middle" fill="#fff" font-family="sans-serif">${ch}</text></svg>`
    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
  }
  // 本地图标路径（如 @/assets/images/icons/xx.png）：按文件名匹配 src/assets/images/icons 下的资源
  if (!/^(https?:|data:)/.test(item.icon)) {
    return localIconMap[item.icon.split('/').pop() || ''] || item.icon
  }
  return item.icon
}

/**
 * 图标加载失败回调：记录失败标记，触发降级占位图
 *
 * @param item 前端条目
 */
function onIconError(item: FrontendItem) {
  failedIcons.add(item.key)
}

/**
 * 点击条目卡片，自有页面跳转详情页，外部站点新窗口打开
 *
 * @param item 被点击的前端条目
 */
function handleClickItem(item: FrontendItem) {
  if (isExternal(item.key)) {
    window.open(item.key, '_blank')
  } else {
    router.push(`/frontend/${item.key}`)
  }
}
</script>

<style lang="scss" scoped>
.category {
  scroll-margin-top: calc(var(--n-navbar-height) + 10px);
}

.category-title {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 0 0 12px;
  padding-left: 10px;
  font-size: 18px;
  font-weight: 600;

  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
    width: 4px;
    height: 18px;
    border-radius: 2px;
    background-color: var(--n-color-primary);
  }
}

.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 16px;
}

.frontend-card {
  padding: 8px 16px;
  background-color: #fff;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  cursor: pointer;
  transition:
    box-shadow 0.2s,
    transform 0.2s;

  &:hover {
    box-shadow: 0 4px 12px rgb(0 0 0 / 10%);
    transform: translateY(-2px);
  }
}

.card-header {
  display: flex;
  align-items: center;
  gap: 10px;
}

.frontend-icon {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  object-fit: contain;
  flex-shrink: 0;
}

.frontend-title {
  font-size: 15px;
  font-weight: 600;
}

/* 外链站点标识：靠卡片头部行尾，示意新窗口打开 */
.frontend-external {
  margin-left: auto;
  color: #909399;
  flex-shrink: 0;
}

.frontend-desc {
  display: -webkit-box;
  margin-top: 10px;
  overflow: hidden;
  font-size: 13px;
  line-height: 1.6;
  color: #909399;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  line-clamp: 2;
}

/* 分类快速导航：右下角悬浮按钮 + 展开面板，全端统一 */
.anchor-float {
  .anchor-fab {
    position: fixed;
    right: 16px;
    bottom: 16px;
    z-index: 900;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 44px;
    height: 44px;
    border: none;
    border-radius: 50%;
    color: #fff;
    background-color: var(--n-color-primary);
    box-shadow: 0 4px 12px rgb(0 0 0 / 20%);
    cursor: pointer;
  }

  .anchor-panel {
    position: fixed;
    right: 24px;
    bottom: 88px;
    z-index: 900;
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 140px;
    padding: 8px;
    background-color: #fff;
    border: 1px solid #e4e7ed;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgb(0 0 0 / 12%);

    button {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      padding: 8px 12px;
      border: none;
      border-radius: 6px;
      background: none;
      font-size: 13px;
      color: #606266;
      cursor: pointer;

      &:hover,
      &:active {
        background-color: var(--el-fill-color-light);
      }

      &.active {
        color: var(--n-color-primary);
      }

      em {
        font-style: normal;
        font-size: 12px;
        color: #909399;
      }
    }
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity var(--n-transition-duration-fast);
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

html[data-device='mobile'] {
  .anchor-float {
    .anchor-fab {
      right: 16px;
      bottom: 24px;
    }

    .anchor-panel {
      right: 16px;
      bottom: 80px;
    }
  }

  .card-grid {
    grid-template-columns: repeat(4, 1fr);
    gap: 8px;
  }

  .frontend-card {
    padding: 8px 4px;
    text-align: center;
    background-color: transparent;
    border: none;

    &:hover {
      box-shadow: none;
      transform: none;
    }
  }

  .card-header {
    flex-direction: column;
    gap: 8px;
  }

  .frontend-icon {
    width: 48px;
    height: 48px;
  }

  .frontend-title {
    max-width: 100%;
    overflow: hidden;
    font-size: 12px;
    font-weight: 400;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .frontend-external {
    display: none;
  }

  .frontend-desc {
    display: none;
  }
}
</style>
