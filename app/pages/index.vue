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
  <main class="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
    <section class="container mx-auto px-4 py-12">
      <!-- ヘッダー部分 -->
      <header class="text-center mb-12">
        <div class="inline-flex items-center gap-3 mb-4">
          <div class="w-10 h-10 bg-gradient-to-r from-red-500 to-red-600 rounded-xl flex items-center justify-center">
            <svg class="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M2 5a2 2 0 012-2h8a2 2 0 012 2v10a2 2 0 002 2H4a2 2 0 01-2-2V5zm3 1h6v4H5V6zm6 6H5v2h6v-2z" clip-rule="evenodd"/>
              <path d="M15 7h1a2 2 0 012 2v5.5a1.5 1.5 0 01-3 0V9a1 1 0 00-1-1h-1v4.5a1.5 1.5 0 01-3 0V7z"/>
            </svg>
          </div>
          <h1 class="text-3xl md:text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
            Yahoo!ニュース
          </h1>
        </div>
        <p class="text-gray-600 text-lg">最新のニュースをお届けします</p>
      </header>

      <!-- エラー表示 -->
      <div v-if="error" class="mb-8 mx-auto max-w-2xl">
        <div class="bg-red-50 border border-red-200 rounded-2xl p-6 shadow-sm">
          <div class="flex items-start gap-3">
            <div class="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
              <svg class="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
              </svg>
            </div>
            <div class="flex-1">
              <h3 class="font-semibold text-red-800 mb-1">ニュースの取得に失敗しました</h3>
              <p class="text-red-700 text-sm mb-4">{{ (error as any)?.message || error }}</p>
              <div class="flex flex-wrap gap-3">
                <button 
                  @click="refresh()"
                  class="inline-flex items-center gap-2 px-4 py-2 bg-white border border-red-300 rounded-lg text-red-700 hover:bg-red-50 transition-colors text-sm font-medium"
                >
                  <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clip-rule="evenodd"/>
                  </svg>
                  再読込
                </button>
                <a 
                  href="/api/news" 
                  target="_blank" 
                  rel="noopener"
                  class="inline-flex items-center gap-2 px-4 py-2 bg-white border border-red-300 rounded-lg text-red-700 hover:bg-red-50 transition-colors text-sm"
                >
                  <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z"/>
                    <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z"/>
                  </svg>
                  API を直接確認
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ローディング表示 -->
      <div v-else-if="pending" class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div v-for="n in 6" :key="n" class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div class="animate-pulse space-y-4">
            <div class="h-4 bg-gray-200 rounded-lg w-3/4"></div>
            <div class="h-3 bg-gray-200 rounded w-1/2"></div>
            <div class="space-y-2">
              <div class="h-3 bg-gray-200 rounded"></div>
              <div class="h-3 bg-gray-200 rounded w-5/6"></div>
            </div>
            <div class="h-3 bg-gray-200 rounded w-1/3"></div>
          </div>
        </div>
      </div>

      <!-- ニュース一覧 -->
      <div v-else class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <article
          v-for="item in data?.items || []"
          :key="item.link"
          class="group bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl hover:border-gray-200 transition-all duration-300 p-6 flex flex-col"
        >
          <!-- タイトル -->
          <h2 class="mb-3">
            <a 
              :href="item.link" 
              target="_blank" 
              rel="noopener" 
              class="font-bold text-lg text-gray-800 hover:text-blue-600 transition-colors line-clamp-2 leading-relaxed group-hover:underline"
            >
              {{ item.title }}
            </a>
          </h2>

          <!-- メタ情報 -->
          <div class="flex items-center gap-3 mb-4">
            <div class="flex items-center gap-2 text-sm text-gray-500">
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd"/>
              </svg>
              <time>{{ formatDate(item.pubDate) }}</time>
            </div>
            <span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 border border-blue-200">
              Yahoo!ニュース
            </span>
          </div>

          <!-- 説明文 -->
          <div class="flex-1 mb-4">
            <div 
              v-if="item.description" 
              class="text-gray-600 text-sm leading-relaxed description-clamp"
              v-html="sanitize(item.description)"
            ></div>
            <p v-else class="text-gray-400 text-sm italic">説明がありません</p>
          </div>

          <!-- 読むリンク -->
          <div class="pt-4 border-t border-gray-100">
            <a 
              :href="item.link" 
              target="_blank" 
              rel="noopener" 
              class="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium text-sm group-hover:gap-3 transition-all"
            >
              <span>記事を読む</span>
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clip-rule="evenodd"/>
              </svg>
            </a>
          </div>
        </article>

        <!-- 記事が0件の場合 -->
        <div v-if="(data?.items || []).length === 0" class="col-span-full">
          <div class="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-100">
            <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg class="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M2 5a2 2 0 012-2h8a2 2 0 012 2v10a2 2 0 002 2H4a2 2 0 01-2-2V5zm3 1h6v4H5V6zm6 6H5v2h6v-2z" clip-rule="evenodd"/>
              </svg>
            </div>
            <h3 class="text-lg font-semibold text-gray-700 mb-2">記事が見つかりません</h3>
            <p class="text-gray-500 mb-4">現在表示できる記事がありません。</p>
            <a href="/api/news" target="_blank" rel="noopener" class="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z"/>
                <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z"/>
              </svg>
              API データを確認
            </a>
          </div>
        </div>
      </div>

      <!-- フッター -->
      <footer class="mt-16 text-center">
        <div class="inline-flex items-center gap-2 px-4 py-3 bg-white rounded-xl shadow-sm border border-gray-100 text-sm text-gray-600">
          <svg class="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"/>
          </svg>
          <span>表示される内容はRSSフィードの情報です。詳細は各記事でご確認ください。</span>
        </div>
      </footer>
    </section>
  </main>
</template>

<style scoped>
/* line-clampクラスの定義（3点リーダ対応） */
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  word-break: break-word;
}

.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  word-break: break-word;
}

/* 説明文用の特別なクラス */
.description-clamp {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  word-break: break-word;
  hyphens: auto;
}

/* HTMLコンテンツ内の要素のスタイル調整 */
.description-clamp p {
  margin: 0;
  display: inline;
}

.description-clamp br {
  display: none;
}

/* グラデーション背景のアニメーション */
.bg-gradient-to-br {
  background-size: 400% 400%;
  animation: gradient-shift 15s ease infinite;
}

@keyframes gradient-shift {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}

/* ホバーエフェクトの改善 */
.group:hover .group-hover\:gap-3 {
  gap: 0.75rem;
}

/* プロセスマークダウンのスタイル調整 */
.prose {
  max-width: none;
}

.prose p {
  margin: 0;
  color: rgb(75 85 99);
  line-height: 1.6;
}
</style>