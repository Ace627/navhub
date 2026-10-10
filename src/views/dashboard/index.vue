<template>
  <div class="app-content dashboard">
    <!-- 搜索区：输入框居中定宽，引擎选择桌面端点击引擎名下拉、移动端由放大镜唤起底部弹层 -->
    <div ref="searchSectionRef" class="search-section">
      <div class="search-box">
        <el-input v-model="keyword" class="search-input" size="large" clearable :placeholder="`在${activeEngine}搜索，输入关键词后回车`" @keyup.enter="handleSearch">
          <template #prefix>
            <el-button v-if="appStore.isMobile" text class="engine-trigger" aria-label="选择搜索引擎" @click="openEngineSheet">
              <SvgIcon name="Search" :size="16" />
            </el-button>
            <el-button v-else text class="engine-trigger engine-trigger-desktop" aria-label="选择搜索引擎" @click="toggleEngineDropdown">
              {{ activeEngine }}
              <SvgIcon name="ArrowDown" :size="12" />
            </el-button>
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

    <!-- 卡片区：首张固定为最近浏览入口，其后依次展示收藏条目（收藏集合顺序，无分区分组） -->
    <div class="site-section">
      <div class="card-grid">
        <!-- 最近浏览入口卡片：复用 LinkCard，操作行由插槽自定义，跳转行为由父级处理 -->
        <LinkCard :item="RECENT_ENTRY" skip-record @click="router.push(RouterConstant.RECENT_PAGE_URL)">
          <template #actions>
            <el-link type="primary" underline="never" @click="handleCopyRecent">复制</el-link>
          </template>
        </LinkCard>
        <template v-for="entry in favoriteSites" :key="entry.item.key">
          <LinkCard v-if="isExternal(entry.item.key)" :item="entry.item" plain-link reorderable />
          <LinkCard v-else :item="entry.item" reorderable @click="handleInternalClick(entry)" />
        </template>
      </div>
    </div>
    <div v-if="!favoriteSites.length" class="empty-state">
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
import { SITE_RECORD_LIMIT, buildSiteShareText, copyText, isExternal, pruneSiteFavorites, pruneSiteRecords } from '@/utils'
import { useAppStore } from '@/store/modules/app'
import { useSiteFavorites } from '@/hooks/useSiteFavorites'
import { useSiteIndex } from '@/hooks/useSiteIndex'
import type { SiteEntry } from '@/hooks/useSiteIndex'
import { useSiteShare } from '@/hooks/useSiteShare'
import type { LinkItem } from '@/components/LinkCard/types'
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

/** 全站条目索引：以条目 key（外链为 URL，站内为路由参数）为键，模块加载时构建一次 */
const SITE_INDEX = useSiteIndex()

/** 站内地址与分享文案构建方法：最近浏览入口卡片复制时复用 */
const { resolveRouteAddress } = useSiteShare()

/** 最近浏览入口卡片条目：非站点条目，key 取最近浏览页路由，仅用于展示与分享文案 */
const RECENT_ENTRY: LinkItem = {
  key: RouterConstant.RECENT_PAGE_URL,
  title: '最近浏览',
  icon: '@/assets/images/icons/历史记录.png',
  description: `自动记录最近打开的站点，最多保留 ${SITE_RECORD_LIMIT} 条`,
}

/** 收藏站点共享状态：首页收藏区随收藏变化实时联动 */
const { favorites } = useSiteFavorites()

/** 收藏站点条目列表：收藏集合顺序映射全站索引，剔除已下架条目 */
const favoriteSites = computed<SiteEntry[]>(() => [...favorites].map((key) => SITE_INDEX[key]).filter((entry): entry is SiteEntry => Boolean(entry)))

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
 * 最近浏览入口卡片操作行复制：复制最近浏览页分享文案（名称、站内地址与描述，格式与 LinkCard 一致）并阻断卡片自身的跳转
 *
 * @param event 点击事件对象
 */
function handleCopyRecent(event: MouseEvent): void {
  event.preventDefault()
  event.stopPropagation()
  copyText(buildSiteShareText(RECENT_ENTRY.title, resolveRouteAddress(RECENT_ENTRY.key), RECENT_ENTRY.description))
}

/**
 * 站内条目点击跳转：路由跳转到所属分类的详情页
 *
 * @param entry 被点击的站内条目
 */
function handleInternalClick(entry: SiteEntry): void {
  router.push(`${entry.categoryPath}/${entry.item.key}`)
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
 * 刷新缓存一致性：以全站配置索引为合法键集合，裁剪收藏与最近浏览中站点被删除后残留的脏键
 */
function refreshSiteCaches(): void {
  pruneSiteFavorites(Object.keys(SITE_INDEX))
  pruneSiteRecords(Object.keys(SITE_INDEX))
}

onMounted(() => {
  refreshSiteCaches()
  document.addEventListener('click', handleDocumentClick)
})

onActivated(refreshSiteCaches)

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
    border-radius: 999px;
  }

  /* 「搜索」文字与清除图标之间留距 */
  &:deep(.el-input__suffix) {
    gap: 8px;
  }
}

/* 桌面端触发器：输入框前缀展示当前引擎名，点击展开引擎下拉 */
.engine-trigger-desktop {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  margin-left: -8px;
  padding: 4px 8px;
  color: var(--el-text-color-regular);

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
  gap: 16px;
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
  }

  /* 空状态定宽仅适用于桌面端，移动端占满可用宽度 */
  .empty-state {
    width: 100%;
  }

  .card-grid {
    grid-template-columns: repeat(4, 1fr);
    gap: 8px;
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
