<template>
  <div class="payday-widget">
    <span class="widget-title">下一个发薪日</span>
    <div class="payday-body">
      <div class="payday-main">{{ mainText }}<span v-if="status === 'counting'" class="payday-unit">天</span></div>
      <div class="payday-sub">{{ subText }}</div>
    </div>
    <!-- 自定义发薪日入口：右上角编辑图标，弹出日期选择 -->
    <el-popover placement="bottom-end" :width="216" trigger="click">
      <template #reference>
        <SvgIcon name="Edit" class="payday-edit" @click.stop />
      </template>
      <div class="payday-editor" @click.stop>
        <span class="payday-editor-label">每月</span>
        <el-input-number v-model="paydayDay" :min="1" :max="31" :step="1" step-strictly controls-position="right" />
        <span class="payday-editor-label">号</span>
      </div>
      <el-button class="payday-reset" link type="primary" @click="resetPayday">恢复默认</el-button>
    </el-popover>
  </div>
</template>

<script setup lang="ts">
import { getPayday, setPayday, removePayday } from '@/utils/cache/payday.cache'

defineOptions({ name: 'PaydayWidget' })

/** 默认发薪日：每月 10 号 */
const DEFAULT_PAYDAY = 10

/** 节假日按天粒度展示，每分钟刷新一次足够 */
const now = useNow({ scheduler: (update) => useIntervalFn(update, 60000) })

/** 自定义发薪日（每月几号），变更即持久化；恢复默认时清除缓存 */
const paydayDay = ref(getPayday() ?? DEFAULT_PAYDAY)

watch(paydayDay, (value) => (value === DEFAULT_PAYDAY ? removePayday() : setPayday(value)))

/** 指定月份的天数 */
function daysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate()
}

/** 当天零点的时间戳（消除时分秒干扰，按自然日计算天数差） */
function midnight(date: Date): number {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime()
}

/**
 * 计算下一个发薪日；发薪日超过当月天数时截断到月末（如 31 号在 2 月取月末）
 *
 * @param base 基准日期
 * @returns days 为距离天数（0 表示今天是发薪日），date 为发薪日期
 */
function nextPaydayDays(base: Date): { days: number; date: Date } {
  const year = base.getFullYear()
  const month = base.getMonth()
  const clampDay = (m: number) => Math.min(paydayDay.value, daysInMonth(year, m))
  const days = Math.round((new Date(year, month, clampDay(month)).getTime() - midnight(base)) / 86400000)
  if (days >= 0) return { days, date: new Date(year, month, clampDay(month)) }
  return { days: Math.round((new Date(year, month + 1, clampDay(month + 1)).getTime() - midnight(base)) / 86400000), date: new Date(year, month + 1, clampDay(month + 1)) }
}

/** 下一个发薪日信息：days 为 0 表示今天发薪，date 为发薪日期 */
const nextPayday = computed(() => nextPaydayDays(now.value))

/** 展示状态：today 今天发薪 / counting 倒计时中 */
const status = computed<'today' | 'counting'>(() => (nextPayday.value.days === 0 ? 'today' : 'counting'))

/** 主信息文案 */
const mainText = computed(() => (status.value === 'today' ? '今天发薪' : `${nextPayday.value.days}`))

/** 副信息文案 */
const subText = computed(() => {
  if (status.value === 'today') return '工资到账，快乐消费'
  const date = nextPayday.value.date
  return `距发薪日 · ${date.getMonth() + 1}月${date.getDate()}号`
})

/**
 * 恢复默认发薪日：置回默认值后由 watch 清除自定义缓存
 */
function resetPayday(): void {
  paydayDay.value = DEFAULT_PAYDAY
}
</script>

<style lang="scss" scoped>
/* 小组件主体：卡片外壳由 LinkCard 提供（本卡隐藏头部），小标题居顶、内容居中 */
.payday-widget {
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

.payday-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  min-width: 0;
}

.payday-main {
  font-size: 26px;
  font-weight: 600;
  line-height: 1.2;
  color: var(--el-color-primary);

  .payday-unit {
    margin-left: 2px;
    font-size: 14px;
    font-weight: 500;
    color: var(--el-text-color-regular);
  }
}

.payday-sub {
  font-size: var(--el-font-size-extra-small);
  color: var(--el-text-color-secondary);
}

.payday-edit {
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

.payday-editor {
  display: flex;
  align-items: center;
  gap: 8px;

  .payday-editor-label {
    flex-shrink: 0;
    font-size: var(--el-font-size-small);
    color: var(--el-text-color-regular);
  }

  .el-input-number {
    width: 96px;
  }
}

.payday-reset {
  width: 100%;
  margin-top: 8px;
}

html[data-device='mobile'] {
  /* 移动端通栏卡片与日历/一言主体等高 */
  .payday-widget {
    min-height: 120px;
  }
}
</style>
