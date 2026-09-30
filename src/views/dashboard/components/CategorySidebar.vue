<template>
  <nav class="category-sidebar" aria-label="网站分类">
    <p class="category-sidebar__title">全部分类</p>
    <CategoryList :categories="categories" :active-key="activeKey" @select="scrollToCategory" />
  </nav>
</template>

<script setup lang="ts">
import CategoryList from './CategoryList.vue'
import { useCategoryNav } from '../composables/useCategoryNav'

defineOptions({ name: 'CategorySidebar' })

const { categories, activeKey, scrollToCategory } = useCategoryNav()
</script>

<style lang="scss" scoped>
.category-sidebar {
  position: sticky;
  top: 16px;
  align-self: flex-start;
  flex-shrink: 0;
  width: var(--n-category-sidebar-width);
  height: calc(100vh - 32px);
  /* 减去上下各 16px 的外边距，保证侧栏自身滚动而不顶出视口 */
  max-height: calc(100vh - 32px);
  padding: 12px 8px;
  overflow-y: auto;
  overscroll-behavior: contain;
  background-color: #fff;
  border-radius: 10px;
  box-shadow: 0 1px 3px rgb(0 0 0 / 6%);
}

.category-sidebar__title {
  margin: 0 0 8px;
  padding: 0 14px;
  font-size: 12px;
  letter-spacing: 0.5px;
  color: #909399;
}
</style>
