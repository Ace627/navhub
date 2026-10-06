/**
 * 收录站点条目通用定义：src/database 下各分类数据文件共用同一结构
 */
export interface SiteItem {
  /** 条目唯一标识：外部站点填完整 URL（http/https 等协议开头，点击新窗口打开）；自有页面填路由参数或组件目录名 */
  key: string
  /** 条目名称 */
  title: string
  /** 图标地址：站点图标 URL 或本地资源路径（src/assets/images/icons/ 下按文件名匹配） */
  icon: string
  /** 描述文案：卡片上展示的简短说明，约 32 字 */
  description: string
}
