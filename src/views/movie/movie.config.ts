import { isExternal } from '@/utils'

/** 免费追剧页条目定义 */
export interface DashboardItem {
  /** 站点唯一标识：完整 URL（http/https 等协议开头），点击新窗口打开 */
  key: string
  /** 站点名称 */
  title: string
  /** 图标地址：站点图标 URL 或本地资源路径（src/assets/images/icons/ 下按文件名匹配） */
  icon: string
  /** 描述文案：站点卡片上展示的简短说明，约 32 字 */
  description: string
}

/** 免费追剧站点列表：均为外部站点，卡片以纯外链模式渲染 */
export const DASHBOARD_LIST: DashboardItem[] = [
  {
    key: 'https://www.ncat1.app',
    title: '网飞猫',
    icon: 'https://vf.esadj.com/vod_pc_static_ncat/images/favicon.ico?ver=123456666',
    description: '影视资源在线观看导航站，聚合热门电影、电视剧与动漫资源，免费在线播放。',
  },
  {
    key: 'https://ddys.io',
    title: '低端影视',
    icon: 'https://www.xetp.cn/ee25c0fbb723.png',
    description: '低端影视官方站，提供海量美剧、韩剧、日剧与热门电影的在线观看与字幕更新。',
  },
  {
    key: 'https://dym11.bond',
    title: '电影猫',
    icon: 'https://dym11.bond/mxtheme/images/favicon.png',
    description: '汇集高清电影、电视剧、短剧与动漫资源，海量影视内容实时更新的在线观影站。',
  },
  {
    key: 'https://360yy.cc',
    title: '360影院',
    icon: 'https://360yy.cc/statics/img/favicon.ico',
    description: '提供最新高清免费电影、电视剧、综艺、动漫与短剧的在线观看影视平台。',
  },
  {
    key: 'https://4kvm.site',
    title: '4k影视',
    icon: 'https://4kvm.staticimgjs.org/uploads/2026/03/e8bbe2c53e4567.png',
    description: '综合性影视站，持续更新热门电影、最新美剧与韩剧，提供高清在线与影视推荐。',
  },
  {
    key: 'https://www.hqvod.com',
    title: '高清点播',
    icon: 'https://www.hqvod.com/favicon.ico',
    description: '海量高清电影与最新电视剧免费在线观看，每日更新，支持追剧与多端播放。',
  },
  {
    key: 'https://www.hhkan0.com',
    title: '好好看',
    icon: 'https://vf.esadj.com/vod_pc_static_hkan/images/favicon.ico',
    description: '好好看影视站，每日更新奈飞新剧与欧美日韩电影，免费在线观看。',
  },
  {
    key: 'https://dmbus.cc',
    title: '动漫巴士',
    icon: 'https://dmbus.cc/favicon.ico',
    description: '动漫巴士提供最新热门动漫在线观看，覆盖国产、日本、欧美动漫，播放流畅无广告。',
  },
  {
    key: 'https://cupfox.app',
    title: '茶杯狐',
    icon: 'https://picx.zhimg.com/80/v2-5393cb76a824b11d7771ecdce592c87d.png',
    description: '茶杯狐影视资源搜索引擎，聚合全网电影、剧集与动漫资源链接，支持快速查找。',
  },
  {
    key: 'https://findno.tv',
    title: 'NO视频',
    icon: 'https://www.novipnoad.net/favicon.ico',
    description: 'NO视频影视站，聚合电影、电视剧与综艺资源，免注册在线观看，界面简洁体验佳。',
  },
  {
    key: 'https://www.1905.com',
    title: '1905电影网',
    icon: 'https://static.m1905.cn/57x57.png',
    description: '电影频道节目中心旗下电影门户，提供电影资讯、影评、预告片、在线观影及票务服务。',
  },
  {
    key: 'https://www.sxzxc.com',
    title: '68影院',
    icon: 'assets/images/icons/68影院.png',
    description: '提供最新影视大全免费在线观看，每日第一时间更新，无需VIP即可观看高清影视。',
  },
  {
    key: 'https://bojucc.github.io',
    title: '播剧网',
    icon: 'assets/images/icons/播剧网.png',
    description: '提供最新电视剧、电影、短剧、动漫、综艺在线观看，支持按类型、地区、年份和演员快速查找。',
  },
  {
    key: 'https://www.svlik.com/t/movie',
    title: '视频在线解析',
    icon: 'https://www.svlik.com/favicon.ico',
    description: 'VIP 视频在线解析工具，支持优酷、爱奇艺、腾讯等平台会员视频免费观看。',
  },
  {
    key: 'https://www.cilixiong.cc',
    title: '磁力熊',
    icon: 'assets/images/icons/磁力熊.png',
    description: '影视资源聚合搜索站点，可在线查找热播剧集与电影资源，助你快速追剧。',
  },
  {
    key: 'https://www.mp4ba.vip',
    title: '高清Mp4吧',
    icon: 'https://www.mp4ba.vip/wp-content/themes/Loostrive/images/favicon.ico',
    description: '提供1080P、4K高清电影剧集mp4/mkv下载，资源更新及时适合追剧。',
  },
  {
    key: 'https://www.6v520.cc',
    title: '6v电影',
    icon: 'https://www.6v520.cc/favicon.ico',
    description: '每日搜集互联网最新电影与电视剧，提供高清免费下载，资源更新快。',
  },
  {
    key: 'https://www.yangshipin.cn',
    title: '央视频',
    icon: 'https://sapi.yangshipin.cn/assets/2022/pcicon/favicon.ico',
    description: '中央广播电视总台旗下视频平台，汇聚新闻、影视、体育、综艺等正版内容。',
  },
  {
    key: 'https://tv.cctv.com/live/index.shtml',
    title: '央视直播',
    icon: 'https://tv.cctv.com/favicon.ico',
    description: '央视网官方直播入口，提供 CCTV 各频道在线直播与节目表预告等服务。',
  },
  {
    key: 'https://www.acfun.cn',
    title: 'AcFun',
    icon: 'https://cdn.aixifan.com/ico/favicon.ico',
    description: '国内老牌弹幕视频网站，汇聚独家动漫新番与UP主创作，弹幕氛围友好活跃。',
  },
  {
    key: 'https://www.bilibili.com',
    title: '哔哩哔哩',
    icon: 'assets/images/icons/哔哩哔哩.png',
    description: '哔哩哔哩视频弹幕站，汇聚动漫新番、影视综艺与UP主创作视频，互动氛围活跃。',
  },
  {
    key: 'https://v.qq.com',
    title: '腾讯视频',
    icon: 'https://vfiles.gtimg.cn/wuji_dashboard/xy/starter/4ea79867.png',
    description: '腾讯官方在线视频平台，提供海量正版剧集、电影、综艺与动漫，独播内容持续更新。',
  },
  {
    key: 'https://www.iqiyi.com',
    title: '爱奇艺',
    icon: 'https://www.iqiyi.com/favicon.ico',
    description: '国内领先在线视频平台，提供海量正版剧集、电影、综艺与动漫，独播内容持续更新。',
  },
  {
    key: 'https://www.youku.com/ku/webhome',
    title: '优酷',
    icon: 'https://img.alicdn.com/imgextra/i2/O1CN01BeAcgL1ywY0G5nSn8_!!6000000006643-2-tps-195-195.png',
    description: '阿里旗下在线视频平台，提供正版剧集、电影、综艺与动漫，独播内容持续更新。',
  },
  {
    key: 'https://www.keke1.app',
    title: '可可影视',
    icon: 'https://vf.esadj.com/vod_pc_static_kkdy/images/favicon.ico?ver=123456666',
    description: '可可影视免费在线观影站，奈飞热剧每日更新，欧美日韩剧集电影免费看。',
  },
  {
    key: 'https://dongpian1.com',
    title: '懂片帝',
    icon: 'https://dongpian1.com/assets/app-icon-64.png?v=20260829-dongpiandi-logo-v2',
    description: '智能影视助手，AI搜索电影、剧集、短剧与综艺，发现片单并在线播放。',
  },
  {
    key: 'https://www.kpkuang.fun',
    title: '看片狂人',
    icon: 'https://www.kpkuang.fun/upload/site/20191223-1/2c9a52af085be96d716679409b453460.png',
    description: '影视资源站，每日收录电影、剧集、动漫与综艺，高清资源免费在线观看下载。',
  },
  {
    key: 'https://www.yikaocq.com',
    title: '星空影院',
    icon: 'https://www.yikaocq.com/mxtheme/images/favicon1.png',
    description: '全网热门高清电影电视剧免费在线观看，含动漫综艺短剧，每日持续更新。',
  },
  {
    key: 'https://www.dcjyb.com',
    title: '樱花影院',
    icon: 'https://www.dcjyb.com/upload/site/20250109-1/d67eca64b94eb5862e8444eb2ca2c796.png',
    description: '免费在线看电影电视剧，高清VIP剧集与热门电影每日更新，追剧便捷。',
  },
  {
    key: 'https://www.shenqizhe.com',
    title: '碟调网',
    icon: 'https://www.shenqizhe.com/favicon.png',
    description: '影视聚合站，热门电影电视剧与短剧动漫在线观看，日更海量内容免费看。',
  },
  {
    key: 'https://gaze.red',
    title: '注视影视',
    icon: 'https://gaze.red/apple-touch-icon.png',
    description: '界面简洁流畅的免费观影站，高清热门剧、番剧与冷门电影在线观看。',
  },
  {
    key: 'https://kanju1.com',
    title: '看剧AI',
    icon: 'https://kanju1.com/assets/app-icon-180.png?v=20260819-kanju',
    description: '影视搜索与发现工具，支持电影、剧集、动漫与综艺片库浏览及智能推荐。',
  },
  {
    key: 'https://www.imtlink.com',
    title: '影视森林',
    icon: 'https://www.imtlink.com/forest.png',
    description: '聚合全网影视资源，短剧电影剧集综艺动漫与欧冠NBA等体育赛事免费观看。',
  },
]

/** 外部站点数量：自有页面不计入，供统计场景复用 */
export const EXTERNAL_DASHBOARD_COUNT = DASHBOARD_LIST.filter((item) => isExternal(item.key)).length
