// app/types/news.ts
export type NewsItem = {
  title: string
  link: string
  pubDate: string
  description: string
}

export type NewsResponse = { items: NewsItem[] }
