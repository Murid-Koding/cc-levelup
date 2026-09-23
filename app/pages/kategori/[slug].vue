<script setup lang="ts">
import SessionCard from '~~/app/features/sessions/components/SessionCard.vue'
import type { CategoryDetailResponse } from '~~/shared/types/session'

const route = useRoute()
const router = useRouter()

const slug = computed(() => {
  const raw = route.params.slug
  return Array.isArray(raw) ? raw[0] : (raw as string)
})

const currentPage = computed(() => {
  const raw = route.query.page
  const pageStr = Array.isArray(raw) ? raw[0] : raw
  if (!pageStr) return 1
  if (!/^\d+$/.test(pageStr)) return 1
  const val = parseInt(pageStr, 10)
  return val >= 1 && val <= 10000 ? val : 1
})

const { data, status, error, refresh } = await useFetch<CategoryDetailResponse>(
  () => `/api/categories/${slug.value}?page=${currentPage.value}&limit=9`,
  {
    watch: [slug, currentPage]
  }
)

const kategori = computed(() => data.value?.kategori ?? null)
const sessions = computed(() => data.value?.sessions ?? [])
const pagination = computed(
  () =>
    data.value?.pagination ?? {
      page: currentPage.value,
      limit: 9,
      total: 0,
      totalPages: 0
    }
)

const isLoading = computed(() => status.value === 'pending')
const isError = computed(() => status.value === 'error')
const isNotFound = computed(() => error.value?.statusCode === 404)
const isOutOfRange = computed(
  () =>
    !isLoading.value &&
    !isError.value &&
    pagination.value.total > 0 &&
    currentPage.value > pagination.value.totalPages
)

if (import.meta.server) {
  const event = useRequestEvent()
  if (event && error.value?.statusCode === 404) {
    setResponseStatus(event, 404)
  }
}

function changePage(newPage: number) {
  if (!Number.isInteger(newPage) || newPage < 1) return
  if (pagination.value.totalPages > 0 && newPage > pagination.value.totalPages) return
  if (newPage === currentPage.value) return

  router.push({
    path: route.path,
    query: {
      ...route.query,
      page: newPage === 1 ? undefined : String(newPage)
    }
  })
}

useHead(() => {
  if (isNotFound.value || !kategori.value) {
    return {
      title: 'Kategori Tidak Ditemukan — CC Level Up!',
      meta: [{ name: 'robots', content: 'noindex, nofollow' }]
    }
  }

  const title = `Sesi Kategori ${kategori.value.nama} — CC Level Up!`
  const desc = `Kumpulan sharing session komunitas CC Level Up! dalam topik ${kategori.value.nama}.`

  return {
    title,
    meta: [
      { name: 'description', content: desc },
      { property: 'og:title', content: title },
      { property: 'og:description', content: desc }
    ]
  }
})
</script>

<template>
  <div class="max-w-6xl mx-auto px-4 py-8 md:py-12">
    <!-- Breadcrumb -->
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
        Kembali ke Semua Sesi
      </NuxtLink>
    </nav>

    <!-- 404 Not Found -->
    <div
      v-if="isNotFound"
      class="rounded-xl border border-amber-200 bg-amber-50 p-8 text-center"
      role="alert"
    >
      <h1 class="text-2xl font-bold text-amber-900">Kategori Tidak Ditemukan</h1>
      <p class="mt-2 text-sm text-amber-700">Topik kategori yang Anda tuju tidak tersedia.</p>
      <NuxtLink
        to="/sesi"
        class="mt-6 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-500"
      >
        Lihat Semua Sesi
      </NuxtLink>
    </div>

    <!-- Error State -->
    <div
      v-else-if="isError"
      class="rounded-xl border border-red-200 bg-red-50 p-8 text-center"
      role="alert"
    >
      <h2 class="text-lg font-semibold text-red-800">Gagal memuat kategori</h2>
      <p class="mt-2 text-sm text-red-600">Terjadi kendala saat mengambil data sesi kategori.</p>
      <button
        type="button"
        class="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 cursor-pointer"
        @click="() => refresh()"
      >
        Coba Lagi
      </button>
    </div>

    <!-- Out of range state -->
    <div
      v-else-if="isOutOfRange"
      class="rounded-xl border border-amber-200 bg-amber-50 p-8 text-center"
    >
      <h2 class="text-lg font-semibold text-amber-900">Halaman tidak tersedia</h2>
      <p class="mt-2 text-sm text-amber-700">
        Halaman yang Anda tuju tidak memiliki daftar sesi. Total halaman yang tersedia adalah
        {{ pagination.totalPages }}.
      </p>
      <button
        type="button"
        class="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer"
        @click="changePage(1)"
      >
        Kembali ke Halaman Pertama
      </button>
    </div>

    <!-- Content -->
    <div v-else-if="kategori">
      <header class="mb-8 md:mb-12">
        <div
          class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold mb-3"
        >
          Kategori Topik
        </div>
        <h1 class="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">
          {{ kategori.nama }}
        </h1>
        <p class="mt-2 text-base md:text-lg text-gray-600">
          Menampilkan seluruh rekaman sharing session berlabel {{ kategori.nama }}.
        </p>
      </header>

      <!-- Empty state jika belum ada sesi published di kategori ini (PRD Open Question #2 approval) -->
      <div
        v-if="pagination.total === 0"
        class="rounded-xl border border-dashed border-gray-300 p-12 text-center"
      >
        <h2 class="text-lg font-semibold text-gray-800">Belum ada sesi untuk kategori ini</h2>
        <p class="mt-2 text-sm text-gray-500">Sesi dengan topik ini akan segera hadir.</p>
        <NuxtLink
          to="/sesi"
          class="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          Lihat Kategori Lain
        </NuxtLink>
      </div>

      <!-- Grid sessions -->
      <div v-else>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <SessionCard v-for="session in sessions" :key="session.id" :session="session" />
        </div>

        <!-- Pagination Halaman Kategori -->
        <nav
          v-if="pagination.totalPages > 1"
          class="mt-12 flex items-center justify-center gap-2"
          aria-label="Navigasi Halaman Kategori"
        >
          <button
            type="button"
            :disabled="currentPage <= 1"
            class="px-3.5 py-2 text-sm rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
            @click="changePage(currentPage - 1)"
          >
            Sebelumnya
          </button>

          <span class="px-4 py-2 text-sm text-gray-700 font-medium">
            Halaman {{ currentPage }} dari {{ pagination.totalPages }}
          </span>

          <button
            type="button"
            :disabled="currentPage >= pagination.totalPages"
            class="px-3.5 py-2 text-sm rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
            @click="changePage(currentPage + 1)"
          >
            Selanjutnya
          </button>
        </nav>
      </div>
    </div>
  </div>
</template>
