<template>
  <el-drawer
    v-model="visible"
    :class="['action-sheet', { 'is-round': round }]"
    :style="drawerStyle"
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
    <div class="action-sheet__body">
      <!-- 头部：关闭按钮 + 标题 + 描述，三者均为空时不渲染 -->
      <div v-if="showHeader" class="action-sheet__header">
        <el-button v-if="closeable" text class="action-sheet__close" @click="close('close')">
          <SvgIcon :name="closeIcon" :size="18" />
        </el-button>
        <p v-if="titleLines.length" class="action-sheet__title">
          <span v-for="(line, index) in titleLines" :key="index">{{ line }}</span>
        </p>
        <p v-if="description || slots.description" class="action-sheet__description">
          <slot name="description">{{ description }}</slot>
        </p>
      </div>

      <!-- 内容区：默认渲染 actions 列表，传入默认插槽则完全自定义 -->
      <div class="action-sheet__content">
        <slot>
          <el-button
            v-for="(action, index) in actions"
            :key="index"
            text
            class="action-sheet__action"
            :class="action.className"
            :disabled="action.disabled"
            :style="action.color ? { color: action.color } : undefined"
            @click="handleSelect(action, index)"
          >
            <slot name="action" :action="action" :index="index">
              <SvgIcon v-if="action.icon" class="action-sheet__action-icon" :name="action.icon" :size="18" />
              <span class="action-sheet__action-name">{{ action.name }}</span>
              <span v-if="action.subname" class="action-sheet__action-subname">{{ action.subname }}</span>
            </slot>
          </el-button>
        </slot>
      </div>

      <!-- 取消按钮：与内容区之间留出分隔间距 -->
      <el-button v-if="cancelText || slots.cancel" text class="action-sheet__cancel" @click="handleCancel">
        <slot name="cancel">{{ cancelText }}</slot>
      </el-button>
    </div>
  </el-drawer>
</template>

<script setup lang="ts">
defineOptions({ name: 'ActionSheet' })
import type { ActionSheetAction, ActionSheetCloseAction } from './types'

/**
 * 组件 Props 定义（对齐 Vant ActionSheet，差异点已在各字段注明）
 * @property {boolean} [modelValue] - 显隐状态，配合 v-model 使用
 * @property {boolean} [show] - 显隐状态，配合 v-model:show 使用；与 modelValue 同时存在时以本字段为准
 * @property {ActionSheetAction[]} actions - 选项列表
 * @property {string|string[]} title - 顶部标题，传数组表示多行
 * @property {string} description - 选项上方的描述文案
 * @property {string} cancelText - 取消按钮文字，为空则不渲染
 * @property {number|string} itemHeight - 选项行与取消按钮的行高（px），默认 36
 * @property {boolean} closeable - 是否显示右上角关闭按钮
 * @property {string} closeIcon - 关闭图标名称，对应 src/assets/svg-icons 下图标
 * @property {number|string} duration - 动画时长（秒），传 0 可禁用动画
 * @property {number} [zIndex] - 固定层级，不传则由 el-drawer 自动分配
 * @property {boolean} round - 是否显示顶部圆角
 * @property {boolean} overlay - 是否显示遮罩层
 * @property {string|string[]|object} overlayClass - 自定义遮罩层类名
 * @property {boolean} lockScroll - 是否锁定背景滚动
 * @property {boolean} lazyRender - 是否仅在显示时渲染节点，关闭后每次关闭都会销毁 DOM
 * @property {boolean} closeOnClickAction - 点击选项后是否关闭
 * @property {boolean} closeOnClickOverlay - 点击遮罩层后是否关闭
 * @property {boolean} closeOnPressEscape - 按下 ESC 是否关闭（Vant 无此项，为 el-drawer 能力补充）
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
  cancelText: { type: String, default: '' },
  itemHeight: { type: [Number, String], default: 36 },
  closeable: { type: Boolean, default: true },
  closeIcon: { type: String, default: 'Close' },
  duration: { type: [Number, String], default: 0.3 },
  zIndex: { type: Number, default: undefined },
  round: { type: Boolean, default: true },
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
 * @property select - 点击选项（禁用项不触发）
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

/** 是否渲染头部：标题、描述、关闭按钮任意其一存在即渲染 */
const showHeader = computed(() => props.closeable || !!titleLines.value.length || !!props.description || !!slots.description)

