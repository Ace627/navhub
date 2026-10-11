<template>
  <section class="stat-grid">
    <div v-for="stat in statList" :key="stat.label" class="stat-card" :class="{ 'is-copyable': stat.copyText }" @click="handleCopyStat(stat)">
      <strong>{{ stat.value }}</strong>
      <span>{{ stat.label }}</span>
    </div>
  </section>
</template>

<script setup lang="ts">
import { copyText } from '@/utils'
import { QQ_GROUP } from '../about.config'

/** 统计卡数据入参 */
interface Props {
  /** 站点分类数量 */
  categoryCount: number
  /** 收录站点数量 */
  siteCount: number
}

const props = defineProps<Props>()

/** 统计卡片项：copyText 有值时卡片可点击复制 */
interface StatItem {
  label: string
  value: string
  copyText?: string
}

/** 系统帧率，由 requestAnimationFrame 采样 */
const fps = useFps()

/**
 * 分类数量的滚动动画值
 *
 * 数据由接口异步返回，从 0 到目标值的过渡由 useTransition 驱动，避免数字跳变
 */
const categoryCountDisplay = useTransition(() => props.categoryCount, { duration: 600 })

/** 收录站点数量的滚动动画值，口径同分类数量 */
const siteCountDisplay = useTransition(() => props.siteCount, { duration: 600 })

/** 统计卡片数据：交流群号支持点击复制 */
const statList = computed<StatItem[]>(() => [
  { label: '站点分类', value: `${Math.round(categoryCountDisplay.value)}` },
  { label: '收录站点', value: `${Math.round(siteCountDisplay.value)}` },
  { label: '交流群号', value: QQ_GROUP, copyText: QQ_GROUP },
  { label: '系统帧率', value: `${fps.value}` },
])

/**
 * 点击统计卡片时复制该项的值
 *
 * 仅带 copyText 的卡片有复制能力，其余卡片点击不做处理，避免无意义反馈；
 * 复制结果提示由 utils 的 copyText 统一给出
 *
 * @param stat 被点击的统计卡数据项
 */
function handleCopyStat(stat: StatItem) {
  if (!stat.copyText) return
  copyText(stat.copyText)
}
</script>

<style lang="scss" scoped>
/* 统计卡片区 */
.stat-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.stat-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 20px 16px;
  background-color: var(--el-bg-color);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 8px;
  transition:
    transform var(--el-transition-duration-fast),
    box-shadow var(--el-transition-duration-fast),
    border-color var(--el-transition-duration-fast);

  &:hover {
    border-color: var(--el-color-primary-light-5);
    box-shadow: 0 4px 12px rgb(0 0 0 / 8%);
    transform: translateY(-2px);
  }

  strong {
    font-size: 26px;
    font-weight: 600;
    color: var(--el-text-color-primary);
  }

  span {
    font-size: 13px;
    color: var(--el-text-color-secondary);
  }

  /* 可复制卡片：光标与 user-select 区分于只读卡片 */
  &.is-copyable {
    cursor: pointer;
    user-select: none;
  }
}

html[data-device='mobile'] {
  .stat-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;
  }

  .stat-card {
    padding: 12px 8px;

    strong {
      font-size: 20px;
    }
  }
}
</style>
