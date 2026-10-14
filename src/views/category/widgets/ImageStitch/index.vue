<template>
  <div class="app-content">
    <div class="tool-container">
      <!-- 空态：整卡大拖拽区，承担全部引导职责 -->
      <el-upload v-if="!imageItems.length" class="upload-empty" drag multiple accept="image/*" :auto-upload="false" :show-file-list="false" @change="handleFileChange">
        <div class="upload-body">
          <SvgIcon name="Upload" :size="32" class="upload-icon" />
          <div class="upload-text">拖拽图片到此处，或<span class="upload-browse">点击选择图片</span></div>
          <div class="upload-tip">支持多选<span class="paste-hint">与 Ctrl+V 粘贴截图</span> · 纯本地处理，不上传服务器</div>
        </div>
      </el-upload>

      <template v-else>
        <!-- 状态行：素材数量与预计输出尺寸 -->
        <div class="status-row">
          <span class="status-count">已添加 {{ imageItems.length }} 张图片</span>
          <span v-if="canExport" class="status-size">预计输出 {{ resultWidth }} × {{ resultHeight }}px</span>
        </div>

        <!-- 素材条：序号即拼接顺序，悬停浮现操作按钮，条尾追加图片 -->
        <div class="strip">
          <div v-for="(imageItem, index) in imageItems" :key="imageItem.id" class="strip-item">
            <img class="strip-image" :src="imageItem.url" :alt="imageItem.name" draggable="false" />
            <span class="strip-index">{{ index + 1 }}</span>
            <div class="strip-actions">
              <el-button size="small" circle :disabled="index === 0" @click="moveItem(index, -1)"><SvgIcon name="ArrowUp" :size="12" /></el-button>
              <el-button size="small" circle :disabled="index === imageItems.length - 1" @click="moveItem(index, 1)"><SvgIcon name="ArrowDown" :size="12" /></el-button>
              <el-button size="small" circle @click="removeItem(index)"><SvgIcon name="Close" :size="12" /></el-button>
            </div>
            <span class="strip-size">{{ imageItem.width }} × {{ imageItem.height }}</span>
          </div>
          <el-upload class="strip-add" accept="image/*" multiple :auto-upload="false" :show-file-list="false" @change="handleFileChange">
            <div class="strip-add-tile">
              <SvgIcon name="Plus" :size="18" />
              <span>添加图片</span>
            </div>
          </el-upload>
        </div>

        <!-- 参数区：方向 / 间距 / 对齐 / 格式 紧凑两列 -->
        <div class="params">
          <div class="param-item">
            <span class="param-label">拼接方向</span>
            <el-radio-group v-model="direction" size="small">
              <el-radio-button value="horizontal">横向</el-radio-button>
              <el-radio-button value="vertical">竖向</el-radio-button>
            </el-radio-group>
          </div>
          <div class="param-item">
            <span class="param-label">图片间距</span>
            <el-slider v-model="gap" class="param-slider" :min="0" :max="100" :step="2" />
            <span class="param-value">{{ gap }}px</span>
          </div>
          <div class="param-item">
            <span class="param-label">对齐方式</span>
            <el-radio-group v-model="alignment" size="small">
              <el-radio-button value="center">居中</el-radio-button>
              <el-radio-button value="start">{{ alignmentStartText }}</el-radio-button>
            </el-radio-group>
          </div>
          <div class="param-item">
            <span class="param-label">输出格式</span>
            <el-radio-group v-model="format" size="small">
              <el-radio-button value="png">PNG</el-radio-button>
              <el-radio-button value="jpeg">JPG</el-radio-button>
            </el-radio-group>
          </div>
          <div class="param-item">
            <span class="param-label">间隔背景</span>
            <el-color-picker v-model="bgColor" size="small" :predefine="predefineColors" />
            <el-tooltip :disabled="!!bgColor" content="透明区域在部分看图工具中会显示为黑色，仅 PNG 格式有效，如需不透明请选择具体颜色" placement="top">
              <span class="param-value param-color-value">{{ bgColor ?? '透明' }}</span>
            </el-tooltip>
          </div>
        </div>

        <!-- 预览面板：弹性占满剩余高度，结果 1:1 展示，滚动收敛在面板内部 -->
        <div class="preview-panel">
          <canvas ref="canvasRef" class="preview-canvas" :class="{ 'is-transparent': !bgColor, 'is-vertical': direction === 'vertical' }" />
        </div>

        <!-- 导出行：尺寸信息在左，操作在右 -->
        <div class="export-row">
          <span class="export-size">{{ canExport ? `${resultWidth} × ${resultHeight}px` : '—' }}</span>
          <div class="export-actions">
            <el-button :disabled="!imageItems.length" @click="handleClear"><SvgIcon name="Delete" :size="14" class="mr-4px" />清空</el-button>
            <el-button type="primary" :disabled="!canExport" :loading="exporting" @click="handleExport"> <SvgIcon v-if="!exporting" name="Download" :size="14" class="mr-4px" />下载拼接结果 </el-button>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: 'ToolImageStitch' })

