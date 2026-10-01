<template>
  <div class="app-content flex flex-col gap-16px">
    <section v-for="group in webGroups" :key="group.category" class="category">
      <h2 class="category-title">{{ group.category }}</h2>
      <div class="card-grid">
        <a v-for="item in group.children" :key="item.url" :href="getHref(item)" target="_blank" rel="noopener noreferrer" class="site-card">
          <div class="card-header">
            <img class="site-icon" :src="getIcon(item)" :alt="item.title" loading="lazy" draggable="false" @error="onIconError(item)" />
            <span class="site-title">{{ item.title }}</span>
          </div>
          <p class="site-desc" :title="item.description">{{ item.description }}</p>
        </a>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: RouterConstant.HOME_PAGE_NAME })
import { reactive } from 'vue'
import webs from '@/database/webs.json'
import { RouterConstant } from '@/router/router.constant'

const webGroups = webs

const failedIcons = reactive(new Set<string>())

// 收集 src/assets/images/icons 下的本地图标，按文件名索引（key 为构建后资源地址）
const localIconMap: Record<string, string> = {}
for (const [path, url] of Object.entries(import.meta.glob<string>('/src/assets/images/icons/*.{png,ico,svg,jpg,jpeg,webp}', { eager: true, import: 'default' }))) {
  localIconMap[path.split('/').pop() || ''] = url
}

/**
 * 拼接带来源参数的跳转链接
 *
 * @param item 站点条目
 * @returns 追加 from 参数后的完整链接；已有查询串的用 & 追加，含 hash 的插在 hash 之前
 */
function getHref(item: (typeof webs)[number]['children'][number]) {
  const from = `from=${window.location.href}`
  const hashIndex = item.url.indexOf('#')
  if (hashIndex !== -1) {
    const base = item.url.slice(0, hashIndex)
    const hash = item.url.slice(hashIndex)
    return `${base}${base.includes('?') ? '&' : '?'}${from}${hash}`
  }
  return `${item.url}${item.url.includes('?') ? '&' : '?'}${from}`
}

function getIcon(item: (typeof webs)[number]['children'][number]) {
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

function onIconError(item: (typeof webs)[number]['children'][number]) {
  failedIcons.add(item.url)
}
</script>

<style lang="scss" scoped>
.category-title {
  position: relative;
  margin: 0 0 12px;
  padding-left: 10px;
  font-size: 18px;
  font-weight: 600;

  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
    width: 4px;
    height: 18px;
    border-radius: 2px;
    background-color: var(--n-color-primary);
  }
}

.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 16px;
}

.site-card {
  display: block;
  padding: 16px;
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
  .card-grid {
    grid-template-columns: repeat(4, 1fr);
    gap: 8px;
  }

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
