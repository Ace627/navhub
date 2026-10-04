<template>
  <div class="app-content flex flex-col gap-16px">
    <!-- 站点介绍 -->
    <section class="hero">
      <img class="hero-logo" src="/favicon.svg" alt="logo" draggable="false" referrerpolicy="no-referrer" />
      <div class="hero-info">
        <h2 class="hero-title">{{ siteTitle }}</h2>
        <p class="hero-desc">一个干净、无广告的个人上网导航，收录日常高频使用的影视、软件、学习与网盘资源站点，让好网站一眼就能找到。</p>
        <button type="button" class="qq-btn" @click="copyQQ">
          <SvgIcon name="About" :size="16" />
          <span>QQ 交流群：{{ qqGroup }} </span>
          <em>点击复制</em>
        </button>
      </div>
    </section>

    <!-- 数据统计 -->
    <section class="stat-grid">
      <div v-for="stat in statList" :key="stat.label" class="stat-card">
        <strong>{{ stat.value }}</strong>
        <span>{{ stat.label }}</span>
      </div>
    </section>

    <!-- 分类分布 -->
    <section class="panel">
      <h3 class="panel-title">分类分布</h3>
      <ProChart custom-class="chart-box" :options="categoryOption" />
    </section>

    <!-- 免责声明 -->
    <section class="panel">
      <h3 class="panel-title">免责声明</h3>
      <ul class="notice-list">
        <li>本站仅为个人收藏的网址导航，所有收录站点均来自互联网公开渠道，与本站无任何隶属关系。</li>
        <li>各站点的内容、服务及安全性由其运营方自行负责，使用过程中请自行甄别，注意个人信息与财产安全。</li>
        <li>如收录站点侵犯了您的合法权益，或您不希望被本站收录，可通过交流群联系，核实后将于 24 小时内移除。</li>
      </ul>
    </section>
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: 'About' })
import { EXTERNAL_DASHBOARD_COUNT } from '@/views/dashboard/dashboard.config'
import { EXTERNAL_TOOL_COUNT } from '@/views/tool/tool.config'
import { EXTERNAL_STUDY_COUNT } from '@/views/study/study.config'
import { EXTERNAL_SOFTWARE_COUNT } from '@/views/software/software.config'
import { EXTERNAL_WALLPAPER_COUNT } from '@/views/wallpaper/wallpaper.config'
import { EXTERNAL_FRONTEND_COUNT } from '@/views/frontend/frontend.config'
import { EXTERNAL_AI_COUNT } from '@/views/ai/ai.config'
import type { EChartsOption } from 'echarts'

/** 站点名称，取自环境变量，与侧栏 logo 处一致 */
const siteTitle = import.meta.env.VITE_APP_TITLE

/** QQ 交流群号 */
const qqGroup = '486011286'

/** 收录站点总数，由数据源直接推导：首页站点加上人工智能页、前端专家页、实用工具页、自我提升页、好软推荐页与精美壁纸页的外部站点 */
const siteCount = EXTERNAL_DASHBOARD_COUNT + EXTERNAL_AI_COUNT + EXTERNAL_FRONTEND_COUNT + EXTERNAL_TOOL_COUNT + EXTERNAL_STUDY_COUNT + EXTERNAL_SOFTWARE_COUNT + EXTERNAL_WALLPAPER_COUNT

/** 分类分布数据：首页「影视资源」分类加上「人工智能」「前端专家」「实用工具」「自我提升」「好软推荐」「精美壁纸」各行，占比合计 100% */
const categoryStats = computed(() => [
  { name: '影视资源', value: EXTERNAL_DASHBOARD_COUNT },
  { name: '人工智能', value: EXTERNAL_AI_COUNT },
  { name: '前端专家', value: EXTERNAL_FRONTEND_COUNT },
  { name: '实用工具', value: EXTERNAL_TOOL_COUNT },
  { name: '自我提升', value: EXTERNAL_STUDY_COUNT },
  { name: '好软推荐', value: EXTERNAL_SOFTWARE_COUNT },
  { name: '精美壁纸', value: EXTERNAL_WALLPAPER_COUNT },
])

/**
 * 分类分布环形图配置
 *
 * 半径与圆心均按百分比设置，容器缩放时由 ProChart 的 ResizeObserver 联动自适应；
 * 图例使用 scroll 类型，移动端小屏分类过多时自动翻页
 */
