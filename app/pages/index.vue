<script setup lang="ts">
import ArrowDown from '@primeicons/vue/arrow-down'
import ArrowRight from '@primeicons/vue/arrow-right'
import Sparkles from '@primeicons/vue/sparkles'
import vAnimateonscroll from 'primevue/animateonscroll'
import UpcomingLumaSection from '~~/app/features/home/components/UpcomingLumaSection.vue'
import { getCanonicalUrl } from '~~/shared/utils/seo'

useHead({
  title: 'CC Level Up! — Platform dan komunitas berbagi gagasan untuk membantu Anda naik level bersama',
  link: [{ rel: 'canonical', href: getCanonicalUrl('/') }],
  meta: [
    {
      name: 'description',
      content:
        'Platform dan komunitas berbagi gagasan untuk membantu Anda naik level bersama lewat sharing session interaktif'
    },
    { property: 'og:title', content: 'CC Level Up!' },
    {
      property: 'og:description',
      content: 'Platform dan komunitas berbagi gagasan untuk membantu Anda naik level bersama.'
    },
    { property: 'og:url', content: getCanonicalUrl('/') }
  ]
})
</script>

<template>
  <div class="w-full">
    <!-- Full-width Viewport Hero Section -->
    <section
      class="relative w-full min-h-screen flex flex-col items-center justify-center px-4 py-20 text-center bg-gradient-to-b from-emerald-50/50 via-white to-gray-50/30 border-b border-gray-100"
    >
      <div class="max-w-4xl mx-auto flex flex-col items-center">
        <span
          v-animateonscroll="{ enterClass: 'animate-fadeinup', threshold: 0.1 }"
          class="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 tracking-wide uppercase"
        >
          <Sparkles class="w-3.5 h-3.5" />
          <span>Komunitas Belajar Terbuka</span>
        </span>
        <h1
          v-animateonscroll="{
            enterClass: 'animate-fadeinup animate-delay-100',
            threshold: 0.1
          }"
          class="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-gray-900 tracking-tight leading-tight"
        >
          CC Level Up!
        </h1>
        <p
          v-animateonscroll="{
            enterClass: 'animate-fadeinup animate-delay-200',
            threshold: 0.1
          }"
          class="mt-6 text-lg sm:text-xl text-gray-600 max-w-2xl leading-relaxed"
        >
        Platform dan Komunitas berbagi gagasan untuk membantu Anda naik Level bersama lewat sharing session interaktif.
        </p>
        <div
          v-animateonscroll="{
            enterClass: 'animate-fadeinup animate-delay-300',
            threshold: 0.1
          }"
          class="mt-8 flex flex-w items-center justify-center gap-4"
        >
          <NuxtLink
            to="/sessions"
            class="no-underline inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-base font-semibold shadow-sm transition-colors"
          >
            <span>Jelajahi Semua Sesi</span>
            <ArrowRight class="w-4 h-4" />
          </NuxtLink>
          <NuxtLink
            to="/about"
            class="no-underline inline-flex items-center px-6 py-3 bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 rounded-xl text-base font-medium shadow-sm transition-colors"
          >
            Tentang Komunitas
          </NuxtLink>
        </div>
      </div>

      <!-- Scroll Indicator -->
      <div
        class="absolute bottom-8 inset-x-0 flex flex-col items-center justify-center text-xs text-gray-400 font-medium pointer-events-none select-none"
      >
        <span>Gulir ke bawah</span>
        <ArrowDown class="w-4 h-4 mt-1 animate-bounce" />
      </div>
    </section>

    <!-- Content Section -->
    <div
      v-animateonscroll="{
        enterClass: 'animate-fadeinup',
        threshold: 0.1
      }"
      class="max-w-6xl mx-auto px-4 py-12 md:py-16"
    >
      <UpcomingLumaSection />
    </div>
  </div>
</template>
