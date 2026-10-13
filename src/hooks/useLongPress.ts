/**
 * 移动端触屏长按交互：按住指定时长触发回调，位移超出阈值视为滚动滑动自动取消；
 * 长按触发后拦截紧随其后的 click，避免既弹出面板又触发点击跳转
 *
 * @param onLongPress 长按触发回调，参数为 onPointerDown 时传入的上下文（v-for 场景用于区分条目）
 * @param options 可选项：disabled 动态禁用（禁用时按下不启动计时）
 * @returns 需绑定到目标元素的事件处理器集合
 */
export function useLongPress<T>(onLongPress: (context: T | undefined) => void, options?: { disabled?: () => boolean }) {
  /** 触发长按所需的按压时长（毫秒） */
  const LONG_PRESS_DELAY = 450

  /** 长按过程中允许的最大位移（像素），超出视为滚动滑动，取消长按 */
  const LONG_PRESS_MOVE_THRESHOLD = 10

  /** 长按定时器句柄 */
  let longPressTimer: ReturnType<typeof setTimeout> | undefined

  /** 长按起始点横坐标 */
  let pressStartX = 0

  /** 长按起始点纵坐标 */
  let pressStartY = 0

  /** 按下时携带的上下文，触发时回传给回调（v-for 场景用于区分条目） */
  let pressContext: T | undefined

  /** 长按已触发标记：命中时拦截紧随其后的 click，避免既弹面板又触发跳转 */
  let suppressNextClick = false

  /**
   * 指针按下回调：仅触屏启动长按计时，记录起始点与上下文用于滑动取消
   *
   * @param event 指针事件对象
   * @param context 随按下携带、触发时回传给回调的上下文
   */
  function onPointerDown(event: PointerEvent, context?: T): void {
    if (options?.disabled?.() || event.pointerType !== 'touch') return
    pressContext = context
    pressStartX = event.clientX
    pressStartY = event.clientY
    longPressTimer = setTimeout(triggerLongPress, LONG_PRESS_DELAY)
  }

  /**
   * 指针移动回调：位移超出阈值视为滚动，取消长按计时
   *
   * @param event 指针事件对象
   */
  function onPointerMove(event: PointerEvent): void {
    if (!longPressTimer) return
    const deltaX = event.clientX - pressStartX
    const deltaY = event.clientY - pressStartY
    if (deltaX * deltaX + deltaY * deltaY > LONG_PRESS_MOVE_THRESHOLD * LONG_PRESS_MOVE_THRESHOLD) cancelLongPress()
  }

  /**
   * 触发长按：标记拦截后续 click 并执行回调
   */
  function triggerLongPress(): void {
    cancelLongPress()
    suppressNextClick = true
    onLongPress(pressContext)
  }

  /**
   * 取消长按计时并清理句柄
   */
  function cancelLongPress(): void {
    clearTimeout(longPressTimer)
    longPressTimer = undefined
  }

  /**
   * 指针抬起或取消回调：结束按压，清理长按计时
   */
  function onPointerRelease(): void {
    cancelLongPress()
  }

  /**
   * click 捕获回调：长按触发后的首次 click 在此拦截，避免既弹出面板又触发跳转
   *
   * @param event 点击事件对象
   */
  function onClickCapture(event: MouseEvent): void {
    if (!suppressNextClick) return
    suppressNextClick = false
    event.preventDefault()
    event.stopPropagation()
  }

  onBeforeUnmount(cancelLongPress)

  return { onPointerDown, onPointerMove, onPointerRelease, onClickCapture }
}
