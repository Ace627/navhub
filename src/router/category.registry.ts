import type { RouteRecordRaw } from 'vue-router'
import type { CategoryItem, SiteItem } from '@/types'
import { SiteRequest } from '@/api/site.request'

/** 分类注册条目定义：分类表条目附加该分类下的站点数据列表 */
export type CategoryEntry = CategoryItem & {
  /** 分类收录的站点数据列表 */
  data: SiteItem[]
}

/** 分类注册表：启动引导阶段由分类表与站点表装配，业务组件经 getCategoryRegistry() 读取 */
let categoryRegistry: CategoryEntry[] = []

/**
 * 获取分类注册表
 *
 * 须在引导阶段 initCategoryRegistry 执行完成后调用，否则返回空数组
 *
 * @returns 分类注册表条目列表
 */
export function getCategoryRegistry(): CategoryEntry[] {
  return categoryRegistry
}

/**
 * 初始化分类注册表：从数据接口拉取分类与站点，按外键关联装配
 *
 * 由 setupRouter 在路由创建前调用；接入后端后本方法与接口层实现同步切换，调用方不变
 */
export async function initCategoryRegistry(): Promise<void> {
  const [categories, sites] = await Promise.all([SiteRequest.findCategoryList(), SiteRequest.findSiteList()])
  categoryRegistry = categories.map((category) => ({
    ...category,
    data: sites.filter((site) => site.categoryId === category.id),
  }))
}

/**
 * 由分类注册表生成布局子路由
 *
 * link 模式仅生成列表路由；detail 模式额外生成 `<path>/:key` 详情路由，指向通用详情页
 *
 * @returns 分类路由列表
 */
export function buildCategoryRoutes(): RouteRecordRaw[] {
  return categoryRegistry.flatMap((entry) => {
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
