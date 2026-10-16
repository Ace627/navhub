<template>
  <el-drawer
    v-model="visible"
    class="action-sheet"
    direction="btt"
    size="auto"
    :with-header="false"
    :modal="overlay"
    :modal-class="overlayClass"
    :lock-scroll="lockScroll"
    :close-on-click-modal="closeOnClickOverlay"
    :close-on-press-escape="closeOnPressEscape"
    :append-to-body="appendToBody"
    :append-to="teleport"
    :z-index="zIndex"
    :destroy-on-close="!lazyRender"
    :before-close="handleBeforeClose"
    @open="emit('open')"
    @opened="emit('opened')"
    @close="emit('close')"
    @closed="emit('closed')"
  >
    <div class="action-sheet__body" :style="bodyStyle">
      <!-- 工具栏：取消 | 标题 | 完成，对齐 DatetimePicker 弹层的三段式头部 -->
      <div class="action-sheet__toolbar">
        <el-text v-if="cancelText" class="action-sheet__toolbar-action" @click="handleCancel">{{ cancelText }}</el-text>
        <span v-else class="action-sheet__toolbar-blank" />
        <span class="action-sheet__title">
          <span v-for="(line, index) in titleLines" :key="index" class="action-sheet__title-line">{{ line }}</span>
        </span>
        <el-text v-if="confirmText" class="action-sheet__toolbar-action is-confirm" type="primary" @click="handleConfirm">{{ confirmText }}</el-text>
        <span v-else class="action-sheet__toolbar-blank" />
      </div>

      <!-- 描述文案：工具栏下方居中展示 -->
      <p v-if="description || slots.description" class="action-sheet__description">
        <slot name="description">{{ description }}</slot>
      </p>

      <!-- 内容区：默认渲染 actions 列表，传入默认插槽则完全自定义 -->
      <div class="action-sheet__content">
        <slot>
          <el-button
            v-for="(action, index) in actions"
            :key="index"
            text
            class="action-sheet__item"
            :class="[{ 'is-active': confirmText && selectedIndex === index }, action.className]"
            :disabled="action.disabled"
            :style="action.color ? { color: action.color } : undefined"
            @click="handleSelect(action, index)"
          >
            <slot name="action" :action="action" :index="index">
              <SvgIcon v-if="action.icon" class="action-sheet__item-icon" :name="action.icon" :size="18" />
              <span class="action-sheet__item-name">{{ action.name }}</span>
              <span v-if="action.subname" class="action-sheet__item-subname">{{ action.subname }}</span>
            </slot>
          </el-button>
        </slot>
      </div>
    </div>
  </el-drawer>
</template>

<script setup lang="ts">
defineOptions({ name: 'ActionSheet' })
import type { ActionSheetAction, ActionSheetCloseAction } from './types'

/**
 * 组件 Props 定义（视觉与交互对齐 DatetimePicker 底部弹层，差异点已在各字段注明）
 * @property {boolean} [modelValue] - 显隐状态，配合 v-model 使用
 * @property {boolean} [show] - 显隐状态，配合 v-model:show 使用；与 modelValue 同时存在时以本字段为准
 * @property {ActionSheetAction[]} actions - 选项列表
 * @property {string|string[]} title - 工具栏标题，传数组表示多行
 * @property {string} description - 选项上方的描述文案
 * @property {string} cancelText - 工具栏左侧取消文案，传空串则不渲染取消位
 * @property {string} confirmText - 工具栏右侧确认文案；非空时进入确认模式：点选项仅高亮，点确认才提交并关闭
 * @property {number} activeIndex - 确认模式下打开面板时的默认选中下标（如当前搜索引擎）
 * @property {number|string} itemHeight - 选项行高（px），默认 44，与 DatetimePicker 滚轮行高一致
 * @property {number|string} duration - 动画时长（秒），传 0 可禁用动画
 * @property {number} [zIndex] - 固定层级，不传则由 el-drawer 自动分配
 * @property {boolean} overlay - 是否显示遮罩层
 * @property {string|string[]|object} overlayClass - 自定义遮罩层类名
 * @property {boolean} lockScroll - 是否锁定背景滚动
 * @property {boolean} lazyRender - 是否仅在显示时渲染节点，关闭后每次关闭都会销毁 DOM
 * @property {boolean} closeOnClickAction - 即时模式下点击选项后是否关闭（确认模式下无效，由确认按钮统一关闭）
 * @property {boolean} closeOnClickOverlay - 点击遮罩层后是否关闭
 * @property {boolean} closeOnPressEscape - 按下 ESC 是否关闭
 * @property {boolean} safeAreaInsetBottom - 是否开启底部安全区适配
 * @property {boolean} appendToBody - 是否挂载到 body，避免受父级定位与层级影响
 * @property {string} teleport - 挂载节点，等同 Vue Teleport 的 to 属性
 * @property {(action: ActionSheetCloseAction) => boolean|Promise<boolean>} [beforeClose] - 关闭前回调，返回 false 可阻止关闭
 */
