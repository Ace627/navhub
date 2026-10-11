<template>
  <!-- 透传所有 el-tooltip 属性，完全兼容原生用法；$attrs 置于默认值之后，保证外部传参能覆盖默认延迟 -->
  <el-tooltip :show-after="320" :disabled="disabled" v-bind="$attrs">
    <!-- 触发元素插槽，和原生一致 -->
    <slot>{{ displayText }}</slot>
    <!-- 自定义内容插槽，处理换行和宽度 -->
    <template #content>
      <div class="pro-tooltip-content" :style="{ maxWidth: contentMaxWidth }">
        <!-- 优先使用 content 插槽，其次支持原生 content 属性 -->
        <slot name="content"> {{ props.content }} </slot>
      </div>
    </template>
  </el-tooltip>
</template>

<script setup lang="ts">
import type { PropType } from 'vue'

defineOptions({ name: 'ProTooltip' })

const props = defineProps({
  /** 提示框宽度 */
  width: { type: [String, Number], default: 240 },
  /** 透传 el-tooltip 的 content 属性，兼容原生用法 */
  content: { type: String, default: '' },
  /** 触发文字最大显示字数（超出自动...），0 表示不截断 */
  length: { type: Number, default: 0 },
  /** 省略符号 */
  ellipsis: { type: String, default: '...' },
  /** 截断判定目标元素：传入后仅在其内容被截断时显示提示，通常传入触发元素自身的 ref */
  truncateTarget: { type: Object as PropType<HTMLElement | null>, default: null },
})

// 计算：显示的截取文字
const displayText = computed(() => {
  const text = props.content || ''
  if (!props.length || text.length <= props.length) return text
  return text.slice(0, props.length) + props.ellipsis
})

/** 目标元素内容是否被截断：未测量或无法测量时按「可显示」处理，避免提示被永久禁用 */
const truncated = ref(true)

/** 上一次测量时的目标宽度：宽度未变说明换行结果不变，跳过重测 */
let measuredWidth = -1

/** 行数限制属性：测量时临时解除，取到内容完整高度后立即还原 */
const LINE_CLAMP_PROPS = ['-webkit-line-clamp', 'line-clamp']

/**
 * 测量目标元素内容是否被截断
 *
 * 元素被 -webkit-line-clamp 截断时 scrollHeight 与 clientHeight 相等，直接比较无法判断，
 * 故先记录截断后的可见尺寸，再临时解除行数限制取内容完整尺寸，比较后立即还原（同一帧内完成，不会产生可见跳动）；
 * 单行省略（nowrap + text-overflow）不产生纵向差异，由横向滚动宽度兜底判定
 */
function measureTruncated(): void {
  const el = props.truncateTarget
  if (!el) return
  const visibleHeight = el.clientHeight
  const visibleWidth = el.clientWidth
  const savedStyles = LINE_CLAMP_PROPS.map((name) => [name, el.style.getPropertyValue(name)] as const)
  for (const [name] of savedStyles) el.style.setProperty(name, 'unset')
  const fullHeight = el.scrollHeight
  const fullWidth = el.scrollWidth
  for (const [name, value] of savedStyles) {
    if (value) el.style.setProperty(name, value)
    else el.style.removeProperty(name)
  }
  truncated.value = fullHeight > visibleHeight + 1 || fullWidth > visibleWidth + 1
}

/**
 * 目标元素尺寸变化回调：宽度未变时换行结果不变，跳过重测
 */
function handleTargetResize(): void {
  const el = props.truncateTarget
  if (!el || el.clientWidth === measuredWidth) return
  measuredWidth = el.clientWidth
  measureTruncated()
}

// 目标元素挂载后先测一次；缩放、侧栏折叠、字体切换等改变宽度时按宽度重测
onMounted(() => nextTick(measureTruncated))
useResizeObserver(() => props.truncateTarget, handleTargetResize)

// 文案变化时宽度可能不变但行数已变，同样需要重测
watch(
  () => props.content,
  () => nextTick(measureTruncated),
)

/** 是否禁用提示框：无内容、字数未超限，或指定了截断判定且内容完整可见时禁用 */
const disabled = computed(() => {
  const text = props.content || ''
  if (!text) return true
  if (props.length > 0 && text.length <= props.length) return true
  return props.truncateTarget !== null && !truncated.value
})

const contentMaxWidth = computed(() => {
  return typeof props.width === 'number' ? `${props.width}px` : props.width
})
</script>

<style lang="scss" scoped>
/* 核心样式：自动换行 + 阅读优化 */
.pro-tooltip-content {
  text-align: justify;
  white-space: pre-wrap; /* 保留文本换行，超过宽度自动折行 */
  word-break: break-word; /* 长英文/数字自动换行，避免溢出 */
  line-height: 1.5; /* 行高优化，提升可读性 */
}
</style>
