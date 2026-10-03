/** 工具条目定义 */
export interface ToolItem {
  /** 工具唯一标识：自有工具填组件目录名（与详情页组件目录一致，同时用作子路由参数）；外部工具填完整 URL（http/https 等协议开头，点击新窗口打开） */
  key: string
  /** 工具名称 */
  title: string
  /** 图标地址：自有工具填本地资源路径（@/ 别名指向 src/assets/ 下图标文件）；外部工具填站点图标 URL */
  icon: string
  /** 描述文案：工具卡片上展示的简短说明，约 32 字 */
  description: string
}

/** 工具注册表：自有工具登记组件目录名并在本目录下建同名组件目录（内含 index.vue）；外部工具直接登记完整 URL */
export const TOOL_LIST: ToolItem[] = [
  {
    key: 'DoubleColorBall',
    title: '双色球模拟器',
    icon: '@/assets/images/icons/双色球.png',
    description: '随机模拟双色球与大乐透号码，支持自定义组数与摇号动画，仅供娱乐。',
  },
  {
    key: 'https://www.5adanci.com',
    title: '日历精灵',
    icon: 'https://cdn.wuxingchuanyi.vip/com/favicon.ico',
    description: '提供全年日历图免费下载，含农历周数与节假日调休安排，高清精美可打印。',
  },
  {
    key: 'https://tools.pdf24.org/zh',
    title: 'PDF24 Tools',
    icon: 'https://tools.pdf24.org/static/img/appIcons/v3/icon_192.png?v=5ca75609',
    description: '免费在线 PDF 工具集，支持合并压缩转换编辑，无水印且无需注册。',
  },
  {
    key: 'https://colors.ichuantong.cn',
    title: '中国古典颜色',
    icon: 'https://colors.ichuantong.cn/apple-touch-icon.png',
    description: '收录六百余种中国传统色，提供精准色值与色彩代码一键获取，国风设计必备。',
  },
  {
    key: 'https://www.speedtest.cn',
    title: '网络测速',
    icon: 'https://www.speedtest.cn/images/icon/apple-touch-icon-precomposed.png',
    description: '专业网速测试平台，支持宽带与家庭网络测速，提供网络诊断及提速优化服务。',
  },
  {
    key: 'https://pansou.cc',
    title: '盘搜搜',
    icon: 'https://pansou.cc/static/img/logo.png',
    description: '网盘资源搜索神器，实时收录全网影视、音乐、软件等资源，一键快速查找。',
  },
  {
    key: 'https://wormhole.app',
    title: 'Wormhole',
    icon: '@/assets/images/icons/Wormhole.png',
    description: '端到端加密文件传输工具，链接自动过期，无需注册即可安全分享大文件。',
  },
  {
    key: 'https://jiejingku.net/tag/jiejingku',
    title: '捷径库',
    icon: 'https://jiejingku.net/wp-content/uploads/2025/08/jiejingku-iOS-512x512-1.webp',
    description: '海量 iOS 快捷指令分享站，支持分类查找与一键导入，让手机操作更高效。',
  },
  {
    key: 'https://www.rcuts.com',
    title: '快捷指令库',
    icon: 'https://www.rcuts.com/favicon.ico',
    description: '分享苹果 iOS 快捷指令大全，提供捷径下载与教程，一款实用的效率工具。',
  },
]
