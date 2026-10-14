/**
 * 可触发点击震动的交互元素选择器：
 * 覆盖原生交互元素、显式无障碍角色与 Element Plus 中非 button 渲染的可点项
 */
const HAPTIC_SELECTOR = [
  'a',
  'button',
  'input',
  'textarea',
  'select',
  'label',
  'summary',
  '[role="button"]',
  '[role="switch"]',
  '[role="radio"]',
  '[role="checkbox"]',
  '[role="tab"]',
  '.el-segmented__item',
  '.el-rate__item',
].join(', ')

/** 点击震动时长（毫秒），轻触感即可 */
const HAPTIC_DURATION = 15

/** 移动端点击触觉反馈：命中可交互元素时触发一次轻震动 */
export function useHaptics() {
  const appStore = useAppStore()

  /** 全局点击回调：仅移动端且点击目标为可交互元素时震动 */
  function _clickHandler(event: MouseEvent) {
    if (!appStore.isMobile || typeof navigator.vibrate !== 'function') return
    const target = event.target as HTMLElement | null
    if (target?.closest?.(HAPTIC_SELECTOR)) navigator.vibrate(HAPTIC_DURATION)
  }

  /** 捕获阶段监听，避免业务侧 stopPropagation 漏掉事件 */
  onMounted(() => document.addEventListener('click', _clickHandler, true))

  onBeforeUnmount(() => document.removeEventListener('click', _clickHandler, true))
}
