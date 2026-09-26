import { existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  compatibilityDate: '2026-09-27',
  modules: ['@nuxtjs/color-mode'],
  css: ['~/assets/css/main.css'],
  vite: { plugins: [tailwindcss()] },
  // The field guide's rich select options show the pick through the browser's own <selectedcontent>.
  vue: { compilerOptions: { isCustomElement: tag => tag === 'selectedcontent' } },

  // Dark is the default; a light pick is kept for every page, under the key the static pages used.
  colorMode: {
    preference: 'dark',
    fallback: 'dark',
    dataValue: 'theme',
    classSuffix: '',
    storageKey: 'miscripedia.theme',
  },

  app: {
    head: {
      htmlAttrs: { lang: 'en' },
      link: [
        { rel: 'icon', type: 'image/png', href: '/favicon.png' },
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Atkinson+Hyperlegible:wght@400;700&family=Fredoka:wght@500;600;700&display=swap' },
      ],
    },
  },

  runtimeConfig: {
    public: {
      // build-data downloads the game's 50px avatars and full art into assets/, which is gitignored. Where they are
      // missing (a fresh clone, the hosted build) images go straight to the game's CDN instead of 404ing first.
      localImages: existsSync('assets/avatars') && existsSync('assets/art'),
    },
  },

  // assets/ stays at the repo root while the static pages still read it; it moves to public/ when they are retired.
  nitro: {
    publicAssets: [{ dir: fileURLToPath(new URL('./assets', import.meta.url)), baseURL: '/assets', maxAge: 60 * 60 * 24 * 7 }],
  },
})
