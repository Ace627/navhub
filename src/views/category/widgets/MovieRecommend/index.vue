<template>
  <div class="app-content app-content--fill">
    <div class="movie-container">
      <div class="movie-tip flex-center">
        <SvgIcon name="Dice" :size="16" />
        <el-text type="success">片单自行整理，随机抽一部，专治选片困难</el-text>
      </div>

      <!-- 抽签结果：整页只展示这一部，卡片撑满剩余高度，可换一部或跳转豆瓣详情 -->
      <div v-if="movie" class="movie-card" :class="{ 'is-rolling': rolling, 'is-landed': landed }">
        <!-- 装饰光斑：纯视觉元素，不参与交互与语义 -->
        <span class="glow glow-primary" aria-hidden="true"></span>
        <span class="glow glow-warning" aria-hidden="true"></span>

        <div class="movie-top">
          <span class="movie-badge flex-center">
            <SvgIcon name="Movie" :size="14" />
            随机推荐
          </span>
          <el-text type="info" size="small">片单共 {{ records.length }} 部</el-text>
        </div>

        <div class="movie-body">
          <!-- 评分环：环形进度以评分为进度值，默认插槽替换环心的百分比文案为分数与口径 -->
          <el-progress class="movie-score" type="circle" :percentage="ratingPercent" :width="scoreSize" :stroke-width="scoreStroke" :color="scoreColor">
            <template #default>
              <span class="score-value">{{ movie.rating }}</span>
              <span class="score-label">豆瓣评分</span>
            </template>
          </el-progress>

          <div class="movie-info">
            <div class="movie-header">
              <el-tooltip content="点击复制片名" placement="top">
                <h2 class="movie-title" @click="copyMovieTitle">{{ movie.title }}</h2>
              </el-tooltip>
              <span class="movie-year">{{ movie.year }}</span>
            </div>

            <div class="movie-tags">
              <el-tag v-for="genre in genreList" :key="genre" size="small" effect="plain" round>{{ genre }}</el-tag>
            </div>
          </div>
        </div>

        <!-- 推荐理由：整行铺开，长段落在窄列里会排到五六行 -->
        <p class="movie-digest">
          <span v-if="digestLabel" class="digest-label">{{ digestLabel }}</span>
          {{ digestText }}
        </p>

        <!-- 片单统计：把抽签池的规模与质量摊开，兼作卡片下半部的版面支撑 -->
        <div class="movie-facts">
          <div class="fact">
            <span class="fact-value">{{ records.length }}</span>
            <span class="fact-label">收录影片</span>
          </div>
          <div class="fact">
            <span class="fact-value">{{ averageRating }}</span>
            <span class="fact-label">平均评分</span>
          </div>
          <div class="fact">
            <span class="fact-value">{{ topMovie?.rating ?? '-' }}</span>
            <span class="fact-label">最高评分</span>
          </div>
        </div>

        <div class="movie-actions">
          <el-button size="large" :disabled="rolling" @click="fetchRandomMovie">
            <SvgIcon name="Refresh" :size="16" class="mr-4px" :class="{ 'is-spinning': rolling }" />
            {{ rolling ? '抽片中' : '换一部' }}
          </el-button>
          <el-button size="large" type="primary" @click="openMovieDetail()">
            豆瓣详情
            <SvgIcon name="External" :size="16" class="ml-4px" />
          </el-button>
        </div>
      </div>

      <!-- 空片单占位：片单尚未整理时展示，避免页面空白 -->
      <div v-else class="movie-empty flex-center flex-col">
        <span class="empty-icon flex-center">
          <SvgIcon name="Movie" :size="32" />
        </span>
        <el-text type="info">片单整理中，敬请期待</el-text>
      </div>

      <!-- 落款说明：标明片单来源口径，避免评分被当成绝对标准 -->
      <p v-if="records.length" class="movie-note">片单为个人整理，以个人感受为准仅供参考。</p>
    </div>
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: 'MovieRecommend' })
import { random } from 'lodash-es'
import { records } from '@/database/movies'
import type { MovieRecord } from '@/database/movies'
import { copyText } from '@/utils'

