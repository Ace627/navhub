<template>
  <div ref="rootRef" class="float-nav">
    <transition name="float-nav-fade">
      <div v-show="panelVisible" class="float-nav-panel">
        <button type="button" @click="openSearch">全站搜索</button>
        <button type="button" @click="goSetting">系统设置</button>
        <button type="button" @click="goAbout">关于我们</button>
      </div>
    </transition>
    <!-- 快捷悬浮钮组：返回首页、侧栏菜单常驻，加号展开完整导航面板；侧栏抽屉展开时整体隐藏避免遮挡 -->
    <div v-show="appStore.isCollapse" class="float-nav-actions">
      <button type="button" class="float-nav-fab" aria-label="返回首页" @click="goHome">
        <SvgIcon name="Home" :size="20" />
      </button>
      <button type="button" class="float-nav-fab" aria-label="打开侧栏菜单" @click="openSidebar">
        <SvgIcon name="Menu" :size="20" />
      </button>
      <button type="button" class="float-nav-fab" aria-label="页面导航" @click="panelVisible = !panelVisible">
        <SvgIcon name="More" :size="20" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: 'FloatNav' })
import { RouterConstant } from '@/router/router.constant'

const appStore = useAppStore()
const router = useRouter()

const rootRef = ref<HTMLElement>()

/** 导航面板是否展开 */
const panelVisible = ref(false)

/** 移动端搜索面板共享开关 */
const mobileSearchVisible = useMobileSearch()

/**
 * 返回最近使用页（主页）：收起面板后跳回首页
 */
function goHome() {
  panelVisible.value = false
  router.push(RouterConstant.HOME_PAGE_URL)
}

/**
 * 打开侧栏菜单：移动端抽屉收起时展开，已展开时保持不动
 */
function openSidebar() {
  panelVisible.value = false
  if (appStore.isCollapse) appStore.toggleSidebar()
}

/**
 * 打开移动端搜索面板
 */
function openSearch() {
  panelVisible.value = false
  mobileSearchVisible.value = true
}

/**
 * 跳转到系统设置页：收起面板后进入设置页
 */
function goSetting() {
  panelVisible.value = false
  router.push({ name: 'Setting' })
}

/**
 * 跳转到关于我们页：收起面板后进入关于页
 */
function goAbout() {
  panelVisible.value = false
  router.push({ name: 'About' })
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

  /* 悬浮钮组：纵向堆叠于右下角，整体预留底部安全距离 */
  .float-nav-actions {
    position: fixed;
    right: 16px;
    bottom: 32px;
    z-index: 2025;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .float-nav-fab {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 44px;
    height: 44px;
    border: none;
    border-radius: 50%;
    color: var(--el-color-white);
    background-color: color-mix(in srgb, var(--el-color-primary) 64%, transparent);
    // opacity: 0.72;
    box-shadow: var(--el-box-shadow-light);
    cursor: pointer;
  }

  /* 展开面板贴在钮组左侧，底边与钮组对齐（右偏移 = 钮组右距 16 + 钮宽 44 + 间隙 12） */
  .float-nav-panel {
    position: fixed;
    right: 72px;
    bottom: 32px;
    z-index: 900;
    display: flex;
    flex-direction: column;
    gap: 2px;
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
