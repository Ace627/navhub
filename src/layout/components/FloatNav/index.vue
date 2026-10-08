<template>
  <div ref="rootRef" class="float-nav">
    <transition name="float-nav-fade">
      <div v-show="panelVisible" class="float-nav-panel">
        <button type="button" @click="openSidebar">分类导航</button>
        <button type="button" @click="openSearch">全站搜索</button>
      </div>
    </transition>
    <button type="button" class="float-nav-fab" aria-label="页面导航" @click="panelVisible = !panelVisible">
      <SvgIcon name="Plus" :size="20" />
    </button>
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: 'FloatNav' })

const appStore = useAppStore()

const rootRef = ref<HTMLElement>()

/** 导航面板是否展开 */
const panelVisible = ref(false)

/** 移动端搜索面板共享开关 */
const mobileSearchVisible = useMobileSearch()

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
