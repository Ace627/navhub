<template>
  <div class="app-content about-grid">
    <AboutHero class="area-hero" />
    <AboutStats class="area-stats" :category-count="categoryStats.length" :site-count="siteCount" />
    <AboutCategoryChart class="area-chart" :category-stats="categoryStats" :site-count="siteCount" />
    <AboutFeatures class="area-feature" />
    <AboutTechStack class="area-tech" />
    <AboutChangelog class="area-log" />
    <AboutNotice class="area-notice" />
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: 'About' })
import { SiteRequest } from '@/api/site.request'
import AboutHero from './components/AboutHero.vue'
import AboutStats from './components/AboutStats.vue'
import AboutCategoryChart from './components/AboutCategoryChart.vue'
import AboutFeatures from './components/AboutFeatures.vue'
import AboutTechStack from './components/AboutTechStack.vue'
import AboutChangelog from './components/AboutChangelog.vue'
import AboutNotice from './components/AboutNotice.vue'

/** 收录站点总数：仅统计外部站点，挂载后由数据接口拉取更新 */
const siteCount = ref(0)

/** 分类分布数据：各分类的外部站点数量，挂载后由数据接口拉取更新，占比合计 100% */
const categoryStats = ref<{ name: string; value: number }[]>([])

/**
 * 拉取站点统计数据：分类列表提供分布维度，外部站点列表提供总量与各分类计数
 */
async function fetchStats() {
  const [categories, sites] = await Promise.all([SiteRequest.findCategoryList(), SiteRequest.findSiteList({ isExternal: true })])
  siteCount.value = sites.length
  categoryStats.value = categories.map((category) => ({ name: category.title, value: sites.filter((site) => site.categoryId === category.id).length }))
}

onMounted(fetchStats)
</script>

<style lang="scss" scoped>
/* 关于页 Bento 布局：4 列网格按区域编排各板块 */
.about-grid {
  display: grid;
  grid-template-areas:
    'hero hero hero hero'
    'stats stats stats stats'
    'chart chart feature feature'
    'tech tech tech log'
    'notice notice notice notice';
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;
}

.area-hero {
  grid-area: hero;
}

.area-stats {
  grid-area: stats;
}

.area-chart {
  grid-area: chart;
}

.area-feature {
  grid-area: feature;
}

.area-tech {
  grid-area: tech;
}

.area-log {
  grid-area: log;
}

.area-notice {
  grid-area: notice;
}

html[data-device='mobile'] {
  .about-grid {
    grid-template-areas:
      'hero'
      'stats'
      'chart'
      'feature'
      'tech'
      'log'
      'notice';
    grid-template-columns: 1fr;
    gap: 8px;
  }
}
</style>

<style lang="scss">
/* 板块通用面板样式：供各板块组件根节点复用，经 .about-grid 后代选择器限定作用范围 */
.about-grid {
  .about-panel {
    padding: 20px 24px;
    background-color: var(--el-bg-color);
    border: 1px solid var(--el-border-color-lighter);
    border-radius: 8px;
  }

  .about-panel-title {
    position: relative;
    margin: 0 0 16px;
    padding-left: 10px;
    font-size: 16px;
    font-weight: 600;

    &::before {
      content: '';
      position: absolute;
      left: 0;
      top: 50%;
      transform: translateY(-50%);
      width: 4px;
      height: 16px;
      border-radius: 2px;
      background-color: var(--el-color-primary);
    }
  }
}

html[data-device='mobile'] .about-grid .about-panel {
  padding: 16px;
}
</style>
