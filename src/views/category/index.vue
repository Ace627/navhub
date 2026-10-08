<template>
  <div class="app-content">
    <div class="card-grid">
      <LinkCard v-for="item in sites" :key="item.key" :item="item" :plain-link="plainLink" @click="handleClickItem(item)" />
    </div>
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: 'Category' })
import type { SiteItem } from '@/types'
import { getCategoryRegistry } from '@/router/category.registry'
import { isExternal } from '@/utils'

const route = useRoute()
const router = useRouter()

/** 当前路由命中的分类注册表条目 */
const entry = computed(() => getCategoryRegistry().find((category) => category.name === route.name))

/** 当前分类收录的站点数据列表 */
const sites = computed(() => entry.value?.data ?? [])

/** 当前分类是否以纯外链（a 标签直链）模式渲染卡片 */
const plainLink = computed(() => entry.value?.plainLink ?? false)

/**
 * 点击条目卡片：detail 模式下自有条目跳转详情页，其余条目一律新窗口打开
 *
 * 纯外链分类的卡片由 LinkCard 内部 a 标签完成跳转，不会触发本回调
 *
 * @param item 被点击的站点条目
 */
function handleClickItem(item: SiteItem) {
  if (entry.value?.mode === 'detail' && !isExternal(item.key)) {
    router.push(`/${entry.value.path}/${item.key}`)
    return
  }
  window.open(item.key, '_blank')
}
</script>

<style lang="scss" scoped>
.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 16px;
}

html[data-device='mobile'] {
  .card-grid {
    grid-template-columns: repeat(4, 1fr);
    gap: 8px;
  }
}
</style>
