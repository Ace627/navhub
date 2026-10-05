import { isExternal } from '@/utils'

/** 自我提升条目定义 */
export interface StudyItem {
  /** 站点唯一标识：完整 URL（http/https 等协议开头），点击新窗口打开 */
  key: string
  /** 站点名称 */
  title: string
  /** 图标地址：站点图标 URL 或本地资源路径（src/assets/images/icons/ 下按文件名匹配） */
  icon: string
  /** 描述文案：站点卡片上展示的简短说明，约 32 字 */
  description: string
}

/** 自我提升站点列表：均为外部站点，卡片以纯外链模式渲染 */
export const STUDY_LIST: StudyItem[] = [
  {
    key: 'https://www.lvyenet.com',
    title: '绿叶学习网',
    icon: 'https://www.lvyenet.com/imgs/sites/share/apple-touch-icon.png',
    description: '专注优质编程教程，涵盖网络与开发技术，并提供在线编译器助力边学边练。',
  },
  {
    key: 'https://www.51zxw.net',
    title: '我要自学网',
    icon: 'https://www.51zxw.net/favicon.ico',
    description: '涵盖办公、3D、平面、影视动画等软件领域的免费视频教程自学网站。',
  },
  {
    key: 'https://www.examcoo.com/index/ku',
    title: '考试酷',
    icon: 'https://www.examcoo.com/favicon.ico',
    description: '永久免费的在线考试与电子作业平台，提供海量公共题库、自测练习与智能组卷服务。',
  },
  {
    key: 'http://www.dzkbw.com',
    title: '电子课本网',
    icon: 'http://www.dzkbw.com/favicon.ico',
    description: '提供人教、苏教、北师大等各版本中小学电子课本的在线阅读与下载导航。',
  },
  {
    key: 'https://le.ouchn.cn/home',
    title: '终身教育平台',
    icon: 'https://le.ouchn.cn/assets/logo.8894ec3b.ico',
    description: '国家开放大学终身教育平台，免费提供学历教育、职业培训等海量在线课程。',
  },
  {
    key: 'https://www.smartedu.cn',
    title: '智慧教育平台',
    icon: 'https://www.smartedu.cn/favicon.ico?1',
    description: '国家智慧教育公共服务平台，汇聚优质课程资源，面向师生和社会学习者免费开放。',
  },
  {
    key: 'https://www.icourse163.org',
    title: '中国大学慕课',
    icon: 'assets/images/icons/中国大学慕课.png',
    description: '汇集名校名师的中文慕课平台，提供优质大学课程在线学习，学完可获得认证证书。',
  },
  {
    key: 'https://gwy.gkzhenti.cn',
    title: '公考真题库',
    icon: 'https://gwy.gkzhenti.cn/favicon.ico',
    description: '收录公务员、事业单位等考试真题，支持行测申论试卷整套在线下载打印。',
  },
  {
    key: 'https://wenshu.court.gov.cn',
    title: '裁判文书网',
    icon: 'https://wenshu.court.gov.cn/website/wenshu/images/favicon.ico',
    description: '最高人民法院官方裁判文书公开平台，可在线检索查阅各类案件裁判文书。',
  },
  {
    key: 'https://www.cnki.net',
    title: '中国知网',
    icon: 'https://www.cnki.net/favicon.ico',
    description: '提供学术期刊、学位论文、会议文献等资源的统一检索、在线阅读与下载服务。',
  },
  {
    key: 'https://zdic.net',
    title: '汉典',
    icon: 'https://zdic.net/apple-touch-icon.png',
    description: '在线汉语字典词典工具，涵盖康熙字典、说文解字、音韵方言与字源字形查询。',
  },
  {
    key: 'https://www.allhistory.com',
    title: '全历史',
    icon: 'https://www.allhistory.com/favicon.ico',
    description: '以AI知识图谱呈现时空关联的历史人文内容，构建数字化的知识探索平台。',
  },
  {
    key: 'https://webapp.vizen.cn/gugong_pano/index.html',
    title: '故宫全景',
    icon: 'https://www.dpm.org.cn/favicon.ico',
    description: '故宫博物院全景漫游，足不出户欣赏紫禁城各大宫殿的高清全景影像。',
  },
  {
    key: 'https://www.cbaigui.com',
    title: '中国妖怪百科',
    icon: 'https://www.cbaigui.com/favicon.ico',
    description: '中国古典妖怪文献资料库，收录鬼怪、精怪、神兽等神话传说与民俗文化条目。',
  },
  {
    key: 'https://open.163.com',
    title: '网易公开课',
    icon: 'https://c.open.163.com/favicon.ico',
    description: '汇聚国内外名校公开课程，覆盖科学、经济、人文等领域，免费开拓视野学习知识。',
  },
  {
    key: 'https://www.shijuan1.com',
    title: '第一试卷网',
    icon: 'https://www.shijuan1.com/favicon.ico',
    description: '免费提供中小学各科试卷资源下载，涵盖单元卷、月考卷与期末期中试题。',
  },
  {
    key: 'https://www.chinesemooc.org/index.php',
    title: '华文慕课',
    icon: 'https://www.chinesemooc.org/favicon.ico',
    description: '北大与阿里合办的中文慕课平台，汇集名校免费课程，文理医工等学科门类齐全。',
  },
  {
    key: 'http://www.wordlm.com',
    title: 'Word联盟',
    icon: 'http://www.wordlm.com/favicon.ico',
    description: '专业办公软件学习平台，提供Word图文视频教程与各版本下载等资讯。',
  },
  {
    key: 'https://www.lanrenexcel.com',
    title: '懒人Excel',
    icon: 'https://www.lanrenexcel.com/wp-content/uploads/icon.png',
    description: '免费Excel教程站，涵盖函数公式、数据透视表、图表与VBA等实操技巧。',
  },
  {
    key: 'https://res.wokanxing.info/jpgramma/index.html',
    title: '日语语法指南',
    icon: 'https://res.wokanxing.info/favicon.ico',
    description: '系统讲解日语语法的免费教程，覆盖基础到高级用法，助力入门者稳步进阶。',
  },
  {
    key: 'https://csdiy.wiki',
    title: 'CS自学指南',
    icon: 'https://csdiy.wiki/images/favicon.ico',
    description: '开源计算机自学指南，汇总名校课程、教材与学习路线，助你系统规划自学方向。',
  },
  {
    key: 'https://programmercarl.com',
    title: '代码随想录',
    icon: 'https://file1.kamacoder.com/i/web/20250421212153.png',
    description: '免费开源的算法刷题指南，提供图文视频题解与面试八股，助力高效备战求职。',
  },
  {
    key: 'https://visualgo.net/zh',
    title: 'VisuAlgo',
    icon: 'https://visualgo.net/img/favicon.png',
    description: '新加坡国立大学出品的数据结构与算法可视化动画教程，支持中文，可交互演示。',
  },
  {
    key: 'https://www.xuetangx.com',
    title: '学堂在线',
    icon: 'https://proxt-cdn.xuetangx.com/fe-proxtassets/xuetangX/0329/logo.ico',
    description: '清华大学发起的慕课平台，汇聚国内外名校优质课程，覆盖多学科免费在线学习。',
  },
  {
    key: 'https://www.runoob.com',
    title: '菜鸟教程',
    icon: 'https://static.char123.com/images/icon/mobile-icon.png',
    description: '提供编程基础技术教程，涵盖主流编程语言与数据库知识，附大量在线实例演示。',
  },
  {
    key: 'https://www.jialidun.com',
    title: '家里蹲大学',
    icon: 'https://www.jialidun.com/favicon.ico',
    description: '提供公开课讲座视频的远程教育学习网站，汇聚网络课程资源，助力自主学习。',
  },
  {
    key: 'https://xue.taobao.com',
    title: '淘宝教育',
    icon: 'https://xue.taobao.com/favicon.ico',
    description: '淘宝旗下在线教育平台，提供电商、外语、职场技能等精品课程与名师直播教学。',
  },
  {
    key: 'https://www.w3school.com.cn/index.html',
    title: 'W3School',
    icon: 'https://www.w3school.com.cn/i/logo/apple-touch-icon.png',
    description: 'Web开发在线教程站，涵盖HTML、CSS等技术，通俗易懂，实例丰富。',
  },
  {
    key: 'https://www.shuxuele.com',
    title: '数学乐',
    icon: 'https://www.shuxuele.com/favicon.ico',
    description: '用浅显语言讲解数学知识，配互动谜题、游戏与测验，适合中小学生的数学乐园。',
  },
  {
    key: 'https://www.mfcad.com',
    title: '沐风网',
    icon: 'https://www.mfcad.com/favicon.ico',
    description: '综合性图纸素材平台，提供CAD、Creo等软件的图纸下载与免费教程。',
  },
  {
    key: 'https://www.chinacourt.cn/index.shtml',
    title: '中国法院网',
    icon: 'https://www.chinacourt.cn/style/images/share200.png',
    description: '最高人民法院批准成立的综合性法律新闻网站，提供权威法律资讯与案件报道。',
  },
  {
    key: 'https://www.eol.cn',
    title: '中国教育在线',
    icon: 'https://www.eol.cn/favicon.ico',
    description: '教育资讯门户，对接国内外数千所高校，发布权威招考、就业等教育信息。',
  },
  {
    key: 'https://www.neea.edu.cn',
    title: '教育考试网',
    icon: 'https://www.neea.edu.cn/favicon.ico',
    description: '教育部教育考试院官网，承办四六级、教师资格等考试报名与成绩查询服务。',
  },
  {
    key: 'https://www.shuge.org',
    title: '书格',
    icon: 'https://www.shuge.org/wp-content/uploads/2026/05/cropped-shugeorg2026-180x180.png',
    description: '开放免费的数字古籍图书馆，分享高清中国古典文化艺术影像，感受传统之美。',
  },
  {
    key: 'https://www.mvyxws.cn',
    title: '医学微视',
    icon: 'https://www.mvyxws.cn/favicon.ico',
    description: '中国医学科普微视频百科全书，以短视频讲解疾病防治与健康知识，通俗易懂。',
  },
  {
    key: 'https://zh.wikihow.com',
    title: 'wikiHow',
    icon: 'https://zh.wikihow.com/skins/WikiHow/wH-initials_152x152.png',
    description: '协作式生活指南百科，提供各领域免费的逐步指导，万事问题都能找到方法。',
  },
  {
    key: 'https://reader.jojokanbao.cn',
    title: 'JOJO看报',
    icon: 'https://reader.jojokanbao.cn/brand/app-icon-180.png',
    description: '在线看报工具，聚合各类报纸资源，手机端可便捷浏览，随时畅享读报体验。',
  },
  {
    key: 'http://www.ngotcmszh.com',
    title: '民间中医网',
    icon: 'http://www.ngotcmszh.com/favicon.ico',
    description: '民间中医交流论坛，涵盖经典研习、经方方药、针灸推拿与养生保健等板块。',
  },
  {
    key: 'http://www.qihuang.net.cn',
    title: '岐黄书院',
    icon: 'http://www.qihuang.net.cn/favicon.ico',
    description: '以中医为主题的阅读交流空间，提供图书借阅、技法推广与中医文化体验。',
  },
  {
    key: 'https://wapp.nishi001.com/forum.php',
    title: '倪师之家',
    icon: 'https://wapp.nishi001.com/favicon.ico',
    description: '学习倪海厦学术思想的中医社区，提供医案资源、文章专栏与自学交流板块。',
  },
  {
    key: 'https://www.zt8.cn',
    title: '字帖吧',
    icon: 'https://www.zt8.cn/favicon.ico',
    description: '免费在线生成汉字、拼音、字母与数字等字帖，输入内容即可实时预览打印。',
  },
]

/** 外部站点数量：当前全部为外链站点，供统计场景复用 */
export const EXTERNAL_STUDY_COUNT = STUDY_LIST.filter((item) => isExternal(item.key)).length
