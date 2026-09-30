export const useAppStore = defineStore('app', () => {
  /** 设备类型 */
  const device = ref<'desktop' | 'mobile'>('desktop')

  const isMobile = computed(() => device.value === 'mobile')
  const isDesktop = computed(() => device.value === 'desktop')

  return { device, isMobile, isDesktop }
})
