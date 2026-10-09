/**
 * 动作面板选项定义（对齐 Vant ActionSheet 的 Action 结构）
 */
export interface ActionSheetAction {
  /** 选项标题 */
  name?: string
  /** 二级说明文字，展示在标题之后 */
  subname?: string
  /** 文字颜色，支持色值或 CSS 变量；不传继承面板主文字色 */
  color?: string
  /** 图标名称，对应 src/assets/svg-icons 下的图标；不传不展示 */
  icon?: string
  /** 附加 class，用于定制单个选项样式 */
  className?: string | string[] | Record<string, boolean>
  /** 是否禁用，禁用后点击不触发 select 事件与 callback */
  disabled?: boolean
  /** 点击回调，接收当前选项对象 */
  callback?: (action: ActionSheetAction) => void
}

/**
 * 触发关闭的来源，用于 beforeClose 回调区分
 * - cancel：点击取消按钮
 * - close：点击右上角关闭按钮
 * - overlay：点击遮罩层或按下 ESC（el-drawer 不区分二者，统一按遮罩处理）
 */
export type ActionSheetCloseAction = 'cancel' | 'close' | 'overlay'