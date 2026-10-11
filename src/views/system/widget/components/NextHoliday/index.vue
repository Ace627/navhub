<template>
  <div class="nextholiday-widget">
    <span class="widget-title">下一个节假日</span>
    <div class="nextholiday-body">
      <div class="nextholiday-main">
        <template v-if="info && !info.rest">{{ info.days }}</template>
        <template v-else>{{ mainText }}</template>
        <span v-if="info && !info.rest" class="nextholiday-unit">天</span>
      </div>
      <div class="nextholiday-sub">{{ subText }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { SolarDay } from 'tyme4ts'

defineOptions({ name: 'NextHolidayWidget' })

/** 向后扫描的天数上限：节假日数据缺失时避免无效长循环 */
const SCAN_LIMIT = 366

/** 节假日按天粒度展示，每分钟刷新一次足够 */
const now = useNow({ scheduler: (update) => useIntervalFn(update, 60000) })

/** 下一个节假日信息：假期中返回假日名；未在扫描范围内找到时返回 null（数据未公布） */
interface NextHolidayInfo {
  /** 今天是否处于法定节假日假期中 */
  rest: boolean
  /** 距离天数（rest 时无意义） */
  days: number
  /** 节假日名称，如 国庆节 */
  name: string
  /** 节假日首日文案，如 1月1日 */
  date: string
}

const info = computed<NextHolidayInfo | null>(() => {
  const current = now.value
  const solar = SolarDay.fromYmd(current.getFullYear(), current.getMonth() + 1, current.getDate())
  const todayLegal = solar.getLegalHoliday()
  if (todayLegal && !todayLegal.isWork()) return { rest: true, days: 0, name: todayLegal.getName(), date: '' }
  let cursor = solar
  for (let days = 1; days <= SCAN_LIMIT; days++) {
    cursor = cursor.next(1)
    const legal = cursor.getLegalHoliday()
    if (legal && !legal.isWork()) {
      return { rest: false, days, name: legal.getName(), date: `${cursor.getMonth()}月${cursor.getDay()}日` }
    }
  }
  return null
})

/** 主信息文案 */
const mainText = computed(() => {
  if (!info.value) return '暂无安排'
  return info.value.rest ? '假期中' : `${info.value.days}`
})

/** 副信息文案 */
const subText = computed(() => {
  if (!info.value) return '下一年的放假安排尚未公布'
  return info.value.rest ? `${info.value.name}快乐，好好休息` : `距${info.value.name} · ${info.value.date}`
})
</script>

<style lang="scss" scoped>
/* 小组件主体：卡片外壳由 LinkCard 提供（本卡隐藏头部），小标题居顶、内容居中 */
.nextholiday-widget {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  /* 与同类无头部小组件主体等高（84px），避免独占一行时卡片偏矮 */
  min-height: 84px;
  margin: 6px 0 8px;
}

/* 顶部小标题：通栏居中，与参考样式一致 */
.widget-title {
  flex-shrink: 0;
  font-size: 12px;
  letter-spacing: 3px;
  text-align: center;
  color: var(--el-text-color-secondary);
  user-select: none;
}

.nextholiday-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  min-width: 0;
}

.nextholiday-main {
  font-size: 26px;
  font-weight: 600;
  line-height: 1.2;
  color: var(--el-color-primary);

  .nextholiday-unit {
    margin-left: 2px;
    font-size: 14px;
    font-weight: 500;
    color: var(--el-text-color-regular);
  }
}

.nextholiday-sub {
  font-size: var(--el-font-size-extra-small);
  color: var(--el-text-color-secondary);
}

html[data-device='mobile'] {
  /* 移动端通栏卡片与日历/一言主体等高 */
  .nextholiday-widget {
    min-height: 120px;
  }
}
</style>
