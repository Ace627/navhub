<template>
  <component
    :is="plainLink && !appStore.isMobile ? 'a' : 'div'"
    class="link-card"
    :href="plainLink && !appStore.isMobile ? item.key : undefined"
    :target="plainLink && !appStore.isMobile ? '_blank' : undefined"
    :rel="plainLink && !appStore.isMobile ? 'noopener noreferrer' : undefined"
    :class="{ 'is-row': layout === 'row' }"
    @click="onCardClick"
    @click.capture="onRootCaptureClick"
    @pointerdown="onPointerDown"
    @pointermove="onPointerMove"
    @pointerup="onPointerRelease"
    @pointercancel="onPointerRelease"
  >
    <div class="card-header">
      <!-- 图标区：默认按条目配置渲染图片，传入 icon 插槽可替换为任意图标组件 -->
      <span class="link-icon">
        <slot name="icon">
          <img :src="getIcon(item)" :alt="item.title" loading="lazy" draggable="false" referrerpolicy="no-referrer" @load="onIconLoad" @error="onIconError" />
        </slot>
      </span>
      <span class="link-title">{{ item.title }}</span>
    </div>
    <ProTooltip :content="item.description">
      <span class="link-desc">{{ item.description }}</span>
    </ProTooltip>
    <!-- 桌面端常驻操作行：默认复制与收藏，reorderable 时前移居首、后移居尾，传入 actions 插槽可自定义 -->
    <div class="card-actions flex-center">
      <slot name="actions">
        <el-link v-if="reorderable" type="primary" underline="never" :disabled="!canMoveFavorite(item.key, -1)" @click="handleMove(-1, $event)">前移</el-link>
        <el-link type="primary" underline="never" @click="handleCopyLink">复制</el-link>
        <el-link type="primary" underline="never" @click="handleToggleFavorite">{{ isFavorite(item.key) ? '已收藏' : '收藏' }}</el-link>
        <el-link v-if="reorderable" type="primary" underline="never" :disabled="!canMoveFavorite(item.key, 1)" @click="handleMove(1, $event)">后移</el-link>
      </slot>
    </div>
  </component>
</template>

<script setup lang="ts">
import { copyText } from '@/utils'
import type { LinkCardProps, LinkItem } from './types'
import { IMG_FAVICON } from '@/common/constant/image.constant'
import { useAppStore } from '@/store/modules/app'
import { useSiteFavorites } from '@/hooks/useSiteFavorites'
import { useSiteRecords } from '@/hooks/useSiteRecords'
import { useSiteShare } from '@/hooks/useSiteShare'
import { useLinkActions } from '@/hooks/useLinkActions'

const props = defineProps<LinkCardProps>()

const emit = defineEmits<{ (e: 'click', item: LinkItem): void }>()

const appStore = useAppStore()
const { isFavorite, toggleFavorite, canMoveFavorite, moveFavorite } = useSiteFavorites()
const { recordVisit } = useSiteRecords()
const { buildShareText } = useSiteShare()
const { openLinkActions } = useLinkActions()

/** 触发长按面板所需的按压时长（毫秒） */
const LONG_PRESS_DELAY = 450

/** 长按过程中允许的最大位移（像素），超出视为滚动滑动，取消长按 */
const LONG_PRESS_MOVE_THRESHOLD = 10

/** 图标加载超时阈值：超过该时长仍未加载完成即降级为默认系统图标（毫秒） */
const ICON_LOAD_TIMEOUT = 5000

/** 当前卡片图标是否已加载失败或超时（命中即降级为默认系统图标） */
const iconFailed = ref(false)

/** 当前卡片图标是否已加载完成 */
const iconLoaded = ref(false)

/** 图标加载超时定时器句柄 */
let iconTimer: ReturnType<typeof setTimeout> | undefined

/** 长按定时器句柄 */
let longPressTimer: ReturnType<typeof setTimeout> | undefined

/** 长按起始点横坐标 */
let pressStartX = 0

/** 长按起始点纵坐标 */
let pressStartY = 0

/** 长按已触发标记：命中时拦截紧随其后的 click，避免触发卡片跳转 */
let suppressNextClick = false

// 收集 src/assets/images/icons 下的本地图标，按文件名索引（key 为构建后资源地址）
const localIconMap: Record<string, string> = {}
for (const [path, url] of Object.entries(import.meta.glob<string>('/src/assets/images/icons/*.{png,ico,svg,jpg,jpeg,webp}', { eager: true, import: 'default' }))) {
  localIconMap[path.split('/').pop() || ''] = url
}

onMounted(startIconTimeout)
onBeforeUnmount(stopIconTimeout)

/**
 * 判断条目当前是否直接展示默认系统图标（未配置图标，或已加载失败/超时）
 *
 * @param item 链接条目
 * @returns 无需加载原始图标、直接走默认图标时返回 true
 */
function isFallbackIcon(item: LinkItem): boolean {
  return iconFailed.value || !item.icon?.trim()
}