const props = defineProps({
  modelValue: { type: Boolean, default: undefined },
  show: { type: Boolean, default: undefined },
  actions: { type: Array as PropType<ActionSheetAction[]>, default: () => [] },
  title: { type: [String, Array] as PropType<string | string[]>, default: '' },
  description: { type: String, default: '' },
  cancelText: { type: String, default: '取消' },
  confirmText: { type: String, default: '' },
  activeIndex: { type: Number, default: -1 },
  itemHeight: { type: [Number, String], default: 44 },
  duration: { type: [Number, String], default: 0.3 },
  zIndex: { type: Number, default: undefined },
  overlay: { type: Boolean, default: true },
  overlayClass: { type: [String, Array, Object] as PropType<string | string[] | Record<string, boolean>>, default: '' },
  lockScroll: { type: Boolean, default: true },
  lazyRender: { type: Boolean, default: true },
  closeOnClickAction: { type: Boolean, default: false },
  closeOnClickOverlay: { type: Boolean, default: true },
  closeOnPressEscape: { type: Boolean, default: true },
  safeAreaInsetBottom: { type: Boolean, default: true },
  appendToBody: { type: Boolean, default: true },
  teleport: { type: String, default: 'body' },
  beforeClose: { type: Function as PropType<(action: ActionSheetCloseAction) => boolean | Promise<boolean>>, default: undefined },
})

/**
 * 组件 Emits 定义
 * @property update:modelValue - v-model 双向绑定同步
 * @property update:show - v-model:show 双向绑定同步
 * @property select - 提交选中项：即时模式为点击选项时，确认模式为点击确认按钮时（禁用项不触发）
 * @property cancel - 点击取消按钮
 * @property open - 面板开始显示
 * @property opened - 面板显示动画结束
 * @property close - 面板开始关闭
 * @property closed - 面板关闭动画结束
 */
const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'update:show', value: boolean): void
  (e: 'select', action: ActionSheetAction, index: number): void
  (e: 'cancel'): void
  (e: 'open'): void
  (e: 'opened'): void
  (e: 'close'): void
  (e: 'closed'): void
}>()

const slots = useSlots()

/** 非受控场景下的内部显隐状态 */
const innerVisible = ref(false)

/** 面板实际显隐：优先取受控值（show / modelValue），两者都未传时退化为内部状态 */
const visible = computed({
  get: () => props.show ?? props.modelValue ?? innerVisible.value,
  set: (value: boolean) => {
    innerVisible.value = value
    emit('update:modelValue', value)
    emit('update:show', value)
  },
})

/** 标题行数组：传数组时按多行渲染 */
const titleLines = computed(() => {
  if (Array.isArray(props.title)) return props.title
  return props.title ? [props.title] : []
})

/** 确认模式下当前选中的选项下标，-1 表示尚未选择 */
const selectedIndex = ref(-1)

/** 每次打开面板时按入参恢复默认选中项 */
watch(visible, (value) => {
  if (value) selectedIndex.value = props.activeIndex
})

/** 弹层行内样式：通过 CSS 变量下发动画时长、选项行高与底部安全区高度 */
const bodyStyle = computed(() => {
  return {
    '--action-sheet-duration': `${props.duration}s`,
    '--action-sheet-item-height': typeof props.itemHeight === 'number' ? `${props.itemHeight}px` : props.itemHeight,
    '--action-sheet-safe-bottom': props.safeAreaInsetBottom ? 'env(safe-area-inset-bottom)' : '0px',
  }
})

/**
 * 执行关闭前的拦截判定
 * @param action 关闭来源
 * @param done 允许关闭时的后续回调
 * @description 1. 未传 beforeClose 直接放行；2. 返回 false 视为阻止关闭；3. 返回 Promise 时按 resolve 结果决定是否继续
 */
