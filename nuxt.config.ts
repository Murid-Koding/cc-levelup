import Aura from '@primevue/themes/aura'

export default defineNuxtConfig({
  compatibilityDate: '2025-01-01',
  future: {
    compatibilityVersion: 4
  },
  typescript: {
    strict: true
  },
  modules: ['@unocss/nuxt', '@primevue/nuxt-module', '@nuxtjs/i18n', '@nuxt/eslint'],
  nitro: {
    preset: 'cloudflare_module'
  },
  primevue: {
    options: {
      theme: {
        preset: Aura,
        options: {
          darkModeSelector: '.dark'
        }
      },
      ripple: true
    },
    autoImport: true
  },
  i18n: {
    bundle: {
      optimizeTranslationDirective: false
    },
    locales: [{ code: 'id', name: 'Bahasa Indonesia', iso: 'id-ID', file: 'id.ts' }],
    defaultLocale: 'id',
    strategy: 'no_prefix',
    lazy: true
  }
})
