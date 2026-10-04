import { isExternal } from '@/utils'

/** 人工智能条目定义 */
export interface AiItem {
  /** 条目唯一标识：完整 URL（http/https 等协议开头，点击新窗口打开） */
  key: string
  /** 条目名称 */
  title: string
  /** 图标地址：站点图标 URL */
  icon: string
  /** 描述文案：卡片上展示的简短说明，约 32 字 */
  description: string
}

/** 人工智能站点列表：均为外部站点，卡片点击后新窗口打开；网页聊天类站点集中排在最前 */
export const AI_LIST: AiItem[] = [
  {
    key: 'https://chat.deepseek.com',
    title: 'DeepSeek',
    icon: 'https://fe-static.deepseek.com/chat/icon-180.png',
    description: '深度求索旗下 AI 对话助手，擅长编程、写作与文件处理，支持文件上传与长文本对话。',
  },
  {
    key: 'https://www.doubao.com/chat',
    title: '豆包',
    icon: 'https://lf-flow-web-cdn.doubao.com/obj/flow-doubao/favicon/new-doubao/76x76.png',
    description: '字节跳动旗下 AI 智能助手，支持聊天问答、写作翻译与编程，可免费体验视频生成。',
  },
  {
    key: 'https://chatgpt.com',
    title: 'ChatGPT',
    icon: 'https://chatgpt.com/unauth-mweb/favicon.ico',
    description: 'OpenAI 旗下 AI 对话助手，支持问答写作与代码编程，可上传文件解析内容。',
  },
  {
    key: 'https://claude.com/product/overview',
    title: 'Claude',
    icon: 'https://assets.claude.com/95a868946ac8a31e5ff832e2899f294aa368b836.png?w=32&h=32',
    description: 'Anthropic 旗下 AI 助手，交付任务并生成文档、幻灯与原型，支持定时执行。',
  },
  {
    key: 'https://yuanbao.tencent.com',
    title: '元宝',
    icon: 'https://static.yuanbao.tencent.com/m/yuanbao-web/favicon_new@32.png',
    description: '腾讯旗下全能 AI 助手，支持智能对话与联网搜索，多端同步助力工作学习。',
  },
  {
    key: 'https://www.kimi.com',
    title: 'Kimi',
    icon: 'https://www.kimi.com/pwa-192.png',
    description: '月之暗面旗下 AI 助手，K3 新版上线，支持智能体编程与知识工作，并行执行任务。',
  },
  {
    key: 'https://www.qianwen.com',
    title: '千问',
    icon: 'https://img.alicdn.com/imgextra/i2/O1CN01taBbMS1CfyJoOt0lB_!!6000000000109-2-tps-80-80.png',
    description: '阿里官方 AI 助手，提供 Qwen 大模型体验，支持 AI 搜索、生图与 PPT 创作。',
  },
  {
    key: 'https://xiaoyi.huawei.com/chat',
    title: '小艺',
    icon: 'https://search-static-drcn.dbankcdn.com/celia/v2/favicon-transparent.ico',
    description: '华为自研 AI 智慧助手，支持问答写作、文档阅读与编码辅助，鸿蒙生态深度适配。',
  },
  {
    key: 'https://grok.com',
    title: 'Grok',
    icon: '@/assets/images/icons/Grok.png',
    description: 'xAI 推出的 AI 对话助手，支持实时搜索与推理问答，可辅助写作与编程分析。',
  },
  {
    key: 'https://skillsmp.com/zh',
    title: 'SkillsMP',
    icon: 'https://skillsmp.com/apple-touch-icon.png',
    description: 'Agent 技能市场，汇集 Codex 与 Claude 技能，支持搜索对比与来源检查。',
  },
  {
    key: 'https://skills66.com',
    title: 'Skills66',
    icon: 'https://skills66.com/favicon.ico?favicon.7f200054.ico',
    description: 'AI 技能分享平台，汇集高质量技能、Prompt 与工具资源，助力提升 AI 开发效率。',
  },
  {
    key: 'https://www.aishort.top',
    title: 'AiShort',
    icon: 'https://www.aishort.top/img/logo.png',
    description: '实用提示词模板库，覆盖写作、编程、翻译等场景，一键复制让 AI 精准理解指令。',
  },
  {
    key: 'https://ccswitch.io/zh',
    title: 'CC Switch',
    icon: 'https://ccswitch.io/favicon.png',
    description: 'AI 编程工具统一管理平台，集中管理多家供应商配置、MCP、技能与用量统计。',
  },
  {
    key: 'https://www.workbuddy.cn',
    title: 'WorkBuddy',
    icon: 'https://download.codebuddy.cn/web/workbuddy/788eb1c5ba3681efa98cf7b58ae688e293c1bb34/assets/logo.svg',
    description: '腾讯云代码助手推出的 AI Agent 办公工具，多智能体并行，交付复杂任务结果。',
  },
  {
    key: 'https://opencode.ai',
    title: 'OpenCode',
    icon: 'https://opencode.ai/apple-touch-icon-v3.png',
    description: '开源 AI 编程代理，深度集成终端工作流，助力开发者高效完成编码任务。',
  },
  {
    key: 'https://www.trae.cn/work',
    title: 'TraeWork',
    icon: 'https://lf-cdn.trae.com.cn/obj/trae-com-cn/trae_website_prod_cn/favicon.png',
    description: '字节跳动推出的 AI 办公平台，支持生成 PPT、数据分析与文档撰写，多端协同提效。',
  },
  {
    key: 'https://www.coze.cn/overview',
    title: '扣子',
    icon: 'https://www.coze.cn/space-intro/favicon.ico',
    description: '字节跳动旗下职场 AI 伙伴与一站式开发平台，支持智能体搭建，直接交付工作结果。',
  },
  {
    key: 'https://dify.ai/zh',
    title: 'Dify',
    icon: 'https://dify.ai/favicon.svg',
    description: '开源 LLM 应用开发平台，可视化编排智能体与工作流，助你从原型快速走向生产。',
  },
  {
    key: 'https://ima.tencent.com/download',
    title: 'ima',
    icon: 'https://fe-static.ima.myqcloud.com/wupload/xy/ima_tool/q476TLJD.svg',
    description: '腾讯推出的 AI 知识管家，以知识库为基础，提供搜、读、写一站式智能体验。',
  },
]

/** 外部站点数量：自有页面不计入，供统计场景复用 */
export const EXTERNAL_AI_COUNT = AI_LIST.filter((item) => isExternal(item.key)).length
