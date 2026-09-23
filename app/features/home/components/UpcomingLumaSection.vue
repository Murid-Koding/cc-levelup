<script setup lang="ts">
const route = useRoute()
const { data, status } = await useFetch<{ lumaEmbedUrl: string }>('/api/settings/luma')

const isArchivePage = computed(() => route.path.startsWith('/sesi'))

// Strict origin validation to prevent arbitrary URL / javascript: URI iframe execution
const safeLumaEmbedUrl = computed(() => {
  const raw = data.value?.lumaEmbedUrl?.trim() || ''
  if (!raw) return ''
  try {
    const parsed = new URL(raw)
    const isLumaDomain = ['lu.ma', 'luma.com'].includes(parsed.hostname.toLowerCase())
    const isHttps = parsed.protocol === 'https:'
    const isEmbedPath = parsed.pathname.startsWith('/embed/')
    if (isLumaDomain && isHttps && isEmbedPath) {
      return parsed.toString()
    }
    return ''
  } catch {
    return ''
  }
})

const isLoading = computed(() => status.value === 'pending')
</script>

<template>
  <section class="my-8" aria-labelledby="upcoming-sharing-heading">
    <div class="mb-4 flex items-center justify-between">
      <div>
        <span
          class="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 uppercase tracking-wider mb-1"
        >
          Event
        </span>
        <h2
          id="upcoming-sharing-heading"
          class="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight"
        >
          Sedang / Akan Sharing
        </h2>
      </div>
    </div>

    <!-- Loading State -->
    <div
      v-if="isLoading"
      role="status"
      aria-busy="true"
      class="w-full h-80 rounded-2xl bg-gray-100 border border-gray-200 animate-pulse flex items-center justify-center text-gray-400 text-sm"
    >
      <span>Memuat informasi event...</span>
    </div>

    <!-- Active Luma Event Embed -->
    <div
      v-else-if="safeLumaEmbedUrl"
      class="w-full rounded-2xl overflow-hidden border border-gray-200 bg-white shadow-sm"
    >
      <iframe
        :src="safeLumaEmbedUrl"
        class="w-full min-h-[450px] border-0"
        title="Jadwal Event Sharing Session Luma"
        allowfullscreen
        sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
      />
    </div>

    <!-- Empty State (PRD Bagian 5.1.D) -->
    <div
      v-else
      class="w-full p-8 sm:p-10 rounded-2xl border border-dashed border-gray-300 bg-gray-50/80 text-center flex flex-col items-center justify-center"
    >
      <div
        class="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mb-4"
      >
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      </div>

      <h3 class="text-lg font-semibold text-gray-900 mb-2">Belum Ada Sharing Session Terdekat</h3>
      <p class="text-sm text-gray-600 max-w-md leading-relaxed mb-4">
        Sesi berikutnya sedang dipersiapkan. Pantau terus kanal komunitas untuk pengumuman jadwal
        sesi selanjutnya.
      </p>

      <!-- Only show link if visitor is on home page to prevent dead self-link on /sesi -->
      <NuxtLink
        v-if="!isArchivePage"
        to="/sesi"
        class="inline-flex items-center text-sm font-medium text-emerald-700 hover:text-emerald-800 hover:underline"
      >
        Lihat Rekaman Sesi Sebelumnya &rarr;
      </NuxtLink>
    </div>
  </section>
</template>
