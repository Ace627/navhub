<template>
  <div class="navbar">
    <!-- 侧栏折叠控制 -->
    <Hamburger class="navbar-item hover-effect" @toggleClick="appStore.toggleSidebar" />

    <!-- 站点模糊搜索 -->
    <HeaderSearch class="navbar-item" />

    <div class="navbar__right h-full ml-auto flex-center">
      <!-- 主题切换 -->
      <el-tooltip :content="settingStore.isDark ? '浅色主题' : '深色主题'" effect="dark" placement="bottom">
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

const appStore = useAppStore()
const settingStore = useSettingStore()
</script>

<style lang="scss" scoped>
.navbar {
  position: relative;
  display: flex;
  align-items: center;
  height: var(--el-navbar-height);
  background-color: var(--el-navbar-bg-color);
  box-shadow: var(--el-navbar-box-shadow);
}
.navbar-item {
  cursor: pointer;
  display: flex;
  align-items: center;
  height: 100%;
  padding: 0 8px;
  transition: background-color var(--el-transition-duration-fast);
}
.hover-effect:hover {
  background-color: var(--el-fill-color-light);
}
</style>
