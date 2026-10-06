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

    <!-- 最近使用：按全站卡片点击次数取前 8 -->
    <div v-if="recentSites.length" class="card-grid">
      <template v-for="entry in recentSites" :key="entry.item.key">
        <LinkCard v-if="isExternal(entry.item.key)" :item="entry.item" plain-link />
        <LinkCard v-else :item="entry.item" @click="handleInternalClick(entry)" />
      </template>
    </div>
    <div v-else class="empty-state">
      <SvgIcon name="Link" :size="48" class="empty-icon" />
      <p class="empty-text">暂无使用记录，去逛逛各分类导航吧</p>
    </div>
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: RouterConstant.HOME_PAGE_NAME })
import { RouterConstant } from '@/router/router.constant'
import type { LinkItem } from '@/components/LinkCard/types'
import { getSiteClickCounts, isExternal, pruneSiteClickCounts } from '@/utils'
import { AI_LIST } from '@/views/ai/ai.config'
import { API_LIST } from '@/views/api/api.config'
import { DASHBOARD_LIST } from '@/views/movie/movie.config'
import { FRONTEND_LIST } from '@/views/frontend/frontend.config'
import { SOFTWARE_LIST } from '@/views/software/software.config'
import { STUDY_LIST } from '@/views/study/study.config'
import { TOOL_LIST } from '@/views/tool/tool.config'
import { WALLPAPER_LIST } from '@/views/wallpaper/wallpaper.config'

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

/** 最近使用条目列表：按点击次数降序最多 8 条 */
const recentSites = ref<SiteEntry[]>([])

/** 路由实例：站内条目点击时跳转详情页 */
const router = useRouter()

/** 分类数据源清单：分类路由路径 + 该分类下的站点列表 */
const CATEGORY_SOURCES: { categoryPath: string; list: LinkItem[] }[] = [
  { categoryPath: '/movie', list: DASHBOARD_LIST },
  { categoryPath: '/ai', list: AI_LIST },
  { categoryPath: '/api', list: API_LIST },
  { categoryPath: '/frontend', list: FRONTEND_LIST },
  { categoryPath: '/software', list: SOFTWARE_LIST },
  { categoryPath: '/study', list: STUDY_LIST },
  { categoryPath: '/tool', list: TOOL_LIST },
  { categoryPath: '/wallpaper', list: WALLPAPER_LIST },
]

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
 * 刷新最近使用列表：读取本地点击计数，按次数降序取前 15 条
 *
 * 读取前先以全站配置索引为合法键集合裁剪缓存，移除站点被删除后残留的脏键；
 * 条目信息实时取自全站配置索引，缓存中只存计数不存条目副本；
 * 无任何记录时列表为空，页面展示空状态引导文案
 */
function refreshRecentSites(): void {
  pruneSiteClickCounts(Object.keys(SITE_INDEX))
  const counts = getSiteClickCounts()
  recentSites.value = Object.keys(counts)
    .filter((key) => SITE_INDEX[key])
    .sort((a, b) => counts[b] - counts[a])
    .slice(0, 15)
    .map((key) => SITE_INDEX[key])
}

onMounted(refreshRecentSites)
onActivated(refreshRecentSites)
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

  .card-grid {
    grid-template-columns: repeat(4, 1fr);
    gap: 8px;
  }
}
</style>
