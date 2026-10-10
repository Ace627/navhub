<template>
  <div class="app-content flex flex-col gap-16px">
    <!-- 站点介绍 -->
    <section class="hero">
      <div class="hero-logo-wrap">
        <img class="hero-logo" :src="IMG_FAVICON" alt="logo" draggable="false" referrerpolicy="no-referrer" />
      </div>
      <div class="hero-info">
        <h2 class="hero-title">{{ siteTitle }}</h2>
        <p class="hero-desc">一个干净、无广告的个人上网导航，收录日常高频使用的影视、软件、学习与网盘资源站点，让好网站一眼就能找到。</p>
        <p class="hero-uptime">
          <span>已运行 {{ uptimeText }}</span>
        </p>
      </div>
    </section>

    <!-- 数据统计 -->
    <section class="stat-grid">
      <div v-for="stat in statList" :key="stat.label" class="stat-card" :class="{ 'is-copyable': stat.copyText }" @click="handleCopyStat(stat)">
        <strong>{{ stat.value }}</strong>
        <span>{{ stat.label }}</span>
      </div>
    </section>

    <!-- 分类分布 -->
    <section class="panel">
      <h3 class="panel-title">分类分布</h3>
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

    <!-- 功能特性 -->
    <section class="panel">
      <h3 class="panel-title">功能特性</h3>
      <div class="feature-grid">
        <div v-for="feature in featureList" :key="feature.title" class="feature-card">
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

    <!-- 技术栈 -->
    <section class="panel">
      <h3 class="panel-title">技术栈</h3>
      <div class="tech-grid">
        <div v-for="tech in techList" :key="tech.name" class="tech-card">
          <div class="tech-head">
            <strong>{{ tech.name }}</strong>
            <span>{{ tech.version }}</span>
          </div>
          <p>{{ tech.desc }}</p>
        </div>
      </div>
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
import type { EChartsOption } from 'echarts'
import dayjs from 'dayjs'
import { SiteRequest } from '@/api/site.request'
import { IMG_FAVICON } from '@/common/constant/image.constant'

/** 站点名称，取自环境变量，与侧栏 logo 处一致 */
const siteTitle = import.meta.env.VITE_APP_TITLE

/** 统计卡片项：copyText 有值时卡片可点击复制 */
interface StatItem {
  label: string
  value: string
  copyText?: string
}

/** 站点上线时间，运行时长的起算点，随站点的正式对外时间维护 */
const SITE_LAUNCH_TIME = '2026-09-30'

/** 当前时间，每秒刷新，用于驱动运行时长展示 */
const now = ref(new Date())

/** 运行时长的刷新定时器，组件卸载时清理 */
let uptimeTimer: ReturnType<typeof setInterval>

onMounted(() => {
  uptimeTimer = setInterval(() => (now.value = new Date()), 1000)
})

onUnmounted(() => clearInterval(uptimeTimer))

/**
 * 计算站点已运行时长文案
 *
 * 年、月按自然月推进（dayjs 差值已做月末修正），不足整月的部分即为天数；
 * 上线时间取当日零点，故时分秒直接取当前时刻
 */
const uptimeText = computed(() => {
  const current = dayjs(now.value)
  const launch = dayjs(SITE_LAUNCH_TIME)
  const years = current.diff(launch, 'year')
  const months = current.diff(launch.add(years, 'year'), 'month')
  const days = current.diff(launch.add(years, 'year').add(months, 'month'), 'day')
  return `${years} 年 ${padTwo(months)} 月 ${padTwo(days)} 天 ${padTwo(current.hour())} 时 ${padTwo(current.minute())} 分 ${padTwo(current.second())} 秒`
})

/**
 * 将数值补零为两位字符串
 *
 * 运行时长的月、日、时、分、秒统一按两位展示，避免个位数与时钟式阅读习惯错位
 *
 * @param value 待补零的数值
 * @returns 不足两位时前面补 0 的字符串
 */
function padTwo(value: number) {
  return String(value).padStart(2, '0')
}

/** 系统帧率，由 requestAnimationFrame 采样，原右上角展示迁移至此 */
const fps = useFps()

/** QQ 交流群号 */
const qqGroup = '486011286'

/** 图表调色板：canvas 内无法解析 CSS 变量，统一写具体色值，饼图与分类明细列表共用 */
const CHART_COLORS = ['#409eff', '#36cfc9', '#722ed1', '#eb2f96', '#faad14', '#52c41a', '#fa8c16', '#f5222d', '#2f54eb', '#13c2c2']

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

/**
 * 计算单个分类的收录占比，保留一位小数
 *
 * 供分类明细列表展示，与饼图 tooltip 的百分比口径一致
 */
function getCategoryPercent(value: number) {
  return `${((value / siteCount.value) * 100).toFixed(1)}%`
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
    text: `${siteCount.value}`,
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
      data: categoryStats.value,
    },
  ],
}))

