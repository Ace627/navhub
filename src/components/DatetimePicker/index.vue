<template>
  <el-drawer v-model="visible" class="datetime-picker" direction="btt" size="auto" :lock-scroll="false" :with-header="false" :append-to-body="true" :close-on-click-modal="true" @opened="syncColumns">
    <div class="picker-panel">
      <!-- 工具栏：取消 | 标题 | 完成，对齐 Wot UI DatetimePicker 弹层 -->
      <div class="picker-toolbar">
        <el-text class="picker-action" @click="visible = false">取消</el-text>
        <span class="picker-title">{{ title }}</span>
        <el-text class="picker-action" type="primary" @click="handleConfirm">完成</el-text>
      </div>

      <!-- 滚轮区：时 / 分两列，scroll-snap 吸附居中，上下渐隐遮罩做视觉引导 -->
      <div class="picker-columns">
        <div ref="hourRef" class="picker-column" @scroll="onColumnScroll('hour', $event)">
          <div v-for="hour in 24" :key="hour" class="picker-item" :class="{ 'is-active': hourIndex === hour - 1 }" @click="scrollToItem(hourRef, hour - 1)">
            {{ pad(hour - 1) }}
          </div>
        </div>
        <div ref="minuteRef" class="picker-column" @scroll="onColumnScroll('minute', $event)">
          <div v-for="minute in 60" :key="minute" class="picker-item" :class="{ 'is-active': minuteIndex === minute - 1 }" @click="scrollToItem(minuteRef, minute - 1)">
            {{ pad(minute - 1) }}
          </div>
        </div>
        <i class="picker-mask is-top" />
        <i class="picker-mask is-bottom" />
      </div>
    </div>
  </el-drawer>
</template>

<script setup lang="ts">
defineOptions({ name: 'DatetimePicker' })

/**
 * 组件 Props 定义
 * @property {string} modelValue - 绑定值，HH:mm 格式
 * @property {boolean} show - 显隐状态，配合 v-model:show 使用
 * @property {string} title - 弹层标题
 */
const props = defineProps({
  modelValue: { type: String, default: '00:00' },
  show: { type: Boolean, default: false },
  title: { type: String, default: '' },
})

/**
 * 组件 Emits 定义
 * @property update:modelValue - 确认时同步 HH:mm 值
 * @property update:show - v-model:show 双向绑定同步
 * @property confirm - 点击完成后抛出，参数为 HH:mm 字符串
 */
const emit = defineEmits<{
  (event: 'update:modelValue', value: string): void
  (event: 'update:show', value: boolean): void
  (event: 'confirm', value: string): void
}>()

/** 滚轮单项高度（px），对齐 Wot UI item-height 默认值 44 */
const ITEM_HEIGHT = 44

/** 时 / 分两列滚动容器 */
const hourRef = ref<HTMLElement>()
const minuteRef = ref<HTMLElement>()

/** 两列当前命中的下标（驱动选中态加粗） */
const hourIndex = ref(0)
const minuteIndex = ref(0)

/** 弹层显隐：受控转发 */
const visible = computed({
  get: () => props.show,
  set: (value: boolean) => emit('update:show', value),
})

/**
 * 数字补零为两位字符串
 * @param value 0-59 的数字
 */
function pad(value: number) {
  return value.toString().padStart(2, '0')
}

/**
 * 把下标收敛到合法区间
 * @param index 原始下标
 * @param max 上界（含）
 */
function clampIndex(index: number, max: number) {
  return Math.min(Math.max(index, 0), max)
}

/** 弹层打开动画结束后，把两列滚轮定位到当前绑定值 */
function syncColumns() {
  const [hour, minute] = props.modelValue.split(':').map(Number)
  hourIndex.value = clampIndex(hour || 0, 23)
  minuteIndex.value = clampIndex(minute || 0, 59)
  setColumnScroll(hourRef.value, hourIndex.value)
  setColumnScroll(minuteRef.value, minuteIndex.value)
}

/**
 * 直接设置某列滚动位置（不平滑，避免打开时可见滚动过程）
 * @param column 滚动容器
 * @param index 目标下标
 */
function setColumnScroll(column: HTMLElement | undefined, index: number) {
  if (column) column.scrollTop = index * ITEM_HEIGHT
}

/**
 * 滚轮滚动回调：按滚动位置实时换算命中下标，吸附对齐后即为最终值
 * @param column 列标识
 * @param event 原生 scroll 事件
 */
function onColumnScroll(column: 'hour' | 'minute', event: Event) {
  const el = event.target as HTMLElement
  const index = clampIndex(Math.round(el.scrollTop / ITEM_HEIGHT), column === 'hour' ? 23 : 59)
  if (column === 'hour') hourIndex.value = index
  else minuteIndex.value = index
}

/**
 * 点击某个选项：平滑滚动使其居中
 * @param column 滚动容器
 * @param index 目标下标
 */
function scrollToItem(column: HTMLElement | undefined, index: number) {
  column?.scrollTo({ top: index * ITEM_HEIGHT, behavior: 'smooth' })
}

/** 点击完成：把当前两列下标合成 HH:mm 抛出并关闭 */
function handleConfirm() {
  const value = `${pad(hourIndex.value)}:${pad(minuteIndex.value)}`
  emit('update:modelValue', value)
  emit('confirm', value)
  visible.value = false
}
</script>

<style lang="scss" scoped>
.picker-panel {
  /* 底部安全区：全面屏手势条不留白遮挡 */
  padding-bottom: max(8px, env(safe-area-inset-bottom));
  user-select: none;
}

/* 工具栏：取消 / 标题 / 完成 三段布局 */
.picker-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 56px;
  padding: 0 32px;
}

.picker-title {
  flex: 1;
  overflow: hidden;
  text-align: center;
  font-size: var(--el-font-size-medium);
  font-weight: 600;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--el-text-color-primary);
}

.picker-action {
  font-size: var(--el-font-size-medium);
  cursor: pointer;
}

/* 滚轮区：两列均分，上下遮罩悬浮其上 */
.picker-columns {
  position: relative;
  display: flex;
  padding: 0 24px;
}

.picker-column {
  flex: 1;
  height: calc(44px * 6);
  /* 上下各留出 (可见高度 - 单项高度) / 2 的空档，让首尾项也能吸附居中 */
  padding: calc((44px * 6 - 44px) / 2) 0;
  overflow-y: auto;
  scroll-snap-type: y mandatory;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }
}

.picker-item {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 44px;
  scroll-snap-align: center;
  font-size: var(--el-font-size-extra-large);
  font-variant-numeric: tabular-nums;
  color: var(--el-text-color-regular);

  &.is-active {
    font-weight: 600;
    color: var(--el-text-color-primary);
  }
}

/* 上下渐隐遮罩：以弹层底色向透明过渡，替代实线分隔线 */
.picker-mask {
  position: absolute;
  left: 24px;
  right: 24px;
  height: calc((44px * 6 - 44px) / 2);
  pointer-events: none;

  &.is-top {
    top: 0;
    background: linear-gradient(180deg, var(--el-bg-color) 30%, transparent);
  }

  &.is-bottom {
    bottom: 0;
    background: linear-gradient(0deg, var(--el-bg-color) 30%, transparent);
  }
}

/* 抽屉被 Teleport 到 body，容器样式需用 :global 命中（注意 Vue scoped 是单冒号 :global 语法） */
:global(.datetime-picker) {
  border-radius: 32px 32px 0 0;
}

:global(.datetime-picker .el-drawer__body) {
  padding: 0;
  overflow: hidden;
}
</style>