/** 洗牌动画总时长（毫秒）：期间快速轮播随机影片，结束后落定为最终结果 */
const ROLL_DURATION = 900

/** 洗牌动画每帧切换间隔（毫秒） */
const ROLL_INTERVAL = 90

/** 落定后的弹入动画时长（毫秒） */
const LANDED_DURATION = 320

const appStore = useAppStore()

/** 当前随机到的影片 */
const movie = ref<MovieRecord | null>(null)

/** 洗牌动画进行中标记：期间禁用按钮并展示滚动视觉 */
const rolling = ref(false)

/** 落定弹入标记：驱动落定后的缩放动画 */
const landed = ref(false)

/** 评分环直径：桌面端放大成视觉主角，移动端收窄以免挤占标题空间 */
const scoreSize = computed(() => (appStore.isMobile ? 100 : 176))

/** 评分环线宽：环变大后同步加粗，保持环的视觉重量 */
const scoreStroke = computed(() => (appStore.isMobile ? 6 : 8))

/** 评分环进度值：评分按十分制换算为百分比 */
const ratingPercent = computed(() => Number(movie.value?.rating ?? 0) * 10)

/**
 * 按评分分档取色：9 分以上暖橙、8 分档转蓝、其余走绿，均为正向色不显低质
 *
 * @param rating 评分字符串
 * @returns 对应的 CSS 颜色值，评分缺失时返回弱化色
 */
function ratingColor(rating: string): string {
  const score = Number(rating)
  if (!rating || Number.isNaN(score)) return 'var(--el-color-info)'
  if (score >= 9) return 'var(--el-color-warning)'
  if (score >= 8) return 'var(--el-color-primary)'
  return 'var(--el-color-success)'
}

/** 评分环颜色：取当前影片评分的分档色 */
const scoreColor = computed(() => ratingColor(movie.value?.rating ?? ''))

/** 片单平均分：统计区展示 */
const averageRating = computed(() => {
  if (!records.length) return '0.0'
  const total = records.reduce((sum, item) => sum + Number(item.rating), 0)
  return (total / records.length).toFixed(1)
})

/** 片单最高分影片：统计区展示其评分 */
const topMovie = computed<MovieRecord | null>(() => records.reduce<MovieRecord | null>((best, item) => (!best || Number(item.rating) > Number(best.rating) ? item : best), null))

/** 当前影片的类型标签列表：类型串按「 / 」拆分 */
const genreList = computed(() => (movie.value?.genres ? movie.value.genres.split('/').map((genre) => genre.trim()) : []))

/** 推荐理由的行首标签：文案以「【……】」开头时取出标签文字，用于单独排版强调 */
const digestLabel = computed(() => movie.value?.digest.match(/^【([^】]+)】/)?.[1] ?? '')

/** 推荐理由正文：去掉行首的「【……】」标签后剩余内容 */
const digestText = computed(() => (movie.value?.digest ?? '').replace(/^【[^】]+】/, ''))

/**
 * 从片单中随机抽取一部影片
 *
 * @param avoidCurrent 是否避开当前展示的影片（落定时避开，滚动过程中允许重复）
 * @returns 抽中的影片，片单为空时返回 undefined
 */
function pickMovie(avoidCurrent: boolean): MovieRecord | undefined {
  const candidates = avoidCurrent ? records.filter((item) => item.id !== movie.value?.id) : records
  const pool = candidates.length ? candidates : records
  return pool[random(0, pool.length - 1)]
}

/**
 * 抽一部新影片：先播放约 0.9s 的洗牌动画（期间快速轮播片单内容），再落定为最终结果
 *
 * 片单仅一部时同样播放动画，靠卡片的滚动视觉维持「抽片」的反馈
 */
function fetchRandomMovie(): void {
  if (!records.length || rolling.value) return
  rolling.value = true
  landed.value = false

  const startTime = performance.now()
  let lastTime = startTime

  function updateFrame(timestamp: number) {
    if (timestamp - startTime >= ROLL_DURATION) {
      const picked = pickMovie(true)
      if (picked) movie.value = picked
      rolling.value = false
      landed.value = true
      setTimeout(() => (landed.value = false), LANDED_DURATION)
      return
    }

    if (timestamp - lastTime >= ROLL_INTERVAL) {
      lastTime = timestamp
      const preview = pickMovie(false)
      if (preview) movie.value = preview
    }

    requestAnimationFrame(updateFrame)
  }

  requestAnimationFrame(updateFrame)
}

