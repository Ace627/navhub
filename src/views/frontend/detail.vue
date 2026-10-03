<template>
  <div class="app-content flex flex-col">
    <!-- 返回条目列表 -->
    <el-page-header class="detail-header" @back="handleBack">
      <template #content>
        <span class="detail-title">{{ item?.title }}</span>
      </template>
    </el-page-header>

    <!-- 条目主体：按路由参数异步装配对应组件 -->
    <component :is="itemComponent" v-if="itemComponent" />
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: 'FrontendDetail' })
import type { Component } from 'vue'
import { FRONTEND_GROUPS } from './frontend.config'

const route = useRoute()
const router = useRouter()

/** 条目组件注册表：自动收集同级各组件目录下的 index.vue（目录名须与注册表 key 一致） */
const itemModules = import.meta.glob('./*/index.vue')

/** 根据路由参数匹配到的前端条目（跨分组扁平化后查找） */
const item = computed(() => FRONTEND_GROUPS.flatMap((group) => group.children).find((entry) => entry.key === route.params.key))

/** 当前条目对应的异步组件，路由参数未命中任何已登记组件时为 null */
const itemComponent = computed(() => {
  const loader = itemModules[`./${route.params.key}/index.vue`]
  return loader ? defineAsyncComponent(loader as () => Promise<Component>) : null
})

/** 返回前端专家列表页 */
function handleBack() {
  router.push({ name: 'Frontend' })
}

/** 校验路由参数，未命中注册表时回到列表页兜底（防止手输非法地址出现空白页） */
function validateRoute() {
  if (!item.value) router.replace({ name: 'Frontend' })
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
