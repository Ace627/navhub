<template>
  <div class="app-content dashboard">
    <!-- 搜索区：输入框居中定宽，引擎选择桌面端点击引擎名下拉、移动端由放大镜唤起底部弹层 -->
    <div v-if="settingStore.showHomeSearch" ref="searchSectionRef" class="search-section">
      <div class="search-box">
        <el-input v-model="keyword" class="search-input" size="large" clearable :placeholder="`在${activeEngine}搜索，输入关键词后回车`" @keyup.enter="handleSearch">
          <template #prefix>
            <span v-if="appStore.isMobile" class="engine-trigger" role="button" aria-label="选择搜索引擎" @click="openEngineSheet">
              <SvgIcon name="Search" :size="16" />
            </span>
            <span v-else class="engine-trigger engine-trigger-desktop" role="button" aria-label="选择搜索引擎" @click="toggleEngineDropdown">
              {{ activeEngine }}
              <SvgIcon name="ArrowDown" :size="12" />
            </span>
          </template>
          <template #suffix>
            <el-text type="primary" class="px-8px cursor-pointer" @click="handleSearch">搜索</el-text>
          </template>
        </el-input>

        <!-- 桌面端引擎下拉：悬挂于输入框正下方，选中引擎或点击区外收起 -->
        <div v-if="!appStore.isMobile && engineDropdownVisible" class="engine-dropdown">
          <el-button v-for="engine in ENGINE_LIST" :key="engine.name" text class="engine-option" :class="{ 'is-active': engine.name === activeEngine }" @click="selectEngine(engine.name)">
            {{ engine.name }}搜索
          </el-button>
        </div>
      </div>
    </div>

    <!-- 移动端搜索引擎选择弹层：底部弹出，选中引擎后自动收起 -->
    <Teleport to="body">
      <transition name="engine-sheet">
        <div v-if="engineSheetVisible" class="engine-sheet-mask" @click="closeEngineSheet">
          <div class="engine-sheet" @click.stop>
            <p class="engine-sheet-title">选择搜索引擎</p>
            <el-button v-for="engine in ENGINE_LIST" :key="engine.name" text class="engine-option engine-sheet-item" :class="{ 'is-active': engine.name === activeEngine }" @click="selectEngine(engine.name)"
              >{{ engine.name }}搜索</el-button
            >
            <el-button class="engine-sheet-cancel" @click="closeEngineSheet">取消</el-button>
          </div>
        </div>
      </transition>
    </Teleport>

    <!-- 卡片区：按收藏集合顺序排布收藏的站点条目；长按卡片可拖拽调整收藏顺序 -->
    <div class="site-section">
      <div ref="cardGridRef" class="card-grid" :class="{ 'is-drag-sorting': isDragSorting }" @click.capture="handleGridCaptureClick" @dragstart.prevent>
        <!-- 站点收藏卡片：外链直开，站内条目跳转所属分类详情页 -->
        <template v-for="favorite in favoriteEntries" :key="favorite.item.key">
          <LinkCard v-if="isExternal(favorite.item.key)" :item="favorite.item" plain-link long-press-disabled />
          <LinkCard v-else :item="favorite.item" long-press-disabled @click="handleInternalClick(favorite)" />
        </template>
      </div>
    </div>
    <div v-if="!favoriteEntries.length" class="empty-state">
      <SvgIcon name="Link" :size="48" class="empty-icon" />
      <p class="empty-text">暂无收藏站点，去逛逛各分类导航吧</p>
      <!-- 分类快捷入口：仅收藏为空时出现，点击跳转对应分类列表页 -->
      <div class="category-grid">
        <div v-for="entry in CATEGORY_SHORTCUTS" :key="entry.path" class="category-item" @click="handleCategoryClick(entry.path)">
          <SvgIcon :name="entry.icon" :size="18" />
          <span class="category-name">{{ entry.title }}</span>
        </div>
      </div>
      <el-text v-if="appStore.isCollapse" type="primary" class="empty-link" @click="handleExplore">探索一下吧</el-text>
    </div>
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: RouterConstant.HOME_PAGE_NAME })
import { RouterConstant } from '@/router/router.constant'
import Sortable from 'sortablejs'
import { isExternal } from '@/utils'
import { useAppStore } from '@/store/modules/app'
import { useSettingStore } from '@/store/modules/setting'
import { useSiteFavorites } from '@/hooks/useSiteFavorites'
import { useSiteIndex } from '@/hooks/useSiteIndex'
import type { SiteEntry } from '@/hooks/useSiteIndex'
import { useLinkActions } from '@/hooks/useLinkActions'
import { getCategoryRegistry } from '@/router/category.registry'

