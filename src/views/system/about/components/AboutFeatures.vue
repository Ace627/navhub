<template>
  <section class="about-panel">
    <h3 class="about-panel-title">功能特性</h3>
    <div class="feature-grid">
      <div v-for="feature in FEATURE_LIST" :key="feature.title" class="feature-card">
        <div class="feature-icon">
          <SvgIcon :name="feature.icon" :size="18" />
        </div>
        <div class="feature-body">
          <strong>{{ feature.title }}</strong>
          <p>{{ feature.desc }}</p>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { FEATURE_LIST } from '../about.config'
</script>

<style lang="scss" scoped>
/* 功能特性区：桌面端 2×2 网格，与左侧分类分布等高拼排 */
.feature-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.feature-card {
  display: flex;
  gap: 12px;
  padding: 14px;
  background-color: var(--el-fill-color-light);
  border-radius: 8px;
  transition:
    background-color var(--el-transition-duration-fast),
    transform var(--el-transition-duration-fast);

  &:hover {
    background-color: var(--el-color-primary-light-9);
    transform: translateY(-2px);
  }

  .feature-icon {
    display: grid;
    flex-shrink: 0;
    place-items: center;
    width: 36px;
    height: 36px;
    color: var(--el-color-primary);
    background-color: var(--el-bg-color);
    border-radius: 10px;
  }

  .feature-body {
    display: flex;
    flex-direction: column;
    gap: 4px;

    strong {
      font-size: 14px;
      color: var(--el-text-color-primary);
    }

    p {
      margin: 0;
      font-size: 12px;
      line-height: 1.6;
      color: var(--el-text-color-secondary);
    }
  }
}

html[data-device='mobile'] {
  .feature-grid {
    grid-template-columns: 1fr;
    gap: 8px;
  }
}
</style>
