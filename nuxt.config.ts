import { existsSync } from 'node:fs'
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
      // build-data downloads the game's 50px avatars and full art into public/assets/, which is gitignored. Where they
      // are missing (a fresh clone, the hosted build) images go straight to the game's CDN instead of 404ing first.
      localImages: existsSync('public/assets/avatars') && existsSync('public/assets/art'),
    },
  },

  // Links to the old static pages. A server redirect keeps the fragment, so teams.html#team=... still loads its team.
  // index.html needs no rule: it is the home page's own file, and index.vue turns its old #<slug> into that miscrit's page.
  routeRules: {
    '/relics.html': { redirect: { to: '/relics', statusCode: 301 } },
    '/catch.html': { redirect: { to: '/catch', statusCode: 301 } },
    '/breed.html': { redirect: { to: '/breed', statusCode: 301 } },
    '/teams.html': { redirect: { to: '/teams', statusCode: 301 } },
  },
})
