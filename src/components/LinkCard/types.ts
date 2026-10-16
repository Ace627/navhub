/**
 * 通用链接条目定义
 */
export interface LinkItem {
  /** 条目唯一标识：外部站点填完整 URL（点击新窗口打开）；自有页面填路由参数 */
  key: string
  /** 条目名称 */
  title: string
  /** 图标地址：本地资源路径或站点图标 URL */
  icon: string
  /** 描述文案：卡片上展示的简短说明 */
  description: string
  /** 标签列表：卡片右上角展示的分类标记，可选（历史记录等非站点条目可能无此字段） */
  tags?: string[]
  /** 是否固定在首页展示：'1' 固定，'0' 不固定，仅站点条目携带，默认 '0' */
  affix?: string
}

/**
 * 链接卡片组件属性
 */
export interface LinkCardProps {
  /** 链接条目数据 */
  item: LinkItem
  /** 是否渲染为纯外链（a 标签直链，点击新窗口打开）；默认 false，点击仅抛出事件由父级处理 */
  plainLink?: boolean
  /** 是否禁用卡片内置长按面板；默认 false，长按手势由父级网格级拖拽排序接管时（如首页收藏卡片）置 true */
  longPressDisabled?: boolean
  /** 卡片布局形态；默认 card 纵向卡片，row 为横向单行（用于最近浏览等历史列表场景） */
  layout?: 'card' | 'row'
  /** 网格跨列数；默认 1，需要通栏占满一行时置 4 */
  span?: 1 | 4
  /** 是否隐藏操作菜单中的收藏项；默认 false，无收藏语义的非站点条目（如最近浏览入口卡片）置 true */
  hideFavorite?: boolean
  /** 是否隐藏头部（图标与标题）；默认 false，主体内容可自释义的小组件卡片置 true */
  hideHeader?: boolean
  /** 是否剥离卡片底色/边框/内边距的整卡自绘模式；默认 false，主体自带完整版面（如暗色背景）的小组件置 true */
  bare?: boolean
}
