<template>
  <div class="offwork-widget">
    <span class="widget-title">下班倒计时</span>
    <div class="offwork-body">
      <!-- 主信息：休息提示 / 倒计时 / 已下班 -->
      <div class="offwork-main" :class="{ 'is-counting': status === 'counting' }">{{ mainText }}</div>
      <div class="offwork-sub">{{ subText }}</div>
    </div>
    <!-- 自定义下班时间入口：右上角编辑图标，弹出时间选择 -->
    <el-popover placement="bottom-end" :width="216" trigger="click">
      <template #reference>
        <SvgIcon name="Edit" class="offwork-edit" @click.stop />
      </template>
      <div class="offwork-editor" @click.stop>
        <el-time-picker v-model="offWorkTime" value-format="HH:mm" format="HH:mm" placeholder="下班时间" :clearable="false" />
        <el-button link type="primary" @click="resetTime">恢复默认</el-button>
      </div>
    </el-popover>
  </div>
</template>

<script setup lang="ts">
import { SolarDay } from 'tyme4ts'
import { getOffWorkTime, setOffWorkTime, removeOffWorkTime } from '@/utils/cache/off-work.cache'

defineOptions({ name: 'OffWorkWidget' })

/** 默认下班时间：工作日 17:30 */
const DEFAULT_OFF_WORK_TIME = '17:30'

/** 实时时间：vueuse 15 的 useNow 以 scheduler 定制刷新，这里用 1 秒间隔的 useIntervalFn，避免默认 raf 每帧更新的开销 */
const now = useNow({ scheduler: (update) => useIntervalFn(update, 1000) })

/** 自定义下班时间（HH:mm），变更即持久化；恢复默认时清除缓存 */
const offWorkTime = ref(getOffWorkTime() ?? DEFAULT_OFF_WORK_TIME)

watch(offWorkTime, (value) => (value === DEFAULT_OFF_WORK_TIME ? removeOffWorkTime() : setOffWorkTime(value)))

/** 今日的 tyme 公历日与法定节假日记录（null 表示非节假日也非补班日） */
const todaySolar = computed(() => SolarDay.fromYmd(now.value.getFullYear(), now.value.getMonth() + 1, now.value.getDate()))
const legalHoliday = computed(() => todaySolar.value.getLegalHoliday())

/** 今天是否为工作日：法定节假日（含周末）休息，法定补班日（含周末）上班，其余按周一至周五判断 */
const isWorkday = computed(() => {
  const legal = legalHoliday.value
  if (legal) return legal.isWork()
  const day = now.value.getDay()
  return day !== 0 && day !== 6
})

/** 今天是否已过下班时间 */
const isPastOffTime = computed(() => {
  const [hours, minutes] = offWorkTime.value.split(':').map(Number)
  const end = new Date(now.value)
  end.setHours(hours, minutes, 0, 0)
  return now.value.getTime() >= end.getTime()
})

/** 展示状态：rest 今天休息 / counting 倒计时中 / off 已下班 */
const status = computed<'rest' | 'counting' | 'off'>(() => {
  if (!isWorkday.value) return 'rest'
  return isPastOffTime.value ? 'off' : 'counting'
})

/** 主信息文案 */
const mainText = computed(() => {
  if (status.value === 'rest') return '今天休息'
  if (status.value === 'off') return '已下班'
  const diff = Math.max(0, Math.floor((offWorkEndDate.value - now.value.getTime()) / 1000))
  const hours = Math.floor(diff / 3600)
  const minutes = Math.floor((diff % 3600) / 60)
  const seconds = diff % 60
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
})

/** 副信息文案 */
const subText = computed(() => {
  if (status.value === 'rest') {
    const legal = legalHoliday.value
    return legal ? `${legal.getName()}快乐，好好休息` : '好好享受假期吧'
  }
  if (status.value === 'off') return '今天辛苦了，好好休息'
  return `距下班 · ${offWorkTime.value}`
})

/** 当前下班时刻的时间戳（仅工作日倒计时时使用） */
const offWorkEndDate = computed(() => {
  const [hours, minutes] = offWorkTime.value.split(':').map(Number)
  const end = new Date(now.value)
  end.setHours(hours, minutes, 0, 0)
  return end.getTime()
})

/**
 * 恢复默认下班时间：置回默认值后由 watch 清除自定义缓存
 */
function resetTime(): void {
  offWorkTime.value = DEFAULT_OFF_WORK_TIME
}
</script>

<style lang="scss" scoped>
/* 小组件主体：卡片外壳由 LinkCard 提供（下班卡隐藏头部），小标题居顶、内容居中 */
.offwork-widget {
  position: relative;
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

.offwork-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  min-width: 0;
}

.offwork-main {
  font-size: 26px;
  font-weight: 600;
  line-height: 1.2;
  color: var(--el-text-color-primary);

  /* 倒计时数字等宽排布，秒位跳动不引起抖动 */
  &.is-counting {
    font-variant-numeric: tabular-nums;
    color: var(--el-color-primary);
  }
}

.offwork-sub {
  font-size: var(--el-font-size-extra-small);
  color: var(--el-text-color-secondary);
}

.offwork-edit {
  position: absolute;
  top: 0;
  right: 0;
  font-size: 14px;
  color: var(--el-text-color-secondary);
  cursor: pointer;
  transition: color 0.2s;

  &:hover {
    color: var(--el-color-primary);
  }
}

.offwork-editor {
  display: flex;
  align-items: center;
  gap: 8px;
}

html[data-device='mobile'] {
  /* 移动端通栏卡片与日历/一言主体等高 */
  .offwork-widget {
    min-height: 120px;
  }
}
</style>
