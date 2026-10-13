/** 移动端搜索面板共享开关：HeaderSearch 内部触发与面板展示共用 */
const mobileSearchVisible = ref(false)

/**
 * 获取移动端搜索面板的全局共享可见状态
 *
 * @returns 全局共享的可见性 ref
 */
export function useMobileSearch() {
  return mobileSearchVisible
}
