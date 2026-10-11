/**
 * 关于页静态配置
 *
 * 集中维护关于页的文案、特性清单、技术栈与更新日志等静态数据，
 * 各板块组件只负责展示，内容调整一律改这里
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

/** 功能特性清单：均为站内已实现的真实能力，icon 为全局注册的 SvgIcon 名称 */
export const FEATURE_LIST = [
  { icon: 'Moon', title: '暗色模式', desc: '明暗主题一键切换，图表配色自动适配' },
  { icon: 'Search', title: '快捷搜索', desc: 'Ctrl K 唤起全站搜索，按名称或描述定位站点' },
  { icon: 'Expand', title: '移动适配', desc: '小屏自动切换布局，移动端独立优化交互' },
  { icon: 'Sunny', title: '帧率监测', desc: 'requestAnimationFrame 实时采样渲染帧率' },
]

/** 免责声明条目，按展示顺序排列 */
export const NOTICE_LIST = [
  '本站仅为个人收藏的网址导航，所有收录站点均来自互联网公开渠道，与本站无任何隶属关系。',
  '各站点的内容、服务及安全性由其运营方自行负责，使用过程中请自行甄别，注意个人信息与财产安全。',
  '如收录站点侵犯了您的合法权益，或您不希望被本站收录，可通过交流群联系，核实后将于 24 小时内移除。',
]

/** 技术栈条目结构：key 用于从 package.json 自动推导版本号 */
interface TechItem {
  /** 展示名称 */
  name: string
  /** package.json 中的包名 */
  key: string
  /** 一句话说明 */
  desc: string
}

/** 技术栈来源清单：仅维护展示名与说明，版本号运行时推导 */
const TECH_SOURCE: TechItem[] = [
  { name: 'Vue', key: 'vue', desc: '渐进式前端框架' },
  { name: 'TypeScript', key: 'typescript', desc: '类型安全的 JavaScript' },
  { name: 'Vite', key: 'vite', desc: '下一代前端构建工具' },
  { name: 'Element Plus', key: 'element-plus', desc: '桌面端 UI 组件库' },
  { name: 'ECharts', key: 'echarts', desc: '数据可视化图表库' },
  { name: 'Pinia', key: 'pinia', desc: '直观的类型安全状态管理' },
  { name: 'UnoCSS', key: 'unocss', desc: '即时按需原子化 CSS 引擎' },
]

/**
 * 将 package.json 中的版本声明截取为「主版本.次版本」展示格式
 *
 * 依赖声明形如 ^3.5.43，去掉前缀符号后仅保留前两段，与页面既有展示口径一致
 *
 * @param range package.json 中的原始版本声明
 * @returns 形如 3.5 的主.次版本号
 */
function formatVersion(range: string) {
  return range.replace(/^[^\d]+/, '').split('.').slice(0, 2).join('.')
}

/**
 * 读取指定包名的版本声明
 *
 * 技术栈中既有 dependencies 也有 devDependencies，两者依次查找，缺失时返回空串
 *
 * @param key package.json 中的包名
 * @returns 原始版本声明，如 ^3.5.43；未声明时为空串
 */
function getPackageRange(key: string) {
  // package.json 的依赖表被 TS 推断为字面量键名类型，统一放宽为字符串索引表以便按包名查找
  const dependencies = pkg.dependencies as Record<string, string>
  const devDependencies = pkg.devDependencies as Record<string, string>
  return dependencies[key] ?? devDependencies[key] ?? ''
}

/** 技术栈展示清单：版本号由 package.json 推导，避免手写漂移 */
export const TECH_LIST = TECH_SOURCE.map((tech) => ({ ...tech, version: formatVersion(getPackageRange(tech.key)) }))

/** 更新日志条目结构 */
interface ChangelogItem {
  /** 版本号 */
  version: string
  /** 发布日期 */
  date: string
  /** 本次更新内容概述 */
  desc: string
}

/** 更新日志清单：新条目插在最前，与时间线倒序展示对应 */
export const CHANGELOG_LIST: ChangelogItem[] = [
  { version: '1.0.0', date: '2026-09-30', desc: '正式上线，提供站点收录、分类管理、全站搜索与暗色模式能力' },
]
