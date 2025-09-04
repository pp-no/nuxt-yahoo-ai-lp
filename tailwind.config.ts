// tailwind.config.ts
import type { Config } from 'tailwindcss'
import typography from '@tailwindcss/typography'
import lineClamp from '@tailwindcss/line-clamp'

export default <Partial<Config>>{
  content: [
    './app/app.vue',
    './app/components/**/*.{vue,js,ts,jsx,tsx}',
    './app/layouts/**/*.{vue,js,ts,jsx,tsx}',
    './app/pages/**/*.{vue,js,ts,jsx,tsx}',
    './app/plugins/**/*.{js,ts}',
    './app/composables/**/*.{js,ts}',
  ],
  theme: { extend: {} },
  plugins: [typography, lineClamp],
}
