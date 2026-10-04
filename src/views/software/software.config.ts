import { isExternal } from '@/utils'

/** 软件条目定义 */
export interface SoftwareItem {
  /** 站点唯一标识：完整 URL（http/https 等协议开头），点击新窗口打开 */
  key: string
  /** 软件名称 */
  title: string
  /** 图标地址：站点图标 URL 或本地资源路径（src/assets/images/icons/ 下按文件名匹配） */
  icon: string
  /** 描述文案：软件卡片上展示的简短说明，约 32 字 */
  description: string
}

/** 电脑软件站点列表：均为外部站点，卡片以纯外链模式渲染 */
export const SOFTWARE_LIST: SoftwareItem[] = [
  {
    key: 'https://pc.weixin.qq.com',
    title: '微信',
    icon: 'https://res.wx.qq.com/a/wx_fed/assets/res/OTE0YTAw.png',
    description: '腾讯官方即时通讯软件，支持聊天、语音视频通话与文件传输，电脑版官方下载。',
  },
  {
    key: 'https://github.com/huiyadanli/RevokeMsgPatcher',
    title: '微信防撤回',
    icon: 'assets/images/icons/微信防撤回.png',
    description: '开源的微信、QQ、TIM 防撤回补丁工具，一键修改客户端拦截撤回消息。',
  },
  {
    key: 'https://meeting.tencent.com/download',
    title: '腾讯会议',
    icon: 'https://cdn.meeting.tencent.com/assets/next-website/logo128.png',
    description: '腾讯会议高清流畅、便捷易用、安全可靠的多人音视频会议软件，支持多端下载安装。',
  },
  {
    key: 'https://www.lsplayer.com',
    title: '雷神模拟器',
    icon: 'https://res.ldmnq.com/gw/assets/images/05/ls/ls-icon.png',
    description: '领先内核打造的安卓模拟器，运行快速稳定，为大屏游戏带来流畅操控体验。',
  },
  {
    key: 'https://store.steampowered.com',
    title: 'Steam',
    icon: 'https://store.steampowered.com/favicon.ico',
    description: '全球知名的游戏发行平台，提供游戏购买下载、社区创意工坊与成就系统。',
  },
  {
    key: 'https://www.clashverge.dev',
    title: 'Clash Verge',
    icon: 'https://www.clashverge.dev/assets/favicon.ico',
    description: '基于 Tauri 的跨平台代理客户端，界面简洁，支持多内核与规则配置。',
  },
  {
    key: 'https://www.i4.cn/pros/pc.html',
    title: '爱思助手',
    icon: 'https://d-image.i4.cn/i4web/static2025/images/logo.png?v=131',
    description: '专业的苹果设备管理工具，支持一键刷机、数据备份还原、换机搬家与应用下载。',
  },
  {
    key: 'https://423down.lanzouo.com/b105455',
    title: 'WinRAR',
    icon: 'https://www.winrar.com.cn/favicon.ico',
    description: '老牌知名压缩解压软件，支持多种压缩格式，个人版免费，装机必备工具之一。',
  },
  {
    key: 'https://423down.lanzouo.com/b0f1k59qh',
    title: 'PotPlayer',
    icon: 'https://potplayer.info/wp-content/uploads/2023/07/favicon.svg',
    description: 'PotPlayer 全能多媒体播放器，支持主流音视频格式与字幕播放。',
  },
  {
    key: 'https://www.bypass.cn',
    title: '分流抢票',
    icon: 'https://static.bypass.cn/0419/favicon.ico',
    description: '免费自动抢票工具，支持自动抢候补、识别验证码、多线程秒单与捡漏。',
  },
  {
    key: 'https://cmwtat.cloudmoe.com/cn.html',
    title: '云萌激活工具',
    icon: 'https://q1.qlogo.cn/g?b=qq&nk=1207588603&s=640',
    description: '开源免费的 Windows 数字权利激活工具，一键终身激活并自动续期。',
  },
  {
    key: 'https://www.centbrowser.cn',
    title: '百分浏览器',
    icon: 'https://www.centbrowser.cn/favicon.ico',
    description: 'Chrome 增强版浏览器，紧跟最新内核，主打快速简约，优化办公娱乐上网体验。',
  },
  {
    key: 'https://www.google.cn/chrome',
    title: '谷歌浏览器',
    icon: 'https://www.google.cn/chrome/static/images/favicons/apple-icon-57x57.png',
    description: '谷歌官方网络浏览器，以快捷、安全、易用著称，支持丰富扩展插件生态。',
  },
  {
    key: 'https://www.huorong.cn',
    title: '火绒安全',
    icon: 'https://www.huorong.cn/favicon.png',
    description: '专注终端安全的国产安全软件，个人版免费使用，企业版提供终端安全统一管理。',
  },
  {
    key: 'https://coolapk.123741.xyz',
    title: '酷安桌面版',
    icon: 'https://coolapk.123741.xyz/assets/logo.png',
    description: '非官方酷安桌面客户端，轻量纯净的大屏社区浏览体验，全平台覆盖。',
  },
]

/** 外部站点数量：当前全部为外链站点，供统计场景复用 */
export const EXTERNAL_SOFTWARE_COUNT = SOFTWARE_LIST.filter((item) => isExternal(item.key)).length
