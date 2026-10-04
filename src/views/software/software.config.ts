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

/** 好软推荐站点列表：均为外部站点，卡片以纯外链模式渲染 */
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
  {
    key: 'https://www.52pojie.cn/forum-16-1.html',
    title: '精品软件区',
    icon: 'assets/images/icons/精品软件区.webp',
    description: '吾爱破解精品软件区，会员每日分享推荐 PC 与安卓手机软件，交流氛围活跃。',
  },
  {
    key: 'https://www.423down.com',
    title: '423Down',
    icon: 'https://www.423down.com/wp-content/themes/D7/img/favicon.ico',
    description: '始于2014的绿色软件下载站，超千款净化便携软件，三重检测，纯净安全。',
  },
  {
    key: 'https://www.gndown.net',
    title: '绿软驿站',
    icon: 'https://www.gndown.net/favicon.ico',
    description: '安全纯净的绿色软件下载站，无广告免安装，全部软件经人工检测，纯净无捆绑。',
  },
  {
    key: 'https://www.wycad.com',
    title: '无忧软件网',
    icon: 'https://www.wycad.com/favicon.ico',
    description: '分享互联网优质资源，收录绿色软件与破解工具，覆盖多端，每日持续更新。',
  },
  {
    key: 'https://www.ghxi.com',
    title: '果核剥壳',
    icon: 'https://www.ghxi.com/favicon.ico',
    description: '长期更新的科技网站，涵盖绿色软件、系统工具与科技资讯，分享实用资源。',
  },
  {
    key: 'https://www.ipapark.com',
    title: 'iPA资源站',
    icon: 'https://www.ipapark.com/wp-content/uploads/2022/12/icon.png',
    description: 'iPA资源下载站，收录iPhone/iPad软件，附砸壳规则与免费证书。',
  },
  {
    key: 'https://www.xiaoheiw.com',
    title: '小黑资源网',
    icon: 'https://www.xiaoheiw.com/favicon.ico',
    description: '每日更新技术教程、活动线报与软件工具分享，内容实用，持续更新。',
  },
  {
    key: 'https://www.x6d.com',
    title: '小刀娱乐网',
    icon: 'https://www.x6d.com/favicon.ico',
    description: '专注活动线报、绿色软件与教程分享，分类清晰，持续更新网络实用内容。',
  },
  {
    key: 'https://wwt.lanzouj.com/s/jkrj',
    title: '极客软件库',
    icon: 'https://jikeruanjk.com.cn/images/04ad1b05_hu_12b7626e992709af.webp',
    description: '汇聚优质软件、游戏与工具，安全检测保障下载，支持版本更新与断点续传。',
  },
  {
    key: 'https://pan.lanzoup.com/u/qianxun8',
    title: '大肥精品软件',
    icon: 'assets/images/icons/大肥精品软件.png',
    description: '大肥爱分享的精品软件合集，免费分享各类福利软件资源，每日持续更新。',
  },
  {
    key: 'https://lanzoup.com/b032bt3j3c',
    title: '最先软件库',
    icon: 'assets/images/icons/最先软件库.png',
    description: '永久免费分享的各类软件资源合集，更新频繁，部分资源可能失效，仅供学习交流请勿商用。',
  },
  {
    key: 'https://qcrjk.lanzoul.com/b05w0777e',
    title: '千城游戏合集',
    icon: 'https://up.woozooo.com/favicon.ico',
    description: '不定时更新各类好玩破解的安卓游戏资源，收录丰富，喜欢玩游戏的小伙伴不容错过。',
  },
  {
    key: 'https://app.lanzouv.com/s/fuckapp',
    title: 'FuckApp',
    icon: 'https://up.woozooo.com/favicon.ico',
    description: '破解类安卓应用合集，附安装指南：被拦截可断网安装，报毒为破解应用误报，仅供学习研究。',
  },
  {
    key: 'https://www.lanzoui.com/b133841',
    title: '兜兜软件库',
    icon: 'https://up.woozooo.com/favicon.ico',
    description: '兜兜软件库合集，不定时更新各类福利软件，收录丰富，欢迎收藏备用。',
  },
  {
    key: 'https://jiuren.lanzoul.com/s/ruanjiange',
    title: '旧人软件阁',
    icon: 'assets/images/icons/旧人软件阁.png',
    description: '旧人软件阁的软件合集，软件基于官方接口制作，若失效多为官方已修复所致。',
  },
  {
    key: 'https://huanziapp.lanzout.com/b0fq2clwj',
    title: '欢子黑科技',
    icon: 'https://up.woozooo.com/favicon.ico',
    description: '佚名收集的各种破解软件资源。',
  },
  {
    key: 'https://www.lanzoui.com/b838976',
    title: '滚哥网盘资源',
    icon: 'https://up.woozooo.com/favicon.ico',
    description: '滚哥网盘资源合集，每日动态更新各类软件，失效多为版本更新，仅供测试请勿他用。',
  },
  {
    key: 'https://yoyodadada.lanzouw.com/u/yoyodadada',
    title: '优质软件合集',
    icon: 'https://up.woozooo.com/favicon.ico',
    description: '佚名收集的各种破解软件资源。',
  },
  {
    key: 'https://www.lanzoui.com/b01b01h9a',
    title: '未分类软件集',
    icon: 'https://up.woozooo.com/favicon.ico',
    description: '佚名收集的各种破解软件资源。',
  },
  {
    key: 'https://pan.lanzoui.com/b221497',
    title: '精选软件推荐',
    icon: 'https://up.woozooo.com/favicon.ico',
    description: '人工精选的热门娱乐实用软件合集，每天更新，持续上新，欢迎收藏使用。',
  },
  {
    key: 'https://pan.lanzoui.com/b215476',
    title: '乐分享软件',
    icon: 'https://up.woozooo.com/favicon.ico',
    description: '佚名收集的各种破解软件资源。',
  },
  {
    key: 'https://pan.lanzoui.com/b828085',
    title: '安卓破解软件',
    icon: 'https://up.woozooo.com/favicon.ico',
    description: '常用软件破解版合集，涵盖影视会员、音乐、下载工具等热门安卓应用的破解版本。',
  },
  {
    key: 'https://pan.lanzoui.com/b888887',
    title: '破解游戏合集',
    icon: 'https://up.woozooo.com/favicon.ico',
    description: '佚名收集的各种破解软件资源。',
  },
  {
    key: 'https://pan.lanzoui.com/b54212',
    title: '允晨软件库',
    icon: 'https://up.woozooo.com/favicon.ico',
    description: '佚名收集的各种破解软件资源。',
  },
  {
    key: 'https://pan.lanzoui.com/u/ygtq',
    title: '软件实验室',
    icon: 'https://up.woozooo.com/favicon.ico',
    description: '佚名收集的各种破解软件资源。',
  },
  {
    key: 'https://pan.lanzoui.com/b60564',
    title: '清风软件集',
    icon: 'https://up.woozooo.com/favicon.ico',
    description: '清风软件集，全部软件免费使用，基于官方接口改写，若失效多为官方已修复。',
  },
  {
    key: 'https://pan.lanzoui.com/b158157',
    title: '小说软件合集',
    icon: 'https://up.woozooo.com/favicon.ico',
    description: '佚名收集的各种破解软件资源。',
  },
  {
    key: 'https://pan.lanzoui.com/u/aybaba',
    title: '阿友软件合集',
    icon: 'https://up.woozooo.com/favicon.ico',
    description: '阿友软件合集，软件基于官方接口制作，全部免费使用，若失效多为官方已修复。',
  },
  {
    key: 'https://www.lanzoui.com/u/xiaopengi',
    title: '小鹏软件合集',
    icon: 'https://up.woozooo.com/favicon.ico',
    description: '小鹏团队出品的软件合集，不保证长久可用，失效即停更，仅供学习参考请勿非法使用。',
  },
  {
    key: 'https://www.lanzoui.com/u/azsoft',
    title: '星辰软件合集',
    icon: 'https://up.woozooo.com/favicon.ico',
    description: '星辰软件合集，收录好玩有趣的各类软件资源，持续更新，欢迎体验收藏。',
  },
  {
    key: 'https://www.lanzoui.com/u/xinqidian',
    title: '新起点软件库',
    icon: 'https://up.woozooo.com/favicon.ico',
    description: '良心出品的各类实用软件，多为活动或接口类应用，失效属正常情况望理解。',
  },
  {
    key: 'https://pan.lanzoup.com/b059sp2j',
    title: '软件窝合集',
    icon: 'https://up.woozooo.com/favicon.ico',
    description: '软件窝福利软件合集，不定时更新各类资源，内容源于互联网仅供学习参考。',
  },
  {
    key: 'https://jamcz.com',
    title: '晨钟网络科技',
    icon: 'https://jamcz.com/favicon.ico',
    description: '专注开发小众实用的安卓与 Windows 软件，解决数码爱好者的使用痛点。',
  },
]

/** 外部站点数量：当前全部为外链站点，供统计场景复用 */
export const EXTERNAL_SOFTWARE_COUNT = SOFTWARE_LIST.filter((item) => isExternal(item.key)).length
