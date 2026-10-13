<template>
  <nav class="tab-bar">
    <button v-for="tab in TABS" :key="tab.path" type="button" class="tab-item" :class="{ 'is-active': isActive(tab) }" @click="goTab(tab)">
      <SvgIcon :name="tab.icon" :size="20" />
      <span class="tab-label">{{ tab.title }}</span>
    </button>
  </nav>
</template>

<script setup lang="ts">
defineOptions({ name: 'TabBar' })
import { RouterConstant } from '@/router/router.constant'

/** 底部标签页定义 */
interface TabItem {
  /** 标签文案 */
  title: string
  /** 图标名 */
  icon: string
  /** 路由地址 */
  path: string
}

/** 底部标签页列表：主页复用收藏展示页，分类与我的为移动端专用聚合页 */
const TABS: TabItem[] = [
  { title: '首页', icon: 'Home', path: RouterConstant.HOME_PAGE_URL },
  { title: '分类', icon: 'Menu', path: RouterConstant.MOBILE_CATEGORIES_URL },
  { title: '我的', icon: 'User', path: RouterConstant.MOBILE_PROFILE_URL },
]

const route = useRoute()
const router = useRouter()

/**
 * 判断标签是否处于激活态：详情页等子路由经 meta.activeMenu 归属到所属一级标签
 *
 * @param tab 标签定义
 * @returns 激活时返回 true
 */
function isActive(tab: TabItem): boolean {
  return ((route.meta.activeMenu as string) || route.path) === tab.path
}

/**
 * 切换标签：跳转对应路由
 *
 * @param tab 标签定义
 */
function goTab(tab: TabItem) {
  router.push(tab.path)
}
</script>

<style lang="scss" scoped>
/* 仅移动端展示，桌面端保持常驻侧栏布局 */
.tab-bar {
  display: none;
}

html[data-device='mobile'] {
  .tab-bar {
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: calc(var(--el-sidebar-index) - 2); // 与移动端顶栏同级，低于抽屉遮罩
    display: flex;
    height: calc(var(--el-tabbar-height) + var(--el-safe-bottom));
    padding-bottom: var(--el-safe-bottom); // 底部安全区（iOS 手势条 / 全屏模式兜底）
    background-color: var(--el-tabbar-bg-color);
    box-shadow: var(--el-tabbar-box-shadow);
  }

  .tab-item {
    display: flex;
    flex: 1;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 3px;
    border: none;
    background: none;
    color: var(--el-text-color-secondary);
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;

    &.is-active {
      color: var(--el-color-primary);
    }
  }

  .tab-label {
    font-size: var(--el-font-size-extra-small);
    line-height: 1;
  }
}
</style>
