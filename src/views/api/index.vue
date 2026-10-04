<template>
  <div class="app-content">
    <div class="card-grid">
      <LinkCard v-for="item in API_LIST" :key="item.key" :item="item" plain-link />
    </div>
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: 'Api' })
import { API_LIST } from './api.config'
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
