<template>
  <div class="app-content app-content--fill">
    <div class="tool-container">
      <!-- 发薪日列表：元素直接浮在页面背景上，无卡片容器 -->
      <div class="hero-card">
        <div class="hero-body">
          <!-- 列表展示：按剩余天数升序，左标题+左元信息，右侧大字倒数，最近一项高亮 -->
          <div class="payday-list">
            <div v-for="item in paydayList" :key="item.day" class="payday-item" :class="{ active: item.day === nextPayday.day }">
              <div class="payday-info">
                <span class="payday-title">{{ item.day }} 号发薪日</span>
                <span class="payday-meta">{{ item.dateText }} | {{ item.week }} | {{ item.lunar }}</span>
              </div>
              <div class="payday-count">
                <span v-if="item.daysLeft === 0" class="days-today">今天</span>
                <template v-else>
                  <span class="days-num">{{ padDays(item.daysLeft) }}</span>
                  <span class="days-unit">天</span>
                </template>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: 'ToolPaydayCountdown' })
import dayjs from 'dayjs'
import type { Dayjs } from 'dayjs'
import { SolarDay } from 'tyme4ts'

/** 默认发薪日候选（每月几号） */
const DEFAULT_PAYDAYS = [1, 5, 8, 10, 15, 18, 20, 25]

/** 当前时间，定时刷新驱动剩余天数重算 */
const now = ref(dayjs())

/** 定时刷新句柄 */
let timer: ReturnType<typeof setInterval> | undefined

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

/**
 * 农历月日文本：完整农历串去掉「农历」前缀与干支年（如 九月初九、闰六月初一）
 *
 * @param date 公历日期
 * @returns 农历月日串
 */
function lunarText(date: Dayjs): string {
  const lunar = SolarDay.fromYmd(date.year(), date.month() + 1, date.date()).getLunarDay().toString()
  return lunar.replace(/^农历/, '').replace(/^[^年]+年/, '')
}

/**
 * 星期文本（如 星期日）
 *
 * @param date 公历日期
 * @returns 星期串
 */
function weekText(date: Dayjs): string {
  return `星期${SolarDay.fromYmd(date.year(), date.month() + 1, date.date()).getWeek()}`
}

/** 各候选发薪日的剩余天数（发薪日当天为 0），按剩余天数升序让最近的排最前 */
const paydayList = computed(() =>
  DEFAULT_PAYDAYS.map((day) => {
    const target = nextOccurrence(day, now.value)
    return {
      day,
      daysLeft: target.diff(now.value.startOf('day'), 'day'),
      dateText: target.format('YYYY-MM-DD'),
      week: weekText(target),
      lunar: lunarText(target),
    }
  }).sort((a, b) => a.daysLeft - b.daysLeft || a.day - b.day),
)

/** 距今最近的发薪日候选 */
const nextPayday = computed(() => paydayList.value.reduce((min, item) => (item.daysLeft < min.daysLeft ? item : min)))

/**
 * 剩余天数补零为双位展示
 *
 * @param days 非负整数天数
 * @returns 双位数字串（如 3 → "03"）
 */
function padDays(days: number) {
  return days.toString().padStart(2, '0')
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
.tool-container {
  width: 640px;
  margin: 0 auto;
}

/* 主区域：无卡片容器，仅保留纵向留白 */
.hero-card {
  padding: 16px 0;
}

/* 发薪日列表：每个候选日一行 */
.payday-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

/* 行卡对齐下班倒计时的小组件质感：白底大圆角轻阴影，左右两栏布局 */
.payday-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 16px 20px;
  border-radius: 16px;
  background: #fff;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06);
  transition: all 0.3s ease;
}

/* 最近的发薪日候选：主色内描边高亮 */
.payday-item.active {
  box-shadow:
    inset 0 0 0 1px var(--el-color-primary),
    0 8px 24px rgba(0, 0, 0, 0.06);
}

/* 左栏：标题在上、元信息（公历|星期|农历）在下 */
.payday-info {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
}

.payday-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.payday-item.active .payday-title {
  color: var(--el-color-primary);
}

.payday-meta {
  font-size: 13px;
  color: var(--el-text-color-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 右栏：大字剩余天数，基准线对齐单位 */
.payday-count {
  display: flex;
  align-items: baseline;
  gap: 4px;
  flex-shrink: 0;
}

.days-num {
  font-size: 34px;
  font-weight: bold;
  line-height: 1;
  font-variant-numeric: tabular-nums;
  color: var(--el-text-color-primary);
}

.payday-item.active .days-num {
  color: var(--el-color-primary);
}

.days-unit {
  font-size: 13px;
  color: var(--el-text-color-secondary);
}

/* 发薪日当天：以文字代替数字 */
.days-today {
  font-size: 24px;
  font-weight: bold;
  line-height: 1;
  color: var(--el-color-primary);
}

/* 深色模式：行卡改为深色融入 */
html.dark {
  .payday-item {
    background: #1c1c1e;
    box-shadow: none;
  }
  .payday-item.active {
    box-shadow: inset 0 0 0 1px var(--el-color-primary);
  }
}

/* 移动端：缩小内边距与字号并占满宽度 */
html[data-device='mobile'] {
  .app-content {
    padding: 8px;
  }
  .tool-container {
    width: 100%;
  }
  .hero-card {
    padding: 8px 0;
  }
  .payday-item {
    padding: 13px 14px;
  }
  .payday-title {
    font-size: 15px;
  }
  .payday-meta {
    font-size: 12px;
  }
  .days-num {
    font-size: 28px;
  }
}
</style>
