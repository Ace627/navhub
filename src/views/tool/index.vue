<template>
  <div class="app-content">
    <div class="card-grid">
      <div v-for="(item, index) in TOOL_LIST" :key="index" class="tool-card" :title="isExternal(item.key) ? '将在新窗口打开' : undefined" @click="handleClickTool(item)">
        <div class="card-header">
          <img class="tool-icon" :src="getIcon(item)" :alt="item.title" loading="lazy" draggable="false" @error="onIconError(item)" />
          <span class="tool-title">{{ item.title }}</span>
          <SvgIcon v-if="isExternal(item.key)" name="External" :size="12" class="tool-external" />
        </div>
        <ProTooltip :content="item.description">
          <span class="tool-desc">{{ item.description }}</span>
        </ProTooltip>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: 'Tool' })
import { isExternal } from '@/utils'
import { TOOL_LIST } from './tool.config'
import type { ToolItem } from './tool.config'

const router = useRouter()

/** 当前图标已加载失败的工具 key 集合（组件内私有，命中即降级为首字占位图） */
const failedIcons = reactive(new Set<string>())

// 收集 src/assets/images/icons 下的本地图标，按文件名索引（key 为构建后资源地址）
const localIconMap: Record<string, string> = {}
for (const [path, url] of Object.entries(import.meta.glob<string>('/src/assets/images/icons/*.{png,ico,svg,jpg,jpeg,webp}', { eager: true, import: 'default' }))) {
  localIconMap[path.split('/').pop() || ''] = url
}

/**
 * 解析工具图标地址
 *
 * @param item 工具条目
 * @returns 加载失败降级为首字 SVG 占位；本地图标按文件名映射资源地址；其余原样返回
 */
function getIcon(item: ToolItem) {
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
 * @param item 工具条目
 */
function onIconError(item: ToolItem) {
  failedIcons.add(item.key)
}

/**
 * 点击工具卡片，自有工具跳转详情页，外部工具新窗口打开
 *
 * @param item 被点击的工具条目
 */
function handleClickTool(item: ToolItem) {
  if (isExternal(item.key)) {
    window.open(item.key, '_blank')
  } else {
    router.push(`/tool/${item.key}`)
  }
}
</script>

<style lang="scss" scoped>
.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 16px;
}

.tool-card {
  padding: 8px 16px;
  background-color: #fff;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
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

.tool-icon {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  object-fit: contain;
  flex-shrink: 0;
}

.tool-title {
  font-size: 15px;
  font-weight: 600;
}

/* 外链工具标识：靠卡片头部行尾，示意新窗口打开 */
.tool-external {
  margin-left: auto;
  color: #909399;
  flex-shrink: 0;
}

.tool-desc {
  display: -webkit-box;
  margin-top: 10px;
  overflow: hidden;
  font-size: 13px;
  line-height: 1.6;
  color: #909399;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  line-clamp: 2;
}

html[data-device='mobile'] {
  .tool-card {
    padding: 8px 4px;
    text-align: center;
    background-color: transparent;
    border: none;

    &:hover {
      box-shadow: none;
      transform: none;
    }
  }

  .card-header {
    flex-direction: column;
    gap: 8px;
  }

  .tool-icon {
    width: 48px;
    height: 48px;
  }

  .tool-title {
    max-width: 100%;
    overflow: hidden;
    font-size: 12px;
    font-weight: 400;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .tool-external {
    display: none;
  }

  .tool-desc {
    display: none;
  }
}
</style>
