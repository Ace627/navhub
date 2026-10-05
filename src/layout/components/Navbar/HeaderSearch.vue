<template>
  <div ref="rootRef" class="header-search">
    <!-- 桌面端常驻搜索框 -->
    <div class="search-input-wrap">
      <SvgIcon name="Search" :size="14" class="search-input-icon" />
      <input ref="inputRef" v-model="keyword" class="search-input" type="text" placeholder="搜索站点名称或描述" @focus="inputFocused = true" @keydown="onInputKeydown" />
      <kbd v-if="!keyword" class="search-kbd">Ctrl K</kbd>
      <SvgIcon v-else name="Plus" :size="12" class="search-clear" @click="clearKeyword" />
    </div>

    <!-- 搜索结果下拉 -->
    <transition name="search-fade">
      <div v-if="dropdownVisible" class="search-dropdown">
        <div v-for="(item, index) in results" :key="item.key" class="search-option" :class="{ active: index === activeIndex }" @mousedown.prevent="openItem(item)" @mouseenter="activeIndex = index">
          <img class="search-option-icon" :src="getIcon(item)" :alt="item.title" loading="lazy" referrerpolicy="no-referrer" @error="onIconError(item)" />
          <div class="search-option-body">
            <div class="search-option-head">
              <span class="search-option-title" v-html="highlight(item.title)"></span>
              <em class="search-option-category">{{ item.categoryName }}</em>
            </div>
            <p class="search-option-desc" v-html="highlight(item.description)"></p>
          </div>
        </div>
        <div v-if="!results.length" class="search-empty">未找到相关站点</div>
      </div>
    </transition>

    <!-- 移动端搜索入口 -->
    <button type="button" class="search-mobile-btn" aria-label="搜索" @click="mobilePanelVisible = true">
      <SvgIcon name="Search" :size="18" />
    </button>

    <!-- 移动端全屏搜索面板 -->
    <Teleport to="body">
      <transition name="search-fade">
        <div v-if="mobilePanelVisible" class="search-mobile-panel">
          <div class="search-mobile-bar">
            <SvgIcon name="Search" :size="16" class="search-input-icon" />
            <input ref="mobileInputRef" v-model="keyword" class="search-input" type="text" placeholder="搜索站点名称或描述" @keydown="onInputKeydown" />
            <button type="button" class="search-mobile-close" aria-label="关闭搜索" @click="mobilePanelVisible = false">取消</button>
          </div>
          <div class="search-mobile-results">
            <div v-for="item in results" :key="item.key" class="search-option" @click="openItem(item)">
              <img class="search-option-icon" :src="getIcon(item)" :alt="item.title" loading="lazy" referrerpolicy="no-referrer" @error="onIconError(item)" />
              <div class="search-option-body">
                <div class="search-option-head">
                  <span class="search-option-title" v-html="highlight(item.title)"></span>
                  <em class="search-option-category">{{ item.categoryName }}</em>
                </div>
                <p class="search-option-desc" v-html="highlight(item.description)"></p>
              </div>
            </div>
            <div v-if="keyword.trim() && !results.length" class="search-empty">未找到相关站点</div>
          </div>
        </div>
      </transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: 'HeaderSearch' })
import type { LinkItem } from '@/components/LinkCard/types'
import { isExternal } from '@/utils'
import { RouterConstant } from '@/router/router.constant'
import { AI_LIST } from '@/views/ai/ai.config'
import { API_LIST } from '@/views/api/api.config'
import { DASHBOARD_LIST } from '@/views/dashboard/dashboard.config'
import { FRONTEND_LIST } from '@/views/frontend/frontend.config'
import { SOFTWARE_LIST } from '@/views/software/software.config'
import { STUDY_LIST } from '@/views/study/study.config'
import { TOOL_LIST } from '@/views/tool/tool.config'
import { WALLPAPER_LIST } from '@/views/wallpaper/wallpaper.config'