/** 抽屉行内样式：通过 CSS 变量下发动画时长、行高与底部安全区高度 */
const drawerStyle = computed(() => {
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
 * 关闭面板
 * @param action 关闭来源，传给 beforeClose 回调
 */
function close(action: ActionSheetCloseAction) {
  runBeforeClose(action, () => {
    visible.value = false
  })
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
 * @description 1. 禁用项直接中断；2. 抛出 select 事件并执行选项自带 callback；3. closeOnClickAction 为真时自动关闭，且不经过 beforeClose
 */
function handleSelect(action: ActionSheetAction, index: number) {
  if (action.disabled) return
  emit('select', action, index)
  if (props.closeOnClickAction) visible.value = false
  action.callback?.(action)
}

/**
 * 点击取消按钮
 * @description 抛出 cancel 事件后走 beforeClose 判定再关闭
 */
function handleCancel() {
  emit('cancel')
  close('cancel')
}
</script>

<style lang="scss" scoped>
.action-sheet__body {
  padding-bottom: max(8px, var(--action-sheet-safe-bottom, 0px));
  /* 面板由长按触发，若不禁用选中会在手指抬起时选中文案 */
  user-select: none;
}

/* 头部：标题与描述居中，关闭按钮绝对定在左上角 */
.action-sheet__header {
  position: relative;
  padding: 16px 48px 12px;
  text-align: center;
}

.action-sheet__title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  line-height: 1.4;
  color: var(--el-text-color-primary);

  span {
    display: block;
  }
}

.action-sheet__description {
  margin: 6px 0 0;
  font-size: 14px;
  line-height: 1.5;
  color: var(--el-text-color-secondary);
}

.action-sheet__close {
  position: absolute;
  top: 10px;
  right: 8px;
  width: 32px;
  height: 32px;
  padding: 0;
  font-size: 18px;
  color: var(--el-text-color-secondary);
}

/* 选项行：整行可点，标题与二级说明左右分布 */
.action-sheet__action {
  justify-content: space-between;
  width: 100%;
  height: var(--action-sheet-item-height, 36px);
  padding: 0 16px;
  font-size: 16px;
  border-radius: 0;

  &:not(:last-child) {
    border-bottom: 1px solid var(--el-border-color-lighter);
  }

  :deep(> span) {
    display: flex;
    gap: 8px;
    align-items: center;
    justify-content: space-between;
    width: 100%;
  }
}

.action-sheet__action-icon {
  flex-shrink: 0;
  color: var(--el-text-color-secondary);
}

.action-sheet__action-subname {
  overflow: hidden;
  font-size: 14px;
  color: var(--el-text-color-secondary);
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 取消按钮：与内容区之间留出 8px 间距并加分割线 */
.action-sheet__cancel {
  width: 100%;
  height: var(--action-sheet-item-height, 36px);
  margin-top: 8px;
  font-size: 16px;
  font-weight: 600;
  border-top: 1px solid var(--el-border-color-lighter);
  border-radius: 0;
}

/* 移动端：选项内容整体水平居中 */
html[data-device='mobile'] {
  .action-sheet__action {
    :deep(> span) {
      justify-content: center;
    }
  }
}

/* Element Plus 相邻按钮默认带 12px 左边距，会让第二行起整行右移，这里按更高特异性清零 */
.action-sheet__body .el-button.action-sheet__action,
.action-sheet__body .el-button.action-sheet__cancel {
  margin: 0;
}

/* 取消按钮重新补回与内容区的间距（被上面清零规则覆盖） */
.action-sheet__body .el-button.action-sheet__cancel {
  margin-top: 8px;
}

/* 抽屉容器：抽屉被 Teleport 到 body，样式需用 :global 命中 */
:global(.action-sheet) {
  max-height: 80vh;
  box-shadow: none;
  transition-duration: var(--action-sheet-duration, 0.3s);
}

:global(.action-sheet.is-round) {
  border-radius: 16px 16px 0 0;
}

/* 抽屉内容区：去掉默认内边距，交由内容区自行控制，超出高度内部滚动 */
:global(.action-sheet .el-drawer__body) {
  padding: 0;
  overflow-y: auto;
}
</style>