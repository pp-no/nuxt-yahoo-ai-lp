// server/api/news.get.ts  ← ルート直下 server/api で運用する前提
import Parser from 'rss-parser'
import { eventHandler } from 'h3'   // ← #imports は使わない

type Item = { title: string; link: string; pubDate: string; description: string }

// ── 簡易メモリキャッシュ（プロセス生存中保持） ─────────────────
const descCache = new Map<string, { text: string; at: number }>()
const DESC_TTL = 1000 * 60 * 60 * 6 // 6時間

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))
const decode = (s: string) =>
  s.replace(/&amp;/g, '&')
   .replace(/&lt;/g, '<')
   .replace(/&gt;/g, '>')
   .replace(/&#39;|&apos;/g, "'")
   .replace(/&quot;/g, '"')

function extractMetaDescription(html: string): string {
  const og = html.match(/<meta[^>]+property=["']og:description["'][^>]*content=["']([^"']+)["'][^>]*>/i)
  if (og?.[1]) return decode(og[1]).trim()
  const nameDesc = html.match(/<meta[^>]+name=["']description["'][^>]*content=["']([^"']+)["'][^>]*>/i)
  if (nameDesc?.[1]) return decode(nameDesc[1]).trim()
  return ''
}

export default eventHandler(async () => {
  // 1) RSS 取得（Yahoo! トピックス既定。必要なら環境変数で上書き）
  const NEWS_RSS_URL =
    process.env.NUXT_PUBLIC_NEWS_RSS_URL ||
    'https://news.yahoo.co.jp/rss/topics/top-picks.xml'

  const parser = new Parser({
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; NuxtRSSFetcher/1.0)',
      Accept: 'application/rss+xml, application/xml;q=0.9,*/*;q=0.8',
    },
    timeout: 10_000,
  })

  const feed = await parser.parseURL(NEWS_RSS_URL)
  const base = (feed.items || []).slice(0, 5).map((i: any) => ({
    title: i.title ?? '',
    link: i.link ?? '',
    pubDate: i.isoDate ?? i.pubDate ?? '',
    description: '', // ← 後で埋める
  }))

  // 2) 各記事HTMLから meta description を抽出（直列）
  const out: Item[] = []
  for (const it of base) {
    let description = ''

    if (it.link) {
      const key = it.link
      const cached = descCache.get(key)
      if (cached && Date.now() - cached.at < DESC_TTL) {
        description = cached.text
      } else {
        try {
          const res = await fetch(it.link, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (compatible; NuxtHTMLFetcher/1.0)',
              Accept: 'text/html,application/xhtml+xml,*/*',
            },
            redirect: 'follow',
          })
          const html = await res.text()
          description = extractMetaDescription(html)
          if (description) descCache.set(key, { text: description, at: Date.now() })
          await sleep(250) // 連続アクセスの間隔を少し空ける
        } catch (e: any) {
          console.warn('[news.get] enrich failed:', e?.message || String(e))
        }
      }
    }

    out.push({ ...it, description })
  }

  return { items: out }
})