/**
 * 复制当前影片片名到剪贴板：复制结果提示由 utils 的 copyText 统一给出
 */
function copyMovieTitle(): void {
  if (!movie.value) return
  copyText(movie.value.title)
}

/**
 * 新窗口打开指定影片的豆瓣详情页
 *
 * @param item 目标影片，缺省时取当前抽中的影片
 */
function openMovieDetail(item?: MovieRecord): void {
  const target = item ?? movie.value
  if (!target) return
  window.open(`https://movie.douban.com/subject/${target.id}/`, '_blank', 'noopener,noreferrer')
}

onMounted(fetchRandomMovie)
</script>

<style lang="scss" scoped>

/* 容器纵向撑满，卡片随之撑满可用高度，避免页面只剩一小块内容 */
.movie-container {
  display: flex;
  flex-direction: column;
  flex: 1;
  width: 640px;
  margin: 0 auto;
}

/* 顶部提示：胶囊底色替代虚线框，与卡片配色呼应 */
.movie-tip {
  flex-shrink: 0;
  gap: 6px;
  margin-bottom: 16px;
  padding: 10px 16px;
  border-radius: 999px;
  background-image: linear-gradient(90deg, var(--el-color-success-light-9), var(--el-color-primary-light-9));
}

.movie-card {
  position: relative;
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 18px;
  padding: 28px 34px 32px;
  overflow: hidden;
  background-image: linear-gradient(135deg, var(--el-color-primary-light-9) 0%, var(--el-bg-color) 45%, var(--el-color-warning-light-9) 100%);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 16px;
  box-shadow: var(--el-box-shadow-light);
}

/* 装饰光斑：自带模糊的圆形色块，营造卡片内的色彩层次 */
.glow {
  position: absolute;
  width: 240px;
  height: 240px;
  border-radius: 50%;
  filter: blur(70px);
  opacity: 0.5;
  pointer-events: none;
}

.glow-primary {
  top: -110px;
  left: -90px;
  background-color: var(--el-color-primary-light-5);
}

.glow-warning {
  right: -100px;
  bottom: -120px;
  background-color: var(--el-color-warning-light-5);
}

.movie-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.movie-badge {
  gap: 4px;
  padding: 4px 10px;
  font-size: 12px;
  color: var(--el-color-primary);
  background-color: var(--el-color-primary-light-9);
  border: 1px solid var(--el-color-primary-light-8);
  border-radius: 999px;
}

/* 主体区吸收卡片剩余高度，评分环与影片信息在卡内垂直居中 */
.movie-body {
  display: flex;
  flex: 1;
  align-items: center;
  gap: 34px;
}

.movie-score {
  flex-shrink: 0;
  /* 环形进度的默认样式自带行内布局，此处保证环心内容纵向排列 */
  line-height: 1.2;
}

.score-value {
  display: block;
  font-size: 42px;
  font-weight: 700;
  color: var(--el-text-color-primary);
}

