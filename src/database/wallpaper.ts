import type { SiteItem } from './types'
import { isExternal } from '@/utils'

/** 精美壁纸站点列表：均为外部站点，卡片以纯外链模式渲染 */
export const WALLPAPER_LIST: SiteItem[] = [
  {
    key: 'https://pic.netbian.com',
    title: '彼岸图网',
    icon: 'assets/images/icons/彼岸图网.ico',
    description: '彼岸图网，4K 高清壁纸下载站，涵盖风景、动漫、游戏等海量分类，每日更新。',
  },
  {
    key: 'https://gallery.timeline.ink',
    title: '拾光壁纸',
    icon: 'https://gallery.timeline.ink/favicon.ico',
    description: '拾光壁纸，精选高质量壁纸在线预览与下载，界面清爽，分类丰富。',
  },
  {
    key: 'https://wallpaperscraft.com',
    title: '桌面壁纸',
    icon: 'https://wallpaperscraft.com/public/img/general/favicon.ico?v=9f57a44a',
    description: '海外高清桌面壁纸站，收录近十万张壁纸，支持按分辨率适配电脑与手机下载。',
  },
  {
    key: 'https://wallroom.io',
    title: 'Wallroom',
    icon: 'https://wallroom.io/img/favicon.ico',
    description: '极简风格壁纸站，提供 4K 高清桌面与手机壁纸，按分辨率筛选，免费下载。',
  },
  {
    key: 'https://wallhaven.clbug.com',
    title: 'Wallhaven',
    icon: 'https://wallhaven.clbug.com/favicon.ico',
    description: '海外精选壁纸站 Wallhaven 镜像，动漫、风景等海量高清壁纸，支持分类检索。',
  },
  {
    key: 'https://bizhi.wpcoder.cn',
    title: '全面屏壁纸',
    icon: 'https://bizhi.wpcoder.cn/wp-content/themes/new_wallpaper/favicon.ico',
    description: '专为全面屏手机适配的免费超清壁纸站，兼容安卓 iOS，涵盖 4K 与曲面屏机型壁纸。',
  },
  {
    key: 'https://www.yeitu.com',
    title: '亿图全景图库',
    icon: 'https://statics.yeitu.com/images/favicon.ico',
    description: '亿图全景图库，提供电脑手机壁纸、动漫摄影、头像表情等图片分享与免费下载。',
  },
  {
    key: 'https://www.bizhi66.com',
    title: '壁纸爱好者',
    icon: 'https://www.bizhi66.com/favicon.ico',
    description: '壁纸爱好者，4K 高清壁纸下载站，涵盖游戏动漫卡通等分类，每日更新精选壁纸。',
  },
  {
    key: 'https://haowallpaper.com',
    title: '哲风壁纸',
    icon: 'https://haowallpaper.com/favicon.ico',
    description: '哲风壁纸，提供 4K 至 8K 高清桌面与手机壁纸，支持图搜、裁剪等特色功能，免费下载。',
  },
  {
    key: 'https://hdqwalls.com',
    title: 'HDQWalls',
    icon: 'https://hdqwalls.com/icons/favicon.ico',
    description: '高清壁纸资源站，提供 4K 至 8K 桌面、手机与宽屏壁纸下载，画质精选，更新及时。',
  },
  {
    key: 'https://10wallpaper.com',
    title: '10wallpaper',
    icon: 'https://10wallpaper.com/favicon.ico',
    description: '海外高清壁纸站，提供 4K、5K 桌面与移动端壁纸，支持多分辨率免费下载。',
  },
  {
    key: 'https://desk.3gbizhi.com',
    title: '3G壁纸',
    icon: 'https://desk.3gbizhi.com/assets/mobile/images/favicon.ico',
    description: '3G壁纸桌面频道，提供高清电脑壁纸与 4K 桌面图片，涵盖风景、动漫、游戏主题。',
  },
  {
    key: 'https://wallhere.com',
    title: 'WallHere',
    icon: 'assets/images/icons/Wallhere.png',
    description: '免费下载超 173 万张高清桌面壁纸，世界知名的壁纸库，支持多语言与搜索。',
  },
  {
    key: 'https://www.pandadiu.com',
    title: 'Cosplay联盟',
    icon: 'https://www.pandadiu.com/favicon.ico',
    description: 'Cosplay 资源分享站，非商业运营，实时收录优秀作品与热门讯息，传递快乐。',
  },
  {
    key: 'https://www.bizhihui.com',
    title: '壁纸汇',
    icon: 'https://s.panlai.com/images/favicon.ico',
    description: '壁纸汇，免费提供手机、动漫、电脑等 4K 高清壁纸下载，支持多尺寸自定义。',
  },
  {
    key: 'https://www.gamewallpapers.com',
    title: '游戏主题壁纸',
    icon: 'https://www.gamewallpapers.com/images/favicon/gw_favicon_152_apple.png',
    description: '游戏主题壁纸站，提供 Xbox、PS 等平台游戏高清壁纸，支持 1080p 至 4K。',
  },
  {
    key: 'https://www.wallpaperhub.app',
    title: 'WallpaperHub',
    icon: 'https://www.wallpaperhub.app/favicon.ico',
    description: '海外免费壁纸站，提供 Surface 官方壁纸与 Bing 每日图，支持 4K 下载。',
  },
  {
    key: 'https://bing.ioliu.cn',
    title: '必应壁纸',
    icon: 'https://bing.ioliu.cn/icons/apple-touch-icon.png',
    description: '必应每日壁纸聚合站，纵览全球各地区精选壁纸，支持按日期浏览下载。',
  },
  {
    key: 'https://www.wallcoo.com',
    title: '猫猫壁纸酷',
    icon: 'https://www.wallcoo.com/wp-content/uploads/logo/apple-touch-icon.png',
    description: '猫猫壁纸酷，分享高清壁纸与摄影设计素材，分类丰富，作品免费下载使用。',
  },
  {
    key: 'http://www.win4000.com',
    title: '美桌网',
    icon: 'http://www.win4000.com/favicon.ico',
    description: '美桌网，提供电脑手机高清壁纸下载，分类丰富，支持按分辨率匹配适配桌面。',
  },
  {
    key: 'https://simpledesktops.com',
    title: '简约壁纸',
    icon: 'https://static.simpledesktops.com/static/favicon.ico',
    description: '极简风格壁纸站，专注低干扰桌面美化，支持用户投稿，另提供多平台客户端。',
  },
  {
    key: 'https://qingbizhi.com',
    title: '极简壁纸',
    icon: 'https://qingbizhi.com/wp-content/uploads/2025/11/cropped-logo_01-180x180.jpg',
    description: '极简壁纸，提供 4K 至 8K 超高清无水印壁纸，涵盖自然动漫游戏等分类，免费下载。',
  },
  {
    key: 'https://www.haokanziyuan.com',
    title: '好看资源',
    icon: 'https://www.haokanziyuan.com/wp-content/uploads/2025/09/微信图片_20250905184233_105_61.jpg',
    description: '好看资源，摄影图片大全，汇集街拍写真套图资源，支持在线浏览与付费下载。',
  },
  {
    key: 'https://www.fulizu.com',
    title: '图集秀',
    icon: 'https://www.fulizu.com/wp-content/uploads/2024/03/20240323075218359-1711151538-logo.png',
    description: '图集秀，汇集秀人网系列模特写真套图，涵盖微密圈与 Cosplay 作品，在线欣赏。',
  },
]

/** 外部站点数量：当前全部为外链站点，供统计场景复用 */
export const EXTERNAL_WALLPAPER_COUNT = WALLPAPER_LIST.filter((item) => isExternal(item.key)).length
