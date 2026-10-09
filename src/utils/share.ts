/**
 * 构建站点分享文案：站点名称、地址与描述逐段拼接
 *
 * @param title 站点名称
 * @param link 站点地址（外链为完整 URL，自有页面为站内路由地址）
 * @param description 站点描述
 * @returns 按固定分隔线拼接的分享文案
 */
export function buildSiteShareText(title: string, link: string, description: string): string {
  return `${title}\n------\n${link}\n------\n${description}`
}