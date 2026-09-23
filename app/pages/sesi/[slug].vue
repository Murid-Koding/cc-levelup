<script setup lang="ts">
import SessionCard from '~~/app/features/sessions/components/SessionCard.vue'
import YouTubeFacade from '~~/app/features/sessions/components/YouTubeFacade.vue'
import { useSessionDetailViewModel } from '~~/app/features/sessions/viewmodels/useSessionDetailViewModel'
import { getCanonicalUrl } from '~~/shared/utils/seo'

const { session, formattedDate, isLoading, isError, isNotFound, refresh, onVideoPlay } =
  useSessionDetailViewModel()

// SEO & Structured Data (VideoObject)
useHead(() => {
  if (isNotFound.value || !session.value) {
    return {
      title: 'Sesi Tidak Ditemukan — CC Level Up!',
      meta: [{ name: 'robots', content: 'noindex, nofollow' }]
    }
  }

  const thumbnailUrl = `https://img.youtube.com/vi/${session.value.youtubeVideoId}/hqdefault.jpg`
  const currentTitle = `${session.value.judul} — CC Level Up!`
  const description = session.value.deskripsi
  const canonicalUrl = getCanonicalUrl(`/sesi/${session.value.slug}`)

  // Escape HTML characters in JSON-LD string to prevent XSS breakout
  const safeJsonLd = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    name: session.value.judul,
    description: session.value.deskripsi,
    thumbnailUrl: [thumbnailUrl],
    uploadDate: session.value.tanggal,
    embedUrl: `https://www.youtube-nocookie.com/embed/${session.value.youtubeVideoId}`
  }).replace(/</g, '\\u003c')

  return {
    title: currentTitle,
    link: [{ rel: 'canonical', href: canonicalUrl }],
    meta: [
      { name: 'description', content: description },
      { property: 'og:title', content: currentTitle },
      { property: 'og:description', content: description },
      { property: 'og:type', content: 'video.other' },
      { property: 'og:url', content: canonicalUrl },
      { property: 'og:image', content: thumbnailUrl },
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: currentTitle },
      { name: 'twitter:description', content: description },
      { name: 'twitter:image', content: thumbnailUrl }
    ],
    script: [
      {
        type: 'application/ld+json',
        innerHTML: safeJsonLd
      }
    ]
  }
})
</script>

<template>
  <div class="max-w-4xl mx-auto px-4 py-8 md:py-12">
    <!-- Breadcrumb / Back to archive navigation -->
    <nav class="mb-6" aria-label="Navigasi Rekam Jejak">
      <NuxtLink
        to="/sesi"
        class="inline-flex items-center text-sm font-medium text-emerald-700 hover:text-emerald-800 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 rounded"
      >
        <svg class="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M10 19l-7-7m0 0l7-7m-7 7h18"
          />
        </svg>
        Kembali ke Arsip Sesi
      </NuxtLink>
    </nav>

    <!-- Loading state -->
    <div v-if="isLoading" class="space-y-6 animate-pulse">
      <div class="aspect-video bg-gray-200 rounded-xl" />
      <div class="space-y-3">
        <div class="h-4 bg-gray-200 rounded w-1/4" />
        <div class="h-8 bg-gray-200 rounded w-3/4" />
        <div class="h-4 bg-gray-200 rounded w-1/3" />
      </div>
    </div>

    <!-- 404 / Draft / Not Found state -->
    <div
      v-else-if="isNotFound"
      class="rounded-xl border border-amber-200 bg-amber-50 p-8 text-center"
      role="alert"
    >
      <h1 class="text-2xl font-bold text-amber-900">Sesi Tidak Ditemukan</h1>
      <p class="mt-2 text-sm text-amber-700">
        Sesi yang Anda tuju mungkin belum dipublikasikan atau tautan yang Anda buka keliru.
      </p>
      <NuxtLink
        to="/sesi"
        class="mt-6 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-500"
      >
        Lihat Semua Sesi Tersedia
      </NuxtLink>
    </div>

    <!-- Generic Error state -->
    <div
      v-else-if="isError"
      class="rounded-xl border border-red-200 bg-red-50 p-8 text-center"
      role="alert"
    >
      <h2 class="text-lg font-semibold text-red-800">Gagal memuat detail sesi</h2>
      <p class="mt-2 text-sm text-red-600">
        Terjadi kendala saat mengambil data sesi. Silakan coba kembali.
      </p>
      <button
        type="button"
        class="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
        @click="() => refresh()"
      >
        Coba Lagi
      </button>
    </div>

    <!-- Main Content Detail -->
    <article v-else-if="session" class="space-y-8">
      <!-- Video Player (YouTube Facade) -->
      <header>
        <YouTubeFacade
          :video-id="session.youtubeVideoId"
          :title="session.judul"
          @play="onVideoPlay"
        />

        <div class="mt-6 space-y-3">
          <!-- Kategori badges -->
          <div class="flex items-center gap-2 flex-wrap">
            <span
              v-for="cat in session.kategoris"
              :key="cat.id"
              class="inline-block text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700"
            >
              {{ cat.nama }}
            </span>
          </div>

          <h1 class="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">
            {{ session.judul }}
          </h1>

          <div class="flex flex-wrap items-center gap-y-2 gap-x-4 text-sm text-gray-600">
            <div class="font-medium text-gray-900">
              Dibawakan oleh: <span class="text-emerald-700">{{ session.pembicara.nama }}</span>
            </div>
            <span>•</span>
            <time :datetime="session.tanggal">{{ formattedDate }}</time>
          </div>
        </div>
      </header>

      <!-- Action link: Materi Presentasi (Google Drive only) -->
      <section v-if="session.linkMateri" class="pt-2">
        <a
          :href="session.linkMateri"
          target="_blank"
          rel="noopener noreferrer"
          class="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-emerald-600 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          <svg
            class="w-4 h-4 text-emerald-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          Akses Materi Presentasi
        </a>
      </section>

      <!-- Deskripsi -->
      <section class="prose max-w-none text-gray-700 space-y-3">
        <h2 class="text-xl font-bold text-gray-900">Deskripsi Sesi</h2>
        <p class="text-base leading-relaxed whitespace-pre-line">{{ session.deskripsi }}</p>
      </section>

      <!-- Ringkasan / Transkrip -->
      <section v-if="session.ringkasan" class="p-6 bg-gray-50 rounded-xl border border-gray-200">
        <h2 class="text-lg font-bold text-gray-900 mb-2">Ringkasan Materi</h2>
        <p class="text-sm sm:text-base text-gray-700 leading-relaxed whitespace-pre-line">
          {{ session.ringkasan }}
        </p>
      </section>

      <!-- Sesi Terkait (Related Sessions) -->
      <section
        v-if="session.relatedSessions && session.relatedSessions.length > 0"
        class="pt-8 border-t border-gray-200"
      >
        <h2 class="text-xl font-bold text-gray-900 mb-6">Sesi Terkait</h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          <SessionCard
            v-for="related in session.relatedSessions"
            :key="related.id"
            :session="related"
          />
        </div>
      </section>
    </article>
  </div>
</template>
