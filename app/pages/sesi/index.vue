<script setup lang="ts">
import UpcomingLumaSection from '~~/app/features/home/components/UpcomingLumaSection.vue'
import SessionCard from '~~/app/features/sessions/components/SessionCard.vue'
import { useSearchViewModel } from '~~/app/features/sessions/viewmodels/useSearchViewModel'
import { useSessionArchiveViewModel } from '~~/app/features/sessions/viewmodels/useSessionArchiveViewModel'
import { getCanonicalUrl } from '~~/shared/utils/seo'

useHead(() => ({
  title: 'Arsip Sharing Session — CC Level Up!',
  link: [{ rel: 'canonical', href: getCanonicalUrl('/sesi') }],
  meta: [
    {
      name: 'description',
      content:
        'Kumpulan sharing session komunitas CC Level Up! seputar teknologi, bisnis, desain, dan pengembangan diri.'
    },
    { property: 'og:title', content: 'Arsip Sharing Session — CC Level Up!' },
    { property: 'og:url', content: getCanonicalUrl('/sesi') }
  ]
}))

const {
  sessions,
  pagination,
  currentPage,
  isLoading,
  isError,
  isEmpty,
  isOutOfRange,
  refresh,
  changePage
} = useSessionArchiveViewModel()

const {
  searchQuery,
  selectedCategory,
  categories,
  searchResults,
  totalFiltered,
  searchPage,
  totalPages,
  isFiltering,
  isIndexLoading,
  isIndexError,
  isCategoriesError,
  setSearchQuery,
  setCategory,
  clearFilters,
  changeSearchPage,
  retryAll
} = useSearchViewModel()
</script>

