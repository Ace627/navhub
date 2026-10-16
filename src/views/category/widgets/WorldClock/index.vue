<template>
  <div class="app-content app-content--fill">
    <div class="tool-container">
      <!-- 本地时间主视觉：轻玻璃大卡 + 漂浮光斑 -->
      <div class="hero-card">
        <div class="blob blob-1" />
        <div class="blob blob-2" />

        <div class="hero-body">
          <span class="hero-date">{{ localDateText }}</span>
          <div class="local-time">{{ localTimeText }}</div>
          <span class="hero-zone">本机时区 UTC{{ localOffsetText }}</span>
        </div>
      </div>

      <!-- 世界主要城市：网格卡片，圆点区分昼夜，跨天时展示相对日徽标 -->
      <div class="city-grid">
        <div v-for="row in cityRows" :key="row.timeZone" class="city-card">
          <div class="city-head">
            <span class="city-name">{{ row.name }}</span>
            <span class="day-dot" :class="{ night: row.isNight }" />
          </div>
          <div class="city-time">{{ row.time }}</div>
          <div class="city-meta">
            <span>{{ row.dateText }}</span>
            <span class="meta-divider">|</span>
            <span>{{ row.diffText }}</span>
          </div>
        </div>
      </div>

      <div class="tip-row flex-center">
        <el-text type="info">时间取自本机时钟并按城市时区换算，自动处理夏令时</el-text>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: 'ToolWorldClock' })

/** 城市条目结构：展示名 + IANA 时区名（换算与夏令时均由 Intl 处理） */
interface CityItem {
  name: string
  timeZone: string
}

/** 城市行渲染结构 */
interface CityRow extends CityItem {
  time: string
  dateText: string
  diffText: string
  isNight: boolean
}

/** 世界主要城市清单 */
const CITY_LIST: CityItem[] = [
  { name: '北京', timeZone: 'Asia/Shanghai' },
  { name: '东京', timeZone: 'Asia/Tokyo' },
  { name: '新加坡', timeZone: 'Asia/Singapore' },
  { name: '悉尼', timeZone: 'Australia/Sydney' },
  { name: '伦敦', timeZone: 'Europe/London' },
  { name: '巴黎', timeZone: 'Europe/Paris' },
  { name: '纽约', timeZone: 'America/New_York' },
  { name: '洛杉矶', timeZone: 'America/Los_Angeles' },
]

/** 一天的毫秒数 */
const DAY_MS = 86400000

/** 各城市格式化器缓存：key 为时区名，避免每秒 tick 重复创建 Intl 实例 */
const cityFormatterMap = new Map<string, { time: Intl.DateTimeFormat; date: Intl.DateTimeFormat; parts: Intl.DateTimeFormat }>()

/** 本机时刻明细格式化器：与城市同规格输出年月日时分，用于计算时差 */
const localPartsFormatter = new Intl.DateTimeFormat('en-US', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' })

/** 每秒刷新定时器句柄 */
let timer: ReturnType<typeof setInterval> | undefined

/** 当前时间，每秒刷新一次驱动整页时钟 */
const now = ref(new Date())

/** 本地时间展示串：HH:mm:ss（24 小时制） */
const localTimeText = computed(() => new Intl.DateTimeFormat('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23' }).format(now.value))

/** 本地日期展示串：如 10月12日 星期一 */
const localDateText = computed(() => new Intl.DateTimeFormat('zh-CN', { month: 'long', day: 'numeric', weekday: 'long' }).format(now.value))

/** 本机 UTC 偏移展示串：如 +8 / -5.5 */
const localOffsetText = computed(() => {
  const offset = -now.value.getTimezoneOffset() / 60
  return `${offset >= 0 ? '+' : '-'}${Math.abs(offset)}`
})

/** 城市行集合：随每秒 tick 重算时间/日期/快慢时差与昼夜状态 */
const cityRows = computed<CityRow[]>(() => {
  const localInfo = getZoneInfo(localPartsFormatter.formatToParts(now.value))
  return CITY_LIST.map((city) => {
    const formatters = getCityFormatters(city.timeZone)
    const timeText = formatters.time.format(now.value)
    const zoneInfo = getZoneInfo(formatters.parts.formatToParts(now.value))
    return {
      ...city,
      time: timeText,
      dateText: formatters.date.format(now.value),
      diffText: getDiffText(getMinuteDiff(zoneInfo, localInfo)),
      isNight: Number(timeText.slice(0, 2)) < 6 || Number(timeText.slice(0, 2)) >= 18,
    }
  })
})

/**
 * 获取指定时区的格式化器集合，首次访问时创建并缓存
 * @param timeZone IANA 时区名
 */
function getCityFormatters(timeZone: string) {
  let formatters = cityFormatterMap.get(timeZone)
  if (!formatters) {
    formatters = {
      time: new Intl.DateTimeFormat('zh-CN', { timeZone, hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }),
      date: new Intl.DateTimeFormat('zh-CN', { timeZone, month: 'long', day: 'numeric' }),
      parts: new Intl.DateTimeFormat('en-US', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }),
    }
    cityFormatterMap.set(timeZone, formatters)
  }
  return formatters
}

/**
 * 从 formatToParts 结果提取日期串与当日分钟数
 * @param parts Intl 格式化分片结果
 */
