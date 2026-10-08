/**
 * 站点数据模块类型定义：分类表与站点表实体及查询参数
 */

/** 分类实体：categories.json 单行，站点表通过 categoryId 外键关联本表 */
export interface CategoryItem {
  /** 分类主键 uuid */
  id: string
  /** 路由路径：布局子路由层级，不含前导斜杠 */
  path: string
  /** 路由名称：同时作为通用列表页反查注册表的依据 */
  name: string
  /** 侧边栏展示标题 */
  title: string
  /** SvgIcon 图标名 */
  icon: string
  /** 点击行为模式：link 为全部条目新窗口打开；detail 为外链开新窗、自有条目跳转详情路由（自有条目组件放 src/views/category/widgets/ 下） */
  mode: 'link' | 'detail'
  /** 是否以纯外链（a 标签直链）模式渲染卡片 */
  plainLink?: boolean
}

/** 站点实体：sites.json 单行 */
export interface SiteItem {
  /** 站点主键 uuid */
  id: string
  /** 所属分类外键，关联 CategoryItem.id */
  categoryId: string
  /** 条目唯一标识：外部站点填完整 URL（http/https 等协议开头，点击新窗口打开）；自有页面填路由参数或组件目录名 */
  key: string
  /** 条目名称 */
  title: string
  /** 图标地址：站点图标 URL 或本地资源路径（src/assets/images/icons/ 下按文件名匹配） */
  icon: string
  /** 描述文案：卡片上展示的简短说明，约 32 字 */
  description: string
}

/** 站点列表查询参数：字段均可选，缺省表示不过滤 */
export interface SiteQuery {
  /** 按所属分类主键过滤 */
  categoryId?: string
  /** 按是否外部链接过滤 */
  isExternal?: boolean
}
