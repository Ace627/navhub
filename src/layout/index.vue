<template>
  <div class="app-container" :class="classes">
    <!-- mobile 端侧边栏遮罩层 -->
    <div v-if="appStore.isMobile && !appStore.isCollapse" class="drawer-bg" @click="appStore.closeSidebar(true)"></div>

    <Sidebar class="sidebar-container" />

    <div class="main-container">
      <header class="fixed-header">
        <Navbar />
        <Hitokoto v-if="settingStore.showHitokoto" />
      </header>
      <AppMain />
      <Copyright />
    </div>

    <!-- 移动端悬浮页面导航 -->
    <FloatNav />

    <!-- 站点卡片长按操作面板（全局单例） -->
    <LinkActionSheet />
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: 'Layout' })
import Navbar from './components/Navbar/index.vue'
import Sidebar from './components/Sidebar/index.vue'
import AppMain from './components/AppMain/index.vue'
import Hitokoto from './components/Hitokoto/index.vue'
import FloatNav from './components/FloatNav/index.vue'
import Copyright from './components/Copyright/index.vue'
import LinkActionSheet from './components/LinkActionSheet/index.vue'

const appStore = useAppStore()
const settingStore = useSettingStore()

const classes = computed(() => [{ 'hide-sidebar': appStore.isCollapse }, { 'open-sidebar': !appStore.isCollapse }, { 'has-hitokoto-view': settingStore.showHitokoto }, { withoutAnimation: appStore.withoutAnimation }])
</script>

<style lang="scss" scoped>
.app-container {
  --el-drawer-bg-index: calc(var(--el-sidebar-index) - 1);
  --el-fixed-header-index: calc(var(--el-sidebar-index) - 2);
  --el-fixed-header-width: calc(100% - var(--el-sidebar-width));
  position: relative;
  width: 100%;
  height: 100%;
}
html[data-device='mobile'] .app-container {
  --el-fixed-header-width: 100%;
}
.hide-sidebar {
  --el-fixed-header-width: calc(100% - var(--el-sidebar-hide-width));
}

.sidebar-container {
  position: fixed;
  left: 0;
  top: 0;
  z-index: var(--el-sidebar-index);
  width: var(--el-sidebar-width);
  height: 100%;
  color: var(--el-sidebar-text-color);
  background-color: var(--el-sidebar-bg-color);
  box-shadow: var(--el-sidebar-box-shadow);
  transition: width var(--el-transition-duration);
  overflow: hidden;
}

.main-container {
  position: relative;
  display: flex;
  flex-direction: column;
  height: 100%;
  margin-left: var(--el-sidebar-width);
  transition: margin-left var(--el-transition-duration);
  overflow: hidden;
}

.fixed-header {
  position: fixed;
  top: 0;
  right: 0;
  z-index: var(--el-fixed-header-index);
  width: var(--el-fixed-header-width);
  transition: width var(--el-transition-duration);
}

/* 桌面端侧栏与主内容并排不重叠，头部抬到侧栏之上，使搜索下拉可浮于侧栏上方；
   移动端维持原层级，保证抽屉遮罩仍能盖住头部 */
html:not([data-device='mobile']) .fixed-header {
  z-index: calc(var(--el-sidebar-index) + 1);
}

/* 桌面模式 侧栏折叠 */
.hide-sidebar {
  .sidebar-container {
    width: var(--el-sidebar-hide-width);
  }
  .main-container {
    margin-left: var(--el-sidebar-hide-width);
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
  z-index: var(--el-drawer-bg-index); // 比 sidebar 低
  background-color: rgba(0, 0, 0, 0.32);
  overflow: hidden;
}

/* 移除侧栏和主容器的过渡效果 */
.withoutAnimation .sidebar-container,
.withoutAnimation .main-container {
  transition: none;
}
</style>
