<template>
  <section class="about-panel">
    <h3 class="about-panel-title">访问数据</h3>
    <ProChart v-if="chartData.length" custom-class="visit-chart" :options="visitorOption" />
    <div v-else class="visit-chart visit-empty">暂无访问数据</div>
  </section>
</template>

<script setup lang="ts">
import type { EChartsOption } from 'echarts'
import { useVisitorStats } from '@/hooks/useVisitorStats'

/** 访客统计数据：由根组件统一抓取，关于页只订阅展示 */
const { stats } = useVisitorStats()

/** 图表数据项：类目名与数值成对，供横轴数值与纵轴类目各取一列 */
interface ChartItem {
  name: string
  value: number
}

/**
 * 把统计文本转成图表可用的数值
 *
 * widget 返回的数值可能带千分位分隔符，统一剔除后转换，非法内容按 0 处理
 *
 * @param value 统计项原始文本
 * @returns 数值形式的统计量
 */
function parseStatValue(value: string): number {
  const parsed = Number(value.replace(/,/g, ''))
  return Number.isNaN(parsed) ? 0 : parsed
}

/** 图表数据：标签作为类目，数值作为条形长度，避免在 options 中重复计算 */
const chartData = computed<ChartItem[]>(() => stats.value.map((item) => ({ name: item.label, value: parseStatValue(item.value) })))

/**
 * 访问数据横向条形图配置
 *
 * 统计项名称较长且各项量级差异大，横向条形让类目完整可读并避免数值被压平；
 * 边距一律用百分比，轴标签由 ECharts 6 的 grid.outerBounds 默认留位，文字色省略交由主题默认值适配
 */
const visitorOption = computed<EChartsOption>(() => ({
  tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
  grid: { top: '6%', right: '12%', bottom: '6%', left: '4%' },
  // 移动端容器窄，数值刻度会相互重叠，交由 ECharts 隐藏冲突标签（不重叠时不隐藏，桌面端表现不变）
  xAxis: { type: 'value', axisLabel: { hideOverlap: true } },
  yAxis: { type: 'category', inverse: true, data: chartData.value.map((item) => item.name) },
  series: [
    {
      type: 'bar',
      barWidth: 14,
      itemStyle: { borderRadius: [0, 7, 7, 0] },
      label: { show: true, position: 'right' },
      data: chartData.value.map((item) => item.value),
    },
  ],
}))
</script>

<style lang="scss" scoped>
/* 访问数据图表容器：与分类分布等高，移动端同步收紧 */
.visit-chart {
  height: 320px;
}

.visit-empty {
  display: grid;
  place-items: center;
  font-size: 13px;
  color: var(--el-text-color-secondary);
}

html[data-device='mobile'] {
  .visit-chart {
    height: 260px;
  }
}
</style>