/** 拼接方向 */
type StitchDirection = 'horizontal' | 'vertical'

/** 对齐方式：center 居中 / start 顶部（横向）或靠左（竖向） */
type StitchAlignment = 'center' | 'start'

/** 输出格式 */
type StitchFormat = 'png' | 'jpeg'

/** 单张待拼接图片条目 */
interface StitchImageItem {
  /** 条目唯一标识 */
  id: number
  /** 原始文件名 */
  name: string
  /** 预览地址（objectURL，移除时须手动释放） */
  url: string
  /** 已加载完成的位图，拼接时直接绘制 */
  image: HTMLImageElement
  /** 原始像素宽 */
  width: number
  /** 原始像素高 */
  height: number
}

/** 是否 WebKit 内核（Safari 与 iOS 上的全部浏览器）：画布存在远小于单边上限的总像素面积限制 */
const isWebKit = /Apple/.test(navigator.vendor)

/** 浏览器画布单边像素上限，超出后画布会静默失败，须提前拦截 */
const CANVAS_MAX_SIDE = 16384

/** 画布总像素上限：WebKit 系固定 4096×4096（iPhone 原图两三张即超），Chromium 系按单边上限平方兜底 */
const CANVAS_MAX_AREA = isWebKit ? 4096 * 4096 : CANVAS_MAX_SIDE * CANVAS_MAX_SIDE

/** 条目 id 自增种子 */
let idSeed = 0

const appStore = useAppStore()

/** 待拼接图片列表（按拼接顺序） */
const imageItems = ref<StitchImageItem[]>([])

/** 拼接方向 */
const direction = ref<StitchDirection>('horizontal')

/** 图片间距（像素） */
const gap = ref(16)

/** 对齐方式 */
const alignment = ref<StitchAlignment>('center')

/** 输出格式 */
const format = ref<StitchFormat>('png')

/** 间隔背景色：null 为透明（PNG 保留透明通道，JPG 兜底白色），默认黑底 */
const bgColor = ref<string | null>('#000000')

/** 背景色预设色板 */
const predefineColors = ['#ffffff', '#000000', '#f56c6c', '#e6a23c', '#67c23a', '#409eff']

/** 结果预览画布引用 */
const canvasRef = ref<HTMLCanvasElement>()

/** 是否正在导出 */
const exporting = ref(false)

/** 拼接结果尺寸（像素），不足两张时为 0 */
const resultWidth = ref(0)
const resultHeight = ref(0)

/** 是否满足导出条件：至少一张图且已有有效结果 */
const canExport = computed(() => imageItems.value.length >= 1 && resultWidth.value > 0)

/** 起始对齐文案：横向拼为顶对齐，竖向拼为左对齐 */
const alignmentStartText = computed(() => (direction.value === 'horizontal' ? '顶部' : '靠左'))

/** 重新绘制当前拼接结果（方向/间距/对齐/背景色/格式/列表任一变化时触发；格式影响 JPG 铺底，缺了会导出黑色间隔）
 *
 * 用 post 时序：首图加入时预览画布才随 v-else 分支挂载，pre 时序拿不到画布引用
 */
watch([imageItems, direction, gap, alignment, bgColor, format], renderResult, { deep: true, flush: 'post' })

