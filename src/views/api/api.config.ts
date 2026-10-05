import { isExternal } from '@/utils'

/** 接口条目定义 */
export interface ApiItem {
  /** 站点唯一标识：完整 URL（http/https 等协议开头），点击新窗口打开 */
  key: string
  /** 接口名称 */
  title: string
  /** 图标地址：站点图标 URL 或本地资源路径（src/assets/images/icons/ 下按文件名匹配） */
  icon: string
  /** 描述文案：接口卡片上展示的简短说明，约 32 字 */
  description: string
}

/** 公益接口站点列表：均为外部站点，卡片以纯外链模式渲染 */
export const API_LIST: ApiItem[] = [
  {
    key: 'https://api.aa1.cn',
    title: '夏柔聚合接口',
    icon: 'https://api.aa1.cn/assets/img/favicon.png',
    description: '免费接口聚合平台，上千位开发者入驻，上千款公益 API 接口免费调用。',
  },
  {
    key: 'https://timor.tech/api/holiday',
    title: '免费节假日',
    icon: 'https://timor.tech/favicon.ico',
    description: '免费好用的节假日查询接口，支持查询调休安排，可返回人类可阅读的中文结果。',
  },
  {
    key: 'https://api.istero.com/service',
    title: '起零数据',
    icon: 'https://eo.istero.com/favicon/favicon.ico',
    description: '免费 API 接口开放平台，提供歌词、热搜、备案查询等 200 余款实用接口。',
  },
  {
    key: 'https://mshopact.vivo.com.cn/tool/config',
    title: 'VIVO时间戳',
    icon: 'https://mshopact.vivo.com.cn/favicon.ico',
    description: 'vivo 商城隐藏接口，JSON 直出服务器毫秒时间戳，可作免费校时来源。',
  },
  {
    key: 'https://www.bokewo.com/bing/bingimg.php',
    title: '必应每日壁纸',
    icon: 'https://www.bokewo.com/favicon.ico',
    description: '必应每日壁纸接口，直接返回当天 Bing 壁纸，可作网页背景图源调用。',
  },
  {
    key: 'https://api.qingnian8.com',
    title: '咸虾米接口库',
    icon: 'https://api.qingnian8.com/favicon.ico',
    description: '咸虾米免费接口库，收录各类公益 API，满足开发者与学习者的调用需求。',
  },
  {
    key: 'https://hitokoto.cn',
    title: '一言',
    icon: 'https://hitokoto.cn/favicon.ico',
    description: '免费的一句话接口服务，随机返回动漫、小说、哲学等语句，适合开发调用。',
  },
  {
    key: 'https://blog.csdn.net/qq_46144627/article/details/140908826',
    title: 'QQ头像接口',
    icon: 'https://g.csdnimg.cn/static/logo/favicon32.ico',
    description: 'QQ 头像官方接口教程，支持用 QQ 号、邮箱、空间三种方式获取用户头像。',
  },
  {
    key: 'https://www.explinks.com',
    title: '幂简集成',
    icon: 'https://cdn.explinks.com/favicon.ico',
    description: '国内领先的 API 聚合平台，一站搜索、试用并集成国内外接口服务。',
  },
  {
    key: 'https://api.icofun.cn',
    title: '小齐API',
    icon: 'https://q4.qlogo.cn/g?b=qq&nk=326284281&s=640',
    description: '小齐 API 接口服务站，提供随机一言、工具类等多种免费接口，稳定高效。',
  },
  {
    key: 'https://5213140.xyz',
    title: '安生API',
    icon: 'https://cdn.apifox.com/app/project-icon/custom/20250218/feba6aa3-08fd-4891-be0f-4f086d39dc1e.png',
    description: '安生 API 免费接口面板，提供接口调用统计与多项公益接口，供开发者使用。',
  },
  {
    key: 'https://api.andeer.top',
    title: '极光API',
    icon: 'https://api.andeer.top/favicon.ico',
    description: '高质量 API 服务平台，主打稳定、快速、易用，接口免费开放调用。',
  },
  {
    key: 'https://api.317ak.com',
    title: '倾梦API',
    icon: 'https://image.317ak.com/img/qm.png',
    description: '倾梦免费 API 平台，接口免费开放调用，助力开发者的项目开发进程。',
  },
  {
    key: 'https://api.yujn.cn',
    title: '遇见API',
    icon: 'https://api.yujn.cn/favicon.ico',
    description: '遇见免费接口平台，提供多种常用公益 API 接口，供开发者免费调用。',
  },
  {
    key: 'https://api.suyanw.cn',
    title: '素颜API',
    icon: 'https://api.suyanw.cn/favicon.ico',
    description: '免费数据接口调用平台，致力于提供稳定、快速的公益 API 接口服务。',
  },
  {
    key: 'https://www.free-api.com',
    title: '接口大全',
    icon: 'https://www.free-api.com/image/logo.ico',
    description: '免费接口大全站点，收集互联网各类免费 API 服务，做接口的搬运工。',
  },
  {
    key: 'https://yunzhiapi.cn',
    title: '云智API',
    icon: 'https://yunzhiapi.cn/favicon.ico',
    description: '提供稳定高效的接口调用服务，涵盖人工智能、生活服务、音乐解析等接口。',
  },
  {
    key: 'https://api.shanhe.kim',
    title: '山河云API',
    icon: 'https://q1.qlogo.cn/g?b=qq&nk=1433224387&s=640',
    description: '山河云免费接口平台，提供多种公益 API 数据接口，供开发者免费调用。',
  },
  {
    key: 'https://api.dwo.cc',
    title: '小渡API',
    icon: 'https://api.dwo.cc/favicon.ico',
    description: '免费 API 聚合平台，提供稳定高并发的数据接口，聚合多家优质资源。',
  },
  {
    key: 'https://oiapi.net',
    title: 'OIAPI',
    icon: 'https://oiapi.net/favicon.ico',
    description: '提供丰富的免费 API 服务，支持即点即用、无需注册，可在线测试调用。',
  },
  {
    key: 'https://xxapi.cn/api-market',
    title: 'API市场',
    icon: 'https://xxapi.cn/favicon.ico',
    description: '免费 API 接口市场，提供各类实用接口服务，调用快速稳定。',
  },
  {
    key: 'https://api.okcode.vip',
    title: 'OKAPI',
    icon: 'https://api.okcode.vip/assets/images/favicon.ico',
    description: '致力于提供安全稳定、快速便捷的免费 API 接口服务平台。',
  },
  {
    key: 'https://free.wqwlkj.cn',
    title: '问情API',
    icon: 'https://free.wqwlkj.cn/icon.ico',
    description: '问情网络科技出品的接口管理平台，界面美观，接口免费开放调用。',
  },
  {
    key: 'https://api-v2.yuafeng.cn',
    title: '枫雨API',
    icon: 'https://api-v2.yuafeng.cn/favicon.ico',
    description: '枫雨免费接口平台，致力为用户提供稳定、快速的 API 数据接口服务。',
  },
  {
    key: 'https://api.qster.top/API',
    title: '客源API',
    icon: 'https://api.qster.top/favicon.ico',
    description: '客源免费接口平台，提供丰富接口与功能，助力开发者高效完成任务。',
  },
  {
    key: 'https://api.ahfi.cn',
    title: '优享云API',
    icon: 'https://api.ahfi.cn/upload/image/1782288268.ico',
    description: '稳定高速的数据接口服务平台，兼具 AI 大模型接口，免费开放调用。',
  },
  {
    key: 'https://apis.kit9.cn',
    title: 'API接口',
    icon: 'https://apis.kit9.cn/favicon.ico',
    description: '为站长与开发者提供免费公共接口，聚合生活服务、短视频、QQ 等相关服务。',
  },
  {
    key: 'https://www.yuanxiapi.cn',
    title: '易连数据',
    icon: 'https://www.yuanxiapi.cn/favicon.ico',
    description: '原远昔API，提供稳定、快速、低价及免费的 API 数据接口调用服务。',
  },
  {
    key: 'https://api.milorapart.top/api-list',
    title: 'MiloraAPI',
    icon: 'https://api.milorapart.top/favicon.ico',
    description: '米洛免费接口平台，提供接口列表与多种公益 API，供开发者调用。',
  },
  {
    key: 'https://apis.whyta.cn',
    title: 'WhyApi',
    icon: 'https://q1.qlogo.cn/g?b=qq&nk=1433224387&s=640',
    description: 'WhyApi 免费接口大全，聚合多种常用公益接口，供开发者快速接入。',
  },
  {
    key: 'https://tmini.net',
    title: 'Tmini',
    icon: 'https://tmini.net/favicon.ico',
    description: '聚合天气、快递物流、号码标记等免费接口，HTTPS 加密传输免密钥调试。',
  },
  {
    key: 'https://www.gmya.net/api',
    title: '故梦吖',
    icon: 'https://www.gmya.net/favicon.ico',
    description: '故梦吖免费接口平台，提供多种常用公益 API，供站长与开发者调用。',
  },
  {
    key: 'https://jkapi.com',
    title: '无铭API',
    icon: 'https://jkapi.com/favicon.ico',
    description: '免费稳定易用的接口平台，覆盖站长工具、IP 归属地、生活与图片视频接口。',
  },
  {
    key: 'https://api.sumt.cn',
    title: 'SumtAPI',
    icon: 'https://api.sumt.cn/favicon.ico',
    description: '免费、稳定、快速的 API 数据接口调用服务平台，支持在线调试使用。',
  },
  {
    key: 'https://api.xiaoyu17love.top',
    title: '小宇API',
    icon: 'https://api.xiaoyu17love.top/favicon.ico',
    description: '小宇免费接口平台，主打稳定、快速、易用，提供高质量公益接口。',
  },
  {
    key: 'https://a.aa.cab',
    title: '云汐API',
    icon: 'https://a.aa.cab/favicon.ico',
    description: '云汐免费接口平台，提供多种常用公益 API，供开发者免费调用。',
  },
  {
    key: 'https://api.zxz.ee',
    title: 'HelloAPI',
    icon: 'https://api.zxz.ee/favicon.ico',
    description: '提供永久免费稳定的接口服务，支持开发者快速接入，稳定可靠。',
  },
  {
    key: 'http://api.cmvip.cn',
    title: '恋酱API',
    icon: 'http://apis.cmvip.cn/assets/index.ico',
    description: '提供优质免费接口的站点，接口持续更新，秉持质量优先的理念运营。',
  },
  {
    key: 'https://api.makuo.cc',
    title: 'Yapi',
    icon: 'https://api.makuo.cc/static/favicon.ico',
    description: '免费数据接口调用平台，致力于提供稳定、快速的公益 API 服务。',
  },
  {
    key: 'https://api.kuleu.com',
    title: '聚合API',
    icon: 'https://api.kuleu.com/favicon.ico',
    description: '免费接口聚合平台，汇聚上千款公益 API，覆盖生活、数据、工具全品类。',
  },
  {
    key: 'https://api.71xk.com',
    title: '星空API',
    icon: 'https://cdn.71xk.com/xkstatic/common/images/logo/png_favicon.png',
    description: '星空免费接口平台，提供稳定可靠的公益 API 数据接口调用服务。',
  },
  {
    key: 'https://img.xjh.me',
    title: '岁月小筑',
    icon: 'https://img.xjh.me/favicon.ico',
    description: '随机图片接口服务，每次访问随机返回背景图片，适合网页装饰调用。',
  },
  {
    key: 'https://www.loliapi.com',
    title: 'LoliAPI',
    icon: 'https://www.loliapi.com/favicon.ico',
    description: '免费公益接口站点，提供多种常用 API 服务，支持开发者免费调用。',
  },
  {
    key: 'http://www.guabu.com/API',
    title: '卦卜网',
    icon: 'http://www.guabu.com/favicon.ico',
    description: '卦卜网免费接口页，提供银行卡归属地、星座运势、黄道吉日等查询接口。',
  },
  {
    key: 'https://api.qvqa.cn/home',
    title: '简心API',
    icon: 'https://api.qvqa.cn/favicon.ico',
    description: '安全稳定的接口服务平台，提供天气、一言、图片等多种免费接口。',
  },
  {
    key: 'https://api.paugram.com',
    title: '保罗API',
    icon: 'https://api.paugram.com/static/img/icon.png',
    description: '保罗免费接口站点，提供 GIF 表情包等趣味接口，适合聊天场景调用。',
  },
  {
    key: 'https://api.xfabe.com',
    title: '小枫API',
    icon: 'https://api.xfabe.com/vite.svg',
    description: '小枫公益接口平台，为开发者提供免费、稳定、快速的 Web 接口服务。',
  },
  {
    key: 'https://api.zlxh.top',
    title: '小黑API',
    icon: 'https://q1.qlogo.cn/g?b=qq&nk=1433224387&s=640',
    description: '小黑免费接口平台，主打稳定、快速、易用，提供高质量公益接口。',
  },
  {
    key: 'https://api.lykep.com',
    title: '零艺客API',
    icon: 'https://api.lykep.com/favicon.ico',
    description: '零艺客免费接口平台，致力提供稳定、快速的公益 API 数据接口服务。',
  },
  {
    key: 'https://api.xinyew.cn',
    title: '新野API',
    icon: 'https://api.xinyew.cn/favicon.ico',
    description: '新野免费接口平台，提供稳定、快速的公益数据接口，免费开放调用。',
  },
  {
    key: 'http://api.xn--yet605m.xyz',
    title: '小鸟的API',
    icon: 'https://q1.qlogo.cn/g?b=qq&nk=1433224387&s=640',
    description: '小鸟的免费接口站点，提供多种常用公益 API，供开发者免费调用。',
  },
  {
    key: 'https://api.tangdouz.com',
    title: '糖豆子API',
    icon: 'https://api.tangdouz.com/favicon.ico',
    description: '收录 200 余款免费接口，覆盖生活查询、文本、图像处理等，无需注册调用。',
  },
  {
    key: 'https://api.ovo1.cc/apilist',
    title: '小虫Api',
    icon: 'https://api.ovo1.cc/upload/image/favicon.ico',
    description: '免费稳定API接口平台，提供多种数据接口与在线调试，助力开发者快速集成。',
  },
]

/** 外部站点数量：当前全部为外链站点，供统计场景复用 */
export const EXTERNAL_API_COUNT = API_LIST.filter((item) => isExternal(item.key)).length
