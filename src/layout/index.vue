<template>
  <div class="app-container">
    <AppMain />
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: 'Layout' })
import AppMain from './components/AppMain/index.vue'
</script>

<style lang="scss" scoped>
.app-container {
  position: relative;
  width: 100%;
  height: 100%;
}
</style>
