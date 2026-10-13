<template>
  <div class="app-content mobile-profile">
    <div class="profile-cells">
      <div v-for="cell in cells" :key="cell.title" class="profile-cell" @click="handleCellClick(cell)">
        <SvgIcon :name="cell.icon" :size="18" class="cell-icon" />
        <div class="cell-body">
          <span class="cell-title">{{ cell.title }}</span>
          <span v-if="cell.desc" class="cell-desc">{{ cell.desc }}</span>
        </div>
        <SvgIcon name="ArrowRight" :size="14" class="cell-arrow" />
      </div>
    </div>

    <!-- 启动页选择对话框：确定后写入设置并持久化 -->
    <el-dialog v-model="startupDialogVisible" title="启动页" width="320" align-center :show-close="false" :lock-scroll="false">
      <el-radio-group v-model="draftStartupPage" class="dialog-options">
        <el-radio v-for="option in STARTUP_OPTIONS" :key="option.value" :value="option.value">
          <SvgIcon :name="option.icon" :size="16" />
          {{ option.label }}
        </el-radio>
      </el-radio-group>
      <template #footer>
        <el-button @click="startupDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmStartupPage">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: RouterConstant.MOBILE_PROFILE_NAME })
import { RouterConstant } from '@/router/router.constant'
import type { SystemSetting } from '@/defaultSettings'
import { useSettingStore } from '@/store/modules/setting'

/** 个人中心入口定义 */
interface ProfileCell {
  /** 入口文案 */
  title: string
  /** 图标名 */
  icon: string
  /** 跳转地址（对话框入口无跳转） */
  path?: string
  /** 副标题描述（可选） */
  desc?: string
  /** 点击行为是否为打开对话框（默认路由跳转） */
  dialog?: boolean
}

/** 启动页选项：与底部标签页一一对应 */
const STARTUP_OPTIONS = [
  { value: 'home', label: '主页', icon: 'Home' },
  { value: 'categories', label: '分类', icon: 'Menu' },
  { value: 'profile', label: '我的', icon: 'User' },
] as const

const router = useRouter()
const settingStore = useSettingStore()

/** 启动页选择对话框可见性 */
const startupDialogVisible = ref(false)

/** 对话框内的暂选启动页：打开时同步当前配置，确定后才落盘 */
const draftStartupPage = ref<SystemSetting['startupPage']>(settingStore.startupPage)

/** 当前启动页的展示名，用于单元格副标题 */
const startupLabel = computed(() => STARTUP_OPTIONS.find((option) => option.value === settingStore.startupPage)?.label ?? '主页')

/** 入口列表：复用既有系统页面，移动端以列表形式聚合；启动页为配置项不走路由跳转 */
const cells = computed<ProfileCell[]>(() => [
  { title: '系统设置', icon: 'Setting', path: '/system/setting' },
  { title: '图标管理', icon: 'Image', path: '/system/icon' },
  { title: '关于我们', icon: 'About', path: '/system/about' },
  { title: '启动页', icon: 'Schedule', desc: `启动默认展示：${startupLabel.value}`, dialog: true },
])

/** 对话框打开时把暂选值重置为当前生效配置，取消不残留改动 */
watch(startupDialogVisible, (visible) => {
  if (visible) draftStartupPage.value = settingStore.startupPage
})

/**
 * 点击入口：对话框入口弹出选择面板，其余跳转对应系统页面
 *
 * @param cell 入口定义
 */
function handleCellClick(cell: ProfileCell) {
  if (cell.dialog) {
    startupDialogVisible.value = true
    return
  }
  router.push(cell.path!)
}

/**
 * 确认启动页：写入设置并持久化到本地，随后关闭对话框
 */
function confirmStartupPage() {
  settingStore.startupPage = draftStartupPage.value
  settingStore.saveSetting()
  startupDialogVisible.value = false
}
</script>

<style lang="scss" scoped>
.profile-cells {
  overflow: hidden;
  background-color: var(--el-bg-color);
  border: 1px solid var(--el-border-color-light);
  border-radius: 12px;
}

.profile-cell {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;

  + .profile-cell {
    border-top: 1px solid var(--el-border-color-lighter);
  }

  &:active {
    background-color: var(--el-fill-color-light);
  }
}

.cell-icon {
  flex-shrink: 0;
  color: var(--el-color-primary);
}

.cell-body {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.cell-title {
  font-size: 15px;
  color: var(--el-text-color-primary);
}

.cell-desc {
  overflow: hidden;
  font-size: 12px;
  color: var(--el-text-color-secondary);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.cell-arrow {
  flex-shrink: 0;
  margin-left: auto;
  color: var(--el-text-color-placeholder);
}
</style>
