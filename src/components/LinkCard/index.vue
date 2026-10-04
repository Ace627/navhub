<template>
  <component :is="plainLink ? 'a' : 'div'" class="link-card" :href="plainLink ? item.key : undefined" :target="plainLink ? '_blank' : undefined" :rel="plainLink ? 'noopener noreferrer' : undefined" @click="onCardClick">
    <div class="card-header">
      <img class="link-icon" :src="getIcon(item)" :alt="item.title" loading="lazy" draggable="false" referrerpolicy="no-referrer" @error="onIconError(item)" />
      <span class="link-title">{{ item.title }}</span>
    </div>
    <ProTooltip :content="item.description">
      <span class="link-desc">{{ item.description }}</span>
    </ProTooltip>
  </component>
</template>

<script setup lang="ts">
import type { LinkCardProps, LinkItem } from './types'

const props = defineProps<LinkCardProps>()

const emit = defineEmits<{ (e: 'click', item: LinkItem): void }>()

/** 当前卡片图标已加载失败的条目 key 集合（组件内私有，命中即降级为首字占位图） */
const failedIcons = reactive(new Set<string>())

// 收集 src/assets/images/icons 下的本地图标，按文件名索引（key 为构建后资源地址）
const localIconMap: Record<string, string> = {}
for (const [path, url] of Object.entries(import.meta.glob<string>('/src/assets/images/icons/*.{png,ico,svg,jpg,jpeg,webp}', { eager: true, import: 'default' }))) {
  localIconMap[path.split('/').pop() || ''] = url
}

/**
 * 解析条目图标地址
 *
 * @param item 链接条目
 * @returns 加载失败降级为首字 SVG 占位；本地图标按文件名映射资源地址；其余原样返回
 */
function getIcon(item: LinkItem) {
  if (failedIcons.has(item.key)) {
    const ch = item.title.trim().charAt(0) || '?'
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64"><rect width="64" height="64" rx="12" fill="#409eff"/><text x="32" y="43" font-size="32" text-anchor="middle" fill="#fff" font-family="sans-serif">${ch}</text></svg>`
    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
  }
  // 本地图标路径（如 @/assets/images/icons/xx.png）：按文件名匹配 src/assets/images/icons 下的资源
  if (!/^(https?:|data:)/.test(item.icon)) {
    return localIconMap[item.icon.split('/').pop() || ''] || item.icon
  }
  return item.icon
}

/**
 * 图标加载失败回调：记录失败标记，触发降级占位图
 *
 * @param item 链接条目
 */
function onIconError(item: LinkItem) {
  failedIcons.add(item.key)
}

/**
 * 卡片点击回调：纯外链模式交给 a 标签默认导航，其余抛出 click 事件由父级决定跳转
 */
function onCardClick() {
  if (props.plainLink) return
  emit('click', props.item)
}
</script>

<style lang="scss" scoped>
.link-card {
  --el-link-card-icon-size: 32px;
  display: block;
  padding: 8px 16px;
  background-color: #fff;
  border: 1px solid var(--el-border-color);
  border-radius: 8px;
  color: inherit;
  text-decoration: none;
  cursor: pointer;
  transition:
    box-shadow 0.2s,
    transform 0.2s;

  &:hover {
    box-shadow: 0 4px 12px rgb(0 0 0 / 10%);
    transform: translateY(-2px);
  }
}

.card-header {
  display: flex;
  align-items: center;
  gap: 10px;
}

.link-icon {
  width: var(--el-link-card-icon-size);
  height: var(--el-link-card-icon-size);
  object-fit: contain;
  flex-shrink: 0;
}

.link-title {
  font-size: 15px;
  font-weight: 600;
}

.link-desc {
  display: -webkit-box;
  margin-top: 8px;
  overflow: hidden;
  font-size: 13px;
  line-height: 1.6;
  color: var(--el-color-info);
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  line-clamp: 2;
}

html[data-device='mobile'] {
  .link-card {
    padding: 8px 4px;
    text-align: center;
    background-color: transparent;
    border: none;
    box-shadow: none;

    &:hover {
      box-shadow: none;
      transform: none;
    }
  }

  .card-header {
    flex-direction: column;
    gap: 8px;
  }

  .link-icon {
    width: 48px;
    height: 48px;
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
}
</style>
