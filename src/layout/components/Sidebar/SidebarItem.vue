<template>
  <template v-if="!item?.meta?.hidden">
    <template v-if="hasOneShowingChild(item.children, item) && (!onlyOneChild.children || onlyOneChild.noShowingChildren) && !item?.meta?.alwaysShow">
      <el-menu-item :index="resolvePath(onlyOneChild.path)" @click="handleMenuItemClick(onlyOneChild)">
        <SvgIcon class="sidebar-icon" :name="onlyOneChild.meta?.icon ?? item.meta?.icon ?? 'Key'" />
        <template #title>
          <span class="menu-title" :title="hasTitle(onlyOneChild.meta?.title)">{{ onlyOneChild.meta?.title }}</span>
        </template>
      </el-menu-item>
    </template>

    <el-sub-menu v-else :index="resolvePath(item.path)" teleported>
      <template #title>
        <SvgIcon class="sidebar-icon" :name="item.meta?.icon ?? 'Key'" />
        <span class="menu-title" :title="hasTitle(item.meta?.title)">{{ item.meta?.title }}</span>
      </template>
      <SidebarItem v-for="(child, index) in item.children" :key="child.path + index" :item="child" :basePath="resolvePath(child.path)" />
    </el-sub-menu>
  </template>
</template>

<script setup lang="ts">
defineOptions({ name: 'SidebarItem' })
import type { PropType } from 'vue'
import type { RouteLocationNormalizedLoaded, RouteRecordRaw } from 'vue-router'
import { isString } from '@/utils'

interface OneChild {
  path: string
  meta?: { title?: string; icon?: string; link?: string; target?: string }
  children?: RouteRecordRaw[]
  noShowingChildren?: boolean
  hidden?: boolean
}

const props = defineProps({
  item: { type: Object as PropType<RouteRecordRaw>, required: true },
  basePath: { type: String, default: '' },
})

const router = useRouter()

const onlyOneChild = ref<OneChild>({ path: '' })

/**
 * 判断路由是否可直接按单项菜单渲染，并收拢唯一可见子路由到 onlyOneChild
 *
 * @param children 子路由列表
 * @param parent 父路由本身
 * @returns 是否仅有一个可见子路由（或无子路由）
 */
function hasOneShowingChild(children: RouteRecordRaw[] = [], parent: RouteRecordRaw): boolean {
  const showingChildren = children.filter((item) => {
    if (item.meta?.hidden) {
      return false
    }
    onlyOneChild.value = item as OneChild
    return true
  })

  if (showingChildren.length === 1) {
    return true
  }

  if (showingChildren.length === 0) {
    onlyOneChild.value = { ...parent, path: '', noShowingChildren: true } as OneChild
    return true
  }

  return false
}

/**
 * 判断标题是否需要原生 tooltip 提示（超过 5 字时返回标题，避免折叠态或省略时看不全）
 *
 * @param title 路由标题（兼容按路由参数动态解析的函数形式，函数标题不做 tooltip）
 * @returns 需要 tooltip 时返回标题原文，否则返回空串
 */
function hasTitle(title?: string | ((route: RouteLocationNormalizedLoaded) => string)): string {
  if (isString(title) && title.length > 5) {
    return title
  }
  return ''
}

/**
 * 解析路由完整路径：根绝对路径（外链 iframe 路由）直接返回，相对路径与父级前缀拼接
 *
 * @param routePath 当前路由 path
 * @returns 规范化后的完整路径
 */
function resolvePath(routePath: string): string {
  if (routePath.startsWith('/')) return routePath
  return normalizePath(props.basePath + '/' + routePath)
}

/** 清理路径中重复的斜杠与末尾斜杠 */
function normalizePath(path: string): string {
  return path ? path.replace(/\/+/g, '/').replace(/\/$/, '') : path
}

/** 处理菜单项点击事件（外链 target=2 新标签直达外链原地址，其余一律当前页跳转） */
function handleMenuItemClick(item: OneChild) {
  const path: string = resolvePath(item.path)
  if (item.meta?.link && item.meta.target === '2') return window.open(item.meta?.link, '_blank', 'noopener')
  router.push(path)
}
</script>

<style lang="scss" scoped>
.sidebar-icon {
  font-size: var(--el-sidebar-icon-size) !important; /* 加权 抵消 SvgIcon 的行内样式 方便支持自定义变量 */
  margin-right: 8px;
  transition: margin-right var(--el-transition-duration);
}
.el-menu--collapse .sidebar-icon {
  margin-right: 0;
}

:deep(.el-sub-menu__title) {
  font-size: var(--el-sidebar-font-size);
}

/* 带 deep 的是对 sub-menu 下的 menu-item 起效 */
.el-menu-item,
:deep(.el-menu-item) {
  color: var(--el-sidebar-text-color);
  font-size: var(--el-sidebar-font-size);
  &:hover {
    color: var(--el-sidebar-hover-text-color);
    background-color: var(--el-sidebar-hover-bg-color);
  }
  &.is-active {
    color: var(--el-sidebar-active-text-color);
    background-color: var(--el-sidebar-active-bg-color);
  }
}
</style>
