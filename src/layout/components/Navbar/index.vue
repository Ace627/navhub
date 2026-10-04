<template>
  <div class="navbar">
    <!-- 侧栏折叠控制 -->
    <Hamburger class="navbar-item hover-effect" @toggleClick="appStore.toggleSidebar" />

    <div class="navbar__right h-full ml-auto flex-center">
      <!-- 站点模糊搜索 -->
      <HeaderSearch />

      <!-- 设置入口 -->
      <el-tooltip content="系统帧率" effect="dark" placement="bottom">
        <span class="navbar-item hover-effect navbar-item__fps"> {{ fps }} </span>
      </el-tooltip>
    </div>
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: 'Navbar' })
import Hamburger from './Hamburger.vue'
import HeaderSearch from './HeaderSearch.vue'

const appStore = useAppStore()
const fps = useFps()
</script>

<style lang="scss" scoped>
.navbar {
  position: relative;
  display: flex;
  align-items: center;
  height: var(--n-navbar-height);
  background-color: var(--n-navbar-bg-color);
  box-shadow: var(--n-navbar-box-shadow);
}
.navbar-item {
  cursor: pointer;
  display: flex;
  align-items: center;
  height: 100%;
  padding: 0 8px;
  transition: background-color var(--n-transition-duration-fast);
}
.hover-effect:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

.navbar-item__fps {
  font-weight: bold;
  color: var(--el-color-danger);
}
</style>
