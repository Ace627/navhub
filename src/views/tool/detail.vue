<template>
  <div class="app-content flex flex-col">
    <!-- 返回工具列表 -->
    <el-page-header class="detail-header" @back="handleBack">
      <template #content>
        <span class="detail-title">{{ tool?.title }}</span>
      </template>
    </el-page-header>

    <!-- 工具主体：按路由参数异步装配对应工具组件 -->
    <component :is="toolComponent" v-if="toolComponent" />
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: 'ToolDetail' })
import type { Component } from 'vue'
import { TOOL_LIST } from './tool.config'

const route = useRoute()
const router = useRouter()

/** 工具组件注册表：自动收集同级各工具目录下的 index.vue（目录名须与注册表 key 一致） */
const toolModules = import.meta.glob('./*/index.vue')

/** 根据路由参数匹配到的工具条目 */
const tool = computed(() => TOOL_LIST.find((item) => item.key === route.params.key))

/** 当前工具对应的异步组件，路由参数未命中任何已登记组件时为 null */
const toolComponent = computed(() => {
  const loader = toolModules[`./${route.params.key}/index.vue`]
  return loader ? defineAsyncComponent(loader as () => Promise<Component>) : null
})

/** 返回工具列表页 */
function handleBack() {
  router.push({ name: 'Tool' })
}

/** 校验路由参数，未命中注册表时回到列表页兜底（防止手输非法地址出现空白页） */
function validateRoute() {
  if (!tool.value) router.replace({ name: 'Tool' })
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