<template>
  <div class="max-w-6xl mx-auto px-4 py-8 md:py-12">
    <header class="mb-8 md:mb-10">
      <h1 class="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">Arsip Sesi</h1>
      <p class="mt-2 text-base md:text-lg text-gray-600">
        Jelajahi rekaman sharing session dari komunitas kami.
      </p>
    </header>

    <!-- Upcoming Event (Luma Embed / Empty State, PRD Bagian 5.1.D) -->
    <UpcomingLumaSection />

    <!-- Search & Filter Bar (Sprint 4 Discovery) -->
    <div class="mb-10 space-y-4">
      <div class="relative max-w-xl">
        <input
          v-model="searchQuery"
          type="search"
          aria-label="Cari sharing session"
          placeholder="Cari judul, topik, pembicara, atau ringkasan..."
          class="w-full px-4 py-3 pl-11 rounded-xl border border-gray-300 bg-white text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm transition-all"
          @input="(e: any) => setSearchQuery(e.target.value)"
        />
        <svg
          class="absolute left-3.5 top-3.5 w-4 h-4 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>

      <!-- Category Filter Pills & Direct Links -->
      <div
        v-if="!isCategoriesError"
        class="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none"
        role="group"
        aria-label="Filter berdasarkan kategori"
      >
        <button
          type="button"
          :aria-pressed="!selectedCategory"
          :class="[
            'px-3.5 py-1.5 text-xs font-medium rounded-full transition-colors whitespace-nowrap cursor-pointer',
            !selectedCategory
              ? 'bg-emerald-700 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          ]"
          @click="setCategory('')"
        >
          Semua Kategori
        </button>

        <div v-for="cat in categories" :key="cat.id" class="inline-flex items-center">
          <button
            type="button"
            :aria-pressed="selectedCategory === cat.slug"
            :class="[
              'px-3.5 py-1.5 text-xs font-medium rounded-full transition-colors whitespace-nowrap cursor-pointer',
              selectedCategory === cat.slug
                ? 'bg-emerald-700 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            ]"
            @click="setCategory(cat.slug)"
          >
            {{ cat.nama }}
          </button>
        </div>

        <button
          v-if="isFiltering"
          type="button"
          class="ml-2 text-xs text-red-600 hover:underline cursor-pointer whitespace-nowrap"
          @click="clearFilters"
        >
          Reset Filter
        </button>
      </div>

      <!-- Error State for Categories/Search Index Loading -->
      <div
        v-if="isIndexError || isCategoriesError"
        class="p-4 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-between"
      >
        <p class="text-xs text-amber-800">
          Beberapa data pencarian atau kategori belum berhasil dimuat.
        </p>
        <button
          type="button"
          class="text-xs font-medium text-amber-900 underline hover:text-amber-700 cursor-pointer"
          @click="retryAll"
        >
          Muat Ulang
        </button>
      </div>
    </div>

    <!-- Tampilan Hasil Pencarian/Filter Client-side -->
    <div v-if="isFiltering">
      <div class="mb-4 flex items-center justify-between" role="status" aria-live="polite">
        <p class="text-sm text-gray-600">
          <span v-if="isIndexLoading">Mencari sesi...</span>
          <span v-else>
            Ditemukan <strong class="text-gray-900">{{ totalFiltered }}</strong> sesi sesuai filter
          </span>
        </p>

        <!-- Link ke Halaman Kategori Mandiri jika kategori terpilih -->
        <NuxtLink
          v-if="selectedCategory"
          :to="`/kategori/${selectedCategory}`"
          class="text-xs font-medium text-emerald-700 hover:text-emerald-800 hover:underline inline-flex items-center gap-1"
        >
          Buka Halaman Topik Ini
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 5l7 7-7 7"
            />
          </svg>
        </NuxtLink>
      </div>

      <div
        v-if="totalFiltered === 0 && !isIndexLoading"
        class="rounded-xl border border-dashed border-gray-300 p-12 text-center"
      >
        <h2 class="text-lg font-semibold text-gray-800">Tidak ada sesi yang cocok</h2>
        <p class="mt-2 text-sm text-gray-500">
          Coba kata kunci pencarian lain atau pilih kategori yang berbeda.
        </p>
        <button
          type="button"
          class="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-emerald-600 hover:bg-emerald-700 cursor-pointer"
          @click="clearFilters"
        >
          Tampilkan Semua Sesi
        </button>
      </div>

      <div v-else>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <SessionCard v-for="session in searchResults" :key="session.id" :session="session" />
        </div>

        <!-- Pagination Hasil Pencarian Client-Side -->
        <nav
          v-if="totalPages > 1"
          class="mt-12 flex items-center justify-center gap-2"
          aria-label="Navigasi Halaman Pencarian"
        >
          <button
            type="button"
            :disabled="searchPage <= 1"
            class="px-3.5 py-2 text-sm rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
            @click="changeSearchPage(searchPage - 1)"
          >
            Sebelumnya
          </button>

          <span class="px-4 py-2 text-sm text-gray-700 font-medium">
            Halaman {{ searchPage }} dari {{ totalPages }}
          </span>

          <button
            type="button"
            :disabled="searchPage >= totalPages"
            class="px-3.5 py-2 text-sm rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
            @click="changeSearchPage(searchPage + 1)"
          >
            Selanjutnya
          </button>
        </nav>
      </div>
    </div>

    <!-- Tampilan Arsip Terpaginasi Normal (Saat tidak ada filter/search) -->
    <div v-else>
      <!-- Loading state -->
      <div v-if="isLoading" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          v-for="n in 6"
          :key="n"
          class="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm animate-pulse"
        >
          <div class="aspect-video bg-gray-200" />
          <div class="p-5 space-y-3">
            <div class="h-4 bg-gray-200 rounded w-1/3" />
            <div class="h-6 bg-gray-200 rounded w-3/4" />
            <div class="h-4 bg-gray-200 rounded w-full" />
            <div class="h-4 bg-gray-200 rounded w-2/3" />
            <div class="pt-3 border-t border-gray-100 flex justify-between">
              <div class="h-3 bg-gray-200 rounded w-1/4" />
              <div class="h-3 bg-gray-200 rounded w-1/4" />
            </div>
          </div>
        </div>
      </div>

      <!-- Error state -->
      <div
        v-else-if="isError"
        class="rounded-xl border border-red-200 bg-red-50 p-8 text-center"
        role="alert"
      >
        <h2 class="text-lg font-semibold text-red-800">Gagal memuat arsip sesi</h2>
        <p class="mt-2 text-sm text-red-600">
          Terjadi kendala saat mengambil data sesi. Silakan coba kembali.
        </p>
        <button
          type="button"
          class="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 cursor-pointer"
          @click="() => refresh()"
        >
          Coba Lagi
        </button>
      </div>

      <!-- Empty state -->
      <div
        v-else-if="isEmpty"
        class="rounded-xl border border-dashed border-gray-300 p-12 text-center"
      >
        <h2 class="text-lg font-semibold text-gray-800">Belum ada sesi yang dipublikasikan</h2>
        <p class="mt-2 text-sm text-gray-500">
          Sesi sharing session yang siap tonton akan tampil di sini segera.
        </p>
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
        <NuxtLink
          to="/sesi"
          class="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-500"
        >
          Kembali ke Halaman Pertama
        </NuxtLink>
      </div>

      <!-- Content grid -->
      <div v-else>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <SessionCard v-for="session in sessions" :key="session.id" :session="session" />
        </div>

        <!-- Pagination Normal -->
        <nav
          v-if="pagination.totalPages > 1"
          class="mt-12 flex items-center justify-center gap-2"
          aria-label="Navigasi Halaman"
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
