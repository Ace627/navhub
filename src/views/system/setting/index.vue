<template>
  <div class="app-content">
    <div class="setting-page flex flex-col gap-16px">
      <!-- 配置分组：items 驱动渲染，改动即生效，点保存才落盘 -->
      <section v-for="group in groups" :key="group.title" class="panel">
        <h3 class="panel-title">{{ group.title }}</h3>
        <div class="setting-list">
          <div v-for="item in group.items" :key="item.prop" class="setting-row">
            <span class="row-icon">
              <SvgIcon :name="item.icon" :size="16" />
            </span>
            <div class="row-body">
              <strong>{{ item.label }}</strong>
              <span>{{ item.desc }}</span>
            </div>
            <div class="row-ctrl">
              <!-- 主题走命令式切换，由 useTheme 播放圆形扩散动效，不参与通用绑定 -->
              <div v-if="item.type === 'theme'" class="theme-switch">
                <button v-for="option in THEME_OPTIONS" :key="option.value" type="button" class="theme-btn" :class="{ 'is-active': settingStore.theme === option.value }" @click="handleTheme(option.value, $event)">
                  <SvgIcon :name="option.icon" :size="14" />
                  <span>{{ option.label }}</span>
                </button>
              </div>
              <el-switch v-else-if="item.type === 'switch'" :model-value="settingStore[item.prop]" @update:model-value="handleUpdate(item.prop, $event)" />
              <el-radio-group v-else-if="item.type === 'radio'" :model-value="settingStore[item.prop]" size="small" @update:model-value="handleUpdate(item.prop, $event)">
                <el-radio-button v-for="option in item.options" :key="option.value" :value="option.value">
                  {{ option.label }}
                </el-radio-button>
              </el-radio-group>
              <el-select v-else-if="item.type === 'select'" :model-value="settingStore[item.prop]" size="small" class="row-select" @update:model-value="handleUpdate(item.prop, $event)">
                <el-option v-for="option in item.options" :key="option.value" :label="option.label" :value="option.value" />
              </el-select>
            </div>
          </div>
        </div>
      </section>

      <!-- 底部操作区：作用于全页的重置与保存 -->
      <div class="page-actions">
        <el-button plain @click="handleClearCache">
          <template #icon>
            <SvgIcon name="Clear" />
          </template>
          <span>清理缓存</span>
        </el-button>
        <el-button plain type="danger" @click="handleReset">
          <template #icon>
            <SvgIcon name="Refresh" />
          </template>
          <span>重置配置</span>
        </el-button>
        <el-button plain type="primary" @click="handleSave">
          <template #icon>
            <SvgIcon name="Save" />
          </template>
          <span>保存配置</span>
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: 'SystemSetting' })
import { cloneDeep } from 'lodash-es'
import type { SystemSetting } from '@/defaultSettings'
import { getSystemSetting, removeSystemSetting, setSystemSetting, StorageCache, TipModal } from '@/utils'

const settingStore = useSettingStore()
const { apply: applyTheme } = useTheme()

/** 进页时 localStorage 中的配置快照：本地无记录时为 null */
let savedSnapshot: SystemSetting | null = null

onMounted(() => {
  savedSnapshot = cloneDeep(getSystemSetting())
})

/** 主题选项：图标取自现有 svg 资源 */
const THEME_OPTIONS = [
  { label: '浅色', value: 'light' as const, icon: 'Sunny' },
  { label: '深色', value: 'dark' as const, icon: 'Moon' },
]

/** 组件尺寸选项 */
const SIZE_OPTIONS = [
  { label: '小号', value: 'small' },
  { label: '默认', value: 'default' },
  { label: '大号', value: 'large' },
]

/** 页面转场动效选项，取值与 AppMain 的 Transition name 一致 */
const TRANSITION_OPTIONS = [
  { label: '渐变过渡', value: 'fade-transform' },
  { label: '淡入淡出', value: 'el-fade-in' },
  { label: '线性淡入', value: 'el-fade-in-linear' },
  { label: '中心缩放', value: 'el-zoom-in-center' },
  { label: '顶部缩放', value: 'el-zoom-in-top' },
  { label: '底部缩放', value: 'el-zoom-in-bottom' },
]

