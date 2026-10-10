<template>
  <ActionSheet v-model:show="panelVisible" :actions="actions" :title="currentItem?.title ?? ''" :lock-scroll="false" />
</template>

<script setup lang="ts">
defineOptions({ name: 'LinkActionSheet' })
import type { ActionSheetAction } from '@/components/ActionSheet/types'
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
 * 面板选项列表：收藏卡片场景追加前移/后移项（首尾按可移动方向禁用），其余场景仅提供复制与收藏切换
 */
const actions = computed<ActionSheetAction[]>(() => {
  const list: ActionSheetAction[] = []
  if (reorderable.value) {
    list.push({ name: '向前移动', disabled: !canMoveCurrent(-1), callback: () => handleMove(-1) }, { name: '向后移动', disabled: !canMoveCurrent(1), callback: () => handleMove(1) })
  }
  list.push({ name: '复制网站', callback: handleCopy }, { name: isCurrentFavorite.value ? '取消收藏' : '收藏网站', callback: handleToggleFavorite })
  return list
})

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
</script>
