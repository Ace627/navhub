<template>
  <div class="hitokoto-container flex items-center">
    <p class="hitokoto">
      <span class="hitokoto-text">「{{ hitokotoInfo?.hitokoto }}」</span>
      <span v-if="hitokotoInfo?.from || hitokotoInfo?.from_who" class="hitokoto-from"> —— {{ hitokotoInfo?.from_who }}「{{ hitokotoInfo?.from }}」 </span>
    </p>
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: 'Hitokoto' })

/** 一言接口返回的数据结构 */
interface HitokotoInfo {
  /** 一言 ID */
  id: number
  /** 一言正文 */
  hitokoto: string
  /** 一言类型 */
  type: string
  /** 一言出处 */
  from: string
  /** 一言作者 */
  from_who: string
  /** 一言长度 */
  length: number
}

/** 一言内容 */
const hitokotoInfo = ref<HitokotoInfo>()

/** 请求一言接口数据并填充展示内容 */
async function fetchHitokoto(): Promise<void> {
  try {
    const response = await fetch('https://v1.hitokoto.cn/')
    hitokotoInfo.value = await response.json()
  } catch {
    // 接口失败时保持空白，不影响布局
  }
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