/** 搜索引擎定义 */
interface SearchEngine {
  /** 引擎名称（同时作为标签与切换标识） */
  name: string
  /** 搜索结果地址前缀，拼接 encodeURIComponent 后的关键词即为完整地址 */
  url: string
}

/** 内置搜索引擎列表：数组顺序即标签展示顺序，可按需扩展 */
const ENGINE_LIST: SearchEngine[] = [
  { name: '百度', url: 'https://www.baidu.com/s?wd=' },
  { name: '谷歌', url: 'https://www.google.com/search?q=' },
  { name: '搜狗', url: 'https://www.sogou.com/web?query=' },
  { name: '必应', url: 'https://www.bing.com/search?q=' },
  { name: '抖音', url: 'https://www.douyin.com/search/' },
  { name: '小红书', url: 'https://www.xiaohongshu.com/search_result?keyword=' },
]

/** 当前选中的搜索引擎名称，默认取第一个 */
const activeEngine = ref(ENGINE_LIST[0].name)

/** 移动端搜索引擎选择弹层可见性 */
const engineSheetVisible = ref(false)

/** 桌面端搜索引擎下拉可见性 */
const engineDropdownVisible = ref(false)

/** 搜索区根节点引用：文档级点击代理据此判断点击是否落在区外 */
const searchSectionRef = ref<HTMLDivElement | null>(null)

/** 搜索关键词 */
const keyword = ref('')

/** 路由实例：站内条目点击时跳转详情页 */
const router = useRouter()

/** 应用状态实例：空状态引导时用于展开侧栏菜单 */
const appStore = useAppStore()

/** 系统设置实例：控制首页搜索区显隐 */
const settingStore = useSettingStore()

/** 全站条目索引：以条目 key（外链为 URL，站内为路由参数）为键，模块加载时构建一次 */
const SITE_INDEX = useSiteIndex()

/** 长按操作面板共享状态：移动端长按卡片原地松手时唤起对应条目的操作面板 */
const { openLinkActions, closeLinkActions, closeLinkMenu } = useLinkActions()

/** 收藏共享状态：首页收藏区随收藏变化实时联动，长按拖拽结束时按新位置写回收藏集合 */
const { favorites, reorderFavorite, pruneFavorites } = useSiteFavorites()

/** 收藏站点条目列表：收藏集合顺序映射全站索引，剔除已下架条目 */
const favoriteEntries = computed<SiteEntry[]>(() => [...favorites].flatMap((key) => (SITE_INDEX[key] ? [SITE_INDEX[key]] : [])))

/** 空状态分类快捷入口：取注册表全部分类的标题、图标与路径，顺序与侧栏菜单一致 */
const CATEGORY_SHORTCUTS = getCategoryRegistry().map((entry) => ({ path: entry.path, title: entry.title, icon: entry.icon }))

/**
 * 打开移动端搜索引擎选择弹层
 */
function openEngineSheet(): void {
  engineSheetVisible.value = true
}

/**
 * 关闭移动端搜索引擎选择弹层：遮罩与取消按钮共用，引擎选择保持原状
 */
function closeEngineSheet(): void {
  engineSheetVisible.value = false
}

/**
 * 切换桌面端引擎下拉：下拉以绝对定位挂在输入框下方，无需输入框失焦
 */
function toggleEngineDropdown(): void {
  engineDropdownVisible.value = !engineDropdownVisible.value
}

/**
 * 文档级点击代理：点击搜索区之外时收起桌面端引擎下拉
 *
 * @param event 文档点击事件
 */
function handleDocumentClick(event: MouseEvent): void {
  if (!engineDropdownVisible.value || searchSectionRef.value?.contains(event.target as Node)) return
  engineDropdownVisible.value = false
}

/**
 * 选中搜索引擎并收起弹层：桌面端下拉与移动端弹层共用
 *
 * @param name 引擎名称
 */
function selectEngine(name: string): void {
  activeEngine.value = name
  closeEngineSheet()
  engineDropdownVisible.value = false
}

/**
 * 搜索跳转：按当前选中引擎拼接关键词后新标签打开
 *
 * 关键词为空时静默忽略，不做任何跳转
 */
