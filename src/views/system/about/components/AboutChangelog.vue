<template>
  <section class="about-panel">
    <h3 class="about-panel-title">更新日志</h3>
    <el-timeline class="changelog">
      <el-timeline-item v-for="(entry, index) in CHANGELOG_LIST" :key="entry.version" :timestamp="entry.date" :type="index === 0 ? 'primary' : undefined" :hollow="index !== 0">
        <strong class="log-version">v{{ entry.version }}</strong>
        <p class="log-desc">{{ entry.desc }}</p>
      </el-timeline-item>
    </el-timeline>
  </section>
</template>

<script setup lang="ts">
import { CHANGELOG_LIST } from '../about.config'
</script>

<style lang="scss" scoped>
/* 更新日志时间线 */
.changelog {
  padding-left: 4px;

  .log-version {
    display: block;
    font-size: 14px;
    color: var(--el-text-color-primary);
  }

  .log-desc {
    margin: 4px 0 0;
    font-size: 12px;
    line-height: 1.6;
    color: var(--el-text-color-secondary);
  }
}
</style>
