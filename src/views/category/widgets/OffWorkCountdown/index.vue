<template>
  <div class="app-content">
    <div class="tool-container">
      <!-- 暗色玻璃主视觉：流光背景 + 霓虹数字 -->
      <div class="hero-card">
        <div class="blob blob-1" />
        <div class="blob blob-2" />
        <div class="blob blob-3" />

        <div class="hero-body">
          <span class="status-text" :class="{ shine: isCounting }">{{ statusText }}</span>

          <!-- 倒计时主展示：数字逐位装盒，变化位 3D 翻牌，冒号呼吸闪烁 -->
          <div class="countdown-container flex-center">
            <template v-for="(char, index) in countdown" :key="index">
              <span v-if="char === ':'" class="colon">{{ char }}</span>
              <div v-else class="digit-cell">
                <Transition name="digit-flip" mode="out-in">
                  <span :key="char" class="digit flex-center">{{ char }}</span>
                </Transition>
              </div>
            </template>
          </div>

          <div class="progress-row flex-center">
            <el-progress type="circle" :percentage="progress" :width="progressSize" :stroke-width="8" :color="progressColors" />
            <div class="progress-info">
              <span class="progress-title">今日工作进度</span>
              <span class="progress-desc">{{ workStartTime }} 上班 → {{ offWorkTime }} 下班</span>
            </div>
          </div>
        </div>
      </div>

      <div class="setting-container flex-center my-16px">
        <el-time-picker v-model="workStartTime" format="HH:mm" value-format="HH:mm" placeholder="上班时间" :clearable="false" @change="workStartTimeChange" />
        <span class="setting-separator">→</span>
        <el-time-picker v-model="offWorkTime" format="HH:mm" value-format="HH:mm" placeholder="下班时间" :clearable="false" @change="offWorkTimeChange" />
        <el-button class="ml-12px" @click="resetTimes">恢复默认</el-button>
      </div>

      <div class="flex-center">
        <el-text type="info">上下班时间仅保存在本地浏览器，换设备后需重新设置</el-text>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: 'ToolOffWorkCountdown' })
import dayjs from 'dayjs'
import { getOffWorkTime, removeOffWorkTime, setOffWorkTime, getWorkStartTime, removeWorkStartTime, setWorkStartTime } from '@/utils'

/** 默认上班时间（HH:mm，24 小时制） */
const DEFAULT_WORK_START_TIME = '09:00'

/** 默认下班时间（HH:mm，24 小时制） */
const DEFAULT_OFF_WORK_TIME = '17:30'

/** 工作进度环的渐变配色：随进度从蓝过渡到警示橙红 */
const progressColors = [
  { color: '#409eff', percentage: 20 },
  { color: '#e6a23c', percentage: 80 },
  { color: '#f56c6c', percentage: 100 },
]

const appStore = useAppStore()

/** 当前上班时间设置，初始值取本地缓存并回退默认值 */
const workStartTime = ref(getWorkStartTime() || DEFAULT_WORK_START_TIME)

/** 当前下班时间设置，初始值取本地缓存并回退默认值 */
const offWorkTime = ref(getOffWorkTime() || DEFAULT_OFF_WORK_TIME)

/** 当前时间，每秒刷新一次驱动倒计时 */
const now = ref(dayjs())

/** 每秒刷新定时器句柄 */
let timer: ReturnType<typeof setInterval> | undefined

/** 进度环尺寸：桌面端大、移动端缩小 */
const progressSize = computed(() => (appStore.isDesktop ? 110 : 84))

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

/** 已下班或周末时不展示有效倒计时 */
const isCounting = computed(() => !isWeekend.value && remainingSeconds.value > 0)

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
  if (!isCounting.value) return '已下班，注意休息'
  return '距离下班还有'
})