function handleSearch(): void {
  const engine = ENGINE_LIST.find((item) => item.name === activeEngine.value)
  const word = keyword.value.trim()
  if (!engine || !word) return
  window.open(engine.url + encodeURIComponent(word), '_blank', 'noopener,noreferrer')
}

/**
 * 站内条目点击跳转：路由跳转到所属分类的详情页
 *
 * @param entry 被点击的站内条目
 */
function handleInternalClick(entry: SiteEntry): void {
  router.push(`${entry.categoryPath}/${entry.item.key}`)
}

/** 触发长按拖拽所需的按压时长（毫秒），与 LinkCard 长按面板时长保持一致 */
const DRAG_PRESS_DELAY = 450

/** 长按后允许的最大位移（像素），超出视为滚动滑动，取消拖拽意图 */
const DRAG_MOVE_THRESHOLD = 12

/** 卡片网格根节点引用：长按拖拽排序的作用容器 */
const cardGridRef = ref<HTMLDivElement | null>(null)

/** 长按拖拽排序实例 */
let sortable: Sortable | null = null

/** 是否处于拖拽排序中：驱动网格抓取光标与被拖卡片的浮起视觉 */
const isDragSorting = ref(false)

/** 拖拽结束后待拦截的 click 标记：排序或唤起面板后避免误触发卡片跳转 */
let suppressGridClick = false

/** 拖拽期间指针是否发生明显位移：原地松手视为长按，唤起操作面板而非排序 */
let dragPointerMoved = false

/** 拖拽指针位移基准坐标 */
let dragBase: { x: number; y: number } | null = null

/** 拖拽期间指针的最新坐标（视口坐标） */
let dragLastPoint: { x: number; y: number } | null = null

/** 拖拽开始时刻各卡片槽位的矩形（相对网格容器坐标）：拖拽中卡片会滑动补位，槽位本身不动，可作为落点判定基准 */
let dragSlotRects: { x: number; y: number; width: number; height: number }[] = []

/**
 * 拖拽期间指针移动捕获回调：记录最新坐标；累计位移超出阈值即判定为拖拽意图，松手后走排序而非面板
 *
 * @param event 指针移动事件对象
 */
function handleDragPointerMove(event: PointerEvent): void {
  dragLastPoint = { x: event.clientX, y: event.clientY }
  if (!dragBase) {
    dragBase = { x: event.clientX, y: event.clientY }
    return
  }
  const deltaX = event.clientX - dragBase.x
  const deltaY = event.clientY - dragBase.y
  if (deltaX * deltaX + deltaY * deltaY > DRAG_MOVE_THRESHOLD * DRAG_MOVE_THRESHOLD) dragPointerMoved = true
}

/**
 * 拖拽开始：记录槽位布局基准并进入拖拽态
 *
 * click 拦截不在此处标记：桌面端按下即拖，原地点击也会走一次拖拽生命周期，须等确认位移或换位后再拦截
 */
function handleDragStart(): void {
  dragPointerMoved = false
  dragBase = null
  dragLastPoint = null
  // 右键菜单与长按面板依赖 click 收起，而拖拽期间 click 会被吞掉，进入拖拽态时主动关闭
  closeLinkMenu()
  closeLinkActions()
  const grid = cardGridRef.value
  if (grid) {
    const gridRect = grid.getBoundingClientRect()
    dragSlotRects = Array.from(grid.children)
      .filter((el): el is HTMLElement => el instanceof HTMLElement && !el.classList.contains('drag-floating'))
      .map((el) => {
        const rect = el.getBoundingClientRect()
        return { x: rect.left - gridRect.left, y: rect.top - gridRect.top, width: rect.width, height: rect.height }
      })
  }
  isDragSorting.value = true
  document.addEventListener('pointermove', handleDragPointerMove, true)
}

/**
 * 按指针最终落点判定目标槽位下标
 *
 * Sortable 依赖拖拽途中的 hover 换位，快速拖拽松手时最后一次换位往往滞后于指针，
 * 得到的 newIndex 会偏小（表现为拖到第 n 个却落在靠前位置）。此处以拖拽开始时的
 * 槽位布局为基准，把指针落点映射为槽位下标；指针远离网格时返回 null，交由调用方沿用 Sortable 结果。
 *
 * @param grid 网格容器
 * @param point 指针最终落点（视口坐标）
 * @returns 目标槽位下标；无法判定时为 null
 */
