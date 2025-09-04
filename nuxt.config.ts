// nuxt.config.ts
import { defineNuxtConfig } from 'nuxt/config'  // ← 追加

export default defineNuxtConfig({
  devtools: { enabled: true },
  srcDir: 'app',
  nitro: {
    scanDirs: ['app/server'],
  },
  modules: ['@nuxtjs/tailwindcss'],
  runtimeConfig: {
    openaiApiKey: process.env.OPENAI_API_KEY,
    public: {
      newsRssUrl: 'https://news.yahoo.co.jp/rss/topics/top-picks.xml',
    },
  },
  app: {
    head: {
      title: 'Yahooニュース×説明表示 | ポートフォリオLP',
      meta: [
        {
          name: 'description',
          content: 'Yahoo!ニュースの最新記事5件の説明文を表示するNuxt製LP',
        },
      ],
    },
  },
})