/**
 * 启动图标加载超时计时：未配置图标时无需计时；超时仍未加载完成则标记失败，降级为默认系统图标
 */
function startIconTimeout(): void {
  if (isFallbackIcon(props.item)) return
  iconTimer = setTimeout(() => {
    if (!iconLoaded.value) iconFailed.value = true
  }, ICON_LOAD_TIMEOUT)
}

/**
 * 停止并清理图标加载超时计时
 */
function stopIconTimeout(): void {
  clearTimeout(iconTimer)
}

/**
 * 解析条目图标地址
 *
 * @param item 链接条目
 * @returns 加载失败/超时/未配置图标时降级为默认系统图标；本地图标按文件名映射资源地址；其余原样返回
 */
function getIcon(item: LinkItem) {
  if (isFallbackIcon(item)) return IMG_FAVICON
  // 本地图标路径（如 @/assets/images/icons/xx.png）：按文件名匹配 src/assets/images/icons 下的资源
  if (!/^(https?:|data:)/.test(item.icon)) {
    return localIconMap[item.icon.split('/').pop() || ''] || item.icon
  }
  return item.icon
}

/**
 * 图标加载成功回调：记录完成标记并取消超时计时
 */
function onIconLoad(): void {
  iconLoaded.value = true
  stopIconTimeout()
}

/**
 * 图标加载失败回调：记录失败标记并取消超时计时，触发降级为默认系统图标
 */
function onIconError(): void {
  iconFailed.value = true
  stopIconTimeout()
}

/**
 * 卡片点击回调：按需写入最近浏览记录（同键去重并置顶），再按模式决定导航方式
 *
 * 纯外链模式交给 a 标签默认导航（仅桌面端），其余抛出 click 事件由父级决定跳转；
 * 桌面端纯外链不调用 preventDefault/stopPropagation，保留 target="_blank" 默认新标签跳转；
 * 移动端纯外链因根节点渲染为 div，改为 window.open 新窗口打开，规避触屏长按触发的浏览器原生链接菜单；
 * 入口类卡片（非站点条目）通过 skipRecord 关闭记录写入，避免产生无效记录
 */
function onCardClick(): void {
  if (!props.skipRecord) recordVisit(props.item.key)
  if (props.plainLink && !appStore.isMobile) return
  if (props.plainLink) {
    window.open(props.item.key, '_blank', 'noopener,noreferrer')
    return
  }
  emit('click', props.item)
}

/**
 * 卡片根节点点击捕获回调：长按触发后的首次 click 在此拦截，避免既弹出操作面板又触发跳转
 *
 * @param event 点击事件对象
 */
function onRootCaptureClick(event: MouseEvent): void {
  if (!suppressNextClick) return
  suppressNextClick = false
  event.preventDefault()
  event.stopPropagation()
}

/**
 * 指针按下回调：仅移动端触屏启动长按计时，记录起始点用于滑动取消
 *
 * @param event 指针事件对象
 */
function onPointerDown(event: PointerEvent): void {
  if (!appStore.isMobile || event.pointerType !== 'touch') return
  pressStartX = event.clientX
  pressStartY = event.clientY
  longPressTimer = setTimeout(triggerLongPress, LONG_PRESS_DELAY)
}

/**
 * 指针移动回调：位移超出阈值视为滚动，取消长按计时
 *
 * @param event 指针事件对象
 */
function onPointerMove(event: PointerEvent): void {
  if (!longPressTimer) return
  const deltaX = event.clientX - pressStartX
  const deltaY = event.clientY - pressStartY
  if (deltaX * deltaX + deltaY * deltaY > LONG_PRESS_MOVE_THRESHOLD * LONG_PRESS_MOVE_THRESHOLD) cancelLongPress()
}

/**
 * 指针抬起或取消回调：结束按压，清理长按计时
 */
function onPointerRelease(): void {
  cancelLongPress()
}

/**
 * 触发长按：标记拦截后续 click，打开当前条目的底部操作面板
 */
function triggerLongPress(): void {
  cancelLongPress()
  suppressNextClick = true
  openLinkActions(props.item, { reorderable: props.reorderable })
}

/**
 * 取消长按计时并清理句柄
 */
function cancelLongPress(): void {
  clearTimeout(longPressTimer)
  longPressTimer = undefined
}

/**
 * 操作行复制点击：复制站点分享文案（名称、地址与描述，自有页面地址取站内路由）并提示结果，同时阻断卡片自身的跳转行为
 *
 * @param event 点击事件对象
 */
function handleCopyLink(event: MouseEvent): void {
  event.preventDefault()
  event.stopPropagation()
  copyText(buildShareText(props.item))
}

/**
 * 操作行收藏点击：切换收藏状态并提示结果，同时阻断卡片自身的跳转行为
 *
 * @param event 点击事件对象
 */
