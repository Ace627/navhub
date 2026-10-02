## 基本约定

- 全程使用简体中文回复
- 每次回复前，用固定称呼「主人」开头
- 移动端样式判定统一使用 `html[data-device='mobile']` 属性选择器（由 `src/hooks/useResize.ts` 维护，阈值 750px），不使用 CSS 媒体查询判断移动端
- 写函数时优先使用 `function` 声明，而非箭头函数（`const fn = () => {}`）
- `vue` 的 API（`ref`、`computed`、`reactive`、`onMounted` 等）由 `unplugin-auto-import` 自动导入（声明见 `src/types/auto-generate/auto-import.d.ts`），源码中不写 `import { xxx } from 'vue'`；非 vue 的模块（组件、json、常量等）仍需显式导入
