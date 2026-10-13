<template>
  <div class="app-content mobile-categories">
    <section v-for="entry in categories.slice(0, renderedCount)" :key="entry.name" class="category-section">
      <!-- 分区标题：图标块 + 分类名，右侧收录数量胶囊 -->
      <header class="category-header">
        <div class="category-title">
          <span class="category-icon">
            <SvgIcon :name="entry.icon" :size="16" />
          </span>
          <span>{{ entry.title }}</span>
        </div>
        <span class="category-count">{{ entry.data.length }}个应用</span>
      </header>

      <!-- 宫格模式：图标卡片网格，点击行为与分类列表页一致（外链新开、站内条目进详情） -->
      <div v-if="viewMode === 'grid'" class="card-grid">
        <LinkCard v-for="item in entry.data" :key="item.key" :item="item" :plain-link="!!entry.plainLink && isExternal(item.key)" @click="handleClickItem(entry, item)" />
      </div>

      <!-- 列表模式：两列「图标 + 名称」行，长按唤起与宫格一致的操作面板 -->
      <div v-else class="list-grid">
        <div
          v-for="item in entry.data"
          :key="item.key"
          class="list-item"
          @click="handleClickItem(entry, item)"
          @click.capture="listLongPress.onClickCapture"
          @pointerdown="(event) => listLongPress.onPointerDown(event, item)"
          @pointermove="listLongPress.onPointerMove"
          @pointerup="listLongPress.onPointerRelease"
          @pointercancel="listLongPress.onPointerRelease"
        >
          <img class="list-icon" :src="getIcon(item)" :alt="item.title" loading="lazy" draggable="false" referrerpolicy="no-referrer" @error="onIconError(item)" />
          <span class="list-title">{{ item.title }}</span>
        </div>
      </div>
    </section>

    <!-- 视图模式切换对话框：顶栏图标唤起，确定后持久化；锁 body 滚动会触发 EP 的滚动条补偿导致页面左移，本页滚动在内部容器，直接关闭 -->
    <el-dialog v-model="switcherVisible" title="列表样式" width="320" align-center :show-close="false" :lock-scroll="false" class="view-switch-dialog">
      <el-radio-group v-model="draftMode" class="dialog-options">
        <el-radio value="grid">
          <SvgIcon name="Menu" :size="16" />
          宫格模式
        </el-radio>
        <el-radio value="list">
          <SvgIcon name="Operation" :size="16" />
          列表模式
        </el-radio>
      </el-radio-group>
      <template #footer>
        <el-button @click="switcherVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmViewMode">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: RouterConstant.MOBILE_CATEGORIES_NAME })
import { RouterConstant } from '@/router/router.constant'
import type { SiteItem } from '@/types'
import { getCategoryRegistry } from '@/router/category.registry'
import type { CategoryEntry } from '@/router/category.registry'
import { isExternal } from '@/utils'
import type { MobileCategoryLayout } from '@/utils'
import { IMG_FAVICON } from '@/common/constant/image.constant'

const router = useRouter()

/** 分类聚合数据：引导阶段装配完成的注册表，按分类分区块展示全部站点 */
const categories = getCategoryRegistry()

/** 视图模式共享状态：顶栏切换图标与本页对话框跨组件联动 */
const { viewMode, switcherVisible, applyViewMode } = useMobileCategoryView()

/** 列表条目长按唤起操作面板：回调参数为按下时携带的条目，与宫格模式行为一致 */
const { openLinkActions } = useLinkActions()
const listLongPress = useLongPress<SiteItem>((item) => item && openLinkActions(item))

/** 对话框内的暂选模式：打开时同步当前模式，确定后才落盘 */
const draftMode = ref<MobileCategoryLayout>(viewMode.value)

/** 图标加载失败的条目 key 集合（命中即降级为默认占位图标） */
const failedIcons = reactive(new Set<string>())

// 收集 src/assets/images/icons 下的本地图标，按文件名索引（key 为构建后资源地址）
const localIconMap: Record<string, string> = {}
for (const [path, url] of Object.entries(import.meta.glob<string>('/src/assets/images/icons/*.{png,ico,svg,jpg,jpeg,webp}', { eager: true, import: 'default' }))) {
  localIconMap[path.split('/').pop() || ''] = url
}

/** 对话框打开时把暂选模式重置为当前生效模式，取消不残留改动 */
watch(switcherVisible, (visible) => {
  if (visible) draftMode.value = viewMode.value
})

