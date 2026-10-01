<template>
  <div class="navbar">
    <!-- 侧栏折叠控制 -->
    <Hamburger class="navbar-item hover-effect" @toggleClick="appStore.toggleSidebar" />
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: 'Navbar' })
import Hamburger from './Hamburger.vue'

const appStore = useAppStore()
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
</style>