/** 搜索索引条目：链接条目附加所属分类信息 */
interface SearchEntry extends LinkItem {
  /** 所属分类名称，如「人工智能」 */
  categoryName: string
  /** 所属分类路由路径，如 /ai */
  categoryPath: string
}

/** 聚合分类列表并附加分类信息的辅助类型 */
interface CategorySource {
  /** 分类名称 */
  categoryName: string
  /** 分类路由路径 */
  categoryPath: string
  /** 该分类下的站点列表 */
  list: LinkItem[]
}

/** 搜索结果最大展示条数 */
const MAX_RESULTS = 20

/** 全量搜索索引：聚合 8 份分类 config，模块加载时构建一次 */
const SEARCH_INDEX: SearchEntry[] = (
  [
    { categoryName: '免费追剧', categoryPath: RouterConstant.HOME_PAGE_URL, list: DASHBOARD_LIST },
    { categoryName: '人工智能', categoryPath: '/ai', list: AI_LIST },
    { categoryName: '前端专家', categoryPath: '/frontend', list: FRONTEND_LIST },
    { categoryName: '好软推荐', categoryPath: '/software', list: SOFTWARE_LIST },
    { categoryName: '实用工具', categoryPath: '/tool', list: TOOL_LIST },
    { categoryName: '公益接口', categoryPath: '/api', list: API_LIST },
    { categoryName: '自我提升', categoryPath: '/study', list: STUDY_LIST },
    { categoryName: '精美壁纸', categoryPath: '/wallpaper', list: WALLPAPER_LIST },
  ] satisfies CategorySource[]
).flatMap((source) => source.list.map((item) => ({ ...item, categoryName: source.categoryName, categoryPath: source.categoryPath })))

/** 收集 src/assets/images/icons 下的本地图标，按文件名索引（key 为构建后资源地址） */
const localIconMap: Record<string, string> = {}
for (const [path, url] of Object.entries(import.meta.glob<string>('/src/assets/images/icons/*.{png,ico,svg,jpg,jpeg,webp}', { eager: true, import: 'default' }))) {
  localIconMap[path.split('/').pop() || ''] = url
}

const router = useRouter()

const rootRef = ref<HTMLElement>()
const inputRef = ref<HTMLInputElement>()
const mobileInputRef = ref<HTMLInputElement>()

/** 搜索关键词 */
const keyword = ref('')
/** 桌面端输入框聚焦状态 */
const inputFocused = ref(false)
/** 移动端搜索面板可见性 */
const mobilePanelVisible = ref(false)
/** 键盘导航的当前选中下标 */
const activeIndex = ref(0)
/** 图标加载失败的条目 key 集合（命中即降级为首字占位图） */
const failedIcons = reactive(new Set<string>())

/** 模糊搜索结果：大小写不敏感匹配名称与描述，超出上限截断 */
const results = computed<SearchEntry[]>(() => {
  const query = keyword.value.trim().toLowerCase()
  if (!query) return []
  return SEARCH_INDEX.filter((item) => item.title.toLowerCase().includes(query) || item.description.toLowerCase().includes(query)).slice(0, MAX_RESULTS)
})

/** 桌面端下拉是否可见：输入框聚焦且有有效关键词 */
const dropdownVisible = computed(() => inputFocused.value && !!keyword.value.trim())

watch(keyword, () => {
  activeIndex.value = 0
})

watch(mobilePanelVisible, (visible) => {
  if (visible) {
    nextTick(() => mobileInputRef.value?.focus())
  }
})

/**
 * 清空关键词并让桌面端输入框重新聚焦
 */
function clearKeyword() {
  keyword.value = ''
  inputRef.value?.focus()
}

/**
 * 高亮文本中的命中关键词：大小写不敏感切分后以 em 标签包裹命中片段
 *
 * @param text 待高亮的原文
 * @returns 高亮后的 HTML 片段
 */
function highlight(text: string) {
  const query = keyword.value.trim()
  if (!query) return text
  const pattern = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  return text.replace(new RegExp(`(${pattern})`, 'gi'), '<em>$1</em>')
}

