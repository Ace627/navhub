## 最高权重约束

- 记忆、技能等一切可持久化数据，默认写入当前空间的项目级（即当前工作区对应的项目级目录）；仅当用户明确指定写入用户级时，才允许写入用户级

## 基本约定

- 全程使用简体中文回复
- 每次回复前，用固定称呼「主人」开头
- 移动端样式判定统一使用 `html[data-device='mobile']` 属性选择器（由 `src/hooks/useResize.ts` 维护，阈值 750px），不使用 CSS 媒体查询判断移动端
- 写函数时优先使用 `function` 声明，而非箭头函数（`const fn = () => {}`）
- 写样式时颜色、字号、间距等优先使用 Element Plus 的 CSS 变量（如 `var(--el-text-color-primary)`、`var(--el-color-primary)`、`var(--el-border-color)`），不硬编码色值；仅当设计稿颜色无对应 el 变量时才写具体值
- `vue` 的 API（`ref`、`computed`、`reactive`、`onMounted` 等）由 `unplugin-auto-import` 自动导入（声明见 `src/types/auto-generate/auto-import.d.ts`），源码中不写 `import { xxx } from 'vue'`；非 vue 的模块（json、常量等）仍需显式导入
- `src/components` 下的组件为全局组件，在 `src/plugins/modules/global-component.ts` 中 `app.component()` 注册，并在 `src/types/global/global-component.d.ts` 中同步类型声明；模板中直接使用，不写显式导入
- 图标只允许使用 `SvgIcon` 组件；若所需图标不存在，提醒开发者先添加对应 SVG 资源，禁止自行用其他方式（图标库、内联 SVG、图片等）实现
- 需要类型判断、链接校验等通用逻辑时，必须先查 `src/utils` 是否已有现成方法（如 `validate.ts` 的 `isExternal`、`isString`），禁止自写正则或重复实现；从 `src/utils` 导入一律走导出桶 `src/utils/index.ts`（`import { xxx } from '@/utils'`），不写 `@/utils/xxx` 深路径
