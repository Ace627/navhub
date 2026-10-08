/** 移动端搜索面板共享开关：供 FloatNav 触发、HeaderSearch 消费 */
const mobileSearchVisible = ref(false)

/**
 * 获取移动端搜索面板的全局共享可见状态
 *
 * @returns 全局共享的可见性 ref
 */
export function useMobileSearch() {
  return mobileSearchVisible
}
