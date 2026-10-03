import { isExternal } from '@/utils'

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
    icon: '@/assets/images/icons/快捷指令库.png',
    description: '分享苹果 iOS 快捷指令大全，提供捷径下载与教程，一款实用的效率工具。',
  },
  {
    key: 'https://tool.browser.qq.com',
    title: '帮小忙',
    icon: 'https://m4.publicimg.browser.qq.com/publicimg/nav/qbtool/home/qb_search.png',
    description: '腾讯QQ浏览器在线工具箱，提供证件照、PDF转换、照片修复等实用小工具。',
  },
  {
    key: 'https://ol.woobx.cn',
    title: '一个木函',
    icon: 'https://ol.woobx.cn/static/icons/apple-touch-icon.png',
    description: '一个木函在线工具箱，集合文字处理、图片处理、单位换算等实用小工具。',
  },
  {
    key: 'https://bigjpg.com',
    title: '图片无损放大',
    icon: 'https://bigjpg.com/static/img/apple-touch-icon.png',
    description: '基于 AI 深度卷积神经网络无损放大图片，支持插画与照片，放大后依然清晰。',
  },
  {
    key: 'https://www.bmcx.com',
    title: '便民查询网',
    icon: 'https://f.bmcx.com/img/index_ico/i_c_o_57x57.png',
    description: '汇聚天气、快递、汇率、电话归属地等便民查询工具，支持免费在线使用。',
  },
  {
    key: 'https://tool.mkblog.cn',
    title: '孟坤工具箱',
    icon: 'https://tool.mkblog.cn/favicon.ico',
    description: '集成图片处理、文本处理、二维码生成等在线小工具合集，免费即开即用。',
  },
  {
    key: 'https://www.tool77.com/zh-CN',
    title: '七七工具箱',
    icon: 'https://www.tool77.com/media/image/favicon.ico',
    description: '提供文档转换、单位换算、图片处理、AI 工具等一站式在线服务。',
  },
  {
    key: 'https://tools.miku.ac',
    title: 'MikuTools',
    icon: 'https://tools.miku.ac/logo/cn/apple-touch-icon-180x180.png',
    description: '聚合图片生成、格式转换、视频下载等在线工具，内置 AI，免登录即用。',
  },
  {
    key: 'https://uutool.cn',
    title: 'UU在线工具',
    icon: 'https://uutool.cn/assets/images/favicon.jpg',
    description: '覆盖文本、图像、编程、音视频处理的数百款在线工具，免注册即开即用。',
  },
  {
    key: 'https://tools.meetlight.cn',
    title: '在线工具箱',
    icon: 'https://tools.meetlight.cn/favicon.ico',
    description: '汇集各类免费实用在线小工具，涵盖格式转换、文本处理等常用功能。',
  },
  {
    key: 'https://www.toolsdo.com',
    title: '工具箱',
    icon: 'https://www.toolsdo.com/favicon.ico',
    description: '汇集免费在线实用工具，覆盖文本、格式转换、开发辅助等日常场景。',
  },
  {
    key: 'https://toolup.com.cn',
    title: 'ToolBox',
    icon: 'https://toolup.com.cn/apple-touch-icon.png',
    description: '提供编码解码、格式转换、加密解密、文本处理等百余款在线工具，本地处理。',
  },
  {
    key: 'https://www.lizshop.cn',
    title: '全能工具箱',
    icon: 'https://www.lizshop.cn/favicon.ico',
    description: '提供JSON格式化、时间戳转换等免费在线工具，涵盖开发与文本场景。',
  },
  {
    key: 'https://toolight.cn',
    title: '偷懒工具',
    icon: '@/assets/images/icons/偷懒工具.png',
    description: '免费在线工具集合，无需登录即可使用，覆盖办公与日常多种实用场景。',
  },
  {
    key: 'https://www.toolnb.com',
    title: '爱资料工具',
    icon: 'https://www.toolnb.com/favicon.ico',
    description: '面向开发与运维的在线工具箱，收录开发、运维、SEO 等数百款工具。',
  },
  {
    key: 'https://tools.quickso.cn',
    title: 'IT工具箱',
    icon: 'https://tools.quickso.cn/apple-touch-icon.png',
    description: '面向开发者的开源在线工具集，界面清爽好用，覆盖编码、转换等常见需求。',
  },
  {
    key: 'https://tools.yuanfen.net',
    title: '猿奋工具箱',
    icon: 'https://tools.yuanfen.net/img/favicon/apple-touch-icon.png',
    description: '提供JSON解析、密码生成、哈希计算、时间转换等开发者实用小工具。',
  },
]

/** 外部工具站点数量：自有工具不计入，供统计场景复用 */
export const EXTERNAL_TOOL_COUNT = TOOL_LIST.filter((tool) => isExternal(tool.key)).length
