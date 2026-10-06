<template>
  <div ref="rootRef" class="float-nav">
    <transition name="float-nav-fade">
      <div v-show="panelVisible" class="float-nav-panel">
        <button v-for="item in NAV_ENTRIES" :key="item.path" type="button" :class="{ active: isActive(item) }" @click="handleSelect(item)">
          <span>{{ item.label }}</span>
          <em v-if="item.count">{{ item.count }}</em>
        </button>
      </div>
    </transition>
    <button type="button" class="float-nav-fab" aria-label="页面导航" @click="panelVisible = !panelVisible">
      <SvgIcon name="Plus" :size="20" />
    </button>
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: 'FloatNav' })
import { RouterConstant } from '@/router/router.constant'
import { EXTERNAL_MOVIE_COUNT } from '@/database/movie'
import { EXTERNAL_FRONTEND_COUNT } from '@/database/frontend'
import { EXTERNAL_AI_COUNT } from '@/database/ai'
import { EXTERNAL_SOFTWARE_COUNT } from '@/database/software'
import { EXTERNAL_TOOL_COUNT } from '@/database/tool'
import { EXTERNAL_API_COUNT } from '@/database/api'
import { EXTERNAL_STUDY_COUNT } from '@/database/study'
import { EXTERNAL_WALLPAPER_COUNT } from '@/database/wallpaper'

/** 导航入口项 */
interface NavEntry {
  /** 展示名称 */
  label: string
  /** 跳转路由路径 */
  path: string
  /** 对应页面的外部站点数，缺省不展示 */
  count?: number
}

/** 免费追剧站点数量，由数据源直接推导 */
const HOME_COUNT = EXTERNAL_MOVIE_COUNT

/** 导航入口列表：与侧栏一致的顶级路由，供移动端快速切换页面 */
const NAV_ENTRIES: NavEntry[] = [
  { label: '最近使用', path: RouterConstant.HOME_PAGE_URL },
  { label: '免费追剧', path: '/movie', count: HOME_COUNT },
  { label: '人工智能', path: '/ai', count: EXTERNAL_AI_COUNT },
  { label: '前端专家', path: '/frontend', count: EXTERNAL_FRONTEND_COUNT },
  { label: '好软推荐', path: '/software', count: EXTERNAL_SOFTWARE_COUNT },
  { label: '实用工具', path: '/tool', count: EXTERNAL_TOOL_COUNT },
  { label: '公益接口', path: '/api', count: EXTERNAL_API_COUNT },
  { label: '自我提升', path: '/study', count: EXTERNAL_STUDY_COUNT },
  { label: '精美壁纸', path: '/wallpaper', count: EXTERNAL_WALLPAPER_COUNT },
  { label: '关于我们', path: '/about' },
]

const route = useRoute()
const router = useRouter()

const rootRef = ref<HTMLElement>()

/** 导航面板是否展开 */
const panelVisible = ref(false)

/**
 * 判断入口是否为当前页面：顶级路径精确匹配，详情子路由按前缀归属上级页面
 *
 * @param item 待判断的导航入口项
 */
function isActive(item: NavEntry) {
  return item.path === RouterConstant.HOME_PAGE_URL ? route.path === item.path : route.path.startsWith(item.path)
}

/**
 * 导航面板选中入口：收起面板后路由跳转
 *
 * @param item 目标导航入口项
 */
function handleSelect(item: NavEntry) {
  panelVisible.value = false
  router.push(item.path)
}

/**
 * 文档点击监听：点击组件外部时收起导航面板
 *
 * @param event 鼠标事件对象
 */
function onDocumentMousedown(event: MouseEvent) {
  if (panelVisible.value && rootRef.value && !rootRef.value.contains(event.target as Node)) {
    panelVisible.value = false
  }
}

onMounted(() => {
  document.addEventListener('mousedown', onDocumentMousedown)
})

onBeforeUnmount(() => {
  document.removeEventListener('mousedown', onDocumentMousedown)
})
</script>

<style lang="scss" scoped>
/* 仅移动端展示，桌面端有常驻侧栏 */
.float-nav {
  display: none;
}

html[data-device='mobile'] {
  .float-nav {
    display: block;
  }

  .float-nav-fab {
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
    color: var(--el-color-white);
    background-color: var(--el-color-primary);
    box-shadow: var(--el-box-shadow-light);
    cursor: pointer;
  }

  .float-nav-panel {
    position: fixed;
    right: 16px;
    bottom: 88px;
    z-index: 900;
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 140px;
    padding: 8px;
    background-color: var(--el-bg-color-overlay);
    border: 1px solid var(--el-border-color-light);
    border-radius: 8px;
    box-shadow: var(--el-box-shadow-light);

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
      color: var(--el-text-color-regular);
      cursor: pointer;

      &:hover,
      &:active {
        background-color: var(--el-fill-color-light);
      }

      &.active {
        color: var(--el-color-primary);
      }

      em {
        font-style: normal;
        font-size: 12px;
        color: var(--el-text-color-secondary);
      }
    }
  }
}

.float-nav-fade-enter-active,
.float-nav-fade-leave-active {
  transition: opacity var(--el-transition-duration-fast);
}

.float-nav-fade-enter-from,
.float-nav-fade-leave-to {
  opacity: 0;
}
</style>
