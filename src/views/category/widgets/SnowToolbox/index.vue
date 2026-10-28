<template>
  <div class="app-content app-content--fill">
    <div class="snow-container">
      <!-- 推荐卡片：撑满剩余高度，介绍落雪工具箱小程序并引导到微信搜索 -->
      <div class="snow-card">
        <!-- 装饰光斑：纯视觉元素，不参与交互与语义 -->
        <span class="glow glow-primary" aria-hidden="true"></span>
        <span class="glow glow-plain" aria-hidden="true"></span>

        <div class="snow-head">
          <img class="snow-logo" :src="logoUrl" alt="落雪工具箱" />
          <div class="snow-head-info">
            <span class="snow-badge flex-center">
              <SvgIcon name="Star" :size="14" />
              微信小程序推荐
            </span>
            <h2 class="snow-title">落雪工具箱</h2>
            <el-text type="info">塞进口袋的工具合集，随开随用</el-text>
          </div>
        </div>

        <!-- 推荐语：整行铺开的引用块，交代核心卖点 -->
        <p class="snow-digest">
          一款纯本地运行的微信小程序工具合集：无服务端、不上传数据，收录时间、图片、娱乐、生活四类 20
          余款小工具，全部免费使用，微信里搜索即达。
        </p>

        <!-- 工具分类概览：只列分类与代表工具，具体功能进小程序体验 -->
        <div class="snow-groups">
          <div v-for="group in groupList" :key="group.title" class="snow-group">
            <div class="group-head">
              <span class="group-title">{{ group.title }}</span>
              <span class="group-count">x{{ group.tools.length }}</span>
            </div>
            <p class="group-tools">{{ group.tools.join(' / ') }}</p>
          </div>
        </div>

        <!-- 卡片统计：三格横排，兼作卡片下半部的版面支撑 -->
        <div class="snow-facts">
          <div class="fact">
            <span class="fact-value">20+</span>
            <span class="fact-label">实用工具</span>
          </div>
          <div class="fact">
            <span class="fact-value">4</span>
            <span class="fact-label">工具分类</span>
          </div>
          <div class="fact">
            <span class="fact-value">0</span>
            <span class="fact-label">数据上传</span>
          </div>
        </div>

        <div class="snow-actions">
          <el-button size="large" type="primary" @click="copyKeyword(MP_NAME)">
            <SvgIcon name="Copy" :size="16" class="mr-4px" />
            复制小程序名
          </el-button>
        </div>

        <!-- 彩蛋提示：不剧透具体内容，留个小钩子引导探索 -->
        <p class="snow-easter flex-center">
          <SvgIcon name="Star" :size="14" />
          彩蛋：长按小程序首页顶部的广告，会解锁隐藏小游戏
        </p>

        <!-- 落款说明：交代网页无法直接拉起小程序的替代路径 -->
        <p class="snow-note">网页无法直接打开小程序，复制名称后打开微信搜索即可进入。</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: 'SnowToolbox' })
import logoUrl from '@/assets/images/icons/落雪工具箱.png'
import { copyText } from '@/utils'

/** 小程序名称：复制后供微信搜索使用 */
const MP_NAME = '落雪工具箱'

/** 工具分类概览：与小程序首页的分类口径一致，仅用于推荐展示 */
const groupList = [
  { title: '时间工具', tools: ['世界时钟', '倒数日', '发薪日倒计时', '时间进度'] },
  { title: '图片工具', tools: ['图片拼接', '图片压缩', '图片加水印', '拼豆图纸'] },
  { title: '娱乐工具', tools: ['数独游戏', '24 点', 'MBTI 测试', '幸运数字'] },
  { title: '生活工具', tools: ['BMI 计算器', '亲戚称呼计算', '固定支出预估'] },
]

/**
 * 复制指定文本到剪贴板：复制结果提示由 utils 的 copyText 统一给出
 *
 * @param text 待复制的文本
 */
function copyKeyword(text: string): void {
  copyText(text)
}
</script>

<style lang="scss" scoped>
/* 容器纵向撑满，卡片随之撑满可用高度，避免页面只剩一小块内容 */
.snow-container {
  display: flex;
  flex-direction: column;
  flex: 1;
  width: 640px;
  margin: 0 auto;
}

.snow-card {
  position: relative;
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 18px;
  padding: 28px 34px 32px;
  overflow: hidden;
  background-image: linear-gradient(135deg, var(--el-color-primary-light-9) 0%, var(--el-bg-color) 45%, var(--el-fill-color-light) 100%);
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

.glow-plain {
  right: -100px;
  bottom: -120px;
  background-color: var(--el-fill-color-darker);
}

.snow-head {
  display: flex;
  align-items: center;
  gap: 18px;
}

.snow-logo {
  flex-shrink: 0;
  width: 76px;
  height: 76px;
  background-color: var(--el-bg-color);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 18px;
  box-shadow: var(--el-box-shadow-light);
}

.snow-head-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
}

.snow-badge {
  gap: 4px;
  align-self: flex-start;
  padding: 4px 10px;
  font-size: 12px;
  color: var(--el-color-primary);
  background-color: var(--el-color-primary-light-9);
  border: 1px solid var(--el-color-primary-light-8);
  border-radius: 999px;
}

.snow-title {
  margin: 0;
  font-size: 32px;
  font-weight: 700;
  letter-spacing: 0.5px;
  line-height: 1.2;
  color: var(--el-text-color-primary);
}

/* 推荐语：整行铺开的引用块，左侧色条 + 浅底 */
.snow-digest {
  margin: 0;
  padding: 14px 16px;
  font-size: 15px;
  line-height: 1.75;
  color: var(--el-text-color-regular);
  background-color: var(--el-fill-color-light);
  border-left: 3px solid var(--el-color-primary-light-5);
  border-radius: 8px;
}

/* 工具分类概览：两列小卡，卡片内只放分类名与代表工具 */
.snow-groups {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}

.snow-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 12px 14px;
  background-color: var(--el-bg-color);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 10px;
}

.group-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
}

.group-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.group-count {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.group-tools {
  margin: 0;
  font-size: 12px;
  line-height: 1.6;
  color: var(--el-text-color-secondary);
}

/* 卡片统计：三格横排，格间用细分隔线，兼作卡片下半部的版面支撑 */
.snow-facts {
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

.snow-actions {
  display: flex;
  justify-content: center;
  gap: 12px;

  /* 相邻按钮默认带 12px 左边距，会让按钮组整体右移，此处清零改由 gap 控制间距 */
  .el-button {
    margin-left: 0;
  }
}

/* 彩蛋提示：比落款稍强一点的弱强调，主色点缀勾起好奇心 */
.snow-easter {
  margin: 0;
  gap: 4px;
  font-size: 13px;
  color: var(--el-color-primary);
  opacity: 0.85;
}

/* 落款说明：弱化处理，交代打开方式 */
.snow-note {
  margin: 0;
  font-size: 12px;
  text-align: center;
  color: var(--el-text-color-secondary);
}

html[data-device='mobile'] {
  .snow-container {
    width: 100%;
  }

  .snow-card {
    gap: 14px;
    padding: 16px 16px 18px;
  }

  .snow-head {
    gap: 14px;
  }

  .snow-logo {
    width: 60px;
    height: 60px;
    border-radius: 14px;
  }

  .snow-title {
    font-size: 24px;
  }

  .snow-digest {
    font-size: 13px;
    line-height: 1.65;
  }

  .snow-facts {
    padding-top: 10px;
  }

  .fact-value {
    font-size: 22px;
  }

  .glow {
    width: 150px;
    height: 150px;
  }
}
</style>
