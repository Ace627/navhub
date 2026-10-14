<template>
  <div class="app-content">
    <div class="tool-container">
      <!-- 轻玻璃主卡：发薪日列表 -->
      <div class="hero-card">
        <div class="blob blob-1" />
        <div class="blob blob-2" />
        <div class="blob blob-3" />

        <div class="hero-body">
          <!-- 列表展示：每个候选发薪日一行，最近一项高亮 -->
          <div class="payday-list">
            <div v-for="item in paydayList" :key="item.day" class="payday-item" :class="{ active: item.day === nextPayday.day }">
              <span class="payday-date">{{ item.day }} 号</span>
              <span class="payday-desc">
                <template v-if="item.daysLeft === 0">今天就是发薪日</template>
                <template v-else
                  >距离发薪日还有 <span class="days-num">{{ padDays(item.daysLeft) }}</span> 天</template
                >
              </span>
            </div>
          </div>
        </div>
      </div>

      <div class="setting-container flex-center my-16px">
        <span class="setting-label">自定义发薪日</span>
        <el-input-number v-model="customDay" :min="1" :max="31" :step="1" step-strictly placeholder="1-31" @change="paydayChange" />
        <el-button class="ml-12px" @click="resetPayday">恢复默认</el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: 'ToolPaydayCountdown' })
import dayjs from 'dayjs'
import type { Dayjs } from 'dayjs'
import { getPayday, removePayday, setPayday } from '@/utils'

/** 默认发薪日候选（每月几号） */
const DEFAULT_PAYDAYS = [1, 5, 8, 10, 15, 18, 20, 25]

/** 自定义发薪日设置，null 表示未自定义（回退默认候选） */
const customDay = ref<number | null>(getPayday())

/** 当前时间，定时刷新驱动剩余天数重算 */
const now = ref(dayjs())

/** 定时刷新句柄 */
let timer: ReturnType<typeof setInterval> | undefined

/** 是否处于自定义发薪日模式 */
const isCustom = computed(() => typeof customDay.value === 'number')

/** 生效的发薪日候选列表：自定义时仅含自定义日，否则为默认候选 */
const paydayDays = computed(() => (isCustom.value ? [customDay.value as number] : DEFAULT_PAYDAYS))

/**
 * 计算指定日期的下一次出现时刻（当天零点）
 *
 * 指定日超过当月天数时收敛到当月最后一天（如 31 号在 30 天月份取 30 号）
 *
 * @param day 每月几号（1-31）
 * @param from 计算基准时刻
 * @returns 下一次出现的零点时刻
 */
function nextOccurrence(day: number, from: Dayjs): Dayjs {
  const base = from.startOf('day')
  const current = base.date(Math.min(day, base.daysInMonth()))
  if (!current.isBefore(base)) return current
  const nextMonth = base.add(1, 'month')
  return nextMonth.date(Math.min(day, nextMonth.daysInMonth()))
}

/** 各候选发薪日的剩余天数（发薪日当天为 0） */
const paydayList = computed(() =>
  paydayDays.value.map((day) => {
    const target = nextOccurrence(day, now.value)
    return { day, target, daysLeft: target.diff(now.value.startOf('day'), 'day') }
  }),
)

/** 距今最近的发薪日候选 */
const nextPayday = computed(() => paydayList.value.reduce((min, item) => (item.target.isBefore(min.target) ? item : min)))

/**
 * 剩余天数补零为双位展示
 *
 * @param days 非负整数天数
 * @returns 双位数字串（如 3 → "03"）
 */
function padDays(days: number) {
  return days.toString().padStart(2, '0')
}

/**
 * 自定义发薪日变更回调：持久化到本地缓存，清空时恢复默认候选
 * @param value 1-31 的日期数字，清空时为 null
 */
function paydayChange(value: number | null | undefined) {
  if (typeof value === 'number' && Number.isInteger(value)) {
    setPayday(value)
    customDay.value = value
  } else {
    removePayday()
    customDay.value = null
  }
}

/**
 * 恢复默认发薪日候选：清除本地缓存
 */
function resetPayday() {
  removePayday()
  customDay.value = null
}

onMounted(() => {
  timer = setInterval(() => {
    now.value = dayjs()
  }, 30000)
})

onBeforeUnmount(() => {
  clearInterval(timer)
})
</script>

<style lang="scss" scoped>
/* 内容不足一屏时整体垂直居中（min-height 百分比在 .app-main 内解析不到，按视口差值计算） */
.app-content {
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
  padding: 32px 24px;
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
  background: var(--el-color-warning);
  opacity: 0.18;
  animation-delay: -4s;
}

.blob-3 {
  top: 40%;
  left: 60%;
  width: 180px;
  height: 180px;
  background: var(--el-color-success);
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
}

/* 发薪日列表：每个候选日一行，最近一项高亮 */
.payday-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.payday-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 18px;
  border-radius: 12px;
  border: 1px solid var(--el-border-color-lighter);
  background: var(--el-fill-color-light);
  transition: all 0.3s ease;
}

.payday-item.active {
  border-color: var(--el-color-primary);
  background: var(--el-color-primary-light-9);
}

.payday-date {
  font-size: 15px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.payday-item.active .payday-date {
  color: var(--el-color-primary);
}

.payday-desc {
  font-size: 14px;
  color: var(--el-text-color-secondary);
}

.days-num {
  margin: 0 2px;
  font-size: 20px;
  font-weight: bold;
  font-variant-numeric: tabular-nums;
  color: var(--el-color-primary);
}

.setting-label {
  font-size: 14px;
  color: var(--el-text-color-regular);
}

/* 深色模式：硬编码浅玻璃底改为深色融入，避免暗色页面里主卡发白发灰 */
html.dark {
  .hero-card {
    background: color-mix(in srgb, var(--el-bg-color) 55%, transparent);
  }
}

/* 用户偏好减少动效时停用全部动画与过渡 */
@media (prefers-reduced-motion: reduce) {
  .blob,
  .hero-card,
  .setting-container {
    animation: none;
  }
}

/* 移动端：缩小内边距并占满宽度 */
html[data-device='mobile'] {
  .app-content {
    padding: 8px;
  }
  .tool-container {
    width: 100%;
  }
  .hero-card {
    padding: 16px 12px;
  }
  .payday-item {
    padding: 12px 14px;
  }
}
</style>
