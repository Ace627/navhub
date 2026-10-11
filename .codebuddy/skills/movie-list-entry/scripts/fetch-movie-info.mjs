/**
 * 影片信息解析：把「豆瓣链接 / 豆瓣 id / 片名」解析为片单条目所需的准确字段
 * 用法：node <skill目录>/scripts/fetch-movie-info.mjs <链接|id|片名> [更多参数...]
 *   例：node scripts/fetch-movie-info.mjs https://movie.douban.com/subject/1292052/ "肖申克的救赎"
 * 输出：JSON 数组，每项含 id/title/year/rating/genres/subtitle/doubanUrl，解析失败时含 error
 * 说明：脚本只负责取数与归一化，推荐语（digest）由会话内撰写，脚本不做文案
 */
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'

const execFileAsync = promisify(execFile)

/** 桌面端 UA：用于豆瓣联想接口 */
const DESKTOP_UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'

/** 移动端 UA：用于豆瓣 rexxar 数据接口 */
const MOBILE_UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1'

/** 单次请求超时时间（毫秒） */
const TIMEOUT = 20000

/** 请求重试次数 */
const RETRY = 3

/**
 * 带超时与重试的 JSON 请求：先走 fetch，失败后用 curl 兜底
 * @param {string} url 请求地址
 * @param {Record<string, string>} headers 请求头
 * @returns {Promise<any>} 解析后的 JSON
 */
async function fetchJson(url, headers) {
  let lastError = null
  for (let attempt = 1; attempt <= RETRY; attempt++) {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), TIMEOUT)
    try {
      const response = await fetch(url, { signal: controller.signal, redirect: 'follow', headers })
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      const text = await response.text()
      try {
        return JSON.parse(text)
      } catch {
        throw new Error(`非 JSON 响应（${text.slice(0, 60).replace(/\s+/g, ' ')}）`)
      }
    } catch (error) {
      lastError = error
      if (attempt < RETRY) await new Promise((resolve) => setTimeout(resolve, 800 * attempt))
    } finally {
      clearTimeout(timer)
    }
  }
  // fetch 通道失败后走 curl 兜底（-k 忽略证书问题）
  try {
    const { stdout } = await execFileAsync('curl', ['-sS', '-k', '-L', '--max-time', String(TIMEOUT / 1000), '-A', headers['User-Agent'], ...Object.entries(headers).filter(([key]) => key !== 'User-Agent').flatMap(([key, value]) => ['-H', `${key}: ${value}`]), url], {
      encoding: 'utf8',
      maxBuffer: 10 * 1024 * 1024,
      windowsHide: true,
    })
    return JSON.parse(stdout)
  } catch (curlError) {
    const reason = lastError instanceof Error ? lastError.message : String(lastError)
    const detail = curlError instanceof Error ? curlError.message : String(curlError)
    throw new Error(`${reason}｜curl: ${detail}`)
  }
}

/**
 * 从输入中提取豆瓣影片主键
 * @param {string} input 链接或纯 id
 * @returns {string} 影片主键，非 id 形式时返回空字符串
 */
function extractId(input) {
  const trimmed = String(input).trim()
  const fromUrl = trimmed.match(/movie\.douban\.com\/subject\/(\d+)/)
  if (fromUrl) return fromUrl[1]
  if (/^\d+$/.test(trimmed)) return trimmed
  return ''
}

/**
 * 按片名反查豆瓣影片（联想接口，免 key）
 * @param {string} name 片名
 * @returns {Promise<Array<{ id: string, title: string, year: string }>>} 候选列表
 */
async function suggestByName(name) {
  const list = await fetchJson(`https://movie.douban.com/j/subject_suggest?q=${encodeURIComponent(name)}`, {
    'User-Agent': DESKTOP_UA,
    Referer: 'https://movie.douban.com/',
  })
  if (!Array.isArray(list)) throw new Error('联想接口返回格式异常')
  return list.map((item) => ({ id: String(item.id), title: item.title, year: String(item.year ?? '') }))
}

/**
 * 按豆瓣主键取影片详情（rexxar 接口，免 key）
 *
 * 注：影片详情页 movie.douban.com/subject/{id} 有反爬（curl 302、fetch 拿到占位页），只能走此接口
 *
 * @param {string} id 豆瓣影片主键
 * @returns {Promise<Record<string, any>>} 详情 JSON
 */
