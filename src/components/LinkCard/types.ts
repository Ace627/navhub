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
}

/**
 * 链接卡片组件属性
 */
export interface LinkCardProps {
  /** 链接条目数据 */
  item: LinkItem
  /** 是否渲染为纯外链（a 标签直链，点击新窗口打开）；默认 false，点击仅抛出事件由父级处理 */
  plainLink?: boolean
  /** 是否跳过最近浏览记录写入；默认 false，入口类卡片（非站点条目）置 true 避免写入无效记录 */
  skipRecord?: boolean
  /** 是否支持在展示列表中调整顺序；默认 false，置 true 时操作行与长按面板展示前移/后移（仅收藏卡片可调整） */
  reorderable?: boolean
}
