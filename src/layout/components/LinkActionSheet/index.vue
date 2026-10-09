<template>
  <el-drawer v-model="panelVisible" direction="btt" size="auto" :with-header="false" class="link-action-sheet">
    <div v-if="currentItem" class="sheet-content select-none">
      <p class="sheet-title">{{ currentItem.title }}</p>
      <div class="sheet-actions">
        <button type="button" class="sheet-action" @click="handleCopy">复制网站</button>
        <button type="button" class="sheet-action" @click="handleToggleFavorite">收藏网站</button>
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

const { currentItem, panelVisible, closeLinkActions } = useLinkActions()
const { toggleFavorite } = useSiteFavorites()
const { buildShareText } = useSiteShare()

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
