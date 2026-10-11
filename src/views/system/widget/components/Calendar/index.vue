<template>
  <div class="calendar-widget">
    <!-- 左侧：年月切换、今日大字、天/周次与农历信息 -->
    <div class="calendar-left">
      <div class="month-nav">
        <SvgIcon name="ArrowLeft" class="nav-arrow" @click="switchMonth(-1)" />
        <span class="month-text">{{ gridYear }}年{{ gridMonth }}月</span>
        <SvgIcon name="ArrowRight" class="nav-arrow" @click="switchMonth(1)" />
      </div>
      <div class="today-day">{{ today.getDay() }}</div>
      <div class="today-meta">
        <span>第{{ todayDayOfYear }}天 第{{ todayWeekOfYear }}周</span>
        <span>{{ todayLunarText }} {{ todayWeekText }}</span>
      </div>
    </div>
    <!-- 右侧：周一起始的 6×7 月历网格，跨月日期置灰，周末红色，今日圆形高亮 -->
    <div class="calendar-right">
      <div class="weekday-row">
        <span v-for="(name, index) in WEEK_NAMES" :key="name" class="weekday" :class="{ 'is-weekend': index === 0 || index === 6 }">{{ name }}</span>
      </div>
      <div class="day-grid">
        <span
          v-for="(cell, index) in gridCells"
          :key="index"
          class="day-cell"
          :class="{
            'is-outside': !cell.inMonth,
            'is-weekend': cell.weekend,
            'is-today': cell.isToday,
          }"
        >
          {{ cell.day }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { SolarDay, SolarMonth } from 'tyme4ts'
import type { SolarWeek } from 'tyme4ts'

defineOptions({ name: 'CalendarWidget' })

/** 周标题（周日起始排列），首尾为周末 */
const WEEK_NAMES = ['日', '一', '二', '三', '四', '五', '六']

/** 月历固定展示 6 行（42 格），不足的用后一个月的周补齐 */
const GRID_WEEK_COUNT = 6

/** 今日（组件挂载时固化，当日跨天由页面刷新自然更新） */
const today = SolarDay.fromYmd(new Date().getFullYear(), new Date().getMonth() + 1, new Date().getDate())

/** 右侧月历当前展示的年月（箭头切换，仅影响网格，不改动左侧今日信息） */
const gridYear = ref(today.getYear())
const gridMonth = ref(today.getMonth())

/** 今日是本年第几天（tyme 返回 0 基索引，展示时 +1） */
const todayDayOfYear = computed(() => today.getIndexInYear() + 1)

/** 今日处于本年第几周（tyme 周一起始口径，与主流日历一致） */
const todayWeekOfYear = computed(() => today.getSolarWeek(1).getIndexInYear())

/** 今日农历文案：初一当天按惯例只展示月名（如「九月」），其余展示「九月初二」 */
const todayLunarText = computed(() => {
  const lunarDay = today.getLunarDay()
  const dayName = lunarDay.getName()
  const monthName = lunarDay.getLunarMonth().getName()
  return dayName === '初一' ? monthName : `${monthName}${dayName}`
})

/** 今日星期文案（tyme 索引 0 为周日） */
const todayWeekText = computed(() => `星期${today.getWeek().getName()}`)

/** 月历 6 行网格：从当月第一周（周日起始）起逐周推进，跨月日期自然带入 */
const gridWeeks = computed<SolarWeek[]>(() => {
  const firstWeek = SolarMonth.fromYm(gridYear.value, gridMonth.value).getWeeks(0)[0]
  return Array.from({ length: GRID_WEEK_COUNT }, (_, index) => firstWeek.next(index))
})

/** 扁平化 42 格单元格数据 */
const gridCells = computed(() =>
  gridWeeks.value.flatMap((week) =>
    week.getDays().map((day) => ({
      day: day.getDay(),
      inMonth: day.getMonth() === gridMonth.value,
      weekend: day.getWeek().getIndex() === 0 || day.getWeek().getIndex() === 6,
      isToday: day.getYear() === today.getYear() && day.getMonth() === today.getMonth() && day.getDay() === today.getDay(),
    })),
  ),
)

/**
 * 切换月历展示月份，跨年时 tyme 的 next 月会自动处理
 *
 * @param offset 移动方向，-1 表示上个月，1 表示下个月
 */
function switchMonth(offset: -1 | 1): void {
  const target = SolarMonth.fromYm(gridYear.value, gridMonth.value).next(offset)
  gridYear.value = target.getYear()
  gridMonth.value = target.getMonth()
}
</script>

<style lang="scss" scoped>
/* 小组件主体：卡片外壳（底色、圆角、内边距）由 LinkCard 负责（日历卡隐藏头部）；
   高度红线：常规站点卡 129px，扣除内边距与操作行后主体仅约 86px，网格按 7 行紧凑排布 */
.calendar-widget {
  display: flex;
  align-items: stretch;
  gap: 10px;
  min-width: 0;
  /* 与同类无头部小组件主体等高（84px），保证各卡高度一致 */
  min-height: 84px;
  margin: 2px 0 4px;
}

.calendar-left {
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  width: 37%;
}

.month-nav {
  display: flex;
  align-items: center;
  gap: 1px;
  font-size: 11px;
  font-weight: 600;
  color: var(--el-text-color-primary);

  .month-text {
    flex: 1;
    min-width: 0;
    overflow: hidden;
    text-align: center;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .nav-arrow {
    flex-shrink: 0;
    font-size: 10px;
    color: var(--el-text-color-secondary);
    cursor: pointer;
    transition: color 0.2s;

    &:hover {
      color: var(--el-color-primary);
    }
  }
}

.today-day {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  font-weight: 600;
  line-height: 1;
  color: var(--el-text-color-primary);
}

.today-meta {
  display: flex;
  flex-direction: column;
  font-size: 10px;
  line-height: 1.5;
  text-align: center;
  color: var(--el-text-color-secondary);
  white-space: nowrap;
}

.calendar-right {
  flex: 1;
  min-width: 0;
}

.weekday-row,
.day-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
}

.weekday-row {
  .weekday {
    font-size: 10px;
    line-height: 1.2;
    text-align: center;
    color: var(--el-text-color-regular);

    &.is-weekend {
      color: var(--el-color-danger);
    }
  }
}

.day-grid {
  row-gap: 1px;
}

.day-cell {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 11px;
  font-size: 10px;
  line-height: 1;
  color: var(--el-text-color-primary);
  border-radius: 7px;

  &.is-weekend {
    color: var(--el-color-danger);
  }

  &.is-outside {
    color: var(--el-text-color-placeholder);

    &.is-weekend {
      /* 跨月的周末日期保留红色但降低存在感 */
      opacity: 0.45;
    }
  }

  &.is-today {
    color: var(--el-color-white);
    background-color: var(--el-color-danger);
  }
}

html[data-device='mobile'] {
  .calendar-widget {
    gap: 12px;
    /* 移动端通栏卡片与一言/下班等主体等高（标题 12 + 主体 120 + 取整差 2px） */
    min-height: 128px;
  }

  .calendar-left {
    width: 30%;
  }

  .month-nav {
    font-size: 12px;

    .nav-arrow {
      display: none;
    }
  }

  .today-day {
    font-size: 32px;
  }

  .today-meta {
    font-size: 11px;
  }

  .day-cell {
    height: 18px;
    font-size: 11px;
  }

  .weekday-row .weekday {
    font-size: 11px;
  }
}
</style>