onMounted(() => {
  if (appStore.isMobile) return
  document.addEventListener('paste', handlePaste)
  window.addEventListener('dragover', handleDragOver)
  window.addEventListener('drop', handleDrop)
})

onBeforeUnmount(() => {
  document.removeEventListener('paste', handlePaste)
  window.removeEventListener('dragover', handleDragOver)
  window.removeEventListener('drop', handleDrop)
  imageItems.value.forEach((imageItem) => URL.revokeObjectURL(imageItem.url))
})

/**
 * 粘贴事件回调：把剪贴板中的图片文件追加到列表尾部
 *
 * 剪贴板不含图片时不拦截，交由浏览器默认行为处理
 *
 * @param event 粘贴事件对象
 */
function handlePaste(event: ClipboardEvent) {
  const files = Array.from(event.clipboardData?.files ?? []).filter((file) => file.type.startsWith('image/'))
  if (!files.length) return
  event.preventDefault()
  files.forEach((file) => addFile(file))
}

/**
 * 拖拽悬停回调：阻止浏览器默认行为，使整页均可作为图片落放区
 *
 * @param event 拖拽事件对象
 */
function handleDragOver(event: DragEvent) {
  if (event.dataTransfer?.types.includes('Files')) event.preventDefault()
}

/**
 * 拖拽落放回调：把拖入页面的图片文件追加到列表尾部
 *
 * 落放进上传组件（空态拖拽区/追加瓦片）时由 el-upload 自行处理，此处跳过避免重复添加
 *
 * @param event 拖拽事件对象
 */
function handleDrop(event: DragEvent) {
  const target = event.target as HTMLElement | null
  if (target?.closest('.el-upload')) return
  const files = Array.from(event.dataTransfer?.files ?? []).filter((file) => file.type.startsWith('image/'))
  if (!files.length) return
  event.preventDefault()
  files.forEach((file) => addFile(file))
}

/**
 * 文件选择回调：把新选中的图片追加到列表尾部
 *
 * @param uploadFile el-upload 上传条目，取其中的原始 File 对象
 */
async function handleFileChange(uploadFile: { raw?: File }) {
  const file = uploadFile.raw
  if (file) await addFile(file)
}

/**
 * 加载图片文件为位图并追加到列表尾部，失败给出提示
 *
 * @param file 图片文件对象（来自上传选择、剪贴板粘贴或整页拖放）
 */
async function addFile(file: File) {
  if (!file.type.startsWith('image/')) return
  try {
    const image = await loadImage(file)
    imageItems.value.push({
      id: ++idSeed,
      name: file.name,
      url: image.src,
      image,
      width: image.naturalWidth,
      height: image.naturalHeight,
    })
  } catch {
    ElMessage.error(`图片「${file.name}」加载失败`)
  }
}

/**
 * 加载图片文件为可绘制的 Image 元素
 *
 * @param file 图片文件对象
 * @returns 加载完成的 Image（src 为 objectURL，释放时机由条目移除逻辑负责）
 */
function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('image load failed'))
    }
    image.src = url
  })
}

/**
 * 调整图片顺序：与相邻条目交换位置
 *
 * @param index 目标条目下标
 * @param offset 移动偏移（-1 前移 / 1 后移）
 */
function moveItem(index: number, offset: number) {
  const target = index + offset
  if (target < 0 || target >= imageItems.value.length) return
  const list = [...imageItems.value]
  ;[list[index], list[target]] = [list[target], list[index]]
  imageItems.value = list
}

/**
 * 移除指定条目并释放其预览地址
 *
 * @param index 目标条目下标
 */
function removeItem(index: number) {
  const [removed] = imageItems.value.splice(index, 1)
  if (removed) URL.revokeObjectURL(removed.url)
}

/**
 * 清空全部图片并释放预览地址
 */
function handleClear() {
  imageItems.value.forEach((imageItem) => URL.revokeObjectURL(imageItem.url))
  imageItems.value = []
}

/**
 * 按当前参数把全部图片绘制到预览画布，并记录结果尺寸
 *
 * 单张图也绘制（作为带背景色的导出预览）；
 * 横向拼接：总宽为各图宽之和加间距，总高取最大图高，按对齐方式决定纵向偏移；
 * 竖向拼接：对上述逻辑做行列互换
 */
