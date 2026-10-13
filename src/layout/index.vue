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
      <Copyright />
    </div>

    <!-- 底部标签栏（移动端） -->
    <TabBar />

    <!-- 站点卡片长按操作面板（全局单例） -->
    <LinkActionSheet />

    <!-- 站点卡片右键操作菜单（全局单例） -->
    <LinkContextMenu />
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: 'Layout' })
import Navbar from './components/Navbar/index.vue'
import Sidebar from './components/Sidebar/index.vue'
import AppMain from './components/AppMain/index.vue'
import TabBar from './components/TabBar/index.vue'
import Copyright from './components/Copyright/index.vue'
import LinkActionSheet from './components/LinkActionSheet/index.vue'
import LinkContextMenu from './components/LinkContextMenu/index.vue'

const appStore = useAppStore()

const classes = computed(() => [{ 'hide-sidebar': appStore.isCollapse }, { 'open-sidebar': !appStore.isCollapse }, { withoutAnimation: appStore.withoutAnimation }])
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
  /* 底部安全区：默认取系统上报值（iOS 手势条等） */
  --el-safe-bottom: env(safe-area-inset-bottom, 0px);
}

/* 全屏/沉浸模式的国产浏览器多不上报安全区（如小米浏览器），由 useResize 启发式判定后启用固定兜底 */
html[data-device='mobile'][data-immersive='true'] .app-container {
  --el-safe-bottom: max(env(safe-area-inset-bottom, 0px), 20px);
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
  /* 移动端 恢复顶部导航 + 底部 TabBar，主体区预留标签栏高度与底部安全区 */
  .main-container {
    margin-left: 0;
    padding-bottom: calc(var(--el-tabbar-height) + var(--el-safe-bottom));
  }

  /* 顶栏/底栏不用纯白实底：半透明混合页面底色 + 背景模糊，透出纸纹融入页面 */
  .app-container {
    --el-navbar-bg-color: color-mix(in srgb, var(--el-bg-color) 55%, transparent);
    --el-tabbar-bg-color: color-mix(in srgb, var(--el-bg-color) 55%, transparent);
  }

  .fixed-header,
  .tab-bar {
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
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
