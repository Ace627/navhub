<template>
  <div class="app-content flex flex-col">
    <!-- 返回条目列表 -->
    <el-page-header class="detail-header" @back="handleBack">
      <template #content>
        <span class="detail-title">{{ item?.title }}</span>
      </template>
    </el-page-header>

    <!-- 条目主体：按路由参数异步装配对应自有条目组件 -->
    <component :is="entryComponent" v-if="entryComponent" />
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: 'CategoryDetail' })
import type { Component } from 'vue'
import { RouterConstant } from '@/router/router.constant'
import { getCategoryRegistry } from '@/router/category.registry'

const route = useRoute()
const router = useRouter()

/** 自有条目组件注册表：自动收集 widgets 下各条目目录的 index.vue（目录名须与注册表 key 一致） */
const widgetModules = import.meta.glob('./widgets/*/index.vue')

/** 当前路由命中的详情型分类注册表条目：按路由路径前缀匹配（非法 key 时也能定位分类以正确兜底） */
const entry = computed(() => getCategoryRegistry().find((category) => category.mode === 'detail' && route.path.startsWith(`/${category.path}/`)))

/** 根据路由参数匹配到的分类条目 */
const item = computed(() => entry.value?.data.find((entryItem) => entryItem.key === route.params.key))

/** 当前条目对应的异步组件，路由参数未命中任何已登记组件时为 null */
const entryComponent = computed(() => {
  const loader = widgetModules[`./widgets/${route.params.key}/index.vue`]
  return loader ? defineAsyncComponent(loader as () => Promise<Component>) : null
})

/** 返回条目所在分类的列表页 */
function handleBack() {
  router.push(entry.value ? `/${entry.value.path}` : RouterConstant.HOME_PAGE_URL)
}

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
