<template>
  <div class="app-content">
    <div class="tool-container">
      <!-- iOS 锁屏主视觉：灵动岛进度胶囊 + 日期 + 超大细体倒计时 -->
      <section class="lock-screen">
        <div class="island">
          <span class="island-label">今日进度</span>
          <span class="island-bar"><i :style="{ width: `${progress}%` }" /></span>
          <span class="island-pct">{{ progress.toFixed(2) }}%</span>
        </div>

        <span class="lock-date">{{ dateText }}</span>

        <!-- 倒计时主展示：超大细体数字直排，变化位 3D 翻牌，冒号呼吸闪烁 -->
        <div class="countdown-container">
          <template v-for="(char, index) in countdown" :key="index">
            <span v-if="char === ':'" class="colon">:</span>
            <div v-else class="digit-cell">
              <Transition name="digit-flip" mode="out-in">
                <span :key="char" class="digit flex-center">{{ char }}</span>
              </Transition>
            </div>
          </template>
        </div>

        <span class="status-text" :class="{ shine: isCounting }">{{ statusText }}</span>
      </section>

      <!-- 周 / 月 / 年 iOS 桌面小组件 -->
      <section class="widget-grid">
        <div v-for="item in timeProgressItems" :key="item.label" class="widget-card">
          <span class="widget-label">{{ item.label }}</span>
          <span class="widget-value">{{ item.value }}<i class="widget-unit">%</i></span>
          <el-progress class="widget-bar" type="line" :percentage="item.value" :stroke-width="6" :show-text="false" color="var(--el-color-primary)" />
        </div>
      </section>

      <section class="setting-bar flex-center">
        <el-time-picker v-model="workStartTime" format="HH:mm" value-format="HH:mm" placeholder="上班时间" :clearable="false" @change="workStartTimeChange" />
        <span class="setting-separator">→</span>
        <el-time-picker v-model="offWorkTime" format="HH:mm" value-format="HH:mm" placeholder="下班时间" :clearable="false" @change="offWorkTimeChange" />
        <el-button class="ml-12px" @click="resetTimes">恢复默认</el-button>
      </section>

      <div class="flex-center mt-8px">
        <el-text type="info" size="small">上下班时间仅保存在本地浏览器，换设备后需重新设置</el-text>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: 'ToolOffWorkCountdown' })
import dayjs, { type Dayjs } from 'dayjs'
import { getOffWorkTime, removeOffWorkTime, setOffWorkTime, getWorkStartTime, removeWorkStartTime, setWorkStartTime } from '@/utils'

/** 默认上班时间（HH:mm，24 小时制） */
const DEFAULT_WORK_START_TIME = '09:00'

/** 默认下班时间（HH:mm，24 小时制） */
const DEFAULT_OFF_WORK_TIME = '17:30'

/** 星期文案表，按 dayjs day() 下标取用（0 为周日） */
const WEEKDAY_TEXT = '日一二三四五六'

/** 当前上班时间设置，初始值取本地缓存并回退默认值 */
const workStartTime = ref(getWorkStartTime() || DEFAULT_WORK_START_TIME)

/** 当前下班时间设置，初始值取本地缓存并回退默认值 */
const offWorkTime = ref(getOffWorkTime() || DEFAULT_OFF_WORK_TIME)

/** 当前时间，每秒刷新一次驱动倒计时 */
const now = ref(dayjs())

/** 每秒刷新定时器句柄 */
let timer: ReturnType<typeof setInterval> | undefined

/** 锁屏顶部日期文案，如「10月13日 星期二」 */
const dateText = computed(() => `${now.value.format('M月D日')} 星期${WEEKDAY_TEXT[now.value.day()]}`)

/** 今天是否为休息日（周六或周日） */
const isWeekend = computed(() => {
  const day = now.value.day()
  return day === 0 || day === 6
})

/** 把 HH:mm 换算成今天的时刻 */
function todayAt(time: string) {
  const [hour, minute] = time.split(':').map(Number)
  return now.value.startOf('day').add(hour, 'hour').add(minute, 'minute')
}

