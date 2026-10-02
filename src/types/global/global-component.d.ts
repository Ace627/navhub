import { GlobalComponents } from 'vue'

export {}

declare module 'vue' {
  export interface GlobalComponents {
    SvgIcon: (typeof import('../components/SvgIcon/index.vue'))['default']
    ProTooltip: (typeof import('../components/ProTooltip/index.vue'))['default']
  }
}
