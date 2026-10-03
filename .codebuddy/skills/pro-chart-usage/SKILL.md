---
name: pro-chart-usage
description: 本项目图表开发与排查规范。**强制触发**：凡新增/修改使用图表的页面或组件（ProChart、ECharts options 编写）、排查图表展示不全/图例溢出/自适应异常等问题时，必须先调用此技能按规范执行，禁止跳过自检清单直接交付。
---

# 图表使用规范（ProChart / ECharts）

本项目图表统一使用全局组件 `ProChart`（`src/components/ProChart/index.vue`，已在 `global-component.ts` 注册，模板中直接使用，无需导入），底层为 ECharts 6.1.0 按需注册（`src/utils/libs/echarts.ts`）。本技能覆盖两类高频事故：**图表展示不全**（高度塌陷、被图例挤压、移动端截断）与**图例溢出**（类目过多撑破容器）。

## 一、硬性约定（违反即返工）

1. **容器必须显式设高**：ProChart 根元素无默认高度，不设高度时 ECharts 回退 100px 或量到 0 高，图直接「展示不全」。必须通过 `custom-class` 传入一个带明确高度的类：

   ```vue
   <ProChart custom-class="chart-box" :options="chartOption" />
   ```

   ```scss
   .chart-box { height: 320px; }
   html[data-device='mobile'] { .chart-box { height: 260px; } }
   ```

2. **移动端只改 CSS 高度**：视口判定统一走 `html[data-device='mobile']`（阈值 750px），禁止媒体查询；options 内**不得**写死像素级的半径/圆心/间距，一律用百分比，靠组件内置 ResizeObserver 自适应。

3. **canvas 不解析 CSS 变量**：options 中一切颜色（`textStyle.color`、`itemStyle`、调色板等）必须写具体色值，写 `var(--el-xxx)` 会静默失效。当前应用无暗色切换（ProChart 的 `isDark` 恒为 false），按浅色取值即可。

4. **只用已注册的模块**：按需注册清单见 `src/utils/libs/echarts.ts`（图表：Bar/Line/Pie/Radar/Gauge/Scatter/Candlestick/Boxplot/Map/EffectScatter/Lines；组件：Title/Tooltip/Legend/LegendScroll/Grid/Polar/Graphic/Geo）。使用未注册的图（如 Funnel、Sunburst、Sankey）**静默渲染空白不报错**——写之前先核对该文件，缺了先补注册再使用。

## 二、防「展示不全」要点

- **radius / center 用百分比**（如 `radius: ['48%', '72%']`、`center: ['50%', '40%']`），禁用像素值。
- **底部有图例时圆心上移**：`center[1]` 取 38%~42%，给图例留出净空，否则图例与图形重叠或把图形顶出容器。
- **有中心标题时先估对齐**：title 的 `top` 为标题块顶边，按「容器高 × top + 标题块高的一半 ≈ center[1] × 容器高」估算，两端（桌面/移动）都核对。
- **直角坐标系防截断**：类目名/数值文本较长时 `grid.containLabel: true`，坐标轴标签过多时 `axisLabel.interval` 或旋转，禁止靠缩小字号硬塞。
- **长类目名**：优先在数据侧提炼短名（超长名在移动端必然溢出），不要依赖 ECharts 截断。

## 三、防「图例溢出」要点

- 类目数可能超过一行时，图例必须用滚动式：

  ```ts
  legend: {
    type: 'scroll',   // 依赖 LegendScrollComponent，已注册
    bottom: 0,
    icon: 'circle',
    itemWidth: 8,
    itemHeight: 8,
    itemGap: 16,
    textStyle: { fontSize: 12, color: '#606266' },
  }
  ```

- 图例**只放底部或顶部**，不放右侧：右侧图例在窄屏会把图形挤没。
- 移动端验证时必须确认分页箭头出现（如 `1/3`）且翻页可用，图例不得溢出面板边界。

## 四、更新语义与数据格式

- ProChart 深度 watch `options` 并以**合并模式** `setOption(option, false)` 更新：适合数据刷新；**不适合**运行时切换图表类型或删除系列（旧配置会残留）——确需结构性变更时，改用 `v-if` 重建组件。
- 系列数据统一 `{ name, value }` 结构；饼图百分比展示用 tooltip formatter `'{b}：{c} 个（{d}%）'` 风格，不要手算。

## 五、交付前自检清单（逐条执行，任一不达标先修正）

1. 容器有显式高度，且 `html[data-device='mobile']` 下有更紧凑的高度；
2. options 内无 CSS 变量色值、无像素级 radius/center/grid 尺寸；
3. 所用图表与组件均在 `src/utils/libs/echarts.ts` 注册清单内；
4. 底部/顶部图例场景下圆心已让位，直角坐标系已 `containLabel`；
5. 双端实测通过（流程见下），移动端无重叠、无溢出、无空白。

## 六、验证流程（沿用项目既有约定）

1. 先探测 dev server（`curl -s -o /dev/null -w "%{http_code}" --max-time 3 http://localhost:6969`）：已在运行才验证，**不停用户的 dev、不私自启动**，未运行则提醒用户；
2. 注意应用 base 为 `/navhub/`，页面地址形如 `http://localhost:6969/navhub/<route>`；
3. `playwright-cli open <url> --browser=msedge`（本机缺 Chrome，必须 msedge）；
4. 桌面截图 → `resize 375 720` 模拟移动端 → 滚动到图表区域截图（内层容器滚动时用 `scrollIntoView`）；
5. 检查 `playwright-cli console` 无新增报错；
6. **验证后必须清理**：`playwright-cli close` 并删除截图文件与 `.playwright-cli` 目录。
