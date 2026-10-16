<template>
  <ActionSheet v-model:show="panelVisible" :actions="actions" :title="currentItem?.title ?? ''" :lock-scroll="false" close-on-click-action />
</template>

<script setup lang="ts">
defineOptions({ name: 'LinkActionSheet' })
import type { ActionSheetAction } from '@/components/ActionSheet/types'
import { useLinkActions } from '@/hooks/useLinkActions'
import { useLinkMenuActions } from '@/hooks/useLinkMenuActions'

const { currentItem, panelVisible, panelOptions } = useLinkActions()
const { buildLinkMenuActions } = useLinkMenuActions()

/**
 * 面板选项列表：与卡片右键菜单同源（系统小组件无地址语义不提供复制项，收藏项随收藏状态切换文案），
 * 菜单项构建参数由唤起长按的卡片传入（如隐藏收藏项）；
 * 点击选项后由 close-on-click-action 统一收起面板
 */
const actions = computed<ActionSheetAction[]>(() => (currentItem.value ? buildLinkMenuActions(currentItem.value, panelOptions.value) : []))
</script>
