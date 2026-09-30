const MAX_MOBILE_WIDTH = 750

/** 根据浏览器宽度变化，变换 Layout 布局 */
export function useResize() {
  const appStore = useAppStore()

  /** 用于判断当前设备是否为移动端 */
  function _isMobile(): boolean {
    const rect = document.body.getBoundingClientRect()
    return rect.width - 1 < MAX_MOBILE_WIDTH
  }

  /** 依据视口宽度写入设备类型 */
  function _updateDevice() {
    appStore.device = _isMobile() ? 'mobile' : 'desktop'
    document.documentElement.dataset['device'] = appStore.device
  }

  /** 用于处理窗口大小变化事件 */
  function _resizeHandler() {
    if (document.hidden) return
    _updateDevice()
  }

  // 挂载前先同步判定一次，避免移动端首帧按桌面布局渲染后再回弹
  _updateDevice()

  /** 在组件挂载前添加窗口大小变化事件监听器 */
  onBeforeMount(() => window.addEventListener('resize', _resizeHandler))

  /** 在组件卸载前移除窗口大小变化事件监听器 */
  onBeforeUnmount(() => window.removeEventListener('resize', _resizeHandler))
}