const categoryOption = computed<EChartsOption>(() => ({
  color: ['#409eff', '#36cfc9', '#722ed1', '#eb2f96', '#faad14', '#52c41a', '#fa8c16', '#f5222d', '#2f54eb', '#13c2c2'],
  tooltip: { trigger: 'item', formatter: '{b}：{c} 个（{d}%）' },
  title: {
    text: `${siteCount}`,
    subtext: '收录站点',
    left: 'center',
    top: '32%',
    itemGap: 6,
    textStyle: { fontSize: 28, fontWeight: 600, color: '#303133' },
    subtextStyle: { fontSize: 12, color: '#909399' },
  },
  legend: {
    type: 'scroll',
    bottom: 0,
    icon: 'circle',
    itemWidth: 8,
    itemHeight: 8,
    itemGap: 16,
    textStyle: { fontSize: 12, color: '#606266' },
  },
  series: [
    {
      type: 'pie',
      radius: ['48%', '72%'],
      center: ['50%', '40%'],
      padAngle: 3,
      itemStyle: { borderRadius: 8 },
      label: { show: false },
      emphasis: { scaleSize: 6 },
      data: categoryStats.value,
    },
  ],
}))

/** 统计卡片数据：分类数由分类分布数据直接推导 */
const statList = computed(() => [
  { label: '站点分类', value: categoryStats.value.length },
  { label: '收录站点', value: siteCount },
  { label: '交流群号', value: qqGroup },
])

/**
 * 复制 QQ 群号到剪贴板，并弹出结果提示
 *
 * 剪贴板 API 不可用（非安全上下文等）时降级为 execCommand 方案
 */
async function copyQQ() {
  try {
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(qqGroup)
    } else {
      const input = document.createElement('textarea')
      input.value = qqGroup
      document.body.appendChild(input)
      input.select()
      document.execCommand('copy')
      input.remove()
    }
    ElMessage.success(`群号 ${qqGroup} 已复制，欢迎加入交流`)
  } catch {
    ElMessage.error('复制失败，请手动复制群号')
  }
}
</script>

<style lang="scss" scoped>
/* 站点介绍区 */
.hero {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 24px;
  background-color: var(--el-bg-color);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 8px;
}

.hero-logo {
  width: 72px;
  height: 72px;
  flex-shrink: 0;
}

.hero-title {
  margin: 0 0 8px;
  font-size: 22px;
  font-weight: 600;
}

.hero-desc {
  margin: 0 0 14px;
  font-size: 14px;
  line-height: 1.7;
  color: var(--el-text-color-secondary);
}

.qq-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border: 1px solid var(--el-color-primary);
  border-radius: 6px;
  font-size: 14px;
  color: var(--n-color-primary);
  background-color: transparent;
  cursor: pointer;
  transition:
    background-color var(--n-transition-duration-fast),
    box-shadow var(--n-transition-duration-fast);

  &:hover {
    background-color: var(--el-color-primary-light-9);
    box-shadow: 0 2px 8px rgb(0 0 0 / 8%);
  }

  em {
    font-style: normal;
    font-size: 12px;
    color: var(--el-text-color-secondary);
  }
}

/* 统计卡片区 */
.stat-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.stat-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 20px 16px;
  background-color: var(--el-bg-color);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 8px;

  strong {
    font-size: 26px;
    font-weight: 600;
    color: var(--n-color-primary);
  }

  span {
    font-size: 13px;
    color: var(--el-text-color-secondary);
  }
}

/* 通用面板 */
.panel {
  padding: 20px 24px;
  background-color: var(--el-bg-color);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 8px;
}

.panel-title {
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
    background-color: var(--n-color-primary);
  }
}

/* 分类分布图表容器 */
.chart-box {
  height: 320px;
}

/* 免责声明 */
.notice-list {
  margin: 0;
  padding-left: 20px;
  font-size: 13px;
  line-height: 2;
  color: var(--el-text-color-secondary);
}

html[data-device='mobile'] {
  .hero {
    flex-direction: column;
    text-align: center;
    padding: 20px 16px;
  }

  .hero-desc {
    margin-bottom: 12px;
  }

  .stat-grid {
    gap: 8px;
  }

  .stat-card {
    padding: 12px 8px;

    strong {
      font-size: 20px;
    }
  }

  .panel {
    padding: 16px;
  }

  .chart-box {
    height: 260px;
  }
}
</style>