/** 今天的上班时刻 */
const workStart = computed(() => todayAt(workStartTime.value))

/** 今天的下班时刻 */
const offWorkTarget = computed(() => todayAt(offWorkTime.value))

/** 距离下班的剩余秒数，已下班时归零 */
const remainingSeconds = computed(() => Math.max(offWorkTarget.value.diff(now.value, 'second'), 0))

/** 今天是否还未到上班时间（非周末且当前时刻早于上班时刻） */
const isNotStarted = computed(() => !isWeekend.value && now.value.isBefore(workStart.value))

/** 未上班、已下班或周末时不展示有效倒计时 */
const isCounting = computed(() => !isWeekend.value && !isNotStarted.value && remainingSeconds.value > 0)

/** 倒计时展示串：剩余秒数格式化为 HH:MM:SS，非倒计时状态展示占位 */
const countdown = computed(() => {
  if (!isCounting.value) return '00:00:00'
  const total = remainingSeconds.value
  const padZero = (num: number) => num.toString().padStart(2, '0')
  return `${padZero(Math.floor(total / 3600))}:${padZero(Math.floor((total % 3600) / 60))}:${padZero(total % 60)}`
})

/** 状态提示文案 */
const statusText = computed(() => {
  if (isWeekend.value) return '今天不上班，好好休息'
  if (isNotStarted.value) return '还没到上班时间，好好休息'
  if (!isCounting.value) return '已下班，注意休息'
  return '距离下班还有'
})

/** 今日工作进度（上班到下班区间的百分比，区间外收敛到 0/100，展示时保留两位小数） */
const progress = computed(() => {
  if (isWeekend.value) return 0
  const nowValue = now.value.valueOf()
  const startValue = workStart.value.valueOf()
  const endValue = offWorkTarget.value.valueOf()
  if (nowValue <= startValue) return 0
  if (nowValue >= endValue) return 100
  return ((nowValue - startValue) / (endValue - startValue)) * 100
})

/** 计算 [start, end) 区间已过去的百分比（按毫秒占比取整） */
function elapsedPercent(start: Dayjs, end: Dayjs) {
  return Math.round(((now.value.valueOf() - start.valueOf()) / (end.valueOf() - start.valueOf())) * 100)
}

/** 本周的开始时刻（以周一为一周起点） */
const weekStart = computed(() => {
  const day = now.value.day()
  return now.value.startOf('day').subtract(day === 0 ? 6 : day - 1, 'day')
})

/** 本月的开始时刻 */
const monthStart = computed(() => now.value.startOf('month'))

/** 今年的开始时刻 */
const yearStart = computed(() => now.value.startOf('year'))

/** 周 / 月 / 年已过进度条数据 */
const timeProgressItems = computed(() => [
  { label: '本周', value: elapsedPercent(weekStart.value, weekStart.value.add(1, 'week')) },
  { label: '本月', value: elapsedPercent(monthStart.value, monthStart.value.add(1, 'month')) },
  { label: '今年', value: elapsedPercent(yearStart.value, yearStart.value.add(1, 'year')) },
])

/**
 * 上班时间变更回调：持久化到本地缓存
 * @param time HH:mm 格式的上班时间
 */
function workStartTimeChange(time: string) {
  if (time) setWorkStartTime(time)
}

/**
 * 下班时间变更回调：持久化到本地缓存
 * @param time HH:mm 格式的下班时间
 */
function offWorkTimeChange(time: string) {
  if (time) setOffWorkTime(time)
}

/**
 * 恢复默认上下班时间：清除本地缓存并回填默认值
 */
function resetTimes() {
  removeWorkStartTime()
  removeOffWorkTime()
  workStartTime.value = DEFAULT_WORK_START_TIME
  offWorkTime.value = DEFAULT_OFF_WORK_TIME
}

onMounted(() => {
  timer = setInterval(() => {
    now.value = dayjs()
  }, 1000)
})

onBeforeUnmount(() => {
  clearInterval(timer)
})
</script>

