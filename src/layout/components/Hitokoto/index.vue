<template>
  <div class="hitokoto-container flex items-center">
    <p class="hitokoto" @click="copyHitokoto">
      <span class="hitokoto-text">「{{ hitokotoInfo?.digest }}」</span>
      <span v-if="hitokotoInfo?.title || hitokotoInfo?.author" class="hitokoto-from"> —— {{ hitokotoInfo?.author }}「{{ hitokotoInfo?.title }}」 </span>
    </p>
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: 'Hitokoto' })
import { records } from '@/database/poems'
import { copyText } from '@/utils'

/** 名句条目的数据结构（对应 src/database/poems.ts 中的记录） */
interface PoemRecord {
  /** 词牌名或诗题 */
  title: string
  /** 所属朝代 */
  dynasty: string
  /** 作者 */
  author: string
  /** 名句正文 */
  digest: string
}

/** 当前展示的名句内容 */
const hitokotoInfo = ref<PoemRecord>()

/** 从诗词库中随机抽取一条名句填充展示内容 */
function fetchHitokoto(): void {
  const index = Math.floor(Math.random() * records.length)
  hitokotoInfo.value = records[index] as PoemRecord
}

/** 点击名句复制完整内容，格式为三行：标题、朝代 作者、名句正文 */
function copyHitokoto(): void {
  if (!hitokotoInfo.value) return
  const { title, dynasty, author, digest } = hitokotoInfo.value
  copyText(`${title}\n${dynasty} ${author}\n${digest}`)
}

onMounted(fetchHitokoto)
</script>

<style lang="scss" scoped>
.hitokoto-container {
  width: 100%;
  height: var(--el-hitokoto-height);
  background-color: var(--el-hitokoto-bg-color);
  border-bottom: 1px solid var(--el-hitokoto-border-color);
  box-shadow: var(--el-hitokoto-box-shadow);
  overflow-x: auto;

  .hitokoto {
    width: 100%;
    padding: 0 16px;
    text-align: center;
    cursor: pointer;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;

    .hitokoto-text {
      color: var(--el-text-color-primary);
      font-size: var(--el-font-size-base);
    }

    .hitokoto-from {
      margin-left: 12px;
      color: var(--el-text-color-secondary);
      font-size: var(--el-font-size-extra-small);
    }
  }
}

/* 移动端空间有限，隐藏出处仅展示一言正文 */
html[data-device='mobile'] {
  .hitokoto-from {
    display: none;
  }
}
</style>