function getZoneInfo(parts: Intl.DateTimeFormatPart[]) {
  const values: Record<string, string> = {}
  for (const part of parts) values[part.type] = part.value
  return {
    dateStr: `${values.year}/${values.month}/${values.day}`,
    minuteOfDay: Number(values.hour) * 60 + Number(values.minute),
  }
}

/**
 * 计算城市时刻相对本地时刻的分钟差（当日时刻差 + 相差天数折算，跨换日线的城市也正确）
 * @param zoneInfo 城市侧时刻明细
 * @param localInfo 本机侧时刻明细
 */
function getMinuteDiff(zoneInfo: { dateStr: string; minuteOfDay: number }, localInfo: { dateStr: string; minuteOfDay: number }) {
  const dayDiff = Math.round((Date.parse(zoneInfo.dateStr) - Date.parse(localInfo.dateStr)) / DAY_MS)
  return dayDiff * 1440 + zoneInfo.minuteOfDay - localInfo.minuteOfDay
}

/**
 * 时差展示串：城市比本地早为「快」、晚为「慢」；非整小时时差保留小数
 * @param diffMinutes 城市相对本地的分钟差
 */
function getDiffText(diffMinutes: number) {
  if (diffMinutes === 0) return '同时区'
  const hours = diffMinutes / 60
  return `${hours > 0 ? '快' : '慢'}${parseFloat(Math.abs(hours).toFixed(2))}小时`
}

onMounted(() => {
  timer = setInterval(() => {
    now.value = new Date()
  }, 1000)
})

onBeforeUnmount(() => {
  clearInterval(timer)
})
</script>

<style lang="scss" scoped>

.tool-container {
  width: 640px;
  margin: 0 auto;
}

/* 轻玻璃主卡：半透明白卡融入浅色页面，柔和光斑漂浮 */
.hero-card {
  position: relative;
  overflow: hidden;
  padding: 36px 24px 32px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.55);
  backdrop-filter: blur(10px);
  border: 1px solid var(--el-border-color-lighter);
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.08);
  animation: rise-enter 0.6s cubic-bezier(0.22, 1, 0.36, 1) both;
}

.city-grid {
  gap: 12px;
  margin-top: 16px;
  animation: rise-enter 0.6s 0.15s cubic-bezier(0.22, 1, 0.36, 1) both;
}

.tip-row {
  margin-top: 16px;
}

@keyframes rise-enter {
  from {
    opacity: 0;
    transform: translateY(24px) scale(0.97);
  }
  to {
    opacity: 1;
    transform: none;
  }
}

.blob {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.25;
  animation: blob-float 12s ease-in-out infinite;
}

.blob-1 {
  top: -80px;
  left: -60px;
  width: 260px;
  height: 260px;
  background: var(--el-color-primary);
}

.blob-2 {
  right: -40px;
  bottom: -90px;
  width: 220px;
  height: 220px;
  background: var(--el-color-warning);
  opacity: 0.15;
  animation-delay: -6s;
}

@keyframes blob-float {
  0%,
  100% {
    transform: translate(0, 0) scale(1);
  }
  50% {
    transform: translate(30px, -20px) scale(1.15);
  }
}

.hero-body {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.hero-date {
  font-size: 16px;
  color: var(--el-text-color-regular);
  letter-spacing: 2px;
}

.local-time {
  margin: 12px 0 8px;
  font-size: 64px;
  font-weight: bold;
  font-variant-numeric: tabular-nums;
  letter-spacing: 4px;
  color: var(--el-text-color-primary);
  text-shadow: 0 2px 12px rgba(64, 158, 255, 0.35);
}

.hero-zone {
  font-size: 13px;
  font-variant-numeric: tabular-nums;
  color: var(--el-text-color-secondary);
}

.city-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
}

.city-card {
  padding: 14px 14px 12px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.55);
  backdrop-filter: blur(10px);
  border: 1px solid var(--el-border-color-lighter);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05);
}

.city-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.city-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

/* 昼夜圆点：白天暖黄、夜晚蓝，直观区分各城市此刻昼夜 */
.day-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--el-color-warning);
  box-shadow: 0 0 6px rgba(230, 162, 60, 0.6);

  &.night {
    background: var(--el-color-primary);
    box-shadow: 0 0 6px rgba(64, 158, 255, 0.6);
  }
}

.city-time {
  margin: 6px 0 4px;
  font-size: 24px;
  font-weight: bold;
  font-variant-numeric: tabular-nums;
  color: var(--el-text-color-primary);
}

.city-meta {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

/* 日期与时差之间的分隔竖线 */
.meta-divider {
  color: var(--el-border-color);
}

/* 用户偏好减少动效时停用全部动画与过渡 */
@media (prefers-reduced-motion: reduce) {
  .blob,
  .hero-card,
  .city-grid {
    animation: none;
  }
}

/* 深色模式：硬编码浅玻璃底改为深色融入，避免暗色页面里卡片发白发灰 */
html.dark {
  .hero-card,
  .city-card {
    background: color-mix(in srgb, var(--el-bg-color) 55%, transparent);
  }
}

/* 移动端：大卡与网格收窄，城市改两列排布 */
html[data-device='mobile'] {
  .app-content {
    padding: 8px;
  }
  .tool-container {
    width: 100%;
  }
  .hero-card {
    padding: 24px 12px 20px;
  }
  .local-time {
    font-size: 44px;
  }
  .city-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;
  }
}
</style>