function resolveDropSlotIndex(grid: HTMLElement, point: { x: number; y: number }): number | null {
  const gridRect = grid.getBoundingClientRect()
  const offsetX = point.x - gridRect.left
  const offsetY = point.y - gridRect.top
  const outsideMargin = 80
  if (offsetX < -outsideMargin || offsetY < -outsideMargin || offsetX > gridRect.width + outsideMargin || offsetY > gridRect.height + outsideMargin) return null
  let nearest = -1
  let nearestDistance = Infinity
  dragSlotRects.forEach((rect, index) => {
    const deltaX = offsetX - (rect.x + rect.width / 2)
    const deltaY = offsetY - (rect.y + rect.height / 2)
    const distance = deltaX * deltaX + deltaY * deltaY
    if (distance < nearestDistance) {
      nearestDistance = distance
      nearest = index
    }
  })
  return nearest === -1 ? null : nearest
}

/**
 * 拖拽结束：还原 Sortable 的 DOM 移动交由 Vue 响应式渲染接管，再按指针是否位移决定排序或唤起操作面板
 *
 * @param event 拖拽结束事件对象
 */
function handleDragEnd(event: Sortable.SortableEvent): void {
  document.removeEventListener('pointermove', handleDragPointerMove, true)
  isDragSorting.value = false
  const { item, from } = event
  const { oldIndex, newIndex } = event
  if (oldIndex === undefined || newIndex === undefined) return
  // 目标位置以指针最终落点映射的槽位为准，Sortable 的 newIndex 在快速拖拽时会滞后于指针
  const grid = cardGridRef.value
  const dropSlot = grid && dragLastPoint ? resolveDropSlotIndex(grid, dragLastPoint) : null
  const targetIndex = dropSlot ?? newIndex
  /** 是否需要拦截紧随的 click：换位、拖拽中位移过或唤起了操作面板 */
  let suppressClick = false
  if (targetIndex !== oldIndex) {
    // 先按锚点还原被 Sortable 移动的节点，避免外部 DOM 变更与 Vue diff 冲突；真实顺序由收藏集合状态驱动
    from.removeChild(item)
    const reference = from.children[oldIndex]
    if (reference) from.insertBefore(item, reference)
    else from.appendChild(item)
    reorderFavorite(oldIndex, targetIndex)
    suppressClick = true
  } else if (!dragPointerMoved && appStore.isMobile) {
    openFavoritePanel(oldIndex)
    suppressClick = true
  } else if (dragPointerMoved) {
    suppressClick = true
  }
  if (suppressClick) {
    suppressGridClick = true
    window.setTimeout(() => {
      suppressGridClick = false
    }, 120)
  }
}

/**
 * 唤起收藏卡片的操作面板：仅移动端长按原地松手时触发，桌面端操作入口统一为卡片右键菜单
 *
 * @param index 收藏条目在收藏列表中的下标
 */
function openFavoritePanel(index: number): void {
  const favorite = favoriteEntries.value[index]
  if (!favorite) return
  openLinkActions(favorite.item)
}

/**
 * 网格点击捕获回调：拖拽结束后的首个 click 在此拦截，避免排序或唤起面板的同时触发卡片跳转
 *
 * @param event 点击事件对象
 */
function handleGridCaptureClick(event: MouseEvent): void {
  if (!suppressGridClick) return
  suppressGridClick = false
  event.preventDefault()
  event.stopPropagation()
}

/**
 * 空状态分类快捷入口点击：路由跳转到对应分类列表页
 *
 * @param path 分类路由路径，不含前导斜杠
 */
function handleCategoryClick(path: string): void {
  router.push(`/${path}`)
}

/**
 * 空状态引导点击：展开折叠的侧栏菜单
 */
function handleExplore(): void {
  appStore.toggleSidebar()
}

/**
 * 刷新缓存一致性：以全站配置索引为合法键集合，裁剪收藏中条目被删除后残留的脏键
 *
 * 必须裁剪内存中的响应式集合而非仅修存储：幽灵键残留会让收藏顺序与展示卡片错位，
 * 拖拽排序等按下标换序的功能会错位换卡。
 */
function refreshSiteCaches(): void {
  pruneFavorites(Object.keys(SITE_INDEX))
}

onMounted(refreshSiteCaches)

onActivated(refreshSiteCaches)

