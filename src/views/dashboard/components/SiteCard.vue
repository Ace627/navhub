<template>
  <a :href="item.url" target="_blank" rel="noopener noreferrer" class="site-card">
    <div class="card-header">
      <img class="site-icon" :src="getIcon(item)" :alt="item.title" loading="lazy" draggable="false" @error="onIconError(item)" />
      <span class="site-title">{{ item.title }}</span>
    </div>
    <ProTooltip :content="item.description">
      <span class="site-desc">{{ item.description }}</span>
    </ProTooltip>
  </a>
</template>

<script setup lang="ts">
import type webs from '@/database/webs.json'

type WebItem = (typeof webs)[number]['children'][number]

defineProps<{ item: WebItem }>()

/** 当前卡片图标已加载失败的站点 url 集合（组件内私有，命中即降级为首字占位图） */
const failedIcons = reactive(new Set<string>())

// 收集 src/assets/images/icons 下的本地图标，按文件名索引（key 为构建后资源地址）
const localIconMap: Record<string, string> = {}
for (const [path, url] of Object.entries(import.meta.glob<string>('/src/assets/images/icons/*.{png,ico,svg,jpg,jpeg,webp}', { eager: true, import: 'default' }))) {
  localIconMap[path.split('/').pop() || ''] = url
}

/**
 * 解析站点图标地址
 *
 * @param item 站点条目
 * @returns 失败降级为首字 SVG 占位；本地图标按文件名映射资源地址；其余原样返回
 */
function getIcon(item: WebItem) {
  if (failedIcons.has(item.url)) {
    const ch = item.title.trim().charAt(0) || '?'
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64"><rect width="64" height="64" rx="12" fill="#409eff"/><text x="32" y="43" font-size="32" text-anchor="middle" fill="#fff" font-family="sans-serif">${ch}</text></svg>`
    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
  }
  // 本地图标路径（如 assets/images/icons/xx.png）：按文件名匹配 src/assets/images/icons 下的资源
  if (!/^(https?:|data:)/.test(item.icon)) {
    return localIconMap[item.icon.split('/').pop() || ''] || item.icon
  }
  return item.icon
}

/**
 * 图标加载失败回调：记录失败标记，触发降级占位图
 *
 * @param item 站点条目
 */
function onIconError(item: WebItem) {
  failedIcons.add(item.url)
}
</script>

<style lang="scss" scoped>
.site-card {
  display: block;
  padding: 8px 16px;
  background-color: #fff;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  color: inherit;
  text-decoration: none;
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

.site-icon {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  object-fit: contain;
  flex-shrink: 0;
}

.site-title {
  font-size: 15px;
  font-weight: 600;
}

.site-desc {
  margin: 10px 0 0;
  font-size: 13px;
  line-height: 1.6;
  color: #909399;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

html[data-device='mobile'] {
  .site-card {
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

  .site-icon {
    width: 48px;
    height: 48px;
  }

  .site-title {
    font-size: 12px;
    font-weight: 400;
    max-width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .site-desc {
    display: none;
  }
}
</style>
