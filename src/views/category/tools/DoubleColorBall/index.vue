<template>
  <div class="app-content">
    <div class="tool-container">
      <div class="tip-container flex-center flex-col">
        <template v-if="appStore.isDesktop">
          <el-text type="success">彩票是概率游戏，中奖是随机事件，不是投入越多、中奖概率就越高</el-text>
        </template>
        <template v-else>
          <el-text type="success">彩票是概率游戏，中奖是随机事件</el-text>
          <el-text type="success">不是投入越多、中奖概率就越高</el-text>
        </template>
        <el-text type="danger">理性购彩，量力而行</el-text>
      </div>

      <div class="balls-container">
        <div v-for="(group, gIndex) in groups" :key="gIndex" class="group">
          <div class="ball-group">
            <!-- 前区球 -->
            <div v-for="(frontCount, frontIndex) in group.frontBalls" :key="'red-' + gIndex + '-' + frontIndex" class="ball flex-center red-ball">
              {{ frontCount === -1 ? '' : padZero(frontCount) }}
            </div>
            <!-- 后区球 -->
            <div class="ball flex-center blue-ball" v-for="(endCount, endIndex) in group.endBalls" :key="endIndex">
              {{ endCount === -1 ? '' : padZero(endCount) }}
            </div>
          </div>
        </div>
      </div>

      <div class="my-16px flex-grow-1 flex justify-center items-end">
        <el-radio-group v-model="lotteryType" class="flex-nowrap flex-shrink-0" :disabled="loading" @change="lotteryTypeChange">
          <el-radio-button label="双色球" value="doubleColorBall" />
          <el-radio-button label="大乐透" value="superLotto" />
        </el-radio-group>
        <el-select v-model="groupCount" placeholder="选择生成组数" class="mx-16px flex-grow-1" @change="groupChange" :disabled="loading">
          <el-option v-for="n in 5" :key="n" :label="`${n} 组`" :value="n"></el-option>
        </el-select>
        <el-button type="primary" @click="startGenerate" class="w-160px" :loading> 生成号码 </el-button>
      </div>

      <div class="flex-center">
        <el-text type="danger">仅供娱乐，切勿当真；如有雷同，实属巧合。 </el-text>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: 'ToolDoubleColorBall' })
import { random } from 'lodash-es'

const appStore = useAppStore()

const groupCount = ref(5)
const groups = ref<{ frontBalls: number[]; endBalls: number[] }[]>([])
const loading = ref<boolean>(false)
const lotteryType = ref<'superLotto' | 'doubleColorBall'>('doubleColorBall')
const frontMaxCount = computed(() => (lotteryType.value === 'doubleColorBall' ? 33 : 35)) // 前区号码最大值
const endMaxCount = computed(() => (lotteryType.value === 'doubleColorBall' ? 16 : 12))
const frontBallCount = computed(() => (lotteryType.value === 'doubleColorBall' ? 6 : 5))
const endBallCount = computed(() => (lotteryType.value === 'doubleColorBall' ? 1 : 2))

/**
 * 将数字转换为两位数的字符串，不足两位前面补零
 * @param {number} num - 需要转换的数字
 * @returns {string} - 转换后的两位数字符串
 */
function padZero(num: number) {
  return num.toString().padStart(2, '0')
}

/**
 * 处理彩票类型变化的函数，初始化组并开始生成
 */
function lotteryTypeChange() {
  initGroups()
  startGenerate()
}

/**
 * 处理组变化的函数，初始化组并开始生成
 */
function groupChange() {
  initGroups()
  startGenerate()
}

/**
 * 初始化组数据
 *  - 该函数会清空 `groups` 数组，并根据 `groupCount` 的值创建新的组数据
 *  - 每个组包含 `frontBallCount` 个前区球和 `endBallCount` 个后区球，初始值均为 -1
 */
function initGroups() {
  groups.value.length = 0
  for (let i = 0; i < groupCount.value; i++) {
    const frontBalls = new Array(frontBallCount.value).fill(-1)
    const endBalls = new Array(endBallCount.value).fill(-1)
    groups.value.push({ frontBalls, endBalls })
  }
}

/**
 * 开始生成号码：每组通过 requestAnimationFrame 播放约 1.6s 的滚动动画，结束后落定为最终号码
 */
function startGenerate() {
  loading.value = true
  groups.value.forEach((group, gIndex) => {
    const startTime = performance.now()
    let rafId: ReturnType<typeof requestAnimationFrame> | null = null
    let lastTime = performance.now()

    function updateFrame(timestamp: number) {
      if (timestamp - startTime >= 1600) {
        groups.value[gIndex] = { ...group, frontBalls: generateBalls(frontBallCount.value, frontMaxCount.value), endBalls: generateBalls(endBallCount.value, endMaxCount.value) }
        loading.value = false
        if (rafId) cancelAnimationFrame(rafId)
        rafId = null
        return
      }

      if (timestamp - lastTime >= 100) {
        lastTime = timestamp
        groups.value[gIndex] = {
          ...group,
          frontBalls: Array.from({ length: group.frontBalls.length }, () => random(1, frontMaxCount.value)),
          endBalls: generateBalls(endBallCount.value, endMaxCount.value),
        }
      }

      rafId = requestAnimationFrame(updateFrame)
    }

    updateFrame(performance.now())
  })
}

/**
 * 生成指定数量的球号数组
 * @param {number} count - 需要生成的球号数量
 * @param {number} maxCount - 球号的最大值
 * @returns {number[]} 按升序排列的球号数组
 */
function generateBalls(count: number, maxCount: number) {
  const balls: number[] = []
  while (balls.length < count) {
    const num = random(1, maxCount)
    if (balls.includes(num)) continue
    balls.push(num)
  }
  return balls.sort((a, b) => a - b)
}

onMounted(() => {
  initGroups()
})
</script>

<style lang="scss" scoped>
.app-content {
  --ball-size: 72px;
  --ball-font-size: calc(var(--ball-size) / 2);
}

.tool-container {
  width: 640px;
  margin: 0 auto;
}

.tool-title {
  font-size: 32px;
  letter-spacing: 2px;
}

.tip-container {
  margin-bottom: 16px;
  padding: 8px 0;
  border-radius: 10px;
  line-height: 1.5;
  border: 2px dashed var(--el-color-info-light-5);
}

.balls-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.group {
  display: flex;
  justify-content: center;
  gap: 8px;
}

.ball-group {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  justify-content: center;
}

/* 球的样式 */
.ball {
  cursor: pointer;
  width: var(--ball-size);
  height: var(--ball-size);
  border-radius: 50%;
  font-size: var(--ball-font-size);
  font-weight: bold;
  color: var(--el-color-white);
  box-shadow: 2px 2px 10px rgba(0, 0, 0, 0.3);
  transition:
    transform 0.3s ease-in-out,
    background 0.3s;
}

/* 红球 */
.red-ball {
  // background: linear-gradient(135deg, #ff5f6d, #ff7b42);
  background: linear-gradient(135deg, var(--el-color-danger), #ff7b42);
}

/* 蓝球 */
.blue-ball {
  // background: linear-gradient(135deg, #36d1dc, #5b86e5);
  background: linear-gradient(135deg, #36d1dc, var(--el-color-primary));
}

/* 移动端：缩小球体并占满宽度 */
html[data-device='mobile'] {
  .app-content {
    --ball-size: 36px;
    padding: 8px;
  }
  .tool-container {
    width: 100%;
  }
}
</style>
