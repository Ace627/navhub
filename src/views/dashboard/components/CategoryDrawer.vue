<template>
  <div class="category-drawer">
    <header class="category-drawer__bar">
      <button
        ref="triggerRef"
        type="button"
        class="category-drawer__trigger"
        aria-label="打开分类菜单"
        :aria-expanded="open"
        aria-controls="category-drawer-panel"
        @click="openDrawer"
      >
        <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true">
          <path d="M3 5h14M3 10h14M3 15h14" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
        </svg>
      </button>
      <span class="category-drawer__current">{{ currentName }}</span>
    </header>

    <!-- 顶栏为 fixed 定位，用等高占位把页面内容推下来 -->
    <div class="category-drawer__spacer" aria-hidden="true"></div>

    <Teleport to="body">
      <Transition name="category-drawer">
        <div v-if="open" class="category-drawer__layer">
          <div class="category-drawer__mask" @click="closeDrawer"></div>
          <aside
            id="category-drawer-panel"
            ref="panelRef"
            class="category-drawer__panel"
            role="dialog"
            aria-modal="true"
            aria-label="网站分类"
            tabindex="-1"
          >
            <p class="category-drawer__panel-title">全部分类</p>
            <CategoryList :categories="categories" :active-key="activeKey" @select="onSelect" />
          </aside>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import CategoryList from './CategoryList.vue'
import { useCategoryNav } from '../composables/useCategoryNav'

defineOptions({ name: 'CategoryDrawer' })

/** 顶栏高度，需与样式变量 --n-category-bar-height 保持一致 */
const TOP_BAR_HEIGHT = 44

const { categories, activeKey, scrollToCategory } = useCategoryNav({ topOffset: TOP_BAR_HEIGHT })

const open = ref(false)
const triggerRef = ref<HTMLButtonElement | null>(null)
const panelRef = ref<HTMLElement | null>(null)

/** 顶栏展示的当前分类名 */
const currentName = computed(function () {
  return (
    categories.find(function (item) {
      return item.key === activeKey.value
    })?.name ?? '全部分类'
  )
})

/** 打开前的页面滚动值，用于关闭时还原 */
let prevOverflow = ''

/** 打开抽屉 */
function openDrawer() {
  open.value = true
}

/** 关闭抽屉 */
function closeDrawer() {
  open.value = false
}

/** 选中分类：先关闭抽屉解锁页面滚动，再定位到目标分类 */
function onSelect(key: string) {
  closeDrawer()
  nextTick(function () {
    requestAnimationFrame(function () {
      scrollToCategory(key)
    })
  })
}

/** 按 Esc 关闭抽屉 */
function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') closeDrawer()
}

watch(open, function (isOpen) {
  if (isOpen) {
    prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    document.addEventListener('keydown', onKeydown)
    nextTick(function () {
      panelRef.value?.focus()
    })
  } else {
    document.body.style.overflow = prevOverflow
    document.removeEventListener('keydown', onKeydown)
    triggerRef.value?.focus()
  }
})

onBeforeUnmount(function () {
  document.body.style.overflow = prevOverflow
  document.removeEventListener('keydown', onKeydown)
})
</script>

<style lang="scss" scoped>
.category-drawer__bar {
  position: fixed;
  top: 0;
  right: 0;
  left: 0;
  z-index: 20;
  display: flex;
  align-items: center;
  gap: 8px;
  height: var(--n-category-bar-height);
  padding: 0 8px;
  padding-left: calc(8px + env(safe-area-inset-left));
  padding-right: calc(8px + env(safe-area-inset-right));
  background-color: rgb(255 255 255 / 92%);
  border-bottom: 1px solid #ebeef5;
  backdrop-filter: blur(8px);
}

.category-drawer__trigger {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  color: #303133;
  background-color: transparent;
  border: none;
  border-radius: 8px;
  cursor: pointer;

  &:active {
    background-color: #f2f3f5;
  }
}

.category-drawer__current {
  overflow: hidden;
  font-size: 15px;
  font-weight: 600;
  color: #303133;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.category-drawer__spacer {
  height: var(--n-category-bar-height);
}

.category-drawer__layer {
  position: fixed;
  inset: 0;
  z-index: 100;
}

.category-drawer__mask {
  position: absolute;
  inset: 0;
  background-color: rgb(0 0 0 / 45%);
  /* 抑制遮罩上的手势，减少 iOS 上的滚动穿透 */
  touch-action: none;
}

.category-drawer__panel {
  --n-category-item-height: 48px;

  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  display: flex;
  flex-direction: column;
  width: min(280px, 76vw);
  padding: 12px 8px;
  padding-left: calc(8px + env(safe-area-inset-left));
  overflow-y: auto;
  overscroll-behavior: contain;
  background-color: #fff;
  box-shadow: 2px 0 16px rgb(0 0 0 / 12%);

  &:focus {
    outline: none;
  }
}

.category-drawer__panel-title {
  margin: 0 0 8px;
  padding: 0 14px;
  font-size: 12px;
  letter-spacing: 0.5px;
  color: #909399;
}

.category-drawer-enter-active,
.category-drawer-leave-active {
  transition: opacity 0.24s ease;

  .category-drawer__panel {
    transition: transform 0.28s cubic-bezier(0.4, 0, 0.2, 1);
  }
}

.category-drawer-enter-from,
.category-drawer-leave-to {
  opacity: 0;

  .category-drawer__panel {
    transform: translateX(-100%);
  }
}

@media (prefers-reduced-motion: reduce) {
  .category-drawer-enter-active,
  .category-drawer-leave-active,
  .category-drawer__panel {
    transition: none;
  }
}
</style>
