/** 分享文案中的站点来源地址 */
const SHARE_SOURCE_URL = 'https://ace627.github.io/navhub'

/**
 * 构建站点分享文案：站点名称、链接、描述与来源逐段拼接
 *
 * @param title 站点名称
 * @param link 站点链接
 * @param description 站点描述
 * @returns 按固定分隔线拼接的分享文案
 */
export function buildSiteShareText(title: string, link: string, description: string): string {
  return `${title}\n------\n${link}\n------\n${description}\n------\n来源：${SHARE_SOURCE_URL}`
}
