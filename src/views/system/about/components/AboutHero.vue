<template>
  <section class="hero">
    <div class="hero-logo-wrap">
      <img class="hero-logo" :src="IMG_FAVICON" alt="logo" draggable="false" referrerpolicy="no-referrer" />
    </div>
    <div class="hero-info">
      <div class="hero-head">
        <h2 class="hero-title">{{ SITE_TITLE }}</h2>
        <span class="hero-version">{{ APP_VERSION }}</span>
      </div>
      <p class="hero-desc">{{ SITE_DESC }}</p>
      <p class="hero-uptime">
        <span>已运行 {{ uptimeText }}</span>
      </p>
    </div>
  </section>
</template>

<script setup lang="ts">
import dayjs from 'dayjs'
import { IMG_FAVICON } from '@/common/constant/image.constant'
import { APP_VERSION, SITE_DESC, SITE_LAUNCH_TIME, SITE_TITLE } from '../about.config'

/** 当前时间，每秒刷新，用于驱动运行时长展示 */
const now = ref(new Date())

/** 运行时长每秒刷新，useIntervalFn 在组件卸载时自动停止 */
useIntervalFn(() => (now.value = new Date()), 1000)

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

.hero-head {
  display: flex;
  align-items: center;
  gap: 10px;
}

.hero-title {
  margin: 0 0 8px;
  font-size: 22px;
  font-weight: 600;
}

.hero-version {
  margin-bottom: 8px;
  padding: 2px 10px;
  font-size: 12px;
  font-weight: 600;
  color: var(--el-color-primary);
  background-color: var(--el-color-primary-light-9);
  border: 1px solid var(--el-color-primary-light-7);
  border-radius: 999px;
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

html[data-device='mobile'] {
  .hero {
    flex-direction: column;
    padding: 20px 16px;
    text-align: center;
  }

  .hero-head {
    justify-content: center;
  }

  .hero-desc {
    margin-bottom: 12px;
  }

  .hero-uptime {
    justify-content: center;
  }
}
</style>