/** 挂载长按拖拽排序：触屏长按 450ms 进入拖拽态（与长按面板时长一致），桌面端鼠标按下即拖、无需等待 */
onMounted(() => {
  if (!cardGridRef.value) return
  sortable = new Sortable(cardGridRef.value, {
    animation: 150,
    forceFallback: true,
    delay: DRAG_PRESS_DELAY,
    delayOnTouchOnly: true,
    touchStartThreshold: DRAG_MOVE_THRESHOLD,
    ghostClass: 'drag-ghost',
    chosenClass: 'drag-chosen',
    fallbackClass: 'drag-floating',
    onStart: handleDragStart,
    onEnd: handleDragEnd,
  })
})

onBeforeUnmount(() => {
  sortable?.destroy()
  sortable = null
  document.removeEventListener('pointermove', handleDragPointerMove, true)
})

/** 首页搜索区显隐联动：仅显示期间挂载文档级点击代理，隐藏时彻底移除，恢复显示时重新挂载 */
watch(
  () => settingStore.showHomeSearch,
  (visible) => {
    if (visible) document.addEventListener('click', handleDocumentClick)
    else document.removeEventListener('click', handleDocumentClick)
  },
  { immediate: true },
)

onBeforeUnmount(() => document.removeEventListener('click', handleDocumentClick))
</script>

<style lang="scss" scoped>
.search-section {
  display: flex;
  justify-content: center;
  margin-bottom: 16px;
}

// .link-card {
//   border-color: var(--el-color-success);
// }

/* 定宽容器：输入框与下拉共用，下拉以输入框左边缘为基准定位 */
.search-box {
  position: relative;
  width: 640px;
  max-width: 100%;
}

.search-input {
  width: 100%;

  &:deep(.el-input__wrapper) {
    /* 轻玻璃底：透出页面纹理背景，与全站卡片视觉一致，避免纯白胶囊突兀 */
    background-color: rgba(255, 255, 255, 0.4);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    border-radius: 999px;
  }

  /* 「搜索」文字与清除图标之间留距 */
  &:deep(.el-input__suffix) {
    gap: 8px;
  }
}

/* 深色模式：玻璃底换深色融入，避免暗底下搜索框发灰发白 */
html.dark .search-input:deep(.el-input__wrapper) {
  background-color: color-mix(in srgb, var(--el-bg-color) 55%, transparent);
}

/* 桌面端触发器：输入框前缀展示当前引擎名，点击展开引擎下拉 */
.engine-trigger-desktop {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  margin-left: -8px;
  padding: 4px 8px;
  color: var(--el-text-color-regular);
  cursor: pointer;

  &:hover {
    color: var(--el-color-primary);
  }
}

/* 桌面端引擎下拉：绝对定位挂在输入框下方，与输入框左边缘对齐 */
.engine-dropdown {
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  z-index: 10;
  min-width: 160px;
  padding: 6px;
  background-color: var(--el-bg-color-overlay);
  border: 1px solid var(--el-border-color-light);
  border-radius: 8px;
  box-shadow: var(--el-box-shadow-light);

  /* el-button 相邻默认带 12px 左边距，会让选项整体右移，此处清零 */
  .engine-option {
    margin-left: 0;
    padding: 8px 10px;
  }
}

/* 引擎选项：桌面下拉与移动端弹层共用 */
.engine-option {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  width: 100%;
  font-size: var(--el-font-size-base);
  color: var(--el-text-color-regular);
  border-radius: 8px;

  &:hover {
    background-color: var(--el-fill-color-light);
  }

  &.is-active {
    color: var(--el-color-primary);
    background-color: var(--el-color-primary-light-9);
  }
}

.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  /* 同行卡片等高由网格默认拉伸实现，卡片间保持 8px 均匀间隙 */
  gap: 8px;
}

/* 拖拽排序中：网格整体呈抓取光标，明确告知正在拖拽 */
.card-grid.is-drag-sorting {
  cursor: grabbing;

  &:deep(.link-card) {
    cursor: grabbing;
  }
}

/* 长按按压中（触屏延迟期）：被选卡片轻微抬起预告即将拖拽 */
.card-grid:deep(.link-card.drag-chosen) {
  transform: scale(1.02);
  box-shadow: var(--el-box-shadow-light);
}

/* 长按拖拽：被拖卡片自身即「浮起卡」，抬起放大、主色描边、压在其余卡片之上，原位不留空槽、不留半透明残影 */
.card-grid:deep(.link-card.drag-ghost) {
  position: relative;
  z-index: 2;
  transform: scale(1.03);
  box-shadow: var(--el-box-shadow-dark);
  outline: 2px solid var(--el-color-primary-light-5);
  outline-offset: -1px;
}

