<template>
  <!-- 菜单定位基准：零尺寸固定定位元素，坐标由右键现场坐标驱动；需传送到 body，
       否则外层布局元素一旦出现 transform 就会成为其包含块，令 fixed 定位偏离视口 -->
  <Teleport to="body">
    <span ref="anchorRef" class="link-context-menu__anchor" :style="{ left: `${menuPoint.x}px`, top: `${menuPoint.y}px` }" aria-hidden="true"></span>
  </Teleport>

  <!-- 桌面端右键操作菜单：与移动端长按面板同源，浮层内容由 el-popover 传送到 body -->
  <el-popover
    :visible="menuVisible && actions.length > 0"
    :virtual-ref="anchorRef ?? undefined"
    virtual-triggering
    trigger="click"
    :show-arrow="false"
    placement="bottom-start"
    :offset="2"
    width="auto"
    :teleported="true"
    :persistent="false"
    popper-class="link-context-menu"
    @update:visible="handleVisibleChange"
  >
    <div class="link-context-menu__list">
      <el-button v-for="action in actions" :key="action.name" text class="link-context-menu__item" @click="handleSelect(action)">{{ action.name }}</el-button>
    </div>
  </el-popover>
</template>

<script setup lang="ts">
defineOptions({ name: 'LinkContextMenu' })
import { useLinkActions } from '@/hooks/useLinkActions'
import { useLinkMenuActions } from '@/hooks/useLinkMenuActions'
import type { LinkMenuAction } from '@/hooks/useLinkMenuActions'

const { currentItem, menuVisible, menuPoint, menuOptions, closeLinkMenu } = useLinkActions()
const { buildLinkMenuActions } = useLinkMenuActions()

/** 浮层定位基准元素 */
const anchorRef = ref<HTMLElement | null>(null)

/** 菜单项列表：与移动端长按面板同源，随收藏状态实时变化 */
const actions = computed(() => (currentItem.value ? buildLinkMenuActions(currentItem.value, menuOptions.value) : []))

/**
 * 菜单项点击：先收起菜单再执行操作，避免操作引发的状态变化与浮层关闭相互干扰
 *
 * @param action 被点击的菜单项
 */
function handleSelect(action: LinkMenuAction): void {
  closeLinkMenu()
  action.callback()
}

/**
 * 浮层显隐回传：点击菜单外部或按下 ESC 时收起菜单
 *
 * @param value 浮层期望的显隐状态
 */
function handleVisibleChange(value: boolean): void {
  if (!value) closeLinkMenu()
}
</script>

<style lang="scss" scoped>
/* 菜单定位基准：零尺寸固定定位元素，不参与布局，也不接收指针事件 */
.link-context-menu__anchor {
  position: fixed;
  top: 0;
  left: 0;
  width: 0;
  height: 0;
  pointer-events: none;
}

/* 菜单浮层：被 el-popover 传送到 body，样式需用 :global 命中；收窄默认内边距与最小宽度 */
:global(.link-context-menu.el-popover.el-popper) {
  min-width: 108px;
  padding: 4px;
  border-radius: 6px;
}

/* 菜单项列表：纵向排布 */
:global(.link-context-menu__list) {
  display: flex;
  flex-direction: column;
}

/* 菜单项：整行可点、左对齐，字号与卡片描述文案保持一致 */
:global(.link-context-menu__item.el-button) {
  justify-content: flex-start;
  width: 100%;
  height: 30px;
  margin: 0;
  padding: 0 8px;
  font-size: 13px;
}
</style>
