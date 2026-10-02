import type { App } from 'vue'
import SvgIcon from '@/components/SvgIcon/index.vue'
import ProTooltip from '@/components/ProTooltip/index.vue'

export function registerGlobalComponent(app: App<any>) {
  app.component('SvgIcon', SvgIcon)
  app.component('ProTooltip', ProTooltip)
}