/** 统计卡片数据：分类数由分类分布数据直接推导，交流群号支持点击复制 */
const statList = computed<StatItem[]>(() => [
  { label: '站点分类', value: `${categoryStats.value.length}` },
  { label: '收录站点', value: `${siteCount.value}` },
  { label: '交流群号', value: qqGroup, copyText: qqGroup },
  { label: '系统帧率', value: `${fps.value}` },
])

/** 功能特性数据：均为站内已实现的真实能力 */
const featureList = [
  { icon: 'Moon', title: '暗色模式', desc: '明暗主题一键切换，图表配色自动适配' },
  { icon: 'Search', title: '快捷搜索', desc: 'Ctrl K 唤起全站搜索，按名称或描述定位站点' },
  { icon: 'Expand', title: '移动适配', desc: '小屏自动切换布局，移动端独立优化交互' },
  { icon: 'Sunny', title: '帧率监测', desc: 'requestAnimationFrame 实时采样渲染帧率' },
]

/** 技术栈数据：与 package.json 实际依赖保持一致 */
const techList = [
  { name: 'Vue', version: '3.5', desc: '渐进式前端框架' },
  { name: 'TypeScript', version: '6.0', desc: '类型安全的 JavaScript' },
  { name: 'Vite', version: '8.3', desc: '下一代前端构建工具' },
  { name: 'Element Plus', version: '2.14', desc: '桌面端 UI 组件库' },
  { name: 'ECharts', version: '6.1', desc: '数据可视化图表库' },
  { name: 'Pinia', version: '4.0', desc: '直观的类型安全状态管理' },
  { name: 'UnoCSS', version: '66.10', desc: '即时按需原子化 CSS 引擎' },
]

/**
 * 复制文本到剪贴板，并弹出结果提示
 *
 * 剪贴板 API 不可用（非安全上下文等）时降级为 execCommand 方案
 */
async function copyText(text: string, message: string) {
  try {
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(text)
    } else {
      const input = document.createElement('textarea')
      input.value = text
      document.body.appendChild(input)
      input.select()
      document.execCommand('copy')
      input.remove()
    }
    ElMessage.success(message)
  } catch {
    ElMessage.error('复制失败，请手动复制')
  }
}

/**
 * 点击统计卡片时复制该项的值
 *
 * 仅带 copyText 的卡片有复制能力，其余卡片点击不做处理，避免无意义反馈
 */
function handleCopyStat(stat: StatItem) {
  if (!stat.copyText) return
  copyText(stat.copyText, `${stat.label}已复制`)
}
</script>

<style lang="scss" scoped>
/* 站点介绍区 */
.hero {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 24px;
  background: linear-gradient(135deg, var(--el-color-primary-light-9) 0%, var(--el-bg-color) 60%);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 8px;
}

.hero-logo-wrap {
  display: grid;
  flex-shrink: 0;
  place-items: center;
  width: 80px;
  height: 80px;
  background-color: var(--el-bg-color);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 20px;
  box-shadow: 0 6px 18px rgb(0 0 0 / 10%);
}

.hero-logo {
  width: 52px;
  height: 52px;
}

.hero-title {
  margin: 0 0 8px;
  font-size: 22px;
  font-weight: 600;
}

.hero-desc {
  font-size: 14px;
  line-height: 1.5;
  color: var(--el-text-color-secondary);
}

.hero-uptime {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin: 0;
  font-size: 14px;
  font-weight: bold;
  color: var(--el-color-primary);
}

/* 统计卡片区 */
.stat-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.stat-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 20px 16px;
  background-color: var(--el-bg-color);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 8px;
  transition:
    transform var(--el-transition-duration-fast),
    box-shadow var(--el-transition-duration-fast),
    border-color var(--el-transition-duration-fast);

  &:hover {
    border-color: var(--el-color-primary-light-5);
    box-shadow: 0 4px 12px rgb(0 0 0 / 8%);
    transform: translateY(-2px);
  }

  strong {
    font-size: 26px;
    font-weight: 600;
    color: var(--el-text-color-primary);
  }

  span {
    font-size: 13px;
    color: var(--el-text-color-secondary);
  }

  /* 可复制卡片：光标与 user-select 区分于只读卡片 */
  &.is-copyable {
    cursor: pointer;
    user-select: none;
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
    background-color: var(--el-color-primary);
  }
}

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

/* 分类分布图表容器 */
.chart-box {
  height: 320px;
}

/* 功能特性区 */
.feature-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
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

/* 技术栈区 */
.tech-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
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
    padding: 20px 16px;
    text-align: center;
  }

  .hero-desc {
    margin-bottom: 12px;
  }

  .hero-uptime {
    justify-content: center;
  }

  .stat-grid {
    grid-template-columns: repeat(2, 1fr);
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

  .category-wrap {
    grid-template-columns: 1fr;
    gap: 8px;
  }

  .chart-box {
    height: 260px;
  }

  .feature-grid {
    grid-template-columns: 1fr;
    gap: 8px;
  }

  .tech-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;
  }
}
</style>
