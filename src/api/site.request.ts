import type { CategoryItem, SiteItem, SiteQuery } from '@/types'
import { isExternal } from '@/utils'
import categoryTable from '@/database/categories.json'
import siteTable from '@/database/sites.json'

/** 模拟分类表：构建期由 Vite 读入 JSON，接后端后随各方法体一并替换为 HTTP 调用 */
const CATEGORY_TABLE = categoryTable as CategoryItem[]

/** 模拟站点表：构建期由 Vite 读入 JSON，接后端后随各方法体一并替换为 HTTP 调用 */
const SITE_TABLE = siteTable as SiteItem[]

/**
 * 站点数据接口封装：分类表与站点表的统一访问入口
 *
 * 全部方法为 Promise 形态以对齐真实接口契约；当前为模拟实现（同步读表异步返回），
 * 接入后端时仅需替换方法体为 HTTP 请求，消费方无需改动
 */
export class SiteRequest {
  /**
   * 查询分类列表
   *
   * @returns 全部分类条目
   */
  static async findCategoryList(): Promise<CategoryItem[]> {
    return [...CATEGORY_TABLE]
  }

  /**
   * 查询站点列表
   *
   * @param query 查询参数：按分类主键、是否外链过滤，缺省表示不过滤
   * @returns 命中的站点条目列表
   */
  static async findSiteList(query?: SiteQuery): Promise<SiteItem[]> {
    let list = [...SITE_TABLE]
    if (query?.categoryId) {
      list = list.filter((item) => item.categoryId === query.categoryId)
    }
    if (query?.isExternal !== undefined) {
      list = list.filter((item) => isExternal(item.key) === query.isExternal)
    }
    return list
  }

  /**
   * 根据主键查询站点详情
   *
   * @param id 站点主键 uuid
   * @returns 命中的站点条目，未命中时返回 undefined
   */
  static async findSiteDetail(id: string): Promise<SiteItem | undefined> {
    return SITE_TABLE.find((item) => item.id === id)
  }

  /**
   * 根据分类路由路径查询该分类下全部站点
   *
   * @param path 分类路由路径，如 tool
   * @returns 该分类下的站点条目列表，分类未命中时返回空数组
   */
  static async findByCategory(path: string): Promise<SiteItem[]> {
    const category = CATEGORY_TABLE.find((item) => item.path === path)
    if (!category) return []
    return SITE_TABLE.filter((item) => item.categoryId === category.id)
  }
}