/** 全局字体选项，value 即 styles/index.scss 顶部挂载的网络字体名，默认项与 defaultSettings.fontFamily 保持一致 */
const FONT_OPTIONS = [
  { label: '霞鹜文楷屏显', value: 'LXGW WenKai Screen' },
  { label: '江西拙楷', value: 'jiangxizhuokai' },
  { label: '平方公子体', value: 'PING FANG GONG ZI TI' },
  { label: '汇文明朝体', value: 'Huiwen-mincho' },
  { label: '千图笔锋手写体', value: 'qiantubifengshouxieti' },
]

interface SettingItem {
  /** 对应 SystemSetting 的字段名 */
  prop: keyof SystemSetting
  /** 左侧行图标，取自 svg 资源目录 */
  icon: string
  label: string
  /** 行内说明文案 */
  desc: string
  /** 控件类型，theme 为命令式切换的特例 */
  type: 'theme' | 'switch' | 'radio' | 'select'
  /** 下拉与单选的可选项 */
  options?: { label: string; value: string }[]
}

interface SettingGroup {
  title: string
  items: SettingItem[]
}

/** 分组配置项：字段均取自 defaultSettings，不新增额外配置 */
const groups: SettingGroup[] = [
  {
    title: '外观主题',
    items: [
      { prop: 'theme', type: 'theme', icon: 'Sunny', label: '主题模式', desc: '整站配色，点击后从按钮处圆形扩散' },
      { prop: 'size', type: 'radio', icon: 'Size', label: '组件尺寸', desc: '表单、按钮与输入框的全局尺寸', options: SIZE_OPTIONS },
      { prop: 'transition', type: 'select', icon: 'SwitchButton', label: '页面转场', desc: '路由切换时的过渡动画', options: TRANSITION_OPTIONS },
      { prop: 'fontFamily', type: 'select', icon: 'ConvertChinese', label: '界面字体', desc: '全局中文字体，切换后立即生效，远程字体首次加载需等网络', options: FONT_OPTIONS },
    ],
  },
  {
    title: '界面显示',
    items: [
      { prop: 'showLogo', type: 'switch', icon: 'About', label: '显示 Logo', desc: '侧边栏顶部的站点名称与图标' },
      { prop: 'showHitokoto', type: 'switch', icon: 'Poem', label: '一言栏', desc: '导航栏下方通栏展示的随机名句，点击可复制' },
      { prop: 'showDynamicTitle', type: 'switch', icon: 'Signature', label: '动态标题', desc: '浏览器标签页标题随路由变化' },
      { prop: 'uniqueOpened', type: 'switch', icon: 'Menu', label: '手风琴侧边栏', desc: '同一时刻只展开一组菜单' },
    ],
  },
]

/**
 * 写入单个配置项
 *
 * prop 为联合类型，v-model 直接绑定索引访问会有类型报错，故统一走 model-value + 事件回抛；
 * Reflect.set 触发的是 store 自身的响应式代理，改动即时在界面生效，但不落盘
 *
 * @param prop 配置字段名
 * @param value 控件回传的新值
 */
function handleUpdate(prop: keyof SystemSetting, value: unknown) {
  Reflect.set(settingStore, prop, value)
}

/**
 * 切换主题：从点击位置播放圆形扩散，并把 localStorage 写回进页快照
 *
 * useTheme.apply 内部会全量持久化当前 store，若不还原会把未点保存的其他改动一并落盘，
 * 与「点击保存才保存」的约定冲突，因此这里保存后立即回滚本地记录
 *
 * @param theme 目标主题
 * @param event 鼠标事件，用于确定扩散圆心
 */
function handleTheme(theme: 'light' | 'dark', event: MouseEvent) {
  if (theme === settingStore.theme) return
  applyTheme(theme, event)
  if (savedSnapshot) setSystemSetting(savedSnapshot)
  else removeSystemSetting()
}

/** 保存全部配置到 localStorage，并同步刷新快照 */
function handleSave() {
  settingStore.saveSetting()
  savedSnapshot = cloneDeep(getSystemSetting())
}

