<template>
  <div class="hitokoto-widget" @click.stop="copyHitokoto">
    <span class="widget-title">每日一言</span>
    <div class="hitokoto-body">
      <p class="hitokoto-text">{{ hitokotoInfo?.digest }}</p>
      <p v-if="hitokotoInfo?.author" class="hitokoto-from">
        {{ hitokotoInfo?.dynasty }} · {{ hitokotoInfo?.author }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: 'HitokotoWidget' })

/** 随机名句共享逻辑 */
const { hitokotoInfo, fetchHitokoto, copyHitokoto } = useHitokoto()

onMounted(fetchHitokoto)
</script>

<style lang="scss" scoped>
/* 小组件主体：卡片外壳由 LinkCard 提供（一言卡隐藏头部），版式为标题居上、名句居中、出处居下 */
.hitokoto-widget {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  /* 与同类无头部小组件主体等高（84px），保证名句为一行或两行时卡片高度一致 */
  min-height: 84px;
  margin: 6px 0 8px;
  cursor: pointer;
}

/* 顶部小标题：通栏居中，与参考样式一致 */
.widget-title {
  flex-shrink: 0;
  font-size: 12px;
  letter-spacing: 3px;
  text-align: center;
  color: var(--el-text-color-secondary);
  user-select: none;
}

.hitokoto-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  min-width: 0;
}

.hitokoto-text {
  display: -webkit-box;
  margin: 0;
  overflow: hidden;
  font-size: 14px;
  font-weight: 600;
  line-height: 1.7;
  text-align: center;
  color: var(--el-text-color-primary);
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  transition: color 0.2s;
}

.hitokoto-from {
  margin: 0;
  max-width: 100%;
  overflow: hidden;
  font-size: var(--el-font-size-extra-small);
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--el-text-color-secondary);
}

.hitokoto-widget:hover .hitokoto-text {
  color: var(--el-color-primary);
}

html[data-device='mobile'] {
  /* 移动端与日历卡同高：主体最小高度 = 日历卡自然高度 - 卡片内边距与主体外边距 */
  .hitokoto-widget {
    margin: 4px 0 8px;
    min-height: 120px;
  }

  .hitokoto-text {
    font-size: 13px;
  }
}
</style>
