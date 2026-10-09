---
name: site-icon-localizer
description: 站点图标本地化，把 sites.json 中的外链 icon 下载到 src/assets/images/icons 并回写为 @/assets/images/icons/文件名。凡新增或修改站点条目时 icon 填了外链、用户要求下载或替换外链图标、图标不显示或空白需排查时，必须先调用此技能，禁止手写 icon 字段或用占位图顶替。文件名固定取 title，扩展名按文件头魔数判定。
---

# 站点图标本地化

## 用途

把 `src/database/sites.json` 中所有 `icon` 为 http(s) 外链的条目，图标文件下载到 `src/assets/images/icons/`，并把 `icon` 字段改写为本地路径，格式固定为 `@/assets/images/icons/` + 图标文件名：

- 主干是站点 `title`（原样使用，含空格照留，如 `Naive UI.png`）
- 扩展名按文件头魔数判定，不信 URL 后缀

## 执行方式

运行内置脚本（零依赖，Node 18+）：

```bash
# 执行本地化（幂等：已有同名单图标文件直接复用，不覆盖用户手动补的图）
node <skill目录>/scripts/download-site-icons.mjs

# 只做自检，不改任何文件
node <skill目录>/scripts/download-site-icons.mjs --check
```

脚本行为：

1. 只处理 `icon` 为 http(s) 外链的条目，逐条下载并按 title 命名落盘；
2. 已存在同名图标文件时**直接复用并回写字段**，不重新下载、不覆盖（用户手动补的图标不会被冲掉）；
3. 下载双通道：先 `fetch`（3 次重试），全失败后用 `curl -k` 兜底（应对源站证书过期）；
4. 结束后自动打印自检结果。

## 自检清单（交付前必须达标）

`--check` 输出六项，其中「引用缺文件」「未引用文件」必须为 0：

| 项 | 要求 |
| --- | --- |
| 引用缺文件 | 必须 0，`icon` 指向的文件不存在即报错 |
| 未引用文件 | 必须 0，图标目录里不能有孤儿文件 |
| 外链 icon | 尽量 0；残留项要列出站点名与原因 |
| 空 icon | 允许存在（源站确实取不到），要列出清单交用户决定 |
| 空白图标 | 允许存在（源站 favicon 本身就是全透明空白图），要列出清单并说明属源数据问题 |

## 已知坑（必须遵守，避免重复踩）

1. **扩展名必须按文件头魔数判定**，不能信 URL 后缀：实测 161 个 `.ico` 地址里有大量实为 PNG/BMP，18 个 `.svg` 后缀的返回非 SVG。
2. **ICO 空白判定必须修正掩码解释**：部分 ico 的 BMP 帧尾部是 **32 位 alpha 通道**而非 1bpp 掩码，按 1bpp 掩码解释会把正常图标误判成全透明（Gitee、Ant Design Vue 曾被误判）。可靠做法：仅当帧长度恰好等于 `头 + stride*高 + maskStride*高` 时才按掩码处理，否则信任像素自带 alpha。脚本已按此实现。
3. **下载图标不要带 `Referer`**：部分站点（WPC 系，如 wallcoo）会对带 Referer 的请求返 403，带 UA 即可。
4. **源站 favicon 常见为全透明空白 ico**（实测 83 个，含 AcFun、爱奇艺、Lodash、部分蓝奏云聚合站）。这类本地化后仍显示空白，属源数据问题，线上外链时同样空白；要补图只能改用首页 `apple-touch-icon` 或第三方镜像，且需用户同意。
5. **首页 favicon 可能是内联 `data:image/svg+xml`**：此时没有独立文件，需解码 data URI 另存为 `.svg`（data URI 内常含单引号，提取正则要兼容双引号包裹的 href 内嵌单引号）。
6. **网络通道可用性**：`https://favicon.im/<host>` 可用（源站无 favicon 时返回首字文字占位图，**不可当作真实图标**）；Google `s2/favicons`、DuckDuckGo `icons.duckduckgo.com` 在本机超时不可用；`api.iowjn.cn` DNS 不通。
7. **不可达站点**：`greasyfork.org`、`wallroom.io`、`yikaocq.com` 等在当前网络下 80/443 全超时，属网络限制而非抓取代码问题，如实报告即可。

## 手动补图的处置规则

- 用户手动添加或替换的图标文件**一律保留并直接引用**，不重新下载、不覆盖、不校验来源；文件存在即复用（脚本已内置该行为）。
- 文件名与 `title` 不一致时（如 `高性价比人生指南.png` 对 title `高性价比人生`）：按现有文件名回填字段，并把命名不一致作为提示告知用户，由用户决定是否改名。
- 用户手动补的图即使内容偏淡、尺寸偏大（如浅灰单色图标 1080×1080），只要用户已提供就直接使用，仅作事实提示，不擅自替换。

## 失败兜底顺序（仅当脚本未取到真图时）

1. 重试一次（网络抖动常能恢复）；
2. 抓首页 HTML 解析 `link[rel~=icon]` 与 `link[rel~=apple-touch-icon]` 的真实地址后下载；
3. 仍失败才考虑 `https://favicon.im/<host>` 镜像，并**明确告知用户这是第三方镜像或占位图**；
4. 三步都失败则保留原外链不动，如实报告站点与失败原因交用户决定，禁止用占位图或臆造图标顶替。

## 与 site-info-parser 的衔接

新增站点先用 `site-info-parser` 产出 `icon` 外链，再执行本技能完成本地化；本技能不负责标题提炼与描述润色。