.score-label {
  display: block;
  margin-top: 2px;
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.movie-info {
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-width: 0;
}

.movie-header {
  display: flex;
  align-items: baseline;
  gap: 10px;
}

.movie-title {
  margin: 0;
  font-size: 42px;
  font-weight: 700;
  letter-spacing: 0.5px;
  color: var(--el-text-color-primary);
  /* 片名可点击复制，悬停给出可交互的视觉提示 */
  cursor: pointer;
  transition: color 0.2s;

  &:hover {
    color: var(--el-color-primary);
  }
}

.movie-year {
  font-size: 15px;
  color: var(--el-text-color-secondary);
}

.movie-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

/* 推荐理由：整行铺开的引用块，左侧色条 + 浅底；长文案更需要行宽 */
.movie-digest {
  margin: 0;
  padding: 14px 16px;
  font-size: 15px;
  line-height: 1.75;
  color: var(--el-text-color-regular);
  background-color: var(--el-fill-color-light);
  border-left: 3px solid var(--el-color-primary-light-5);
  border-radius: 8px;
}

/* 推荐理由的行首标签：单独强调，与正文形成层级 */
.digest-label {
  margin-right: 4px;
  font-weight: 700;
  color: var(--el-color-primary);
}

/* 片单统计：三格横排，格间用细分隔线，兼作卡片下半部的版面支撑 */
.movie-facts {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  padding-top: 16px;
  border-top: 1px solid var(--el-border-color-lighter);
}

.fact {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  border-right: 1px solid var(--el-border-color-lighter);

  &:last-child {
    border-right: none;
  }
}

.fact-value {
  font-size: 26px;
  font-weight: 700;
  color: var(--el-text-color-primary);
}

.fact-label {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.movie-actions {
  display: flex;
  justify-content: center;
  gap: 12px;

  /* 相邻按钮默认带 12px 左边距，会让按钮组整体右移，此处清零改由 gap 控制间距 */
  .el-button {
    margin-left: 0;
  }
}

.movie-empty {
  flex: 1;
  gap: 12px;

  .empty-icon {
    width: 64px;
    height: 64px;
    color: var(--el-text-color-secondary);
    background-color: var(--el-fill-color-light);
    border-radius: 50%;
  }
}

/* 落款说明：弱化处理，只做来源口径交代 */
.movie-note {
  flex-shrink: 0;
  margin: 14px 0 0;
  font-size: 12px;
  text-align: center;
  color: var(--el-text-color-secondary);
}

/* 洗牌中的滚动视觉：标题与推荐语快速明暗闪烁 */
@keyframes movie-flicker {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.4;
  }
}

/* 落定视觉：缩放弹入，给「抽中」一个收尾反馈 */
@keyframes movie-pop {
  0% {
    transform: scale(0.94);
    opacity: 0.3;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

@keyframes movie-spin {
  to {
    transform: rotate(360deg);
  }
}

.movie-card.is-rolling {
  .movie-title,
  .movie-digest,
  .movie-year {
    animation: movie-flicker 0.18s linear infinite;
  }
}

.movie-card.is-landed .movie-title {
  animation: movie-pop 0.32s ease-out;
}

.is-spinning {
  animation: movie-spin 0.6s linear infinite;
}

html[data-device='mobile'] {
  /* 移动端扣除项更少（外壳内边距 12+12、页头 24+16，共 64），据此抬高最小高度多留出行高 */
  .app-content {
    padding-bottom: 44px;
    min-height: calc(100vh - var(--el-navbar-height) - var(--el-copyright-height) - 64px);
    min-height: calc(100dvh - var(--el-navbar-height) - var(--el-copyright-height) - 64px);
  }

  .movie-container {
    width: 100%;
  }

  .movie-card {
    gap: 10px;
    padding: 16px 16px 18px;
  }

  /* 移动端改为纵向排布：评分环居中在上，文字信息在下 */
  .movie-body {
    flex-direction: column;
    justify-content: center;
    gap: 14px;
  }

  .movie-info {
    align-items: center;
    width: 100%;
  }

  .movie-header {
    justify-content: center;
  }

  .movie-title {
    font-size: 24px;
  }

  .score-value {
    font-size: 26px;
  }

  .movie-tags {
    justify-content: center;
  }

  /* 文案块恢复左对齐，居中排布的长句不便阅读；行距收紧以容纳加长后的推荐语 */
  .movie-digest {
    width: 100%;
    font-size: 13px;
    line-height: 1.6;
    text-align: left;
  }

  /* 落款限宽：右下角悬浮按钮占据右侧 44px（含 16px 边距），限宽后居中排布即可横向避开按钮，
     不受纵向高度影响（悬浮按钮宽 44 + 右距 16，两侧各留 65，故减去 130） */
  .movie-note {
    max-width: calc(100% - 130px);
    margin: 14px auto 0;
  }

  /* 统计三格在移动端并列一行，末格不画右分隔线（由基础规则的 :last-child 处理） */
  .movie-facts {
    grid-template-columns: repeat(3, 1fr);
    padding-top: 10px;
  }

  .glow {
    width: 150px;
    height: 150px;
  }

  .movie-empty {
    padding: 32px 0;
  }
}
</style>