/** 重置全部配置：二次确认后清空本地缓存并刷新页面 */
async function handleReset() {
  const { confirm } = await TipModal.confirm('重置后将清除全部本地配置并刷新页面，是否继续？', {
    confirmButtonText: '确定重置',
    cancelButtonText: '取消',
  })
  if (!confirm) return
  settingStore.resetSetting()
}

/**
 * 清理本地缓存：二次确认后清空带前缀的 localStorage 与会话级 sessionStorage 并刷新页面
 *
 * StorageCache.clear 只删除本项目带 VITE_STORAGE_PREFIX 前缀的键，不会误清同源其它数据；
 * 刷新后各 store 重新从缓存读取，缺失的键回落到默认值，故清缓存与重置配置在同一场景下结果接近，
 * 区别是清理缓存同时会丢弃收藏夹等用户数据
 */
async function handleClearCache() {
  const { confirm } = await TipModal.confirm('将清空全部本地缓存（含系统配置、站点收藏等）并刷新页面，是否继续？')
  if (!confirm) return
  StorageCache.clear()
  sessionStorage.clear()
  window.location.reload()
}
</script>

<style lang="scss" scoped>
.setting-page {
  width: 100%;
  max-width: 680px;
  margin: 0 auto;
}

/* 底部操作区 */
.page-actions {
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 通用面板 */
.panel {
  padding: 16px 20px;
  background-color: var(--el-bg-color);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 8px;
}

.panel-title {
  position: relative;
  margin: 0 0 8px;
  padding-left: 10px;
  font-size: 15px;
  font-weight: 600;

  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
    width: 4px;
    height: 15px;
    border-radius: 2px;
    background-color: var(--el-color-primary);
  }
}

/* 配置行 */
.setting-list {
  display: flex;
  flex-direction: column;
}

.setting-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 8px;
  border-radius: 6px;
  transition: background-color var(--el-transition-duration-fast);

  &:hover {
    background-color: var(--el-fill-color-light);
  }

  .row-icon {
    display: grid;
    flex-shrink: 0;
    place-items: center;
    width: 32px;
    height: 32px;
    color: var(--el-color-primary);
    background-color: var(--el-color-primary-light-9);
    border-radius: 8px;
  }

  .row-body {
    display: flex;
    flex: 1;
    flex-direction: column;
    gap: 2px;
    min-width: 0;

    strong {
      font-size: 14px;
      font-weight: 500;
      color: var(--el-text-color-primary);
    }

    span {
      font-size: 12px;
      color: var(--el-text-color-secondary);
    }
  }

  .row-ctrl {
    display: flex;
    flex-shrink: 0;
    align-items: center;
  }

  & + .setting-row {
    border-top: 1px solid var(--el-border-color-extra-light);
  }
}

.row-select {
  width: 136px;
}

/* 主题分段按钮 */
.theme-switch {
  display: flex;
  gap: 4px;
  padding: 2px;
  background-color: var(--el-fill-color);
  border-radius: 6px;
}

.theme-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 5px 12px;
  font-size: 13px;
  color: var(--el-text-color-regular);
  background-color: transparent;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition:
    color var(--el-transition-duration-fast),
    background-color var(--el-transition-duration-fast);

  &:hover {
    color: var(--el-color-primary);
  }

  &.is-active {
    color: var(--el-color-primary);
    background-color: var(--el-bg-color);
    box-shadow: 0 1px 3px rgb(0 0 0 / 12%);
  }
}

html[data-device='mobile'] {
  .setting-page {
    max-width: 100%;
  }

  /* 窄屏仍保持图标 + 文案 + 控件单行，控件由 flex 自然贴右，不另起一行 */
  .setting-row {
    padding: 12px 4px;

    /* 窄屏隐藏行内说明文案，只保留标题 */
    .row-body span {
      display: none;
    }
  }

  .theme-btn {
    padding: 5px 8px;
  }

  .row-select {
    width: 116px;
  }

  /* 为右下角悬浮导航按钮让位，避免压住保存按钮 */
  .page-actions {
    padding-bottom: 92px;
  }
}
</style>
