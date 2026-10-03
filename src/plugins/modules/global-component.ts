import type { App } from 'vue'
import SvgIcon from '@/components/SvgIcon/index.vue'
import ProChart from '@/components/ProChart/index.vue'
import ProTooltip from '@/components/ProTooltip/index.vue'

export function registerGlobalComponent(app: App<any>) {
  app.component('SvgIcon', SvgIcon)
  app.component('ProChart', ProChart)
  app.component('ProTooltip', ProTooltip)
}
