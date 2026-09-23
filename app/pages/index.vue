<script setup lang="ts">
import UpcomingLumaSection from '~~/app/features/home/components/UpcomingLumaSection.vue'
import { getCanonicalUrl } from '~~/shared/utils/seo'

useHead({
  title: 'CC Level Up! — Komunitas Belajar & Arsip Sharing Session',
  link: [{ rel: 'canonical', href: getCanonicalUrl('/') }],
  meta: [
    {
      name: 'description',
      content:
        'Kumpulan rekaman dan materi sharing session seputar teknologi dan rekayasa perangkat lunak secara terbuka dan gratis.'
    },
    { property: 'og:title', content: 'CC Level Up!' },
    {
      property: 'og:description',
      content: 'Kumpulan rekaman sharing session terbuka untuk umum.'
    },
    { property: 'og:url', content: getCanonicalUrl('/') }
  ]
})
</script>

<template>
  <div class="max-w-6xl mx-auto px-4 py-12 md:py-16">
    <!-- Hero Section -->
    <header class="mb-12">
      <h1 class="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight">
        CC Level Up!
      </h1>
      <p class="mt-4 text-lg md:text-xl text-gray-600 max-w-2xl leading-relaxed">
        Arsip sharing session komunitas terbuka. Belajar bersama topik rekayasa perangkat lunak,
        produk, dan teknologi dalam Bahasa Indonesia.
      </p>
      <div class="mt-6 flex flex-wrap items-center gap-4">
        <NuxtLink
          to="/sesi"
          class="inline-flex items-center px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold shadow-sm transition-colors"
        >
          Jelajahi Semua Sesi &rarr;
        </NuxtLink>
        <NuxtLink
          to="/tentang"
          class="inline-flex items-center px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-sm font-medium transition-colors"
        >
          Tentang Komunitas
        </NuxtLink>
      </div>
    </header>

    <!-- Upcoming Event (Luma Embed / Empty State) -->
    <UpcomingLumaSection />
  </div>
</template>
