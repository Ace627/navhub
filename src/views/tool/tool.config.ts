/** 工具条目定义 */
export interface ToolItem {
  /** 工具唯一标识：自有工具填组件目录名（与详情页组件目录一致，同时用作子路由参数）；外部工具填完整 URL（http/https 等协议开头，点击新窗口打开） */
  key: string
  /** 工具名称 */
  title: string
}

/** 工具注册表：自有工具登记组件目录名并在本目录下建同名组件目录（内含 index.vue）；外部工具直接登记完整 URL */
export const TOOL_LIST: ToolItem[] = [
  {
    key: 'DoubleColorBall',
    title: '双色球模拟器',
  },
  {
    key: 'https://www.5adanci.com',
    title: '日历精灵',
  },
  {
    key: 'https://tools.pdf24.org/zh',
    title: 'PDF24 Tools',
  },
  {
    key: 'https://colors.ichuantong.cn',
    title: '中国古典颜色',
  },
  {
    key: 'https://www.speedtest.cn',
    title: '网络测速',
  },
  {
    key: 'https://jiejingku.net/tag/jiejingku',
    title: '捷径库',
  },
  {
    key: 'https://www.rcuts.com',
    title: '快捷指令库',
  },
]