/** 首帧渲染的分区数量：覆盖一屏左右，保证进入页面立即有内容 */
const INITIAL_SECTION_COUNT = 2

/** 每帧追加渲染的分区数量 */
const SECTION_RENDER_STEP = 2

/** 当前已渲染的分区数量：整页一次性渲染约 250 张卡片会白屏一秒，改为首帧渲染可视分区、其余分帧补齐 */
const renderedCount = ref(INITIAL_SECTION_COUNT)

/** 渐进渲染定时器句柄 */
let renderTimer: ReturnType<typeof setTimeout> | undefined

/**
 * 重置并重启渐进渲染：进入页面或切换视图模式时，首帧只渲染前几个分区，其余按帧补齐
 */
function scheduleProgressiveRender(): void {
  clearTimeout(renderTimer)
  renderedCount.value = INITIAL_SECTION_COUNT
  // 等首帧完成绘制后再开始补齐，避免追加渲染阻塞首屏
  renderTimer = setTimeout(renderNextSections, 48)
}

/**
 * 按帧追加渲染分区，直到全部渲染完成
 */
function renderNextSections(): void {
  if (renderedCount.value >= categories.length) return
  renderedCount.value += SECTION_RENDER_STEP
  renderTimer = setTimeout(renderNextSections, 48)
}

// 视图模式切换会整树重建卡片，同样走渐进渲染避免切换瞬间卡顿；immediate 覆盖首次进入页面
watch(viewMode, scheduleProgressiveRender, { immediate: true })

onBeforeUnmount(() => {
  clearTimeout(renderTimer)
})

/**
 * 确认视图模式：落盘并关闭对话框
 */
function confirmViewMode() {
  applyViewMode(draftMode.value)
  switcherVisible.value = false
}

/**
 * 解析列表模式条目图标地址：未配置或加载失败时降级为默认占位图标；本地图标按文件名映射资源地址
 *
 * @param item 站点条目
 * @returns 图标地址
 */
function getIcon(item: SiteItem): string {
  if (failedIcons.has(item.key) || !item.icon?.trim()) return IMG_FAVICON
  if (!/^(https?:|data:)/.test(item.icon)) return localIconMap[item.icon.split('/').pop() || ''] || item.icon
  return item.icon
}

/**
 * 列表图标加载失败回调：记录失败标记触发占位图标降级
 *
 * @param item 站点条目
 */
function onIconError(item: SiteItem): void {
  failedIcons.add(item.key)
}

/**
 * 点击条目：自有条目（小部件）跳转所属分类详情页，外链条目一律新窗口打开
 *
 * 宫格模式下纯外链分类的卡片由 LinkCard 内部完成跳转，不会触发本回调
 *
 * @param entry 条目所属分类注册表条目
 * @param item 被点击的站点条目
 */
function handleClickItem(entry: CategoryEntry, item: SiteItem) {
  if (!isExternal(item.key)) {
    router.push(`/${entry.path}/${item.key}`)
    return
  }
  window.open(item.key, '_blank')
}
</script>

<style lang="scss" scoped>
.category-section + .category-section {
  margin-top: 20px;
}

.category-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}

.category-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 15px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.category-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 8px;
  color: var(--el-color-primary);
  background-color: var(--el-color-primary-light-8);
}

.category-count {
  padding: 2px 10px;
  font-size: 12px;
  color: var(--el-text-color-secondary);
  background-color: var(--el-fill-color);
  border-radius: 999px;
}

.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 16px;
}

.list-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 10px;
}

.list-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  background-color: var(--el-fill-color-light);
  border-radius: 10px;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;

  &:active {
    background-color: var(--el-fill-color);
  }
}

.list-icon {
  width: 28px;
  height: 28px;
  flex-shrink: 0;
  object-fit: contain;
}

.list-title {
  overflow: hidden;
  font-size: 14px;
  color: var(--el-text-color-primary);
  text-overflow: ellipsis;
  white-space: nowrap;
}

html[data-device='mobile'] {
  .card-grid {
    grid-template-columns: repeat(4, 1fr);
    gap: 8px;
  }

  /* 宫格模式纯图标：关闭卡片磨砂，避免 backdrop-filter 把纸纹噪点糊成浅色方块 */
  .card-grid :deep(.link-card) {
    backdrop-filter: none;
    -webkit-backdrop-filter: none;
  }

  .list-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
  }
}
</style>