function renderResult() {
  const canvas = canvasRef.value
  if (!canvas || !imageItems.value.length) {
    resultWidth.value = 0
    resultHeight.value = 0
    return
  }

  const items = imageItems.value
  const isHorizontal = direction.value === 'horizontal'
  const rawCrossSize = isHorizontal ? Math.max(...items.map((item) => item.height)) : Math.max(...items.map((item) => item.width))
  const rawMainSize = items.reduce((total, item) => total + (isHorizontal ? item.width : item.height), 0) + gap.value * (items.length - 1)
  const rawWidth = isHorizontal ? rawMainSize : rawCrossSize
  const rawHeight = isHorizontal ? rawCrossSize : rawMainSize

  /* 原图像素普遍远超屏幕，超出画布单边/总面积上限时整体等比缩小兜底，而非直接拒绝拼接 */
  const scale = Math.min(1, CANVAS_MAX_SIDE / Math.max(rawWidth, rawHeight), Math.sqrt(CANVAS_MAX_AREA / (rawWidth * rawHeight)))
  if (scale < 1) {
    ElMessage.warning({ message: `图片较大，已自动缩小到 ${Math.round(scale * 100)}% 以适配画布上限`, grouping: true })
  }

  const crossSize = Math.round(rawCrossSize * scale)
  const scaledGap = gap.value * scale
  const width = Math.round(rawWidth * scale)
  const height = Math.round(rawHeight * scale)

  canvas.width = width
  canvas.height = height
  const context = canvas.getContext('2d')
  if (!context) return
  // JPG 不支持透明通道，铺白色底避免透明区域导出后发黑
  // JPG 不支持透明通道，未选色时兜底白色避免透明区域发黑；PNG 选了背景色时同样铺底
  const fillColor = format.value === 'jpeg' ? (bgColor.value ?? '#ffffff') : bgColor.value
  if (fillColor) {
    context.fillStyle = fillColor
    context.fillRect(0, 0, width, height)
  }

  let mainOffset = 0
  for (const item of items) {
    const drawMainSize = (isHorizontal ? item.width : item.height) * scale
    const drawCrossSize = (isHorizontal ? item.height : item.width) * scale
    const crossOffset = alignment.value === 'center' ? Math.round((crossSize - drawCrossSize) / 2) : 0
    const x = isHorizontal ? mainOffset : crossOffset
    const y = isHorizontal ? crossOffset : mainOffset
    /* drawImage 参数是宽/高而非主轴/交叉轴，竖向拼时二者不可直接沿用 */
    const drawWidth = isHorizontal ? drawMainSize : drawCrossSize
    const drawHeight = isHorizontal ? drawCrossSize : drawMainSize
    context.drawImage(item.image, x, y, drawWidth, drawHeight)
    mainOffset += drawMainSize + scaledGap
  }

  resultWidth.value = width
  resultHeight.value = height
}

/**
 * 导出拼接结果：画布转为对应格式文件并触发浏览器下载
 */
async function handleExport() {
  const canvas = canvasRef.value
  if (!canvas || !canExport.value) return
  exporting.value = true
  try {
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, `image/${format.value}`, 0.92))
    if (!blob) {
      ElMessage.error('拼接结果导出失败，请重试')
      return
    }
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `拼接图片.${format.value === 'png' ? 'png' : 'jpg'}`
    link.click()
    URL.revokeObjectURL(url)
  } finally {
    exporting.value = false
  }
}
</script>

<style lang="scss" scoped>
.app-content {
  /* 卡片占满视口剩余高度，滚动收敛到预览面板，页面不出现滚动条 */
  display: flex;
  flex-direction: column;
  height: calc(100vh - var(--el-navbar-height) - var(--el-copyright-height) - 76px);
}

.tool-container {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  width: 720px;
  margin: 0 auto;
  padding: 20px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.55);
  backdrop-filter: blur(10px);
  border: 1px solid var(--el-border-color-lighter);
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.08);
  animation: rise-enter 0.6s cubic-bezier(0.22, 1, 0.36, 1) both;
  /* 极矮窗口兜底：分区最小高度之和超出时卡片内滚动，页面仍不出滚动条 */
  overflow: auto;
}

