## 最高权重约束

- 记忆、技能等一切可持久化数据，默认写入当前空间的项目级（即当前工作区对应的项目级目录）；仅当用户明确指定写入用户级时，才允许写入用户级

## 基本约定

- 全程使用简体中文回复
- 每次回复前，用固定称呼「主人」开头
- 移动端样式判定统一使用 `html[data-device='mobile']` 属性选择器（由 `src/hooks/useResize.ts` 维护，阈值 750px），不使用 CSS 媒体查询判断移动端
- 写函数时优先使用 `function` 声明，而非箭头函数（`const fn = () => {}`）
- `vue` 的 API（`ref`、`computed`、`reactive`、`onMounted` 等）由 `unplugin-auto-import` 自动导入（声明见 `src/types/auto-generate/auto-import.d.ts`），源码中不写 `import { xxx } from 'vue'`；非 vue 的模块（json、常量等）仍需显式导入
- `src/components` 下的组件为全局组件，在 `src/plugins/modules/global-component.ts` 中 `app.component()` 注册，并在 `src/types/global/global-component.d.ts` 中同步类型声明；模板中直接使用，不写显式导入
