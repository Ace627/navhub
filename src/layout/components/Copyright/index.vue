<template>
  <div class="flex-center copyright">
    <p class="hitokoto" @click="copyHitokoto">
      <span class="hitokoto-text">「{{ hitokotoInfo?.digest }}」</span>
      <span v-if="hitokotoInfo?.title || hitokotoInfo?.author" class="hitokoto-from"> —— {{ hitokotoInfo?.author }}「{{ hitokotoInfo?.title }}」 </span>
    </p>
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: 'Copyright' })
import { useHitokoto } from '@/hooks/useHitokoto'

/** 底部条展示随机名句，点击可复制 */
const { hitokotoInfo, fetchHitokoto, copyHitokoto } = useHitokoto()

onMounted(fetchHitokoto)
</script>

<style lang="scss" scoped>
.copyright {
  flex-shrink: 0;
  width: 100%;
  height: var(--el-copyright-height);
  background-color: var(--el-copyright-bg-color);
  box-shadow: var(--el-copyright-box-shadow);
  transition: width var(--el-transition-duration);
  overflow-x: auto;
}

.hitokoto {
  width: 100%;
  padding: 0 16px;
  font-size: var(--el-copyright-font-size);
  text-align: center;
  cursor: pointer;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  .hitokoto-text {
    color: var(--el-copyright-value-color);
  }

  .hitokoto-from {
    margin-left: var(--el-copyright-value-gap);
    color: var(--el-copyright-label-color);
    font-size: var(--el-font-size-extra-small);
  }
}

/* 移动端空间有限，隐藏出处仅展示一言正文 */
html[data-device='mobile'] {
  .hitokoto-from {
    display: none;
  }
}
</style>
