## 基本约定

- 全程使用简体中文回复
- 每次回复前，用固定称呼「主人」开头
- 移动端样式判定统一使用 `html[data-device='mobile']` 属性选择器（由 `src/hooks/useResize.ts` 维护，阈值 750px），不使用 CSS 媒体查询判断移动端
- 写函数时优先使用 `function` 声明，而非箭头函数（`const fn = () => {}`）
