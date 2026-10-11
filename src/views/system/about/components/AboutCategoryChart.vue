<template>
  <section class="about-panel">
    <h3 class="about-panel-title">分类分布</h3>
    <div class="category-wrap">
      <ProChart custom-class="chart-box" :options="categoryOption" />
      <ul class="category-list">
        <li v-for="(item, index) in categoryStats" :key="item.name">
          <i class="cat-dot" :style="{ backgroundColor: CHART_COLORS[index] }" />
          <span class="cat-name">{{ item.name }}</span>
          <span class="cat-value">{{ item.value }} 个</span>
          <em class="cat-percent">{{ getCategoryPercent(item.value) }}</em>
        </li>
      </ul>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { EChartsOption } from 'echarts'

/** 分类分布数据入参 */
interface Props {
  /** 各分类的外部站点数量，占比合计 100% */
  categoryStats: { name: string; value: number }[]
  /** 收录站点总数，用于计算占比 */
  siteCount: number
}

const props = defineProps<Props>()

/** 图表调色板：canvas 内无法解析 CSS 变量，统一写具体色值，饼图与分类明细列表共用 */
const CHART_COLORS = ['#409eff', '#36cfc9', '#722ed1', '#eb2f96', '#faad14', '#52c41a', '#fa8c16', '#f5222d', '#2f54eb', '#13c2c2']

/**
 * 计算单个分类的收录占比，保留一位小数
 *
 * 供分类明细列表展示，与饼图 tooltip 的百分比口径一致
 *
 * @param value 该分类的站点数量
 * @returns 形如 12.5% 的占比文案
 */
function getCategoryPercent(value: number) {
  return `${((value / props.siteCount) * 100).toFixed(1)}%`
}

/**
 * 分类分布环形图配置
 *
 * 半径与圆心均按百分比设置，容器缩放时由 ProChart 的 ResizeObserver 联动自适应；
 * 图例使用 scroll 类型，移动端小屏分类过多时自动翻页
 */
const categoryOption = computed<EChartsOption>(() => ({
  color: CHART_COLORS,
  tooltip: { trigger: 'item', formatter: '{b}：{c} 个（{d}%）' },
  title: {
    text: `${props.siteCount}`,
    subtext: '收录站点',
    left: 'center',
    top: '32%',
    itemGap: 6,
    textStyle: { fontSize: 28, fontWeight: 600 },
    subtextStyle: { fontSize: 12 },
  },
  legend: {
    type: 'scroll',
    bottom: 0,
    icon: 'circle',
    itemWidth: 8,
    itemHeight: 8,
    itemGap: 16,
    textStyle: { fontSize: 12 },
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
      data: props.categoryStats,
    },
  ],
}))
</script>

<style lang="scss" scoped>
/* 分类分布区：桌面端左侧饼图 + 右侧明细列表 */
.category-wrap {
  display: grid;
  grid-template-columns: minmax(0, 1.1fr) minmax(0, 1fr);
  gap: 24px;
  align-items: center;
}

.category-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin: 0;
  padding: 0;
  list-style: none;

  li {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 8px 12px;
    font-size: 13px;
    border-radius: 6px;
    transition: background-color var(--el-transition-duration-fast);

    &:hover {
      background-color: var(--el-fill-color-light);
    }
  }

  .cat-dot {
    flex-shrink: 0;
    width: 8px;
    height: 8px;
    border-radius: 50%;
  }

  .cat-name {
    flex: 1;
    color: var(--el-text-color-primary);
  }

  .cat-value {
    color: var(--el-text-color-secondary);
  }

  .cat-percent {
    min-width: 52px;
    font-style: normal;
    color: var(--el-text-color-secondary);
    text-align: right;
  }
}

/* 分类分布图表容器：移动端收紧高度，其余尺寸交给 options 的百分比配置自适应 */
.chart-box {
  height: 320px;
}

html[data-device='mobile'] {
  .category-wrap {
    grid-template-columns: 1fr;
    gap: 8px;
  }

  .chart-box {
    height: 260px;
  }
}
</style>