async function fetchDetail(id) {
  return fetchJson(`https://m.douban.com/rexxar/api/v2/movie/${id}`, {
    'User-Agent': MOBILE_UA,
    Referer: `https://m.douban.com/movie/subject/${id}/`,
  })
}

/**
 * 归一化评分：豆瓣接口可能返回「9」这类无小数写法，统一补成一位小数
 * @param {any} value 接口返回的评分值
 * @returns {string} 一位小数的评分字符串，无评分时返回空字符串
 */
function normalizeRating(value) {
  const score = Number(value)
  if (!value || Number.isNaN(score)) return ''
  return score.toFixed(1)
}

/**
 * 合并类型标签：接口 genres 为权威列表，card_subtitle 里常带补充标签（传记/歌舞/西部等）
 * @param {string[]} genres 接口 genres 字段
 * @param {string} subtitle 接口 card_subtitle 字段（形如 年份 / 地区 / 类型 / 导演 / 主演）
 * @returns {{ genres: string[], extraGenres: string[] }} 合并后的类型与新增的补充标签
 */
function mergeGenres(genres, subtitle) {
  const parts = String(subtitle ?? '')
    .split('/')
    .map((part) => part.trim())
  const fromSubtitle = parts[2] ? parts[2].split(/\s+/).filter(Boolean) : []
  const extraGenres = fromSubtitle.filter((genre) => !genres.includes(genre))
  return { genres: [...genres, ...extraGenres], extraGenres }
}

/**
 * 解析单个输入（链接 / id / 片名）
 * @param {string} input 输入内容
 * @returns {Promise<Record<string, any>>} 解析结果
 */
async function resolveOne(input) {
  const id = extractId(input)
  const result = { input, inputType: id ? 'id' : 'name' }

  if (!id) {
    const keyword = String(input).trim()
    const candidates = await suggestByName(keyword)
    if (!candidates.length) return { ...result, error: '联想接口无候选结果，片名可能有误或该片已下架' }
    result.suggestCandidates = candidates.slice(0, 5)
    // 优先取片名完全一致的候选：联想接口按前缀匹配，短片名会被同名新片顶掉（如「功夫」vs「功夫女足」）
    const exact = candidates.find((item) => item.title === keyword)
    const matched = exact ?? candidates[0]
    result.titleMatchedExactly = Boolean(exact)
    result.id = matched.id
    result.titleFromSuggest = matched.title
    result.yearFromSuggest = matched.year
  } else {
    result.id = id
  }

  const detail = await fetchDetail(result.id)
  if (detail.title === undefined) return { ...result, error: `rexxar 接口未返回影片信息（HTTP 响应异常）` }

  const { genres, extraGenres } = mergeGenres(detail.genres ?? [], detail.card_subtitle)
  return {
    ...result,
    title: detail.title,
    year: String(detail.year ?? ''),
    rating: normalizeRating(detail.rating && detail.rating.value),
    genres,
    extraGenres,
    subtitle: detail.card_subtitle ?? '',
    doubanUrl: `https://movie.douban.com/subject/${result.id}`,
  }
}

/**
 * 启动：逐个解析输入，并对「同时给出 id 与片名」的情况做交叉校验
 */
async function bootstrap() {
  const inputs = process.argv.slice(2)
  if (!inputs.length) {
    console.log('用法：node fetch-movie-info.mjs <链接|id|片名> [更多参数...]')
    process.exit(1)
  }

  const results = []
  for (const input of inputs) {
    try {
      results.push(await resolveOne(input))
    } catch (error) {
      results.push({ input, error: error instanceof Error ? error.message : String(error) })
    }
  }

  // 交叉校验：同时给了 id 与片名时，确认两者指向同一部影片，避免错链
  const idEntry = results.find((item) => item.inputType === 'id' && item.id)
  const nameEntry = results.find((item) => item.inputType === 'name' && item.id)
  let crossCheck = null
  if (idEntry && nameEntry) {
    crossCheck = {
      idFromLink: idEntry.id,
      idFromName: nameEntry.id,
      matched: idEntry.id === nameEntry.id,
      titleFromLink: idEntry.title,
      titleFromName: nameEntry.title,
    }
  }

  console.log(JSON.stringify({ crossCheck, results }, null, 2))
}

bootstrap()