/** 今日工作进度（上班到下班区间的百分比，区间外收敛到 0/100） */
const progress = computed(() => {
  if (isWeekend.value) return 0
  const nowValue = now.value.valueOf()
  const startValue = workStart.value.valueOf()
  const endValue = offWorkTarget.value.valueOf()
  if (nowValue <= startValue) return 0
  if (nowValue >= endValue) return 100
  return Math.round(((nowValue - startValue) / (endValue - startValue)) * 100)
})

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
  --digit-size: 80px;
  --digit-font-size: 44px;
  --colon-font-size: 38px;

  /* 内容不足一屏时整体垂直居中（min-height 百分比在 .app-main 内解析不到，按视口差值计算） */
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-height: calc(100vh - var(--el-navbar-height) - var(--el-copyright-height) - 76px);
}

.tool-container {
  width: 640px;
  margin: 0 auto;
}

/* 轻玻璃主卡：半透明白卡融入浅色页面，柔和光斑漂浮 */
.hero-card {
  position: relative;
  overflow: hidden;
  padding: 40px 24px 32px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.55);
  backdrop-filter: blur(10px);
  border: 1px solid var(--el-border-color-lighter);
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.08);
  animation: rise-enter 0.6s cubic-bezier(0.22, 1, 0.36, 1) both;
}

.setting-container {
  animation: rise-enter 0.6s 0.15s cubic-bezier(0.22, 1, 0.36, 1) both;
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
  background: var(--el-color-danger);
  opacity: 0.18;
  animation-delay: -4s;
}

.blob-3 {
  top: 40%;
  left: 60%;
  width: 180px;
  height: 180px;
  background: var(--el-color-warning);
  opacity: 0.15;
  animation-delay: -8s;
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

.status-text {
  color: var(--el-text-color-regular);
  font-size: 16px;
  letter-spacing: 4px;
}

/* 倒计时进行中：状态文字蓝红流光扫过 */
.status-text.shine {
  background: linear-gradient(90deg, var(--el-color-primary), var(--el-color-danger), var(--el-color-primary));
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

.countdown-container {
  gap: 10px;
  margin: 24px 0;
  perspective: 600px;
  animation: glow-breathe 3s ease-in-out infinite;
}

@keyframes glow-breathe {
  0%,
  100% {
    filter: drop-shadow(0 0 0 rgba(64, 158, 255, 0));
  }
  50% {
    filter: drop-shadow(0 8px 20px rgba(64, 158, 255, 0.35));
  }
}

/* 固定尺寸格子：翻牌动画期间不挤压相邻数字 */
.digit-cell {
  width: var(--digit-size);
  height: var(--digit-size);
}

.digit {
  width: 100%;
  height: 100%;
  border-radius: 16px;
  font-size: var(--digit-font-size);
  font-weight: bold;
  font-variant-numeric: tabular-nums;
  color: var(--el-text-color-primary);
  text-shadow: 0 2px 12px rgba(64, 158, 255, 0.35);
  background: linear-gradient(180deg, var(--el-bg-color), var(--el-fill-color-light));
  border: 1px solid var(--el-border-color-light);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.6),
    0 6px 18px rgba(0, 0, 0, 0.08);
}

.colon {
  font-size: var(--colon-font-size);
  font-weight: bold;
  color: var(--el-text-color-secondary);
  animation: colon-blink 1s step-end infinite;
}

@keyframes colon-blink {
  50% {
    opacity: 0.15;
  }
}

.progress-row {
  gap: 20px;
  margin-top: 8px;
}

.progress-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  text-align: left;
}

.progress-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.progress-desc {
  font-size: 13px;
  font-variant-numeric: tabular-nums;
  color: var(--el-text-color-secondary);
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

/* 用户偏好减少动效时停用全部动画与过渡 */
@media (prefers-reduced-motion: reduce) {
  .blob,
  .colon,
  .hero-card,
  .setting-container,
  .countdown-container,
  .status-text.shine {
    animation: none;
  }
  .digit-flip-enter-active,
  .digit-flip-leave-active {
    transition: none;
  }
}

/* 移动端：缩小数字盒与进度环间距并占满宽度 */
html[data-device='mobile'] {
  .app-content {
    --digit-size: 42px;
    --digit-font-size: 22px;
    --colon-font-size: 20px;
    padding: 8px;
  }
  .tool-container {
    width: 100%;
  }
  .hero-card {
    padding: 24px 12px 20px;
  }
  .countdown-container {
    gap: 4px;
  }
  .progress-row {
    gap: 12px;
  }
}
</style>