/* 深色模式：硬编码浅玻璃底改为深色融入，避免暗色页面里主卡发白发灰 */
html.dark {
  .tool-container {
    background: color-mix(in srgb, var(--el-bg-color) 55%, transparent);
  }
}

/* 空态拖拽区：纵向撑满整卡，承担整卡引导 */
.upload-empty {
  flex: 1;

  :deep(.el-upload),
  :deep(.el-upload-dragger) {
    width: 100%;
    height: 100%;
  }

  :deep(.el-upload-dragger) {
    padding: 0;
    background: transparent;
    border-color: var(--el-border-color-light);

    &:hover {
      border-color: var(--el-color-primary);
    }
  }
}

.upload-body {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  height: 100%;
  padding: 56px 16px;
}

.upload-icon {
  color: var(--el-color-primary);
}

.upload-text {
  font-size: 15px;
  color: var(--el-text-color-regular);
}

.upload-browse {
  color: var(--el-color-primary);
}

.upload-tip {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

/* 状态行：素材数量与预计输出，弱化展示 */
.status-row {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-bottom: 10px;
}

.status-count {
  font-size: 13px;
  color: var(--el-text-color-regular);
}

.status-size {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  font-variant-numeric: tabular-nums;
}

/* 素材条：横向滚动，序号角标 + 悬浮操作 + 尺寸脚注 */
.strip {
  display: flex;
  gap: 10px;
  align-items: stretch;
  overflow-x: auto;
  padding: 2px 2px 4px;
}

.strip-item {
  position: relative;
  flex-shrink: 0;
  width: 112px;
}

.strip-image {
  display: block;
  width: 112px;
  height: 76px;
  object-fit: cover;
  border-radius: 8px;
  background: var(--el-fill-color-light);
}

/* 拼接顺序角标 */
.strip-index {
  position: absolute;
  top: 4px;
  left: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 18px;
  height: 18px;
  padding: 0 4px;
  border-radius: 9px;
  font-size: 11px;
  color: #ffffff;
  background: var(--el-color-primary);
  font-variant-numeric: tabular-nums;
}

/* 操作悬浮层：桌面端悬停显现，移动端常显 */
.strip-actions {
  position: absolute;
  inset-inline: 0;
  bottom: 18px;
  display: flex;
  justify-content: center;
  gap: 2px;
  padding: 14px 4px 4px;
  border-radius: 0 0 8px 8px;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.45));
  opacity: 0;
  transition: opacity 0.2s;

  .el-button {
    margin: 0;
    border: none;
    color: var(--el-color-white);
    background: rgba(0, 0, 0, 0.55);

    &:hover {
      color: var(--el-color-white);
      background: rgba(0, 0, 0, 0.75);
    }

    &:disabled {
      opacity: 0.4;
      color: var(--el-color-white);
      background: rgba(0, 0, 0, 0.55);
    }
  }
}

.strip-item:hover .strip-actions,
.strip-item:focus-within .strip-actions {
  opacity: 1;
}

.strip-size {
  display: block;
  margin-top: 4px;
  overflow: hidden;
  font-size: 11px;
  color: var(--el-text-color-secondary);
  text-align: center;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-variant-numeric: tabular-nums;
}

/* 追加图片瓦片：与缩略图同高，虚线框弱化存在感 */
.strip-add {
  flex-shrink: 0;
  align-self: flex-start;

  :deep(.el-upload) {
    width: 112px;
  }
}

.strip-add-tile {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  /* 铺满上传容器，与缩略图同尺寸 */
  width: 100%;
  height: 76px;
  border-radius: 8px;
  border: 1px dashed var(--el-border-color);
  font-size: 12px;
  color: var(--el-text-color-secondary);
  cursor: pointer;
  transition:
    border-color 0.2s,
    color 0.2s;

  &:hover {
    border-color: var(--el-color-primary);
    color: var(--el-color-primary);
  }
}

/* 参数区：两列网格，移动端折单列 */
.params {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px 32px;
  margin-top: 12px;
  padding-top: 16px;
  border-top: 1px dashed var(--el-border-color-light);
}

