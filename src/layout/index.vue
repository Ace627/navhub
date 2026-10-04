<template>
  <div class="app-container" :class="classes">
    <!-- mobile 端侧边栏遮罩层 -->
    <div v-if="appStore.isMobile && !appStore.isCollapse" class="drawer-bg" @click="appStore.closeSidebar(true)"></div>

    <Sidebar class="sidebar-container" />

    <div class="main-container">
      <header class="fixed-header">
        <Navbar />
      </header>
      <AppMain />
      <AppFooter />
    </div>

    <!-- 移动端悬浮页面导航 -->
    <FloatNav />
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: 'Layout' })
import Navbar from './components/Navbar/index.vue'
import Sidebar from './components/Sidebar/index.vue'
import AppMain from './components/AppMain/index.vue'
import AppFooter from './components/AppFooter/index.vue'
import FloatNav from './components/FloatNav/index.vue'

const appStore = useAppStore()

const classes = computed(() => [{ 'hide-sidebar': appStore.isCollapse }, { 'open-sidebar': !appStore.isCollapse }, { withoutAnimation: appStore.withoutAnimation }])
</script>

<style lang="scss" scoped>
.app-container {
  --n-drawer-bg-index: calc(var(--n-sidebar-index) - 1);
  --n-fixed-header-index: calc(var(--n-sidebar-index) - 2);
  position: relative;
  width: 100%;
  height: 100%;
}

.sidebar-container {
  position: fixed;
  left: 0;
  top: 0;
  z-index: var(--n-sidebar-index);
  width: var(--n-sidebar-width);
  height: 100%;
  color: var(--n-sidebar-text-color);
  background-color: var(--n-sidebar-bg-color);
  box-shadow: var(--n-sidebar-box-shadow);
  transition: width var(--n-transition-duration);
  overflow: hidden;
}

.main-container {
  position: relative;
  display: flex;
  flex-direction: column;
  height: 100%;
  margin-left: var(--n-sidebar-width);
  transition: margin-left var(--n-transition-duration);
}

.fixed-header {
  position: sticky;
  top: 0;
  z-index: var(--n-fixed-header-index);
}

/* 桌面模式 侧栏折叠 */
.hide-sidebar {
  .sidebar-container {
    width: var(--n-sidebar-hide-width);
  }
  .main-container {
    margin-left: var(--n-sidebar-hide-width);
  }
}

html[data-device='mobile'] {
  /* 移动端 侧边栏展开 */
  .main-container {
    margin-left: 0;
  }
}

/* 移动端 侧边栏折叠 */
html[data-device='mobile'] .hide-sidebar .sidebar-container {
  width: 0;
  pointer-events: none;
}

/* 移动端用来关闭左侧边栏抽屉的背景遮罩层 */
.drawer-bg {
  position: fixed;
  inset: 0;
  z-index: var(--n-drawer-bg-index); // 比 sidebar 低
  background-color: rgba(0, 0, 0, 0.32);
  overflow: hidden;
}

/* 移除侧栏和主容器的过渡效果 */
.withoutAnimation .sidebar-container,
.withoutAnimation .main-container {
  transition: none;
}
</style>
