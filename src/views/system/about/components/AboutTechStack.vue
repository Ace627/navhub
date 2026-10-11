<template>
  <section class="about-panel">
    <h3 class="about-panel-title">技术栈</h3>
    <div class="tech-grid">
      <div v-for="tech in TECH_LIST" :key="tech.name" class="tech-card">
        <div class="tech-head">
          <strong>{{ tech.name }}</strong>
          <span>{{ tech.version }}</span>
        </div>
        <p>{{ tech.desc }}</p>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { TECH_LIST } from '../about.config'
</script>

<style lang="scss" scoped>
/* 技术栈区：按最小卡片宽度自动换行填充，适配宽窄不一的 Bento 大格 */
.tech-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(170px, 1fr));
  gap: 12px;
}

.tech-card {
  padding: 12px 14px;
  background-color: var(--el-fill-color-light);
  border-radius: 8px;
  transition:
    background-color var(--el-transition-duration-fast),
    transform var(--el-transition-duration-fast);

  &:hover {
    background-color: var(--el-color-primary-light-9);
    transform: translateY(-2px);
  }

  .tech-head {
    display: flex;
    align-items: baseline;
    gap: 6px;

    strong {
      font-size: 14px;
      color: var(--el-text-color-primary);
    }

    span {
      font-size: 12px;
      color: var(--el-color-primary);
    }
  }

  p {
    margin: 4px 0 0;
    font-size: 12px;
    line-height: 1.6;
    color: var(--el-text-color-secondary);
  }
}
</style>
