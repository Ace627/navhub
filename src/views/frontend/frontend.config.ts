import { isExternal } from '@/utils'

/** 前端条目定义 */
export interface FrontendItem {
  /** 条目唯一标识：完整 URL（http/https 等协议开头，点击新窗口打开） */
  key: string
  /** 条目名称 */
  title: string
  /** 图标地址：站点图标 URL */
  icon: string
  /** 描述文案：卡片上展示的简短说明，约 32 字 */
  description: string
}

/** 前端站点列表：均为外部站点，卡片点击后新窗口打开 */
export const FRONTEND_LIST: FrontendItem[] = [
  {
    key: 'https://gitee.com',
    title: 'Gitee',
    icon: 'https://gitee.com/favicon.ico',
    description: '国内主流代码托管平台，提供 Git 代码管理、项目协作与持续集成等研发服务。',
  },
  {
    key: 'https://github.com',
    title: 'GitHub',
    icon: 'https://github.githubassets.com/assets/pinned-octocat-093da3e6fa40.svg',
    description: '全球最大开源代码托管平台，汇聚海量开源项目，支持代码协作与版本管理。',
  },
  {
    key: 'https://gitcode.com',
    title: 'GitCode',
    icon: 'https://cdn-static.gitcode.com/static/images/logo-favicon.png',
    description: '面向开发者的代码托管与开源协作平台，提供项目托管与社区交流服务。',
  },
  {
    key: 'https://gogs.io',
    title: 'Gogs',
    icon: 'https://gogs.io/mintlify-assets/_mintlify/favicons/unknwon/QW55vOu9whFz9uXZ/_generated/favicon/apple-touch-icon.png',
    description: '轻量级开源的自托管 Git 代码托管服务，部署简单、跨平台，适合快速搭建私有仓库协作。',
  },
  {
    key: 'https://gitlab.cn',
    title: 'GitLab',
    icon: 'https://gitlab.cn/svg/gitlab.svg',
    description: 'GitLab 中文官网，企业级 AI 代码托管与 DevSecOps 平台，支持私有化部署与 SaaS 交付。',
  },
  {
    key: 'https://element-plus.org/zh-CN/component/overview',
    title: 'Element Plus',
    icon: 'https://element-plus.org/images/element-plus-logo-small.svg',
    description: '基于 Vue 3 的开源组件库，文档完善、示例丰富，助力开发者高效构建界面。',
  },
  {
    key: 'https://wot-ui.cn',
    title: 'Wot UI',
    icon: 'https://wot-ui.cn/favicon.ico',
    description: '轻量美观的 uni-app 组件库，提供 80+ 高质量组件，支持暗黑模式。',
  },
  {
    key: 'https://v2.element-plus-x.com/zh',
    title: 'Element Plus X',
    icon: 'https://v2.element-plus-x.com/favicon.ico',
    description: '基于 Vue3 与 Element Plus 的 AI 体验组件库，开箱即用。',
  },
  {
    key: 'https://vant.pro/vant',
    title: 'Vant',
    icon: 'https://fastly.jsdelivr.net/npm/@vant/assets/logo.png',
    description: '轻量可定制的移动端 Vue 组件库，提供 70+ 高质量组件，助力移动应用高效开发。',
  },
  {
    key: 'https://www.naiveui.com/zh-CN/os-theme',
    title: 'Naive UI',
    icon: 'https://www.naiveui.com/assets/naivelogo-BdDVTUmz.svg',
    description: '基于 Vue 3 的组件库，TypeScript 编写，主题可调，内置暗黑模式与丰富组件。',
  },
  {
    key: 'https://antdv.com/components/overview-cn',
    title: 'Ant Design Vue',
    icon: 'https://www.antdv.com/favicon.ico',
    description: '基于 Ant Design 设计规范与 Vue 的企业级组件库，提供丰富的高质量组件。',
  },
  {
    key: 'https://arco.design/vue/docs/start',
    title: 'Arco Design',
    icon: 'https://unpkg.byted-static.com/latest/byted/arco-config/assets/favicon.ico',
    description: '字节跳动出品的企业级设计系统 Vue 版组件库，风格简洁，组件丰富，开箱即用。',
  },
  {
    key: 'https://tdesign.tencent.com/vue-next/overview',
    title: 'TDesign',
    icon: 'https://static.tdesign.tencent.com/vue-next/apple-touch-icon.png',
    description: '腾讯开源的企业级设计体系 Vue 3 组件库，组件丰富，配套设计指南与资源。',
  },
  {
    key: 'https://vue-devui.github.io/quick-start',
    title: 'DevUI',
    icon: 'https://vue-devui.github.io/assets/logo.svg',
    description: '华为开源的 Vue 3 组件库，基于 DevUI 设计体系，提供企业级中后台场景组件。',
  },
  {
    key: 'https://nutui.jd.com/h5/vue/4x',
    title: 'NutUI',
    icon: 'https://img14.360buyimg.com/imagetools/jfs/t1/167902/2/8762/791358/603742d7E9b4275e3/e09d8f9a8bf4c0ef.png',
    description: '京东风格的轻量级移动端 Vue 组件库，支持 H5 与小程序多端开发，组件丰富。',
  },
  {
    key: 'https://maomentai817.github.io/pixel-ui',
    title: 'Pixel UI',
    icon: 'https://maomentai817.github.io/pixel-ui/images/favicon.ico',
    description: '基于 CSS Houdini 实现的像素风组件库，组件自带复古像素质感，适合个性界面。',
  },
  {
    key: 'https://cn.vuejs.org/guide/introduction',
    title: 'Vue',
    icon: 'https://cn.vuejs.org/logo.svg',
    description: '渐进式 JavaScript 前端框架，官方中文文档，提供指南、API 与示例。',
  },
  {
    key: 'https://router.vuejs.org/zh/introduction.html',
    title: 'Vue Router',
    icon: 'https://router.vuejs.org/logo.svg',
    description: 'Vue.js 官方路由器，支持嵌套路由、动态路由与导航守卫等核心能力。',
  },
  {
    key: 'https://pinia.vuejs.org/zh',
    title: 'Pinia',
    icon: 'https://pinia.vuejs.org/logo.svg',
    description: 'Vue 官方推荐的状态管理库，提供类型安全、模块化与开发者工具支持。',
  },
  {
    key: 'https://vueuse.nodejs.cn/guide',
    title: 'VueUse',
    icon: 'https://vueuse.nodejs.cn/apple-touch-icon.png',
    description: '基于 Vue 组合式 API 的实用工具函数集合，覆盖状态、DOM 与常用交互场景。',
  },
  {
    key: 'https://cn.vitejs.dev/guide',
    title: 'Vite',
    icon: 'https://cn.vitejs.dev/logo-without-border.svg',
    description: '下一代前端构建工具链，极速冷启动与热更新，官方中文文档。',
  },
  {
    key: 'https://vitepress.dev/zh',
    title: 'VitePress',
    icon: 'https://vitepress.dev/vitepress-logo-mini.svg',
    description: '基于 Vite 与 Vue 的静态站点生成器，用 Markdown 快速建站。',
  },
  {
    key: 'https://unocss.nodejs.cn',
    title: 'UnoCSS',
    icon: 'https://unocss.nodejs.cn/favicon.svg',
    description: '即时按需的原子化 CSS 引擎，规则灵活可定制，提升样式开发效率。',
  },
  {
    key: 'https://uniapp.dcloud.net.cn/api',
    title: 'uni-app',
    icon: 'https://qiniu-web-assets.dcloud.net.cn/unidoc/zh/icon.png?v=1556263038788',
    description: 'uni-app 官方 API 文档，覆盖网络、存储、媒体等常用跨端接口。',
  },
  {
    key: 'https://uni-helper.js.org',
    title: 'uni-helper',
    icon: 'https://uni-helper.js.org/favicon.ico',
    description: 'uni-app 生态工具集，提供类型提示与常用插件，助力跨端开发。',
  },
  {
    key: 'https://electron.nodejs.cn',
    title: 'Electron',
    icon: 'https://electron.nodejs.cn/assets/img/favicon.ico',
    description: '使用 JavaScript、HTML 和 CSS 构建跨平台桌面应用。',
  },
  {
    key: 'https://flutter.cn',
    title: 'Flutter',
    icon: 'https://docs.flutter.cn/assets/images/cn/flutter-320px.png',
    description: 'Flutter 官方文档中文版，包含 SDK 下载、最新特性、代码示例与中文社区等内容。',
  },
  {
    key: 'https://docs.nestjs.cn/introduction',
    title: 'NestJS',
    icon: 'https://docs.nestjs.cn/nestjs-hero-logo.svg',
    description: 'TypeScript 构建的 Node.js 服务端框架，高效且可扩展。',
  },
  {
    key: 'https://www.typeorm.net',
    title: 'TypeORM',
    icon: 'https://www.typeorm.net/favicon/favicon.ico',
    description: '支持 TypeScript 与多数据库的 ORM 框架，可运行于多端环境。',
  },
  {
    key: 'https://www.redisio.com/Getting-started.html',
    title: 'Redis中文文档',
    icon: 'https://www.redisio.com/img/favicon.png',
    description: 'Redis 中文教程站，涵盖安装运行、数据类型与常用命令等入门内容。',
  },
  {
    key: 'https://github.com/produck/svg-captcha/blob/1.x/README_CN.md',
    title: 'svg-captcha',
    icon: 'https://github.githubassets.com/assets/pinned-octocat-093da3e6fa40.svg',
    description: 'Node.js 验证码生成库，纯 JavaScript 实现，可生成 SVG 格式数字与算式验证码。',
  },
  {
    key: 'https://www.axios-http.cn/docs/intro',
    title: 'Axios',
    icon: 'https://www.axios-http.cn/img/favicon.ico',
    description: '基于 Promise 的网络请求库，同时支持浏览器与 Node.js 端。',
  },
  {
    key: 'https://echarts.apache.org/zh/index.html',
    title: 'ECharts',
    icon: 'https://echarts.apache.org/zh/images/favicon.png?_v_=20240226',
    description: '基于 JavaScript 的开源可视化图表库，类型丰富、交互流畅。',
  },
  {
    key: 'https://dayjs.fenxianglu.cn/category',
    title: 'Day.js',
    icon: 'https://dayjs.fenxianglu.cn/assets/favicon.png',
    description: '极简的 JavaScript 日期库，支持解析、校验、格式化与日期计算。',
  },
  {
    key: 'https://www.lodashjs.com',
    title: 'Lodash',
    icon: 'https://www.lodashjs.com/img/favicon.ico',
    description: '一致、模块化、高性能的 JavaScript 实用工具库，官方中文文档。',
  },
  {
    key: 'https://6tail.cn/tyme.html',
    title: 'Tyme',
    icon: 'https://6tail.cn/favicon.ico',
    description: '强大的多历法日历工具库，支持农历、干支、节气、星座与法定假日等。',
  },
  {
    key: 'https://www.canvasapi.cn',
    title: 'Canvas',
    icon: 'https://www.canvasapi.cn/favicon.ico',
    description: 'Canvas API 中文文档站，提供画布绘图接口的属性、方法与示例讲解。',
  },
  {
    key: 'https://leafletjs.cn',
    title: 'Leaflet',
    icon: 'https://leafletjs.cn/docs/images/favicon.ico',
    description: '开源交互式地图 JavaScript 库，轻量易用，支持移动端适配。',
  },
  {
    key: 'https://nes-vue-docs.netlify.app/zh',
    title: 'NES Vue',
    icon: 'https://nes-vue-docs.netlify.app/apple-touch-icon.png',
    description: '基于 Vue3 的 NES 模拟器组件，在网页端运行 nes 游戏文件。',
  },
  {
    key: 'https://www.iconfont.cn',
    title: '阿里图标库',
    icon: 'https://img.alicdn.com/imgextra/i4/O1CN01XZe8pH1USpiUNT1QN_!!6000000002517-2-tps-114-114.png',
    description: '阿里旗下矢量图标库，提供图标下载、在线存储与格式转换等便捷服务。',
  },
  {
    key: 'https://juejin.cn/frontend',
    title: '掘金',
    icon: 'https://lf-web-assets.juejin.cn/obj/juejin-web/xitu_juejin_web/static/favicons/apple-touch-icon.png',
    description: '面向中文开发者的技术社区，前端频道汇聚优质文章与实践经验。',
  },
  {
    key: 'https://www.pnpm.cn',
    title: 'pnpm',
    icon: 'https://www.pnpm.cn/img/favicon.png',
    description: '极速、高效利用磁盘空间的包管理器，官方中文文档。',
  },
  {
    key: 'https://www.jsdelivr.com',
    title: 'jsDelivr',
    icon: 'https://www.jsdelivr.com/icons/apple-touch-icon.png',
    description: '免费快速的公共 CDN 服务，加速 npm 与 GitHub 资源分发。',
  },
]

/** 外部站点数量：自有页面不计入，供统计场景复用 */
export const EXTERNAL_FRONTEND_COUNT = FRONTEND_LIST.filter((item) => isExternal(item.key)).length
