<script setup lang="ts">
import { useFetch } from '#app'
import type { NewsResponse, NewsItem } from '~/types/news'

const { data, pending, error, refresh } = await useFetch<NewsResponse>("/api/news", {
  key: "news",
})

const formatDate = (iso: string) => {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ""
  return new Intl.DateTimeFormat("ja-JP", { dateStyle: "medium", timeStyle: "short" }).format(d)
}

// 単純なサニタイズ（必要なら sanitize-html の導入も可）
const sanitize = (html: string) => html.replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")

</script>

<template>
  <main class="min-h-screen bg-gray-50">
    <section class="container mx-auto px-4 py-8">
      <header class="mb-8">
        <h1 class="text-2xl md:text-3xl font-bold tracking-tight">
          Yahoo!ニュース（最新5件）— RSS の説明文を表示
        </h1>
      </header>

      <div v-if="error" class="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
        <p class="font-semibold">取得時にエラーが発生しました。</p>
        <p class="text-sm mt-1 break-all">{{ (error as any)?.message || error }}</p>
        <div class="mt-3 flex gap-3 text-sm">
          <button class="rounded-lg border px-3 py-1.5" @click="refresh()">再読込</button>
          <a class="underline" href="/api/news" target="_blank" rel="noopener">/api/news を直接開く</a>
        </div>
      </div>

      <div v-else-if="pending" class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div v-for="n in 5" :key="n" class="animate-pulse bg-white rounded-2xl shadow p-4 h-48"></div>
      </div>

      <div v-else class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <article
          v-for="item in data?.items || []"
          :key="item.link"
          class="bg-white rounded-2xl shadow hover:shadow-lg transition p-5 flex flex-col"
        >
          <a :href="item.link" target="_blank" rel="noopener" class="font-semibold text-lg hover:underline line-clamp-2">
            {{ item.title }}
          </a>

          <div class="flex items-center gap-2 mt-1">
            <time class="text-sm text-gray-500">{{ formatDate(item.pubDate) }}</time>
            <span class="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium bg-gray-100 text-gray-600">
              RSS説明
            </span>
          </div>

          <div class="prose prose-sm md:prose mt-4">
            <p v-if="item.description" v-html="sanitize(item.description)" class="line-clamp-2"></p>
            <p v-else class="text-gray-500">説明がありません</p>
          </div>

          <div class="mt-auto pt-4">
            <a :href="item.link" target="_blank" rel="noopener" class="text-blue-600 hover:underline text-sm">
              Yahoo!ニュースで読む →
            </a>
          </div>
        </article>

        <div v-if="(data?.items || []).length === 0" class="col-span-full text-gray-500">
          記事が0件でした。/api/news のJSONを確認してみてください。
        </div>
      </div>

      <footer class="mt-12 text-xs text-gray-500 space-y-1">
        <p>※ 表示される説明文はRSSの内容です。正確な情報は原文をご確認ください。</p>
      </footer>
    </section>
  </main>
</template>
