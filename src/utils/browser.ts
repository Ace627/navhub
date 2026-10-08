import { TipModal } from './tip-modal'

/**
 * 复制文本到剪贴板，优先使用 Clipboard API，失败时降级 execCommand，并提示复制结果
 * @param text 要复制的文本
 */
export async function copyText(text: string): Promise<void> {
  try {
    await navigator.clipboard.writeText(text)
  } catch {
    // Clipboard API 不可用或被拒绝时，降级 execCommand：创建隐藏 textarea 复制后移除，以其返回值判定成败
    const textarea = document.createElement('textarea')
    textarea.value = text
    textarea.style.position = 'fixed'
    textarea.style.opacity = '0'
    textarea.setAttribute('readonly', '')
    document.body.appendChild(textarea)
    textarea.select()
    const success = document.execCommand('copy')
    textarea.remove()
    if (!success) return TipModal.msgError('复制失败，请手动复制')
  }
  TipModal.msgSuccess('复制成功')
}
