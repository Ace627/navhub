/**
 * 站点图标本地化：把 src/database/sites.json 中所有外链 icon 下载到本地并回写字段
 * 用法：node <skill目录>/scripts/download-site-icons.mjs [--check]
 *   无参数：执行本地化（幂等，已存在的同名文件直接复用，不覆盖用户手动补的图）
 *   --check：只做自检，输出外链残留、空 icon、引用缺文件、未引用文件、空白图标清单
 */
import path from 'node:path'
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { fileURLToPath } from 'node:url'
import { readFile, writeFile, stat, readdir } from 'node:fs/promises'
import { inflateSync } from 'node:zlib'

const execFileAsync = promisify(execFile)

// 下载相关配置
const CONCURRENCY = 8
const TIMEOUT = 20000
const RETRY = 3
const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36'
// 可能的图标扩展名（按常见度排序，用于同名文件复用探测）
const EXTS = ['png', 'jpg', 'svg', 'webp', 'gif', 'ico', 'bmp']

/**
 * 从脚本所在位置向上查找项目根目录（含 src/database/sites.json 的目录）
 * @returns {Promise<string>} 项目根目录绝对路径
 */
async function findProjectDir() {
  let dir = path.dirname(fileURLToPath(import.meta.url))
  for (let i = 0; i < 6; i++) {
    try {
      await stat(path.join(dir, 'src/database/sites.json'))
      return dir
    } catch {
      dir = path.dirname(dir)
    }
  }
  throw new Error('未找到项目根目录（src/database/sites.json）')
}

const PROJECT_DIR = await findProjectDir()
const SITES_JSON = path.join(PROJECT_DIR, 'src/database/sites.json')
const ICON_DIR = path.join(PROJECT_DIR, 'src/assets/images/icons')

/**
 * 过滤出 icon 为 http/https 外链的站点
 * @param {Array<Record<string, any>>} sites 站点列表
 * @returns {Array<Record<string, any>>} 待处理站点
 */
