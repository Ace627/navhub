<template>
  <aside class="flex flex-col">
    <AppLogo :show-title="!appStore.isCollapse" />

    <ul class="nav-list">
      <li v-for="(item, index) in sidebarRoutes" :key="index" class="nav-item" :class="{ active: isActive(item.url) }" @click="handleClickItem(item)">
        <SvgIcon :name="item.icon" />
        <span v-if="!appStore.isCollapse"> {{ item.title }} </span>
      </li>
    </ul>
  </aside>
</template>

<script setup lang="ts">
defineOptions({ name: 'Sidebar' })
import AppLogo from '../AppLogo/index.vue'
import { RouterConstant } from '@/router/router.constant'

const route = useRoute()
const router = useRouter()
const appStore = useAppStore()

/** 布局路由的子路由即全部导航页，过滤隐藏项后生成侧边栏导航数据 */
function getSidebarRoutes() {
  const layoutRoute = router.options.routes.find(item => item.name === RouterConstant.LAYOUT_NAME)
  return (layoutRoute?.children ?? [])
    .filter(item => !item.meta?.hidden && item.meta?.icon)
    .map(item => ({ title: item.meta!.title, url: `/${item.path.replace(/^\//, '')}`, icon: item.meta!.icon! }))
}

const sidebarRoutes = ref(getSidebarRoutes())

/** 判断导航项是否为当前路由对应项 */
function isActive(url: string): boolean {
  return route.path === url || route.path.startsWith(`${url}/`)
}

function handleClickItem(record: (typeof sidebarRoutes.value)[0]) {
  router.push(record.url)
}
</script>

<style lang="scss" scoped>
.nav-list {
  flex-grow: 1;
}

.nav-item {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  height: var(--n-sidebar-item-height);
  margin: 4px 8px;
  padding: 0 12px;
  border-radius: 4px;
  color: var(--n-sidebar-text-color);
  cursor: pointer;
  white-space: nowrap;
  transition: background-color var(--n-transition-duration-fast);

  &:hover {
    background-color: rgba(255, 255, 255, 0.08);
  }

  &.active {
    background-color: var(--n-color-primary);
  }
}
</style>
