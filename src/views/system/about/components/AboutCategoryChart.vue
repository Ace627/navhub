<template>
  <section class="about-panel">
    <div class="panel-head">
      <h3 class="about-panel-title">分类分布</h3>
      <p class="panel-total">
        <strong>{{ siteCount }}</strong>
        <span>收录站点</span>
      </p>
    </div>
    <ProChart custom-class="chart-box" :options="categoryOption" />
  </section>
</template>

<script setup lang="ts">
import type { EChartsOption } from 'echarts'

/** 分类分布数据入参 */
interface Props {
  /** 各分类的外部站点数量，占比合计 100% */
  categoryStats: { name: string; value: number }[]
  /** 收录站点总数，展示于面板右上角 */
  siteCount: number
}

const props = defineProps<Props>()

const appStore = useAppStore()

/** 图表调色板：canvas 内无法解析 CSS 变量，统一写具体色值 */
const CHART_COLORS = ['#409eff', '#36cfc9', '#722ed1', '#eb2f96', '#faad14', '#52c41a', '#fa8c16', '#f5222d', '#2f54eb', '#13c2c2']

/**
 * 分类分布实心饼图配置
 *
 * 收录总数改由面板右上角承载，图表本身回归实心以留出更大的绘制面积；
 * 数量与占比由扇区外圈标签给出，不再在图表外另起明细列表；
 * 半径与圆心均按百分比设置，容器缩放时由 ProChart 的 ResizeObserver 联动自适应；
 * 图例使用 scroll 类型，移动端小屏分类过多时自动翻页；
 * 移动端容器窄，完整标签会顶出面板边界，故收敛为占比并相应缩小半径
 */
const categoryOption = computed<EChartsOption>(() => ({
  color: CHART_COLORS,
  tooltip: { trigger: 'item', formatter: '{b}：{c} 个（{d}%）' },
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
      radius: appStore.isMobile ? '52%' : '58%',
      center: ['50%', '42%'],
      // 标签与 tooltip 的占比统一保留一位小数，与页面既有展示口径一致
      percentPrecision: 1,
      padAngle: 3,
      itemStyle: { borderRadius: 8 },
      label: { show: true, formatter: appStore.isMobile ? '{d}%' : '{c} 个 · {d}%' },
      labelLine: { length: 8, length2: 8 },
      emphasis: { scaleSize: 6 },
      data: props.categoryStats,
    },
  ],
}))
</script>

<style lang="scss" scoped>
/* 面板头部：标题靠左，收录总数对齐到右上角 */
.panel-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;

  .about-panel-title {
    margin-bottom: 0;
  }
}

.panel-total {
  display: flex;
  align-items: baseline;
  gap: 6px;
  margin: 0;

  strong {
    font-size: 20px;
    font-weight: 600;
    color: var(--el-text-color-primary);
  }

  span {
    font-size: 12px;
    color: var(--el-text-color-secondary);
  }
}

/* 分类分布图表容器：移动端收紧高度，其余尺寸交给 options 的百分比配置自适应 */
.chart-box {
  height: 320px;
}

html[data-device='mobile'] {
  .chart-box {
    height: 260px;
  }
}
</style>
