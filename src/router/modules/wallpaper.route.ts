import type { RouteRecordRaw } from 'vue-router'

export const WALLPAPER_ROUTES: RouteRecordRaw[] = [
  {
    path: '/wallpaper',
    name: 'Wallpaper',
    component: () => import('@/views/wallpaper/index.vue'),
    meta: { title: '精美壁纸', icon: 'Wallpaper' },
  },
]
