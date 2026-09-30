<template>
  <ul ref="listRef" class="category-list">
    <li v-for="item in categories" :key="item.key">
      <button
        type="button"
        class="category-list__item"
        :class="{ 'is-active': item.key === activeKey }"
        :data-active="item.key === activeKey"
        :aria-current="item.key === activeKey ? 'true' : undefined"
        @click="emit('select', item.key)"
      >
        <span class="category-list__name">{{ item.name }}</span>
        <span class="category-list__count">{{ item.count }}</span>
      </button>
    </li>
  </ul>
</template>

<script setup lang="ts">
import type { CategoryItem } from '../composables/useCategoryNav'

defineOptions({ name: 'CategoryList' })

const props = defineProps<{
  /** 分类列表 */
  categories: CategoryItem[]
  /** 当前激活的分类 key */
  activeKey: string
}>()

const emit = defineEmits<{
  /** 选中某个分类 */
  select: [key: string]
}>()

const listRef = ref<HTMLElement | null>(null)

/** 激活项滚出列表可视区时，把它带回可见范围（列表自身可滚动时才生效） */
function ensureActiveVisible() {
  const list = listRef.value
  if (!list || list.scrollHeight <= list.clientHeight) return

  const active = list.querySelector<HTMLElement>('[data-active="true"]')
  if (!active) return

  const top = active.offsetTop
  const bottom = top + active.offsetHeight
  if (top < list.scrollTop) list.scrollTo({ top, behavior: 'smooth' })
  else if (bottom > list.scrollTop + list.clientHeight) list.scrollTo({ top: bottom - list.clientHeight, behavior: 'smooth' })
}

watch(
  function () {
    return props.activeKey
  },
  ensureActiveVisible,
)
</script>

<style lang="scss" scoped>
.category-list {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 2px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.category-list__item {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  width: 100%;
  height: var(--n-category-item-height);
  padding: 0 12px 0 14px;
  font-size: 14px;
  color: #606266;
  background-color: transparent;
  border: none;
  border-radius: 8px;
  text-align: left;
  cursor: pointer;
  transition:
    background-color 0.2s,
    color 0.2s;

  /* 激活态左侧竖条 */
  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 50%;
    width: 3px;
    height: 16px;
    border-radius: 0 2px 2px 0;
    background-color: var(--n-color-primary);
    transform: translateY(-50%) scaleY(0);
    transition: transform 0.2s;
  }

  &:hover {
    color: #303133;
    background-color: #f2f3f5;
  }

  &:focus-visible {
    outline: 2px solid var(--n-color-primary);
    outline-offset: -2px;
  }

  &.is-active {
    color: var(--n-color-primary);
    font-weight: 600;
    background-color: rgb(64 158 255 / 10%);

    &::before {
      transform: translateY(-50%) scaleY(1);
    }
  }
}

.category-list__name {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.category-list__count {
  flex-shrink: 0;
  font-size: 12px;
  font-weight: 400;
  color: #c0c4cc;
}
</style>