function runBeforeClose(action: ActionSheetCloseAction, done: () => void) {
  if (!props.beforeClose) {
    done()
    return
  }
  const result = props.beforeClose(action)
  if (result instanceof Promise) {
    result.then((allow) => {
      if (allow) done()
    })
    return
  }
  if (result) done()
}

/**
 * el-drawer 的关闭前拦截回调（遮罩点击与 ESC 均由此进入）
 * @param done el-drawer 提供的放行回调，不调用则面板保持打开
 * @description el-drawer 不区分遮罩与 ESC，统一按 overlay 来源交给 beforeClose 判定
 */
function handleBeforeClose(done: () => void) {
  runBeforeClose('overlay', done)
}

/**
 * 点击选项
 * @param action 当前选项对象
 * @param index 选项在 actions 中的下标
 * @description 1. 禁用项直接中断；2. 确认模式下仅记录选中下标驱动高亮；3. 即时模式下抛出 select 事件、执行选项 callback 并按需关闭
 */
function handleSelect(action: ActionSheetAction, index: number) {
  if (action.disabled) return
  if (props.confirmText) {
    selectedIndex.value = index
    return
  }
  emit('select', action, index)
  if (props.closeOnClickAction) visible.value = false
  action.callback?.(action)
}

/**
 * 点击确认按钮：提交当前选中项后关闭
 * @description 未选中或选中禁用项时不提交；提交路径不经过 beforeClose，与 DatetimePicker 确认行为一致
 */
function handleConfirm() {
  const action = props.actions[selectedIndex.value]
  if (!action || action.disabled) return
  emit('select', action, selectedIndex.value)
  action.callback?.(action)
  visible.value = false
}

/**
 * 点击取消按钮
 * @description 抛出 cancel 事件后走 beforeClose 判定再关闭
 */
function handleCancel() {
  emit('cancel')
  runBeforeClose('cancel', () => {
    visible.value = false
  })
}
</script>

<style lang="scss" scoped>
.action-sheet__body {
  padding-bottom: max(8px, var(--action-sheet-safe-bottom, 0px));
  /* 面板由长按触发，若不禁用选中会在手指抬起时选中文案 */
  user-select: none;
}

/* 工具栏：取消 | 标题 | 完成 三段布局，网格保证标题严格居中 */
.action-sheet__toolbar {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  min-height: 56px;
  padding: 0 32px;
}

.action-sheet__toolbar-action {
  font-size: var(--el-font-size-medium);
  cursor: pointer;

  &.is-confirm {
    justify-self: end;
  }
}

.action-sheet__toolbar-blank {
  min-width: 0;
}

.action-sheet__title {
  overflow: hidden;
  font-size: var(--el-font-size-medium);
  font-weight: 600;
  text-align: center;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--el-text-color-primary);
}

.action-sheet__title-line {
  display: block;
  line-height: 1.4;
}

.action-sheet__description {
  margin: 0 32px 8px;
  font-size: 14px;
  line-height: 1.5;
  text-align: center;
  color: var(--el-text-color-secondary);
}

/* 选项行：对齐 DatetimePicker 滚轮项——整行居中、无分隔线，选中项主色加粗 */
.action-sheet__item {
  justify-content: center;
  width: 100%;
  height: var(--action-sheet-item-height, 44px);
  padding: 0 32px;
  font-size: 16px;
  border-radius: 0;

  :deep(> span) {
    display: flex;
    gap: 8px;
    align-items: center;
    justify-content: center;
    width: 100%;
  }

  &.is-active .action-sheet__item-name {
    font-weight: 600;
    color: var(--el-color-primary);
  }
}

.action-sheet__item-icon {
  flex-shrink: 0;
  color: var(--el-text-color-secondary);
}

.action-sheet__item-name {
  font-size: 16px;
}

.action-sheet__item-subname {
  overflow: hidden;
  font-size: 14px;
  color: var(--el-text-color-secondary);
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Element Plus 相邻按钮默认带 12px 左边距，会让第二行起整行右移，这里按更高特异性清零 */
.action-sheet__body .el-button.action-sheet__item {
  margin: 0;
}

/* 抽屉容器：抽屉被 Teleport 到 body，样式需用 :global 命中 */
:global(.action-sheet) {
  max-height: 80vh;
  border-radius: 32px 32px 0 0;
  box-shadow: none;
  transition-duration: var(--action-sheet-duration, 0.3s);
}

/* 抽屉内容区：去掉默认内边距，交由内容区自行控制，超出高度内部滚动 */
:global(.action-sheet .el-drawer__body) {
  padding: 0;
  overflow-y: auto;
}
</style>
