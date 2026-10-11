<template>
  <section class="about-panel">
    <h3 class="about-panel-title">免责声明</h3>
    <ul class="notice-list">
      <li v-for="notice in NOTICE_LIST" :key="notice">{{ notice }}</li>
    </ul>
  </section>
</template>

<script setup lang="ts">
import { NOTICE_LIST } from '../about.config'
</script>

<style lang="scss" scoped>
/* 免责声明 */
.notice-list {
  margin: 0;
  padding-left: 20px;
  font-size: 13px;
  line-height: 2;
  color: var(--el-text-color-secondary);
}
</style>