.param-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.param-label {
  flex-shrink: 0;
  font-size: 13px;
  color: var(--el-text-color-secondary);
}

.param-slider {
  flex: 1;
}

.param-value {
  flex-shrink: 0;
  width: 40px;
  font-size: 12px;
  text-align: right;
  color: var(--el-text-color-secondary);
  font-variant-numeric: tabular-nums;
}

/* 预览面板上下的固定分区不参与压缩，剩余空间全部让给预览 */
.status-row,
.strip,
.params,
.export-row {
  flex-shrink: 0;
}

/* 预览面板：弹性占满剩余高度，结果按原始像素 1:1 展示，滚动收敛在面板内部 */
.preview-panel {
  display: flex;
  flex: 1 1 0;
  min-height: 180px;
  margin-top: 14px;
  padding: 12px;
  border-radius: 12px;
  background: var(--el-fill-color-light);
  overflow: auto;
}

.preview-canvas {
  /* flex 容器内 auto 外边距：内容不超面板时居中，超出时归零不阻碍滚动 */
  margin: auto;
  border-radius: 6px;
}

/* 横向拼接：高度铺满面板，宽度自适应，超宽横向滚动 */
.preview-canvas:not(.is-vertical) {
  height: 100%;
  width: auto;
}

/* 竖向拼接：宽度铺满面板，高度自适应，超高纵向滚动 */
.preview-canvas.is-vertical {
  width: 100%;
  height: auto;
}

/* 透明背景时以棋盘格衬托（选了背景色则画布自身已有底色，无需棋盘格） */
.preview-canvas.is-transparent {
  background-image:
    linear-gradient(45deg, var(--el-fill-color) 25%, transparent 25%, transparent 75%, var(--el-fill-color) 75%),
    linear-gradient(45deg, var(--el-fill-color) 25%, transparent 25%, transparent 75%, var(--el-fill-color) 75%);
  background-position:
    0 0,
    8px 8px;
  background-size: 16px 16px;
}

/* 导出行：尺寸信息与操作两端对齐 */
.export-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-top: 14px;
}

.export-size {
  min-width: 0;
  overflow: hidden;
  font-size: 12px;
  color: var(--el-text-color-secondary);
  text-overflow: ellipsis;
  white-space: nowrap;
  font-variant-numeric: tabular-nums;
}

.export-actions {
  display: flex;
  flex-shrink: 0;

  .el-button + .el-button {
    margin-left: 8px;
  }
}

@keyframes rise-enter {
  from {
    opacity: 0;
    transform: translateY(24px) scale(0.97);
  }
  to {
    opacity: 1;
    transform: none;
  }
}

/* 用户偏好减少动效时停用入场动画 */
@media (prefers-reduced-motion: reduce) {
  .tool-container {
    animation: none;
  }
  .strip-actions {
    transition: none;
  }
}

/* 移动端：占满宽度、参数单列、操作按钮常显；恢复自然文档流，页面正常滚动 */
html[data-device='mobile'] {
  .app-content {
    height: auto;
    padding: 8px;
  }

  .tool-container {
    flex: none;
    width: 100%;
    padding: 12px;
    overflow: visible;
  }

  .upload-empty {
    flex: none;

    :deep(.el-upload),
    :deep(.el-upload-dragger) {
      height: auto;
    }
  }

  .upload-body {
    height: auto;
    justify-content: flex-start;
    padding: 32px 12px;
  }

  .paste-hint {
    display: none;
  }

  .strip-item,
  .strip-add :deep(.el-upload) {
    width: 96px;
  }

  .strip-image {
    width: 96px;
    height: 64px;
  }

  .strip-actions {
    bottom: 16px;
    opacity: 1;
  }

  .strip-add-tile {
    height: 64px;
  }

  .params {
    grid-template-columns: 1fr;
    gap: 10px;
  }

  .preview-panel {
    flex: none;
    height: 280px;
  }

  .export-row {
    flex-direction: column-reverse;
    align-items: stretch;
  }

  .export-size {
    text-align: center;
  }

  .export-actions {
    .el-button {
      flex: 1;
      margin-left: 0;
    }

    .el-button + .el-button {
      margin-left: 8px;
    }
  }
}
</style>