/**
 * 解析条目图标地址：本地图标按文件名映射资源地址，命中失败降级为首字占位图
 *
 * @param item 搜索索引条目
 * @returns 图标地址
 */
function getIcon(item: SearchEntry) {
  if (failedIcons.has(item.key)) {
    const ch = item.title.trim().charAt(0) || '?'
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64"><rect width="64" height="64" rx="12" fill="#409eff"/><text x="32" y="43" font-size="32" text-anchor="middle" fill="#fff" font-family="sans-serif">${ch}</text></svg>`
    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
  }
  if (!/^(https?:|data:)/.test(item.icon)) {
    return localIconMap[item.icon.split('/').pop() || ''] || item.icon
  }
  return item.icon
}

/**
 * 图标加载失败回调：记录失败标记，触发降级占位图
 *
 * @param item 搜索索引条目
 */
function onIconError(item: SearchEntry) {
  failedIcons.add(item.key)
}

/**
 * 打开搜索命中的条目：外部站点新窗口打开，自有页面路由跳转
 *
 * @param item 搜索索引条目
 */
function openItem(item: SearchEntry) {
  closeAll()
  if (isExternal(item.key)) {
    window.open(item.key, '_blank', 'noopener,noreferrer')
    return
  }
  router.push(`${item.categoryPath}/${item.key}`)
}

/**
 * 输入框键盘事件：上下键移动选中项，回车打开，Esc 清空并收起
 *
 * @param event 键盘事件对象
 */
function onInputKeydown(event: KeyboardEvent) {
  if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
    event.preventDefault()
    const delta = event.key === 'ArrowDown' ? 1 : -1
    activeIndex.value = (activeIndex.value + delta + results.value.length) % Math.max(results.value.length, 1)
    scrollActiveIntoView()
    return
  }
  if (event.key === 'Enter') {
    const item = results.value[activeIndex.value]
    if (item) openItem(item)
    return
  }
  if (event.key === 'Escape') {
    keyword.value = ''
    inputRef.value?.blur()
    closeAll()
  }
}

/**
 * 将键盘导航选中的下拉项滚动到可视区域
 */
function scrollActiveIntoView() {
  awaitNextTick(() => {
    rootRef.value?.querySelector('.search-option.active')?.scrollIntoView({ block: 'nearest' })
  })
}

/**
 * 全局快捷键监听：Ctrl/Cmd + K 聚焦桌面端搜索框
 *
 * @param event 键盘事件对象
 */
function onGlobalKeydown(event: KeyboardEvent) {
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
    event.preventDefault()
    mobilePanelVisible.value = false
    inputRef.value?.focus()
  }
}

/**
 * 文档点击监听：点击组件外部时收起桌面端下拉
 *
 * @param event 鼠标事件对象
 */
function onDocumentMousedown(event: MouseEvent) {
  if (rootRef.value && !rootRef.value.contains(event.target as Node)) {
    inputFocused.value = false
  }
}

/**
 * 关闭桌面端下拉并收起移动端面板
 */
function closeAll() {
  inputFocused.value = false
  mobilePanelVisible.value = false
}

/**
 * 等待下一帧后执行的轻量封装，便于统一替换实现
 *
 * @param callback 回调函数
 */
function awaitNextTick(callback: () => void) {
  nextTick(callback)
}

onMounted(() => {
  document.addEventListener('keydown', onGlobalKeydown)
  document.addEventListener('mousedown', onDocumentMousedown)
})

onBeforeUnmount(() => {
  document.removeEventListener('keydown', onGlobalKeydown)
  document.removeEventListener('mousedown', onDocumentMousedown)
})
</script>

<style lang="scss" scoped>
.header-search {
  position: relative;
  margin-left: 16px;
}

.search-input-wrap {
  display: flex;
  align-items: center;
  gap: 6px;
  width: 240px;
  padding: 0 10px;
  background-color: var(--el-fill-color-light);
  border-radius: 16px;
  transition: box-shadow var(--el-transition-duration-fast);

  &:focus-within {
    box-shadow: 0 0 0 1px var(--el-color-primary) inset;
  }
}

