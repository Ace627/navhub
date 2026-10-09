<template>
  <div class="app-content">
    <!-- 搜索区：引擎切换标签 + 关键词搜索框 -->
    <div class="search-section">
      <el-scrollbar class="engine-scrollbar">
        <div class="engine-tabs">
          <button v-for="engine in ENGINE_LIST" :key="engine.name" type="button" class="engine-tab" :class="{ 'is-active': engine.name === activeEngine }" @click="switchEngine(engine.name)">{{ engine.name }}搜索</button>
        </div>
      </el-scrollbar>
      <el-input v-model="keyword" class="search-input" size="large" clearable :placeholder="`在${activeEngine}搜索，输入关键词后回车`" @keyup.enter="handleSearch">
        <template #prefix>
          <SvgIcon name="Search" :size="16" />
        </template>
      </el-input>
    </div>

    <!-- 我的常用：收藏条目，收藏集合顺序展示 -->
    <div v-if="favoriteSites.length" class="site-section">
      <p class="section-title">我的常用</p>
      <div class="card-grid">
        <template v-for="entry in favoriteSites" :key="entry.item.key">
          <LinkCard v-if="isExternal(entry.item.key)" :item="entry.item" plain-link />
          <LinkCard v-else :item="entry.item" @click="handleInternalClick(entry)" />
        </template>
      </div>
    </div>

    <!-- 最近使用：按全站卡片点击次数取前 15，排除已收藏条目 -->
    <div v-if="recentSites.length" class="site-section">
      <p class="section-title">最近使用</p>
      <div class="card-grid">
        <template v-for="entry in recentSites" :key="entry.item.key">
          <LinkCard v-if="isExternal(entry.item.key)" :item="entry.item" plain-link />
          <LinkCard v-else :item="entry.item" @click="handleInternalClick(entry)" />
        </template>
      </div>
    </div>
    <div v-if="!favoriteSites.length && !recentSites.length" class="empty-state">
      <SvgIcon name="Link" :size="48" class="empty-icon" />
      <p class="empty-text">暂无使用记录，去逛逛各分类导航吧</p>
      <el-text v-if="appStore.isCollapse" type="primary" class="empty-link" @click="handleExplore">探索一下吧</el-text>
    </div>
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: RouterConstant.HOME_PAGE_NAME })
import { RouterConstant } from '@/router/router.constant'
import type { LinkItem } from '@/components/LinkCard/types'
import { getSiteClickCounts, isExternal, pruneSiteClickCounts, pruneSiteFavorites } from '@/utils'
import { useAppStore } from '@/store/modules/app'
import { useSiteFavorites } from '@/hooks/useSiteFavorites'
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

/** 全站条目定义：链接条目 + 所属分类路由路径（站内条目跳转时拼接使用） */
interface SiteEntry {
  /** 链接条目 */
  item: LinkItem
  /** 所属分类路由路径，如 /tool */
  categoryPath: string
}

/** 当前选中的搜索引擎名称，默认取第一个 */
const activeEngine = ref(ENGINE_LIST[0].name)

/** 搜索关键词 */
const keyword = ref('')

/** 路由实例：站内条目点击时跳转详情页 */
const router = useRouter()

/** 应用状态实例：空状态引导时用于展开侧栏菜单 */
const appStore = useAppStore()

/** 收藏站点共享状态：常用区与最近使用区随收藏变化实时联动 */
const { favorites } = useSiteFavorites()

/** 我的常用条目列表：收藏集合顺序映射全站索引，剔除已下架条目 */
const favoriteSites = computed<SiteEntry[]>(() => [...favorites].map((key) => SITE_INDEX[key]).filter((entry): entry is SiteEntry => Boolean(entry)))

/** 最近使用条目列表：按点击次数降序取前 15，排除已收藏条目避免与常用区重复 */
const recentSites = computed<SiteEntry[]>(() => {
  const counts = getSiteClickCounts()
  return Object.keys(counts)
    .filter((key) => SITE_INDEX[key] && !favorites.has(key))
    .sort((a, b) => counts[b] - counts[a])
    .slice(0, 15)
    .map((key) => SITE_INDEX[key])
})

/** 分类数据源清单：分类路由路径 + 该分类下的站点列表（注册表在引导阶段已装配完成） */
const CATEGORY_SOURCES: { categoryPath: string; list: LinkItem[] }[] = getCategoryRegistry().map((entry) => ({ categoryPath: `/${entry.path}`, list: entry.data }))

/** 全站条目索引：以条目 key（外链为 URL，站内为路由参数）为键，模块加载时构建一次 */
const SITE_INDEX: Record<string, SiteEntry> = Object.fromEntries(CATEGORY_SOURCES.flatMap((source) => source.list.map((item) => [item.key, { item, categoryPath: source.categoryPath }])))

/**
 * 切换搜索引擎
 *
 * @param name 引擎名称
 */
function switchEngine(name: string): void {
  activeEngine.value = name
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

/**
 * 空状态引导点击：展开折叠的侧栏菜单
 */
function handleExplore(): void {
  appStore.toggleSidebar()
}

/**
 * 刷新缓存一致性：以全站配置索引为合法键集合，裁剪点击计数与收藏中站点被删除后残留的脏键
 */
function refreshSiteCaches(): void {
  pruneSiteClickCounts(Object.keys(SITE_INDEX))
  pruneSiteFavorites(Object.keys(SITE_INDEX))
}

onMounted(refreshSiteCaches)
onActivated(refreshSiteCaches)
</script>

<style lang="scss" scoped>
.search-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  margin-bottom: 32px;
}

.engine-scrollbar {
  width: 100%;
}

.engine-tabs {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 8px;
}

.engine-tab {
  padding: 4px 16px;
  font-size: var(--el-font-size-base);
  color: var(--el-text-color-regular);
  background-color: var(--el-bg-color);
  border: 1px solid var(--el-border-color);
  border-radius: 999px;
  cursor: pointer;
  white-space: nowrap;
  transition:
    color 0.2s,
    background-color 0.2s,
    border-color 0.2s;

  &:hover {
    color: var(--el-color-primary);
    border-color: var(--el-color-primary-light-5);
  }

  &.is-active {
    color: var(--el-color-white);
    background-color: var(--el-color-primary);
    border-color: var(--el-color-primary);
  }
}

.search-input {
  max-width: 560px;

  &:deep(.el-input__wrapper) {
    border-radius: 999px;
  }
}

.site-section {
  & + .site-section {
    margin-top: 24px;
  }
}

.section-title {
  margin: 0 0 12px;
  font-size: 14px;
  color: var(--el-text-color-secondary);
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
  padding: 64px 0;
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

html[data-device='mobile'] {
  .search-section {
    gap: 12px;
    margin-bottom: 16px;
  }

  .engine-tabs {
    flex-wrap: nowrap;
    justify-content: flex-start;
  }

  .engine-tab {
    flex-shrink: 0;
  }

  .search-input {
    width: 100%;
    max-width: none;
  }

  .site-section {
    & + .site-section {
      margin-top: 16px;
    }
  }

  .section-title {
    margin-bottom: 8px;
  }

  .card-grid {
    grid-template-columns: repeat(4, 1fr);
    gap: 8px;
  }
}
</style>
