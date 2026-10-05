#!/usr/bin/env node
/**
 * 站点信息解析器（零依赖，Node 18+）
 * 用法: node fetch-site-info.mjs <url1> [url2 ...]
 * 输出: JSON 数组 [{ input, title, url, icon, description }]
 */
import { setTimeout as delay } from 'node:timers/promises';

const DEFAULT_ICON = 'https://q1.qlogo.cn/g?b=qq&nk=1433224387&s=640';
const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36';
const PAGE_TIMEOUT = 15000;
const ICON_TIMEOUT = 8000;
const MAX_HTML = 2 * 1024 * 1024; // 2MB 截断

function normalizeInput(raw) {
  let s = String(raw).trim();
  if (!s) throw new Error('空输入');
  if (!/^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//.test(s)) s = 'https://' + s;
  return s;
}

/** 规范化 url：去 hash、去尾部 /（保留 query） */
function normalizeUrl(u) {
  try {
    const url = new URL(u);
    url.hash = '';
    let s = url.toString();
    if (s.endsWith('/') && url.pathname === '/' && !url.search) {
      s = s.slice(0, -1); // 只剩根域名时去掉尾部斜杠
    } else {
      s = s.replace(/\/+$/, '');
    }
    return s;
  } catch {
    return u;
  }
}

/** 从 content-type 头和 html 头部嗅探 charset */
function detectCharset(contentType, headBytes) {
  const m =
    /charset=["']?([\w-]+)/i.exec(contentType || '') ||
    /charset=["']?([\w-]+)/i.exec(new TextDecoder('latin1').decode(headBytes).slice(0, 2048));
  if (!m) return 'utf-8';
  let cs = m[1].toLowerCase();
  if (cs === 'gb2312' || cs === 'gbk') cs = 'gbk';
  try {
    new TextDecoder(cs);
    return cs;
  } catch {
    return 'utf-8';
  }
}

/** 不依赖 DOM 的 HTML 头部信息提取 */
function parseHtml(html, pageUrl) {
  const head = html.slice(0, 200000);
  const metaTagRe = /<meta\b[^>]*>/gi;
  let m;
  const metas = [];
  while ((m = metaTagRe.exec(head)) !== null) metas.push(m[0]);

  const attr = (tag, name) => {
    const re = new RegExp(`${name}\\s*=\\s*("([^"]*)"|'([^']*)'|([^\\s>]+))`, 'i');
    const r = re.exec(tag);
    return r ? (r[2] ?? r[3] ?? r[4] ?? '').trim() : '';
  };

  let title = '';
  const titleMatch = /<title[^>]*>([\s\S]*?)<\/title>/i.exec(head);
  if (titleMatch) title = decodeEntities(titleMatch[1]).trim();

  let description = '';
  for (const tag of metas) {
    const name = (attr(tag, 'name') || attr(tag, 'property')).toLowerCase();
    const content = attr(tag, 'content');
    if (!content) continue;
    if (name === 'description' && !description) description = decodeEntities(content).trim();
    if (name === 'og:title' && !title) title = decodeEntities(content).trim();
  }

  // 图标候选，按优先级排列
  const candidates = [];
  const relPriority = ['apple-touch-icon', 'mask-icon', 'shortcut icon', 'icon'];
  const links = [];
  const linkRe = /<link\b[^>]*>/gi;
  while ((m = linkRe.exec(head)) !== null) links.push(m[0]);
  for (const tag of links) {
    const rel = attr(tag, 'rel').toLowerCase();
    const href = attr(tag, 'href');
    if (!href || !rel.includes('icon')) continue;
    let abs;
    try {
      abs = new URL(href, pageUrl).toString();
    } catch {
      continue;
    }
    // data URI 仅接受真实图片（过滤 data:, 这类空占位）
    if (abs.startsWith('data:image')) return { title, description, icon: abs };
    const idx = relPriority.findIndex((p) => rel.includes(p));
    candidates.push({ abs, pri: idx === -1 ? 99 : idx });
  }
  try {
    const origin = new URL(pageUrl).origin;
    candidates.push({ abs: origin + '/favicon.ico', pri: 98 });
  } catch {
    /* ignore */
  }
  candidates.sort((a, b) => a.pri - b.pri);

  return { title, description, iconCandidates: candidates.map((c) => c.abs) };
}

function decodeEntities(s) {
  return s
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)))
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/g, "'");
}

async function fetchWithTimeout(url, timeoutMs, extraHeaders = {}) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    return await fetch(url, {
      signal: ctrl.signal,
      redirect: 'follow',
      headers: { 'user-agent': UA, accept: '*/*', ...extraHeaders },
    });
  } finally {
    clearTimeout(timer);
  }
}

/** 逐个验证图标候选是否可访问（200 + 图片/任意），返回第一个可用项 */
async function resolveIcon(candidates) {
  for (const iconUrl of candidates) {
    try {
      const res = await fetchWithTimeout(iconUrl, ICON_TIMEOUT, { referer: iconUrl });
      if (!res.ok) continue;
      const ct = res.headers.get('content-type') || '';
      if (ct && !/image|octet-stream/i.test(ct)) continue;
      await res.arrayBuffer(); // 消费以确保内容真实可读
      return iconUrl;
    } catch {
      /* 尝试下一个 */
    }
  }
  return DEFAULT_ICON;
}

async function parseSite(rawInput) {
  const result = { input: rawInput, title: '', url: '', icon: '', description: '' };
  try {
    const pageUrl = normalizeInput(rawInput);
    const res = await fetchWithTimeout(pageUrl, PAGE_TIMEOUT, {
      accept: 'text/html,application/xhtml+xml,*/*;q=0.8',
      'accept-language': 'zh-CN,zh;q=0.9,en;q=0.8',
    });
    const finalUrl = res.url || pageUrl;
    result.url = normalizeUrl(finalUrl);

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const buf = Buffer.from(await res.arrayBuffer()).subarray(0, MAX_HTML);
    const charset = detectCharset(
      res.headers.get('content-type') || '',
      buf.subarray(0, 2048),
    );
    const html = new TextDecoder(charset).decode(buf);
    const { title, description, icon, iconCandidates } = parseHtml(html, finalUrl);

    result.title = title || new URL(finalUrl).hostname;
    result.description = description;
    result.icon = icon ? await Promise.resolve(icon) : await resolveIcon(iconCandidates);
  } catch (e) {
    result.error = e?.cause?.message || e?.message || String(e);
    if (!result.url) result.url = (() => { try { return normalizeUrl(normalizeInput(rawInput)); } catch { return rawInput; } })();
    result.icon = DEFAULT_ICON;
    if (!result.title) result.title = (() => { try { return new URL(normalizeInput(rawInput)).hostname; } catch { return ''; } })();
  }
  return result;
}

const inputs = process.argv.slice(2);
if (inputs.length === 0) {
  console.error('用法: node fetch-site-info.mjs <url1> [url2 ...]');
  process.exit(1);
}
const results = [];
for (const input of inputs) {
  results.push(await Promise.race([parseSite(input), delay(PAGE_TIMEOUT + ICON_TIMEOUT + 5000).then(() => ({ input, title: '', url: '', icon: DEFAULT_ICON, description: '', error: '整体超时' }))]));
}
console.log(JSON.stringify(results, null, 2));
