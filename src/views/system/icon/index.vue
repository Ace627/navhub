<template>
  <div class="app-content">
    <el-form inline>
      <el-form-item label="图标名称">
        <el-input placeholder="请输入图标名称" v-model.trim="name" clearable></el-input>
      </el-form-item>
      <el-form-item>
        <el-switch v-model="mode" active-text="单击下载" inactive-text="单击复制" :active-value="2" :inactive-value="1" />
      </el-form-item>
    </el-form>
    <div class="icon-list grid mx-auto">
      <div class="icon-item flex-center flex-col" v-for="item in list" :key="item" @click="handleClickIcon(item)">
        <SvgIcon :name="item" size="1.64em" />
        <span class="label my-8px">{{ item }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: 'SystemIcon' })
import { copyText } from '@/utils'

/** 全部图标名称列表 */
const iconNameList = ref<string[]>([])
/** 筛选的图标名称关键字 */
const name = ref<string>('')
/** 点击图标触发的操作：1 单击复制 2 单击下载 */
const mode = ref<number>(1)

/** 按关键字实时过滤后的图标列表 */
const list = computed(() => (name.value ? iconNameList.value.filter((item) => item.includes(name.value)) : iconNameList.value))

/** 以原始文本方式收集 svg-icons 目录下的全部 SVG 图标文件 */
const svgModules = import.meta.glob('@/assets/svg-icons/*.svg', { query: '?raw', import: 'default' })

/**
 * 加载图标名称列表：从 SVG 模块路径中提取去扩展名的文件名
 */
function getList() {
  const svgPathList: string[] = Object.keys(svgModules)
  iconNameList.value = svgPathList.map((svgPath) => svgPath.match(/\/([^/]+)\.\w+$/)?.[1] || svgPath)
}

/**
 * 单击图标：按当前模式复制组件用法或下载 SVG 文件
 *
 * @param iconName 图标名称
 */
function handleClickIcon(iconName: string) {
  if (mode.value === 1) {
    copyText(`<SvgIcon name='${iconName}' />`)
  } else {
    handleDownload(iconName)
  }
}

/**
 * 下载指定图标的 SVG 源文件
 *
 * @param iconName 图标名称
 */
async function handleDownload(iconName: string) {
  const svgContent = await svgModules[`/src/assets/svg-icons/${iconName}.svg`]()
  const blob = new Blob([svgContent], { type: 'image/svg+xml' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${iconName}.svg`
  link.click()
  URL.revokeObjectURL(url)
}

getList()
</script>

<style lang="scss" scoped>
.el-input {
  --el-input-width: 220px;
}

.icon-list {
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  border-left: 1px solid var(--el-border-color);
  border-top: 1px solid var(--el-border-color);

  .icon-item {
    position: relative;
    cursor: pointer;
    padding: 8px 0;
    border-right: 1px solid var(--el-border-color);
    border-bottom: 1px solid var(--el-border-color);
    background-color: var(--el-bg-color);

    .label {
      font-size: 12px;
    }
  }

  .icon-item:hover {
    color: var(--el-color-primary);
  }
}
</style>