<style lang="scss" scoped>
.app-content {
  /* iOS systemBlue：浅色 #007AFF / 深色 #0A84FF */
  --ios-accent: #007aff;
  /* 桌面端对齐 iPadOS 锁屏：时钟更大更舒展 */
  --digit-font-size: 108px;

  /* 内容不足一屏时整体垂直居中（min-height 百分比在 .app-main 内解析不到，按视口差值计算） */
  display: flex;
  flex-direction: column;
  justify-content: center;
  /* 100vh 在移动端取地址栏收起后的最大视口，会撑出一段可滚动余量，用 100dvh 按当前可见视口计算 */
  min-height: calc(100vh - var(--el-navbar-height) - var(--el-copyright-height) - 76px);
  min-height: calc(100dvh - var(--el-navbar-height) - var(--el-copyright-height) - 76px);
  padding: 0 16px;
}

html.dark {
  .app-content {
    --ios-accent: #0a84ff;
  }
}

.tool-container {
  /* iPadOS 画布宽度；窄桌面（如 768px iPad）按可用空间收缩不溢出 */
  width: min(720px, 100%);
  margin: 0 auto;
}

/* 锁屏主视觉：无卡片感，元素悬浮在页面背景上 */
.lock-screen {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 48px 0 40px;
  animation: rise-enter 0.6s cubic-bezier(0.22, 1, 0.36, 1) both;
}

.widget-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  animation: rise-enter 0.6s 0.1s cubic-bezier(0.22, 1, 0.36, 1) both;
}

.setting-bar {
  margin-top: 12px;
  padding: 12px 16px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.55);
  backdrop-filter: blur(10px);
  border: 1px solid var(--el-border-color-lighter);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06);
  animation: rise-enter 0.6s 0.2s cubic-bezier(0.22, 1, 0.36, 1) both;
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

/* 灵动岛进度胶囊：与设置条同材质的主题玻璃，主色进度条随今日进度填充 */
.island {
  display: flex;
  align-items: center;
  gap: 10px;
  height: 36px;
  padding: 0 18px;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.65);
  backdrop-filter: blur(10px);
  border: 1px solid var(--el-border-color-lighter);
  color: var(--el-text-color-regular);
  font-size: 13px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
}

.island-bar {
  width: 64px;
  height: 4px;
  border-radius: 2px;
  background: var(--el-fill-color-dark);
  overflow: hidden;

  i {
    display: block;
    height: 100%;
    border-radius: 2px;
    background: var(--el-color-primary);
    transition: width 1s linear;
  }
}

.island-pct {
  min-width: 34px;
  text-align: right;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}

.lock-date {
  margin-top: 20px;
  font-size: 16px;
  letter-spacing: 1px;
  color: var(--el-text-color-secondary);
}

.countdown-container {
  display: flex;
  align-items: center;
  margin-top: 4px;
  perspective: 600px;
  font-size: var(--digit-font-size);
  font-family: -apple-system, 'SF Pro Display', 'Helvetica Neue', var(--el-font-family);
}

/* 固定宽度格子：翻牌动画期间不挤压相邻数字；裁剪翻转过程避免幽灵数字飘出 */
.digit-cell {
  width: 0.6em;
  height: 1.1em;
  overflow: hidden;
}

.digit {
  width: 100%;
  height: 100%;
  font-weight: 200;
  font-variant-numeric: tabular-nums;
  color: var(--el-text-color-primary);
}

.colon {
  padding: 0 0.04em;
  font-weight: 200;
  color: var(--el-text-color-secondary);
  animation: colon-blink 1s step-end infinite;
}

@keyframes colon-blink {
  50% {
    opacity: 0.15;
  }
}

.status-text {
  margin-top: 12px;
  font-size: 15px;
  letter-spacing: 3px;
  color: var(--el-text-color-secondary);
}

/* 倒计时进行中：状态文字系统蓝流光扫过 */
.status-text.shine {
  background: linear-gradient(90deg, var(--ios-accent), var(--el-color-danger), var(--ios-accent));
  background-size: 200% auto;
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: text-shine 3s linear infinite;
}

@keyframes text-shine {
  to {
    background-position: 200% center;
  }
}

/* iOS 小组件卡：大圆角白卡，深色 #1C1C1E */
.widget-card {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 20px 18px;
  border-radius: 24px;
  background: #fff;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06);
}

