<template>
  <div class="app-content">
    初始化测试
    <h1>{{ appStore.isMobile ? '移动端' : '桌面端' }}</h1>
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: RouterConstant.HOME_PAGE_NAME })
import { RouterConstant } from '@/router/router.constant'

const appStore = useAppStore()
</script>

<style lang="scss" scoped></style>
