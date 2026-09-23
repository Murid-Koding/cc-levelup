<script setup lang="ts">
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
  <section class="max-w-6xl mx-auto px-4 py-16">
    <h1 class="text-3xl font-bold text-gray-900">CC Level Up!</h1>
    <p class="mt-4 text-gray-600">
      Arsip sharing session komunitas kami. Sesi pertama dalam Bahasa Indonesia.
    </p>
    <div class="mt-8">
      <NuxtLink
        to="/sesi"
        class="inline-flex items-center px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-sm font-medium"
      >
        Jelajahi Arsip Sesi &rarr;
      </NuxtLink>
    </div>
  </section>
</template>
