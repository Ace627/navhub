import type { RouteRecordRaw } from 'vue-router'
import type { SiteItem } from '@/database/types'
import { AI_LIST } from '@/database/ai'
import { API_LIST } from '@/database/api'
import { FRONTEND_LIST } from '@/database/frontend'
import { MOVIE_LIST } from '@/database/movie'
import { SOFTWARE_LIST } from '@/database/software'
import { STUDY_LIST } from '@/database/study'
import { TOOL_LIST } from '@/database/tool'
import { WALLPAPER_LIST } from '@/database/wallpaper'

/** 分类注册条目定义 */
export interface CategoryEntry {
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
  /** 分类收录的站点数据列表 */
  data: SiteItem[]
}

/** 分类注册表：纯卡片收录型分类统一在此登记，新增分类只需追加一项并在 src/database 补一份对应数据文件 */
export const CATEGORY_REGISTRY: CategoryEntry[] = [
  { path: 'movie', name: 'Movie', title: '免费追剧', icon: 'Movie', mode: 'link', plainLink: true, data: MOVIE_LIST },
  { path: 'ai', name: 'AI', title: '人工智能', icon: 'ChatGPT', mode: 'link', data: AI_LIST },
  { path: 'frontend', name: 'Frontend', title: '前端专家', icon: 'Frontend', mode: 'link', data: FRONTEND_LIST },
  { path: 'software', name: 'Software', title: '好软推荐', icon: 'Software', mode: 'link', plainLink: true, data: SOFTWARE_LIST },
  { path: 'tool', name: 'Tool', title: '实用工具', icon: 'Tool', mode: 'detail', data: TOOL_LIST },
  { path: 'api', name: 'Api', title: '公益接口', icon: 'Api', mode: 'link', plainLink: true, data: API_LIST },
  { path: 'study', name: 'Study', title: '自我提升', icon: 'Study', mode: 'link', plainLink: true, data: STUDY_LIST },
  { path: 'wallpaper', name: 'Wallpaper', title: '精美壁纸', icon: 'Wallpaper', mode: 'link', plainLink: true, data: WALLPAPER_LIST },
]

/**
 * 由分类注册表生成布局子路由
 *
 * link 模式仅生成列表路由；detail 模式额外生成 `<path>/:key` 详情路由，指向通用详情页
 *
 * @returns 分类路由列表
 */
export function buildCategoryRoutes(): RouteRecordRaw[] {
  return CATEGORY_REGISTRY.flatMap((entry) => {
    const routes: RouteRecordRaw[] = [
      {
        path: entry.path,
        name: entry.name,
        component: () => import('@/views/category/index.vue'),
        meta: { title: entry.title, icon: entry.icon },
      },
    ]
    if (entry.mode === 'detail') {
      routes.push({
        path: `${entry.path}/:key`,
        name: `${entry.name}Detail`,
        component: () => import('@/views/category/detail.vue'),
        meta: {
          // 标题按路由参数实时解析为对应条目名称，未命中时兜底为通用详情标题
          title: (route) => entry.data.find((entryItem) => entryItem.key === route.params.key)?.title ?? '条目详情',
          hidden: true,
        },
      })
    }
    return routes
  })
}
