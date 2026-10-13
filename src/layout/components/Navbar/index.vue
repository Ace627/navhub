<template>
  <div class="navbar">
    <!-- 侧栏折叠控制：移动端由底部 TabBar 承担导航，隐藏汉堡 -->
    <Hamburger v-if="!appStore.isMobile" class="navbar-item hover-effect" @toggleClick="appStore.toggleSidebar" />

    <!-- 移动端左侧大标题：展示当前页面名称（详情页按路由参数实时解析） -->
    <h1 v-if="appStore.isMobile" class="navbar-title">{{ mobileTitle }}</h1>

    <!-- 站点模糊搜索：桌面端常驻输入框 -->
    <HeaderSearch v-if="!appStore.isMobile" class="navbar-item" />

    <div class="navbar__right h-full ml-auto flex-center">
      <!-- 移动端搜索入口：图标唤起底部搜索面板 -->
      <HeaderSearch v-if="appStore.isMobile" class="navbar-item" />

      <!-- 移动端分类页视图切换：弹出列表样式对话框（仅分类页显示） -->
      <span v-if="appStore.isMobile && route.name === RouterConstant.MOBILE_CATEGORIES_NAME" class="navbar-item hover-effect" role="button" aria-label="切换列表样式" @click="switcherVisible = true">
        <SvgIcon name="Menu" size="1.16em" />
      </span>

      <div v-if="!appStore.isMobile" class="navbar-item">
        <el-text type="primary">{{ formatTime }}</el-text>
      </div>

      <!-- 系统设置入口：跳转系统设置页（移动端收进「我的」页列表，顶栏不展示） -->
      <el-tooltip v-if="!appStore.isMobile" content="系统设置" effect="dark" placement="bottom">
        <span class="navbar-item hover-effect" @click="goSetting">
          <SvgIcon name="Setting" size="1.16em" />
        </span>
      </el-tooltip>

      <!-- 主题切换（移动端收进系统设置页，顶栏不展示） -->
      <el-tooltip v-if="!appStore.isMobile" :content="settingStore.isDark ? '浅色主题' : '深色主题'" effect="dark" placement="bottom">
        <ThemeSwitch class="navbar-item hover-effect" />
      </el-tooltip>
    </div>
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: 'Navbar' })
import Hamburger from './Hamburger.vue'
import ThemeSwitch from './ThemeSwitch.vue'
import HeaderSearch from './HeaderSearch.vue'
import { RouterConstant } from '@/router/router.constant'

const route = useRoute()
const appStore = useAppStore()
const settingStore = useSettingStore()
const router = useRouter()

/** 移动端分类页视图切换对话框的共享可见状态 */
const { switcherVisible } = useMobileCategoryView()

const formatTime = useDateFormat(useNow(), 'YYYY-MM-DD HH:mm:ss')

/** 移动端顶部大标题：meta.title 支持函数形式，按当前路由动态解析（与 useDynamicTitle 同规则） */
const mobileTitle = computed(() => {
  const title = typeof route.meta.title === 'function' ? route.meta.title(route) : route.meta.title
  return title ?? ''
})

/** 跳转系统设置页 */
function goSetting() {
  router.push({ name: 'Setting' })
}
</script>

<style lang="scss" scoped>
.navbar {
  position: relative;
  display: flex;
  align-items: center;
  height: var(--el-navbar-height);
  background-color: var(--el-navbar-bg-color);
  box-shadow: var(--el-navbar-box-shadow);
  @include mobile {
    padding-right: 16px;
  }
}
.navbar-item {
  cursor: pointer;
  display: flex;
  align-items: center;
  height: 100%;
  padding: 0 4px;
  transition: background-color var(--el-transition-duration-fast);
}

/* 移动端左侧大标题：参考 App 顶栏的页面名样式 */
.navbar-title {
  margin: 0 0 0 16px;
  font-size: 18px;
  font-weight: 700;
  color: var(--el-text-color-primary);
}
.hover-effect:hover {
  background-color: var(--el-fill-color-light);
}
</style>