/* 长按拖拽：隐去 Sortable 跟随指针的浮起克隆，改由卡片本身在槽位间滑动补位，与手机桌面图标拖拽一致；
   否则会出现「浮起卡压住别的卡 + 原位空一格」两个破绽 */
.card-grid:deep(.drag-floating) {
  display: none !important;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  width: 960px;
  margin: 0 auto;
  color: var(--el-text-color-secondary);

  .empty-icon {
    color: var(--el-border-color-darker);
  }

  .empty-text {
    margin: 0;
    font-size: var(--el-font-size-base);
  }

  .empty-link {
    cursor: pointer;
  }
}

/* 分类快捷入口：空状态下补齐横向跳转能力，列宽较卡片网格更窄以容纳更多入口 */
.category-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 12px;
  width: 100%;
}

.category-item {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 10px 8px;
  font-size: var(--el-font-size-base);
  color: var(--el-text-color-regular);
  cursor: pointer;
  background-color: var(--el-bg-color);
  border: 1px solid var(--el-border-color);
  border-radius: 8px;
  transition:
    color 0.2s,
    background-color 0.2s,
    border-color 0.2s;

  &:hover {
    color: var(--el-color-primary);
    background-color: var(--el-color-primary-light-9);
    border-color: var(--el-color-primary-light-5);
  }
}

.category-name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

html[data-device='mobile'] {
  .search-section {
    margin-bottom: 16px;
  }

  .search-box {
    width: 100%;
  }

  /* 放大镜扩大为可点热区，触摸目标不低于 32px */
  .engine-trigger {
    padding: 4px;
    color: var(--el-text-color-secondary);
    cursor: pointer;
  }

  /* 空状态定宽仅适用于桌面端，移动端占满可用宽度 */
  .empty-state {
    width: 100%;
  }

  .card-grid {
    grid-template-columns: repeat(4, 1fr);
    gap: 8px;
  }

  /* 移动端卡片默认无底色/边框，拖拽中补齐卡片外壳并保留抬起阴影，保证「浮起卡」可辨识
     （只补视觉、不改内边距，避免拖拽中尺寸跳动；此处选择器带 html 前缀以压过 LinkCard 的移动端 hover 阴影重置） */
  .card-grid:deep(.link-card.drag-ghost) {
    background-color: var(--el-bg-color);
    border: 1px solid var(--el-border-color);
    border-radius: 8px;
    box-shadow: var(--el-box-shadow-dark);
  }

  /* 分类快捷入口：移动端四列紧凑排布，图标与标题上下排列 */
  .category-grid {
    grid-template-columns: repeat(4, 1fr);
    gap: 8px;
  }

  .category-item {
    flex-direction: column;
    gap: 4px;
    padding: 8px 4px;
    font-size: 12px;
  }
}

/* 搜索引擎选择弹层：底部弹出，遮罩点击与取消按钮均关闭 */
.engine-sheet-mask {
  position: fixed;
  inset: 0;
  z-index: 1000;
  background-color: rgba(0, 0, 0, 0.32);
}

.engine-sheet {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 16px 16px calc(16px + env(safe-area-inset-bottom));
  background-color: var(--el-bg-color);
  border-radius: 16px 16px 0 0;
  box-shadow: var(--el-box-shadow-light);

  /* 相邻按钮默认带 12px 左边距，会让选项行与取消按钮整体右移并溢出弹层，此处统一清零 */
  .el-button {
    margin-left: 0;
  }
}

.engine-sheet-title {
  margin: 0 0 8px;
  text-align: center;
  font-size: var(--el-font-size-base);
  color: var(--el-text-color-primary);
}

/* 弹层选项行高比桌面下拉更宽松，触摸目标更大 */
.engine-sheet-item {
  padding: 12px 8px;
}

.engine-sheet-cancel {
  width: 100%;
  margin-top: 8px;
}

/* 遮罩淡入淡出，面板上滑/下滑 */
.engine-sheet-enter-active,
.engine-sheet-leave-active {
  transition: opacity var(--el-transition-duration);

  .engine-sheet {
    transition: transform var(--el-transition-duration);
  }
}

.engine-sheet-enter-from,
.engine-sheet-leave-to {
  opacity: 0;

  .engine-sheet {
    transform: translateY(100%);
  }
}
</style>
