import { records } from '@/database/poems'
import { copyText } from '@/utils'

/** 名句条目的数据结构（对应 src/database/poems.ts 中的记录） */
export interface PoemRecord {
  /** 词牌名或诗题 */
  title: string
  /** 所属朝代 */
  dynasty: string
  /** 作者 */
  author: string
  /** 名句正文 */
  digest: string
}

/**
 * 随机名句共享逻辑：从本地诗词库随机抽取名句供展示，并提供点击复制能力
 *
 * 各调用方各自持有一份名句状态，互不影响
 *
 * @returns 名句内容与取词、复制方法
 */
export function useHitokoto() {
  /** 当前展示的名句内容 */
  const hitokotoInfo = ref<PoemRecord>()

  /**
   * 从诗词库中随机抽取一条名句填充展示内容
   */
  function fetchHitokoto(): void {
    const index = Math.floor(Math.random() * records.length)
    hitokotoInfo.value = records[index] as PoemRecord
  }

  /**
   * 点击名句复制完整内容，格式为三行：标题、朝代 作者、名句正文
   */
  function copyHitokoto(): void {
    if (!hitokotoInfo.value) return
    const { title, dynasty, author, digest } = hitokotoInfo.value
    copyText(`${title}\n${dynasty} ${author}\n${digest}`)
  }

  return { hitokotoInfo, fetchHitokoto, copyHitokoto }
}
