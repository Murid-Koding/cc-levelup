<script setup lang="ts">
import SessionCard from '~~/app/features/sessions/components/SessionCard.vue'
import { useSessionArchiveViewModel } from '~~/app/features/sessions/viewmodels/useSessionArchiveViewModel'

useHead({
  title: 'Arsip Sharing Session — CC Level Up!',
  meta: [
    {
      name: 'description',
      content:
        'Kumpulan sharing session komunitas CC Level Up! seputar teknologi, bisnis, desain, dan pengembangan diri.'
    }
  ]
})

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
</script>

<template>
  <div class="max-w-6xl mx-auto px-4 py-8 md:py-12">
    <header class="mb-8 md:mb-12">
      <h1 class="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">Arsip Sesi</h1>
      <p class="mt-2 text-base md:text-lg text-gray-600">
        Jelajahi rekaman sharing session dari komunitas kami.
      </p>
    </header>

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
        class="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
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

      <!-- Pagination -->
      <nav
        v-if="pagination.totalPages > 1"
        class="mt-12 flex items-center justify-center gap-2"
        aria-label="Navigasi Halaman"
      >
        <button
          type="button"
          :disabled="currentPage <= 1"
          class="px-3.5 py-2 text-sm rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
          class="px-3.5 py-2 text-sm rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          @click="changePage(currentPage + 1)"
        >
          Selanjutnya
        </button>
      </nav>
    </div>
  </div>
</template>
