<template>
  <el-drawer
    v-model="panelVisible"
    direction="btt"
    size="auto"
    :with-header="false"
    :lock-scroll="false"
    class="link-action-sheet"
  >
    <div v-if="currentItem" class="sheet-content select-none">
      <p class="sheet-title">{{ currentItem.title }}</p>
      <div class="sheet-actions">
        <button v-if="reorderable" type="button" class="sheet-action" :class="{ 'is-disabled': !canMoveCurrent(-1) }" :disabled="!canMoveCurrent(-1)" @click="handleMove(-1)">前移</button>
        <button type="button" class="sheet-action" @click="handleCopy">复制网站</button>
        <button type="button" class="sheet-action" @click="handleToggleFavorite">{{ isCurrentFavorite ? '取消收藏' : '收藏网站' }}</button>
        <button v-if="reorderable" type="button" class="sheet-action" :class="{ 'is-disabled': !canMoveCurrent(1) }" :disabled="!canMoveCurrent(1)" @click="handleMove(1)">后移</button>
        <button type="button" class="sheet-action is-cancel" @click="handleClose">取消</button>
      </div>
    </div>
  </el-drawer>
</template>

<script setup lang="ts">
defineOptions({ name: 'LinkActionSheet' })
import { copyText } from '@/utils'
import { useLinkActions } from '@/hooks/useLinkActions'
import { useSiteFavorites } from '@/hooks/useSiteFavorites'
import { useSiteShare } from '@/hooks/useSiteShare'

const { currentItem, panelVisible, reorderable, closeLinkActions } = useLinkActions()
const { isFavorite, toggleFavorite, canMoveFavorite, moveFavorite } = useSiteFavorites()
const { buildShareText } = useSiteShare()

/** 当前条目的收藏状态：随收藏集合实时变化，已收藏时长按显示「取消收藏」 */
const isCurrentFavorite = computed(() => (currentItem.value ? isFavorite(currentItem.value.key) : false))

/**
 * 当前条目是否可按指定方向调整展示顺序：仅收藏卡片场景（reorderable 为 true）有效，首尾禁用
 *
 * @param offset 移动方向，-1 表示前移一位，1 表示后移一位
 * @returns 可移动时返回 true
 */
function canMoveCurrent(offset: -1 | 1): boolean {
  return reorderable.value && Boolean(currentItem.value) && canMoveFavorite(currentItem.value?.key ?? '', offset)
}

/**
 * 复制站点分享文案（名称、地址与描述，自有页面地址取站内路由）并关闭面板（复制结果提示由 copyText 内部给出）
 */
function handleCopy(): void {
  if (!currentItem.value) return
  copyText(buildShareText(currentItem.value))
  closeLinkActions()
}

/**
 * 切换收藏状态并关闭面板
 */
function handleToggleFavorite(): void {
  if (!currentItem.value) return
  const added = toggleFavorite(currentItem.value.key)
  ElMessage.success(added ? `已收藏「${currentItem.value.title}」` : `已取消收藏「${currentItem.value.title}」`)
  closeLinkActions()
}

/**
 * 将当前条目在收藏列表中前移或后移一位并关闭面板（处于首尾无可移动方向时按钮为禁用态，不会触发本方法）
 *
 * @param offset 移动方向，-1 表示前移一位，1 表示后移一位
 */
function handleMove(offset: -1 | 1): void {
  if (!currentItem.value) return
  moveFavorite(currentItem.value.key, offset)
  closeLinkActions()
}

/**
 * 取消按钮：关闭面板
 */
function handleClose(): void {
  closeLinkActions()
}
</script>

<style lang="scss" scoped>
.sheet-content {
  padding: 8px 0 16px;
}

.sheet-title {
  margin: 0;
  padding: 12px 20px;
  overflow: hidden;
  font-size: var(--el-font-size-base);
  color: var(--el-text-color-secondary);
  text-align: center;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.sheet-actions {
  display: flex;
  flex-direction: column;
}

.sheet-action {
  height: 52px;
  font-size: 16px;
  color: var(--el-text-color-primary);
  background-color: var(--el-bg-color);
  border: none;
  border-top: 1px solid var(--el-border-color-lighter);
  cursor: pointer;

  &:active {
    background-color: var(--el-fill-color-light);
  }

  &.is-disabled {
    color: var(--el-text-color-placeholder);
    cursor: not-allowed;
  }

  &.is-cancel {
    margin-top: 8px;
    font-weight: 600;
  }
}

/* 抽屉容器：顶角圆角化并去掉默认内边距，交由内容区自行控制 */
:global(.link-action-sheet) {
  border-radius: 16px 16px 0 0;
}

:global(.link-action-sheet .el-drawer__body) {
  padding: 0;
}
</style>
