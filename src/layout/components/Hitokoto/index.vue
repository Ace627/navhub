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
import { useHitokoto } from '@/hooks/useHitokoto'

/** 随机名句共享逻辑：横条与小组件共用同一实现，各自持有一份名句状态 */
const { hitokotoInfo, fetchHitokoto, copyHitokoto } = useHitokoto()

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