.search-input-icon {
  flex-shrink: 0;
  color: var(--el-text-color-secondary);
}

.search-input {
  flex: 1;
  min-width: 0;
  height: 30px;
  border: none;
  outline: none;
  background: transparent;
  font-size: 13px;
  color: var(--el-text-color-primary);

  &::placeholder {
    color: var(--el-text-color-placeholder);
  }
}

.search-kbd {
  flex-shrink: 0;
  padding: 1px 5px;
  border: 1px solid var(--el-border-color);
  border-radius: 4px;
  font-size: 11px;
  font-family: inherit;
  color: var(--el-text-color-secondary);
}

.search-clear {
  flex-shrink: 0;
  color: var(--el-text-color-secondary);
  cursor: pointer;
  transform: rotate(45deg);

  &:hover {
    color: var(--el-text-color-primary);
  }
}

.search-dropdown {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  z-index: calc(var(--el-fixed-header-index) + 1);
  width: 380px;
  max-height: 420px;
  padding: 6px;
  overflow-y: auto;
  background-color: var(--el-bg-color-overlay);
  border: 1px solid var(--el-border-color-light);
  border-radius: 8px;
  box-shadow: var(--el-box-shadow-light);
}

.search-option {
  display: flex;
  gap: 10px;
  padding: 8px 10px;
  border-radius: 6px;
  cursor: pointer;

  &.active {
    background-color: var(--el-fill-color-light);
  }
}

.search-option-icon {
  width: 24px;
  height: 24px;
  margin-top: 2px;
  object-fit: contain;
  flex-shrink: 0;
}

.search-option-body {
  flex: 1;
  min-width: 0;
}

.search-option-head {
  display: flex;
  align-items: center;
  gap: 8px;
}

.search-option-title {
  overflow: hidden;
  font-size: 14px;
  font-weight: 600;
  text-overflow: ellipsis;
  white-space: nowrap;

  :deep(em),
  em {
    font-style: normal;
    color: var(--el-color-primary);
  }
}

.search-option-category {
  flex-shrink: 0;
  padding: 0 6px;
  font-style: normal;
  font-size: 11px;
  line-height: 18px;
  color: var(--el-color-primary);
  background-color: var(--el-color-primary-light-9);
  border-radius: 4px;
}

.search-option-desc {
  display: -webkit-box;
  margin: 2px 0 0;
  overflow: hidden;
  font-size: 12px;
  line-height: 1.5;
  color: var(--el-text-color-secondary);
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 1;
  line-clamp: 1;

  :deep(em),
  em {
    font-style: normal;
    color: var(--el-color-primary);
  }
}

.search-empty {
  padding: 24px 0;
  text-align: center;
  font-size: 13px;
  color: var(--el-text-color-secondary);
}

.search-mobile-btn {
  display: none;
}

/* 仅移动端展示：隐藏常驻输入框，改用图标入口 + 全屏搜索面板 */
html[data-device='mobile'] {
  .search-input-wrap {
    display: none;
  }

  .search-mobile-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border: none;
    border-radius: 50%;
    background: none;
    color: var(--el-text-color-regular);
    cursor: pointer;

    &:active {
      background-color: var(--el-fill-color-light);
    }
  }
}

.search-mobile-panel {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  background-color: var(--el-bg-color);
}

.search-mobile-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
  padding: 8px 12px;
  border-bottom: 1px solid var(--el-border-color-light);

  .search-input {
    height: 34px;
  }
}

.search-mobile-close {
  flex-shrink: 0;
  padding: 4px 8px;
  border: none;
  background: none;
  font-size: 14px;
  color: var(--el-color-primary);
  cursor: pointer;
}

.search-mobile-results {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
}

.search-fade-enter-active,
.search-fade-leave-active {
  transition: opacity var(--el-transition-duration-fast);
}

.search-fade-enter-from,
.search-fade-leave-to {
  opacity: 0;
}
</style>
