/** 根据浏览器宽度变化，变换 Layout 布局 */
export function useResize() {
  const route = useRoute()
  const appStore = useAppStore()

  /** 用于判断当前设备是否为移动端 */
  function _isMobile(): boolean {
    const rect = document.body.getBoundingClientRect()
    return rect.width - 1 < 750
  }

  /** 用于处理窗口大小变化事件 */
  function _resizeHandler() {
    if (document.hidden) return
    appStore.device = _isMobile() ? 'mobile' : 'desktop'
    document.documentElement.dataset['device'] = appStore.device
    if (appStore.isMobile) appStore.closeSidebar(true)
  }

  /** 用于处理右键菜单事件：移动端统一阻止浏览器原生菜单（长按/右键），桌面端保留默认行为 */
  function _contextMenuHandler(event: MouseEvent) {
    if (appStore.isMobile) event.preventDefault()
  }

  /** 监听路由变化，根据设备类型调整布局 */
  watch(
    () => route.name,
    () => {
      if (appStore.isMobile && !appStore.isCollapse) appStore.closeSidebar(false)
    },
    { immediate: true },
  )

  /** 在组件挂载前添加窗口大小变化事件监听器 */
  onBeforeMount(() => window.addEventListener('resize', _resizeHandler))

  /** 在组件挂载后执行初始判定，并挂载全局右键菜单拦截 */
  onMounted(() => {
    _resizeHandler()
    document.addEventListener('contextmenu', _contextMenuHandler)
  })

  /** 在组件卸载前移除窗口大小变化与右键菜单事件监听器 */
  onBeforeUnmount(() => {
    window.removeEventListener('resize', _resizeHandler)
    document.removeEventListener('contextmenu', _contextMenuHandler)
  })
}
