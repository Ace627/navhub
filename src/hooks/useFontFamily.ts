/**
 * 全局字体切换 hook
 * - 把设置项 fontFamily 写到 <html> 的 --el-font-family 上，Element Plus 组件与业务样式统一跟随该变量
 * - 值为空表示不做覆盖，沿用 Element Plus 在 :root 提供的默认字体
 * - 调用时立即应用一次（与 useTheme 同理，防刷新后短暂闪回默认字体），之后仅跟随 store 变化
 * - 只改样式不落盘，持久化仍由设置页「保存配置」决定，避免未保存的改动被写入本地
 */
export function useFontFamily() {
  const settingStore = useSettingStore()

  /**
   * 应用字体：覆盖根节点的 --el-font-family
   *
   * @param fontFamily 字体名，为空字符串表示移除覆盖，回落到 Element Plus 默认字体
   */
  function apply(fontFamily: string) {
    if (fontFamily) document.documentElement.style.setProperty('--el-font-family', `'${fontFamily}', sans-serif`)
    else document.documentElement.style.removeProperty('--el-font-family')
  }

  apply(settingStore.fontFamily)

  watch(() => settingStore.fontFamily, apply)

  return { apply }
}