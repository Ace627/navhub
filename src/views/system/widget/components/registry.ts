import type { Component } from 'vue'
import type { LinkItem } from '@/components/LinkCard/types'
import HitokotoWidget from './Hitokoto/index.vue'
import CalendarWidget from './Calendar/index.vue'
import OffWorkWidget from './OffWork/index.vue'
import NextHolidayWidget from './NextHoliday/index.vue'
import PaydayWidget from './Payday/index.vue'

/** 系统小组件定义：非站点条目，key 使用 system: 前缀命名空间与站点区分 */
export interface SystemWidget {
  /** 唯一标识 */
  key: string
  /** 卡片图标（SvgIcon 名称） */
  icon: string
  /** 卡片展示条目（标题与描述；图标由 SvgIcon 渲染，不占用站点图标资源） */
  item: LinkItem
  /** 卡片主体内容组件 */
  component: Component
  /** 是否隐藏卡片头部（图标与标题）；默认 false，主体内容可自释义的小组件置 true */
  hideHeader?: boolean
  /** 是否整卡自绘模式（剥离卡片底色/边框/内边距）；默认 false，主体自带完整版面的小组件置 true */
  bare?: boolean
}

/** 系统小组件注册表：数组顺序即系统组件管理页的展示顺序，首页展示与否由收藏决定 */
export const SYSTEM_WIDGETS: SystemWidget[] = [
  {
    key: 'system:hitokoto',
    icon: 'Poem',
    item: { key: 'system:hitokoto', title: '一言', icon: '', description: '随机名句，点击卡片即可复制' },
    component: HitokotoWidget,
    hideHeader: true,
  },
  {
    key: 'system:calendar',
    icon: 'Calendar',
    item: { key: 'system:calendar', title: '日历', icon: '', description: '公历农历信息与整月视图' },
    component: CalendarWidget,
    hideHeader: true,
  },
  {
    key: 'system:offwork',
    icon: 'Schedule',
    item: { key: 'system:offwork', title: '下班倒计时', icon: '', description: '距下班实时倒计时，支持自定义下班时间' },
    component: OffWorkWidget,
    hideHeader: true,
  },
  {
    key: 'system:nextholiday',
    icon: 'Sunny',
    item: { key: 'system:nextholiday', title: '下一个节假日', icon: '', description: '距离下一个法定节假日的天数' },
    component: NextHolidayWidget,
    hideHeader: true,
  },
  {
    key: 'system:payday',
    icon: 'Star',
    item: { key: 'system:payday', title: '发薪日', icon: '', description: '距发薪日的倒数天数，支持自定义发薪日' },
    component: PaydayWidget,
    hideHeader: true,
  },
]

/** 以 key 为键的小组件索引：收藏集合混排渲染时快速判别系统组件 */
export const SYSTEM_WIDGET_MAP: Map<string, SystemWidget> = new Map(SYSTEM_WIDGETS.map((widget) => [widget.key, widget]))
