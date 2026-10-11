/**
 * 关于页静态配置
 *
 * 集中维护关于页的文案与免责声明等静态数据，各板块组件只负责展示，内容调整一律改这里
 */
import pkg from '../../../../package.json'

/** 站点名称，取自环境变量，与侧栏 logo 处一致 */
export const SITE_TITLE = import.meta.env.VITE_APP_TITLE

/** 站点简介文案，展示于 hero 区 */
export const SITE_DESC = '一个干净、无广告的个人上网导航，收录日常高频使用的影视、软件、学习与网盘资源站点，让好网站一眼就能找到。'

/** 站点上线时间，运行时长的起算点，随站点的正式对外时间维护 */
export const SITE_LAUNCH_TIME = '2026-09-30'

/** QQ 交流群号，统计卡展示并支持点击复制 */
export const QQ_GROUP = '486011286'

/** 站点当前版本号，取自 package.json 的 version 字段，随发版维护 */
export const APP_VERSION = `v${pkg.version}`

/** 免责声明条目，按展示顺序排列 */
export const NOTICE_LIST = [
  '本站仅为个人收藏的网址导航，所有收录站点均来自互联网公开渠道，与本站无任何隶属关系。',
  '各站点的内容、服务及安全性由其运营方自行负责，使用过程中请自行甄别，注意个人信息与财产安全。',
  '如收录站点侵犯了您的合法权益，或您不希望被本站收录，可通过交流群联系，核实后将于 24 小时内移除。',
]