function handleToggleFavorite(event: MouseEvent): void {
  event.preventDefault()
  event.stopPropagation()
  const added = toggleFavorite(props.item.key)
  ElMessage.success(added ? `已收藏「${props.item.title}」` : `已取消收藏「${props.item.title}」`)
}

/**
 * 操作行顺序调整点击：将当前条目在收藏列表中前移或后移一位并提示结果，同时阻断卡片自身的跳转行为
 *
 * 处于首尾无可移动方向时链接为禁用态，不会触发本方法。
 *
 * @param offset 移动方向，-1 表示前移一位，1 表示后移一位
 * @param event 点击事件对象
 */
function handleMove(offset: -1 | 1, event: MouseEvent): void {
  event.preventDefault()
  event.stopPropagation()
  moveFavorite(props.item.key, offset)
  ElMessage.success(offset < 0 ? `「${props.item.title}」已前移` : `「${props.item.title}」已后移`)
}
</script>

<style lang="scss" scoped>
.link-card {
  --el-link-card-icon-size: 32px;
  /* 纵向弹性布局：描述行数不定时，操作行仍贴卡片底部对齐 */
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 8px 12px;
  background-color: var(--el-bg-color);
  border: 1px solid var(--el-border-color);
  border-radius: 8px;
  color: var(--el-text-color-regular);
  text-decoration: none;
  cursor: pointer;
  transition:
    box-shadow 0.2s,
    transform 0.2s;

  &:hover {
    box-shadow: var(--el-box-shadow-light);
    transform: translateY(-2px);
  }
}

.card-header {
  display: flex;
  align-items: center;
  gap: 10px;
}

.link-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: var(--el-link-card-icon-size);
  height: var(--el-link-card-icon-size);
  flex-shrink: 0;

  /* 插槽内容（图片或图标组件）统一填满图标区，避免自身尺寸规则与容器冲突 */
  > * {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
}

.link-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.link-desc {
  display: -webkit-box;
  margin: 8px 0;
  overflow: hidden;
  font-size: 13px;
  line-height: 1.6;
  color: var(--el-color-info);
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  line-clamp: 2;
}

/* 行布局：横向单行排布，描述单行截断，操作行靠右且不带顶部分隔线（用于最近浏览等历史列表场景） */
.link-card.is-row {
  flex-direction: row;
  align-items: center;
  gap: 12px;
  padding: 10px 16px;

  &:hover {
    transform: none;
  }
}

.link-card.is-row .card-header {
  flex-shrink: 0;
}

.link-card.is-row .link-title {
  white-space: nowrap;
}

.link-card.is-row .link-desc {
  flex: 1;
  min-width: 0;
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.link-card.is-row .card-actions {
  flex-shrink: 0;
  margin: 0 0 0 auto;
  padding: 0;
  border-top: none;
}

.card-actions {
  /* 自动外边距把操作行推至卡片底部，各卡片操作行横向对齐 */
  margin-top: auto;
  gap: 6px;
  padding-top: 8px;
  border-top: 1px solid var(--el-border-color);
  /* 深度选择器使外部插槽内容（如首页最近浏览入口的复制链接）与默认操作行字号一致 */
  :deep(.el-link) {
    --el-link-font-size: 12px;
  }
}

html[data-device='mobile'] {
  .link-card {
    padding: 8px 4px;
    text-align: center;
    background-color: transparent;
    border: none;
    box-shadow: none;
    user-select: none;
    -webkit-touch-callout: none;

    &:hover {
      box-shadow: none;
      transform: none;
    }
  }

  .card-actions {
    display: none;
  }

  .card-header {
    flex-direction: column;
    gap: 8px;
  }

  .link-icon {
    width: 48px;
    height: 48px;
    /* 触屏长按时图片不成为事件目标，避免国产浏览器弹出原生图片菜单 */
    pointer-events: none;
  }

  .link-title {
    max-width: 100%;
    overflow: hidden;
    font-size: 12px;
    font-weight: 400;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .link-desc {
    display: none;
  }

  /* 行布局在移动端还原卡片底色并改为两行栅格：图标 + 标题一行、描述一行、时间右侧垂直居中 */
  .link-card.is-row {
    display: grid;
    grid-template-columns: 1fr auto;
    align-items: center;
    column-gap: 10px;
    padding: 10px 12px;
    background-color: var(--el-bg-color);
    border: 1px solid var(--el-border-color);
    border-radius: 8px;
    text-align: left;
  }

  .link-card.is-row .card-header {
    min-width: 0;
    flex-direction: row;
    gap: 10px;
  }

  .link-card.is-row .link-icon {
    width: 32px;
    height: 32px;
  }

  .link-card.is-row .link-title {
    font-size: 15px;
    font-weight: 600;
  }

  .link-card.is-row .link-desc {
    display: block;
    margin: 2px 0 0;
    font-size: 12px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .link-card.is-row .card-actions {
    display: flex;
    grid-column: 2;
    grid-row: 1 / span 2;
  }
}
</style>