function pickExternalIconSites(sites) {
  return sites.filter((site) => typeof site.icon === 'string' && /^https?:\/\//i.test(site.icon))
}

/**
 * 把站点 title 转成合法文件名（替换非法字符，压缩空白）
 * @param {string} title 站点标题
 * @returns {string} 文件名主干
 */
function toFileBase(title) {
  return String(title).replace(/[\\/:*?"<>|]/g, '_').replace(/\s+/g, ' ').trim()
}

/**
 * 探测已存在的同名单图标文件
 * @param {string} base 文件名主干
 * @returns {Promise<string>} 扩展名，未找到时返回空字符串
 */
async function findExistingIcon(base) {
  for (const ext of EXTS) {
    try {
      await stat(path.join(ICON_DIR, `${base}.${ext}`))
      return ext
    } catch {
      /* 继续尝试下一个扩展名 */
    }
  }
  return ''
}

/**
 * 依据文件头字节判断真实图片格式，返回规范扩展名（识别不出时按 content-type 兜底）
 * @param {Buffer} buffer 文件内容
 * @param {string} contentType 响应头 content-type
 * @returns {string} 扩展名（不含点），无法识别时返回空字符串
 */
function detectExt(buffer, contentType) {
  const head = buffer.subarray(0, 16)
  const isPng = head[0] === 0x89 && head[1] === 0x50 && head[2] === 0x4e && head[3] === 0x47
  const isJpeg = head[0] === 0xff && head[1] === 0xd8 && head[2] === 0xff
  const isGif = head.subarray(0, 3).toString('latin1') === 'GIF'
  const isIco = head[0] === 0x00 && head[1] === 0x00 && head[2] === 0x01 && head[3] === 0x00
  const isWebp = head.subarray(0, 4).toString('latin1') === 'RIFF' && head.subarray(8, 12).toString('latin1') === 'WEBP'
  const isBmp = head[0] === 0x42 && head[1] === 0x4d
  const isSvg = /<svg[\s>]/i.test(buffer.subarray(0, 1024).toString('utf8'))

  if (isSvg) return 'svg'
  if (isPng) return 'png'
  if (isJpeg) return 'jpg'
  if (isGif) return 'gif'
  if (isWebp) return 'webp'
  if (isBmp) return 'bmp'
  if (isIco) return 'ico'

  // 字节特征不可靠时退回响应头
  const type = String(contentType).toLowerCase()
  if (type.includes('svg')) return 'svg'
  if (type.includes('png')) return 'png'
  if (type.includes('jpeg') || type.includes('jpg')) return 'jpg'
  if (type.includes('gif')) return 'gif'
  if (type.includes('webp')) return 'webp'
  if (type.includes('bmp')) return 'bmp'
  if (type.includes('icon')) return 'ico'
  return ''
}

/**
 * 用 curl 兜底下载（应对证书过期、TLS 握手异常等 fetch 无法处理的站点）
 * @param {string} url 图片地址
 * @returns {Promise<{ buffer: Buffer, ext: string }>} 图片内容与扩展名
 */
async function downloadByCurl(url) {
  const { stdout } = await execFileAsync(
    'curl',
    ['-sS', '-k', '-L', '--max-time', String(TIMEOUT / 1000), '-A', USER_AGENT, '-w', '\n__TYPE__%{content_type}', url],
    { encoding: 'buffer', maxBuffer: 20 * 1024 * 1024, windowsHide: true }
  )
  const splitIndex = stdout.lastIndexOf(Buffer.from('\n__TYPE__'))
  if (splitIndex < 0) throw new Error('curl 响应格式异常')
  const buffer = stdout.subarray(0, splitIndex)
  const contentType = stdout.subarray(splitIndex + 8).toString('utf8').trim()
  if (!buffer.length) throw new Error('curl 空响应')
  const ext = detectExt(buffer, contentType)
  if (!ext) throw new Error(`curl 非图片响应(${contentType || 'unknown'})`)
  return { buffer, ext }
}

/**
 * 带超时与重试的图片下载：先走 fetch，失败再用 curl 兜底
 * @param {string} url 图片地址
 * @returns {Promise<{ buffer: Buffer, ext: string }>} 图片内容与扩展名
 */
async function downloadImage(url) {
  let lastError = null
  for (let attempt = 1; attempt <= RETRY; attempt++) {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), TIMEOUT)
    try {
      const response = await fetch(url, {
        redirect: 'follow',
        signal: controller.signal,
        headers: { 'User-Agent': USER_AGENT, Accept: 'image/*,*/*;q=0.8' }
      })
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      const buffer = Buffer.from(await response.arrayBuffer())
      if (!buffer.length) throw new Error('空响应')
      const ext = detectExt(buffer, response.headers.get('content-type') || '')
      // 拿不到图片特征时判定为失败，交由后续重试与兜底处理
      if (!ext) throw new Error(`非图片响应(${response.headers.get('content-type') || 'unknown'})`)
      return { buffer, ext }
    } catch (error) {
      lastError = error
      if (attempt < RETRY) await new Promise((resolve) => setTimeout(resolve, 800 * attempt))
    } finally {
      clearTimeout(timer)
    }
  }
  // fetch 通道彻底失败后走 curl（-k 忽略过期证书）
  try {
    return await downloadByCurl(url)
  } catch (curlError) {
    const reason = lastError instanceof Error ? lastError.message : String(lastError)
    const detail = curlError instanceof Error ? curlError.message : String(curlError)
    throw new Error(`${reason}｜curl: ${detail}`)
  }
}

/**
 * 处理单个站点：已存在同名文件则直接复用（不覆盖用户手动补的图），否则下载后写入
 * @param {Record<string, any>} site 站点数据
 * @returns {Promise<string>} 结果描述，用于汇总输出
 */
async function handleSite(site) {
  const base = toFileBase(site.title)
  try {
    const reuse = await findExistingIcon(base)
    if (reuse) {
      site.icon = `@/assets/images/icons/${base}.${reuse}`
      return `↺ ${site.title}（复用 .${reuse}）`
    }
    const { buffer, ext } = await downloadImage(site.icon)
    await writeFile(path.join(ICON_DIR, `${base}.${ext}`), buffer)
    site.icon = `@/assets/images/icons/${base}.${ext}`
    return `✅ ${site.title}（.${ext}，${(buffer.length / 1024).toFixed(1)}KB）`
  } catch (error) {
    return `❌ ${site.title}｜${site.icon}｜${error instanceof Error ? error.message : error}`
  }
}

/**
 * 以固定并发执行任务队列
 * @param {Array<() => Promise<string>>} tasks 任务列表
 * @returns {Promise<string[]>} 各任务结果
 */
async function runPool(tasks) {
  const results = []
  let cursor = 0
  const workers = Array.from({ length: Math.min(CONCURRENCY, tasks.length) }, async () => {
    while (cursor < tasks.length) {
      const current = cursor++
      results[current] = await tasks[current]()
    }
  })
  await Promise.all(workers)
  return results
}

/**
 * 解析 ICO 的目录项
 * @param {Buffer} buf ico 内容
 * @returns {Array<{ w: number, h: number, size: number, offset: number }>} 目录项列表
 */
function readIcoEntries(buf) {
  const count = buf.readUInt16LE(4)
  const entries = []
  for (let i = 0; i < count; i++) {
    const base = 6 + i * 16
    entries.push({ w: buf[base] || 256, h: buf[base + 1] || 256, size: buf.readUInt32LE(base + 8), offset: buf.readUInt32LE(base + 12) })
  }
  return entries
}

/**
 * 把 ICO 内单个 BMP 帧解码为 RGBA
 * @param {Buffer} dib BMP 数据块
 * @returns {{ width: number, height: number, rgba: Buffer } | null} 像素信息
 */
function dibToRgba(dib) {
  const headerSize = dib.readUInt32LE(0)
  const width = dib.readInt32LE(4)
  const rawHeight = dib.readInt32LE(8)
  const bpp = dib.readUInt16LE(14)
  const compression = dib.readUInt32LE(16)
  if ((bpp !== 32 && bpp !== 24) || (compression !== 0 && compression !== 3)) return null
  const height = Math.abs(rawHeight) / 2
  const topDown = rawHeight < 0
  const pixelOffset = headerSize + (compression === 3 && headerSize === 40 ? 12 : 0)
  const stride = Math.ceil((bpp * width) / 32) * 4
  const maskStride = Math.ceil(width / 32) * 4
  const maskOffset = pixelOffset + stride * height
  // 仅当长度恰好等于「头 + 像素 + 1bpp 掩码」时才按掩码解释，否则视为额外 alpha 通道
  const hasMask = Math.abs(dib.length - (maskOffset + maskStride * height)) <= 4
  const rgba = Buffer.alloc(width * height * 4)
  for (let row = 0; row < height; row++) {
    const srcRow = topDown ? row : height - 1 - row
    for (let x = 0; x < width; x++) {
      const src = pixelOffset + srcRow * stride + x * (bpp / 8)
      const dst = (row * width + x) * 4
      rgba[dst] = dib[src + 2]
      rgba[dst + 1] = dib[src + 1]
      rgba[dst + 2] = dib[src]
      rgba[dst + 3] = bpp === 32 ? dib[src + 3] : 255
    }
    if (hasMask) {
      for (let x = 0; x < width; x++) {
        const bit = (dib[maskOffset + srcRow * maskStride + (x >> 3)] >> (7 - (x % 8))) & 1
        if (!bit) rgba[(row * width + x) * 4 + 3] = 0
      }
    }
  }
  return { width, height, rgba }
}

/**
 * 判断 ICO 是否全透明（空白图）
 * @param {Buffer} buf ico 内容
 * @returns {{ decodable: boolean, blank: boolean }} 判定结果
 */
function isBlankIco(buf) {
  let hasFrame = false
  let visible = 0
  let hasPngFrame = false
  for (const entry of readIcoEntries(buf)) {
    const slice = buf.subarray(entry.offset, entry.offset + entry.size)
    if (slice.length > 8 && slice[0] === 0x89 && slice[1] === 0x50) {
      hasFrame = true
      hasPngFrame = true
      continue
    }
    const rgba = dibToRgba(slice)
    if (!rgba) continue
    hasFrame = true
    for (let i = 3; i < rgba.rgba.length; i += 4) if (rgba.rgba[i] > 0) visible++
  }
  return { decodable: hasFrame, blank: hasFrame && visible === 0 && !hasPngFrame }
}

/**
 * 还原 PNG 扫描行的滤波字节
 * @param {number} filterType 滤波类型
 * @param {Buffer} row 当前行原始数据
 * @param {Buffer} prev 上一行数据
 * @param {number} bpp 每像素字节数
 * @returns {Buffer} 反滤波后的像素数据
 */
function unfilterRow(filterType, row, prev, bpp) {
  const out = Buffer.from(row)
  for (let i = 0; i < out.length; i++) {
    const a = i >= bpp ? out[i - bpp] : 0
    const b = prev[i] || 0
    const c = i >= bpp ? prev[i - bpp] || 0 : 0
    if (filterType === 1) out[i] = (out[i] + a) & 0xff
    else if (filterType === 2) out[i] = (out[i] + b) & 0xff
    else if (filterType === 3) out[i] = (out[i] + ((a + b) >> 1)) & 0xff
    else if (filterType === 4) {
      const p = a + b - c
      const pa = Math.abs(p - a)
      const pb = Math.abs(p - b)
      const pc = Math.abs(p - c)
      const pred = pa <= pb && pa <= pc ? a : pb <= pc ? b : c
      out[i] = (out[i] + pred) & 0xff
    }
  }
  return out
}

/**
 * 统计 PNG 的可见像素，判断是否为空白图（仅处理 8bit RGB/RGBA 非隔行）
 * @param {Buffer} buf png 内容
 * @returns {{ blank: boolean } | null} 判定结果，无法解析时返回 null
 */
function isBlankPng(buf) {
  if (buf.length < 8 || buf[0] !== 0x89 || buf[1] !== 0x50) return null
  let width = 0
  let height = 0
  let bitDepth = 0
  let colorType = 0
  let interlace = 0
  const idat = []
  let offset = 8
  while (offset + 8 <= buf.length) {
    const length = buf.readUInt32BE(offset)
    const type = buf.toString('latin1', offset + 4, offset + 8)
    const data = buf.subarray(offset + 8, offset + 8 + length)
    if (type === 'IHDR') {
      width = data.readUInt32BE(0)
      height = data.readUInt32BE(4)
      bitDepth = data[8]
      colorType = data[9]
      interlace = data[12]
    } else if (type === 'IDAT') idat.push(data)
    else if (type === 'IEND') break
    offset += 12 + length
  }
  if (bitDepth !== 8 || (colorType !== 2 && colorType !== 6) || interlace !== 0 || !idat.length) return null
  const bpp = colorType === 6 ? 4 : 3
  const stride = width * bpp
  let raw
  try {
    raw = inflateSync(Buffer.concat(idat))
  } catch {
    return null
  }
  let visible = 0
  let prev = Buffer.alloc(stride)
  for (let y = 0; y < height; y++) {
    const line = raw.subarray(y * (stride + 1), (y + 1) * (stride + 1))
    if (line.length < stride + 1) break
    const row = unfilterRow(line[0], line.subarray(1), prev, bpp)
    prev = row
    for (let x = 0; x < width; x++) {
      const p = x * bpp
      if (colorType === 2 || row[p + 3] > 0) visible++
    }
  }
  return { blank: visible === 0 }
}

/**
 * 自检：统计外链、空 icon、引用缺文件、未引用文件与空白图标
 * @returns {Promise<string>} 自检报告文本
 */
async function check() {
  const sites = JSON.parse(await readFile(SITES_JSON, 'utf8'))
  const files = await readdir(ICON_DIR)
  const external = sites.filter((site) => /^https?:\/\//i.test(site.icon || ''))
  const empty = sites.filter((site) => !site.icon)
  const missing = sites.filter((site) => site.icon?.startsWith('@/') && !files.includes(site.icon.split('/').pop()))
  const unused = files.filter((file) => !sites.some((site) => (site.icon || '').endsWith('/' + file)))
  const blanks = []
  for (const site of sites) {
    const name = site.icon?.split('/').pop()
    if (!name || !site.icon.startsWith('@/') || !files.includes(name)) continue
    const buffer = await readFile(path.join(ICON_DIR, name))
    if (name.endsWith('.ico')) {
      const stat = isBlankIco(buffer)
      if (stat && stat.blank) blanks.push(name)
    } else if (name.endsWith('.png')) {
      const stat = isBlankPng(buffer)
      if (stat && stat.blank) blanks.push(name)
    }
  }
  const lines = [
    `站点总数：${sites.length}`,
    `外链 icon：${external.length}${external.length ? ' → ' + external.map((s) => s.title).join('、') : ''}`,
    `空 icon：${empty.length}${empty.length ? ' → ' + empty.map((s) => s.title).join('、') : ''}`,
    `引用缺文件：${missing.length}${missing.length ? ' → ' + missing.map((s) => s.title).join('、') : ''}`,
    `未引用文件：${unused.length}${unused.length ? ' → ' + unused.join('、') : ''}`,
    `空白图标：${blanks.length}${blanks.length ? ' → ' + blanks.join('、') : ''}`
  ]
  return lines.join('\n')
}

/**
 * 启动：--check 只自检，否则执行本地化并回写
 */
async function bootstrap() {
  if (process.argv.includes('--check')) {
    console.log(await check())
    return
  }
  const sites = JSON.parse(await readFile(SITES_JSON, 'utf8'))
  const targets = pickExternalIconSites(sites)
  console.log(`共 ${sites.length} 个站点，其中外链 icon ${targets.length} 个，开始本地化\n`)

  const results = await runPool(targets.map((site) => () => handleSite(site)))
  results.forEach((line) => console.log(line))

  const failed = results.filter((line) => line.startsWith('❌'))
  await writeFile(SITES_JSON, `${JSON.stringify(sites, null, 2)}\n`, 'utf8')

  console.log(`\n成功 ${results.length - failed.length} 个，失败 ${failed.length} 个，已写回 ${SITES_JSON}`)
  if (failed.length) {
    console.log('\n失败清单（icon 仍保留原外链，需人工处理）：')
    failed.forEach((line) => console.log(line))
  }
  console.log('\n自检：\n' + (await check()))
}

bootstrap()