export interface SystemSetting {
  /** 主题 */
  theme: 'light' | 'dark'
  /** 组件大小 */
  size: 'default' | 'small' | 'large'
  /** 是否显示动态标题 */
  showDynamicTitle: boolean
  /** 侧边栏是否手风琴模式 */
  uniqueOpened: boolean
  /** 是否显示项目名称及 Logo */
  showLogo: boolean
  /** 是否显示一言栏 */
  showHitokoto: boolean
  /** 全局字体，取值为已挂载的网络字体名 */
  fontFamily: string
  /** 路由转场动效 */
  transition: 'fade-transform' | 'el-fade-in-linear' | 'el-fade-in' | 'el-zoom-in-center' | 'el-zoom-in-top' | 'el-zoom-in-bottom'
}

export const defaultSettings: SystemSetting = {
  theme: 'light',
  size: 'default',
  transition: 'fade-transform',
  uniqueOpened: true,
  showDynamicTitle: true,
  showLogo: true,
  showHitokoto: true,
  fontFamily: 'LXGW WenKai Screen',
}