.widget-label {
  font-size: 13px;
  color: var(--el-text-color-secondary);
}

.widget-value {
  font-size: 32px;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  color: var(--el-text-color-primary);
}

.widget-unit {
  margin-left: 2px;
  font-size: 13px;
  font-style: normal;
  font-weight: 400;
  color: var(--el-text-color-secondary);
}

.widget-bar {
  margin-top: 2px;
}

.setting-separator {
  padding: 0 8px;
  color: var(--el-text-color-secondary);
}

/* 数字翻牌过渡：旧位下翻淡出、新位上翻弹入 */
.digit-flip-enter-active {
  transition:
    transform 0.45s cubic-bezier(0.34, 1.56, 0.64, 1),
    opacity 0.3s ease;
  transform-origin: center bottom;
}

.digit-flip-enter-from {
  transform: rotateX(-90deg) translateY(-8px);
  opacity: 0;
}

.digit-flip-leave-active {
  transition:
    transform 0.2s ease-in,
    opacity 0.2s ease-in;
  transform-origin: center top;
}

.digit-flip-leave-to {
  transform: rotateX(90deg) translateY(8px);
  opacity: 0;
}

/* 深色模式：设置条玻璃底与小组件卡改为深色融入 */
html.dark {
  .setting-bar {
    background: color-mix(in srgb, var(--el-bg-color) 55%, transparent);
  }
  .island {
    background: color-mix(in srgb, var(--el-bg-color) 65%, transparent);
    box-shadow: none;
  }
  .widget-card {
    background: #1c1c1e;
    box-shadow: none;
  }
}

/* 用户偏好减少动效时停用全部动画与过渡 */
@media (prefers-reduced-motion: reduce) {
  .lock-screen,
  .widget-grid,
  .setting-bar,
  .colon,
  .status-text.shine {
    animation: none;
  }
  .digit-flip-enter-active,
  .digit-flip-leave-active {
    transition: none;
  }
  .island-bar i {
    transition: none;
  }
}

/* 移动端对齐 iPhone：纵向锁屏构图 + 全宽进度列表行 */
html[data-device='mobile'] {
  .app-content {
    --digit-font-size: clamp(48px, 16vw, 64px);
    /* 移动端同样垂直居中，扣除项按移动布局（TabBar + 安全区，无页头与版权栏）计算 */
    min-height: calc(100vh - var(--el-navbar-height) - var(--el-tabbar-height) - var(--el-safe-bottom, 0px) - 24px);
    min-height: calc(100dvh - var(--el-navbar-height) - var(--el-tabbar-height) - var(--el-safe-bottom, 0px) - 24px);
    padding: 0 16px;
  }
  .tool-container {
    width: 100%;
  }
  .lock-screen {
    padding: 32px 0 28px;
  }
  /* 灵动岛沿用主题玻璃材质（与桌面一致），仅收窄尺寸 */
  .island {
    height: 32px;
    padding: 0 14px;
    gap: 8px;
    font-size: 11px;
    border-radius: 16px;
  }
  .island-bar {
    width: 48px;
  }
  .lock-date {
    margin-top: 14px;
    font-size: 14px;
  }
  .status-text {
    font-size: 13px;
    letter-spacing: 2px;
  }
  /* 周 / 月 / 年改为 iOS 分组列表式全宽行：标签 | 进度条 | 数值 */
  .widget-grid {
    grid-template-columns: 1fr;
    gap: 10px;
  }
  .widget-card {
    display: grid;
    grid-template-columns: auto 1fr auto;
    align-items: center;
    gap: 12px;
    padding: 14px 16px;
    border-radius: 16px;
  }
  .widget-label {
    grid-column: 1;
    grid-row: 1;
  }
  .widget-value {
    grid-column: 3;
    grid-row: 1;
    font-size: 20px;
  }
  .widget-bar {
    grid-column: 2;
    grid-row: 1;
    margin-top: 0;
  }
  .setting-bar {
    padding: 12px 10px;
    border-radius: 16px;
  }
}
</style>
