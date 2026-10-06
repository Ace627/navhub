export function useDynamicTitle() {
  // 获取当前路由对象，用来获取当前页面的路径和元信息
  const route = useRoute()
  // 获取存储用户设置的 store，这里用于获取是否启用动态标题的设置
  const settingStore = useSettingStore()
  // 获取应用程序的默认标题，通常在 .env 文件中定义
  const appTitle = import.meta.env.VITE_APP_TITLE

  watch(
    // 设置 watch 来观察路由的路径 (route.path) 和是否显示动态标题 (settingStore.showDynamicTitle)。当这些值发生变化时，会根据条件更新页面标题
    [() => route.path, () => settingStore.showDynamicTitle],
    ([_, showDynamicTitle]) => {
      // meta.title 支持函数形式，按当前路由动态解析页面标题（如详情页按条目参数取标题）
      const pageTitle = typeof route.meta.title === 'function' ? route.meta.title(route) : route.meta.title
      // 如果不启用动态标题或当前路由没有解析出标题，则使用默认的应用标题
      if (!showDynamicTitle || !pageTitle) {
        document.title = appTitle
      } else {
        // 否则，动态标题会以 解析出的标题 - 默认应用标题 的格式展示
        document.title = `${pageTitle} - ${appTitle}`
      }
    },
    { immediate: true },
  )
}
