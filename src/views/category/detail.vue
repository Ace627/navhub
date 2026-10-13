<template>
  <div class="app-content flex flex-col">
    <!-- 返回条目列表：移动端由顶栏返回箭头承担，仅桌面端展示 -->
    <el-page-header v-if="!appStore.isMobile" class="detail-header" @back="backToDetailSource">
      <template #content>
        <span class="detail-title">{{ item?.title }}</span>
      </template>
    </el-page-header>

    <!-- 条目主体：按路由参数装配对应自有条目组件 -->
    <component :is="entryComponent" v-if="entryComponent" />
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: 'CategoryDetail' })
import type { Component } from 'vue'
import { useAppStore } from '@/store/modules/app'
import { RouterConstant } from '@/router/router.constant'
import { getCategoryRegistry } from '@/router/category.registry'

const route = useRoute()
const router = useRouter()

const appStore = useAppStore()

const { backToDetailSource } = useDetailBack()

/** 自有条目组件注册表：自动收集 widgets 下各条目目录的 index.vue（目录名须与注册表 key 一致）；eager 装配进详情分包，避免运行时二次异步加载导致首进白屏 */
const widgetModules = import.meta.glob<Component>('./widgets/*/index.vue', { eager: true, import: 'default' })

/** 当前路由命中的分类注册表条目：按路由路径前缀匹配（非法 key 时也能定位分类以正确兜底） */
const entry = computed(() => getCategoryRegistry().find((category) => route.path.startsWith(`/${category.path}/`)))

/** 根据路由参数匹配到的分类条目 */
const item = computed(() => entry.value?.data.find((entryItem) => entryItem.key === route.params.key))

/** 当前条目对应的组件，路由参数未命中任何已登记组件时为 null */
const entryComponent = computed(() => widgetModules[`./widgets/${route.params.key}/index.vue`] ?? null)

/** 校验路由参数，未命中注册表时回到所在分类列表页兜底（防止手输非法地址出现空白页） */
function validateRoute() {
  if (!item.value) router.replace(entry.value ? `/${entry.value.path}` : RouterConstant.HOME_PAGE_URL)
}

watch(
  () => route.params.key,
  validateRoute,
  { immediate: true },
)
</script>

<style lang="scss" scoped>
.detail-header {
  margin-bottom: 16px;
}

.detail-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}
</style>
