<script setup lang="ts">
import Search from '@primeicons/vue/search'
import Times from '@primeicons/vue/times'
import Button from 'primevue/button'
import IconField from 'primevue/iconfield'
import InputIcon from 'primevue/inputicon'
import InputText from 'primevue/inputtext'
import Paginator from 'primevue/paginator'
import UpcomingLumaSection from '~~/app/features/home/components/UpcomingLumaSection.vue'
import SessionCard from '~~/app/features/sessions/components/SessionCard.vue'
import { useSearchViewModel } from '~~/app/features/sessions/viewmodels/useSearchViewModel'
import { useSessionArchiveViewModel } from '~~/app/features/sessions/viewmodels/useSessionArchiveViewModel'
import { getCanonicalUrl } from '~~/shared/utils/seo'

useHead(() => ({
  title: 'Sesi Belajar — CC Level Up!',
  link: [{ rel: 'canonical', href: getCanonicalUrl('/sessions') }],
  meta: [
    {
      name: 'description',
      content:
        'Kumpulan sharing session komunitas CC Level Up! seputar teknologi, bisnis, desain, dan pengembangan diri.'
    },
    { property: 'og:title', content: 'Sesi Belajar — CC Level Up!' },
    { property: 'og:url', content: getCanonicalUrl('/sessions') }
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
      <h1 class="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">Sesi Belajar</h1>
      <p class="mt-2 text-base md:text-lg text-gray-600">
        Temukan dan pelajari rekaman sharing session dari komunitas kami.
      </p>
    </header>

    <!-- Upcoming Event (Luma Embed / Empty State, PRD Bagian 5.1.D) -->
    <UpcomingLumaSection />

    <!-- Search & Filter Bar (Sprint 4 Discovery) -->
    <div class="mb-10 space-y-4">
      <div class="relative max-w-xl">
        <IconField class="w-full">
          <InputIcon>
            <Search class="w-4 h-4 text-gray-400" />
          </InputIcon>
          <InputText
            :model-value="searchQuery"
            type="search"
            aria-label="Cari sharing session"
            placeholder="Cari judul, topik, pembicara, atau ringkasan..."
            class="search-input-field w-full !rounded-xl !pl-10 !pr-10 !py-3 text-sm !border-gray-300 focus:!border-emerald-500 focus:!ring-2 focus:!ring-emerald-500/20 shadow-sm transition-all"
            @input="(e: any) => setSearchQuery(e.target.value)"
          />
          <InputIcon
            v-if="searchQuery"
            role="button"
            tabindex="0"
            aria-label="Hapus teks pencarian"
            class="cursor-pointer focus:outline-none focus:ring-1 focus:ring-emerald-500 rounded p-0.5"
            @click="setSearchQuery('')"
            @keydown.enter="setSearchQuery('')"
            @keydown.space.prevent="setSearchQuery('')"
          >
            <Times class="w-3.5 h-3.5 text-gray-400 hover:text-gray-600 transition-colors" />
          </InputIcon>
        </IconField>
      </div>

      <!-- Category Filter Pills & Direct Links -->
      <div
        v-if="!isCategoriesError"
        class="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none"
        role="group"
        aria-label="Filter berdasarkan kategori"
      >
        <Button
          type="button"
          label="Semua Kategori"
          rounded
          size="small"
          :severity="!selectedCategory ? 'success' : 'secondary'"
          :variant="!selectedCategory ? undefined : 'outlined'"
          :aria-pressed="!selectedCategory"
          class="!text-xs !font-semibold !px-4 !py-2 whitespace-nowrap cursor-pointer transition-all duration-200"
          :class="!selectedCategory ? '!bg-emerald-600 !border-emerald-600 !text-white shadow-xs' : '!bg-white !text-gray-700 !border-gray-200 hover:!bg-gray-50'"
          @click="setCategory('')"
        />

        <div v-for="cat in categories" :key="cat.id" class="inline-flex items-center">
          <Button
            type="button"
            :label="cat.nama"
            rounded
            size="small"
            :severity="selectedCategory === cat.slug ? 'success' : 'secondary'"
            :variant="selectedCategory === cat.slug ? undefined : 'outlined'"
            :aria-pressed="selectedCategory === cat.slug"
            class="!text-xs !font-semibold !px-4 !py-2 whitespace-nowrap cursor-pointer transition-all duration-200"
            :class="selectedCategory === cat.slug ? '!bg-emerald-600 !border-emerald-600 !text-white shadow-xs' : '!bg-white !text-gray-700 !border-gray-200 hover:!bg-gray-50'"
            @click="setCategory(cat.slug)"
          />
        </div>

        <Transition name="fade-slide">
          <Button
            v-if="isFiltering"
            type="button"
            label="Reset Filter"
            severity="danger"
            variant="text"
            size="small"
            rounded
            class="!text-xs !font-medium !text-rose-600 hover:!text-rose-700 !px-3 !py-1.5 whitespace-nowrap transition-all cursor-pointer"
            @click="clearFilters"
          />
        </Transition>
      </div>

      <!-- Error State for Categories/Search Index Loading -->
      <div
        v-if="isIndexError || isCategoriesError"
        class="p-4 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-between"
      >
        <p class="text-xs text-amber-800">
          Beberapa data pencarian atau kategori belum berhasil dimuat.
        </p>
        <Button
          type="button"
          label="Muat Ulang"
          variant="link"
          size="small"
          class="!text-xs !font-medium !text-amber-900 !p-0 underline hover:!text-amber-700 cursor-pointer"
          @click="retryAll"
        />
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
          :to="`/categories/${selectedCategory}`"
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
        <Button
          type="button"
          label="Tampilkan Semua Sesi"
          severity="success"
          size="small"
          class="mt-4 !bg-emerald-600 hover:!bg-emerald-700 !border-emerald-600 cursor-pointer"
          @click="clearFilters"
        />
      </div>

      <div v-else>
        <Transition name="fade-container" mode="out-in">
          <div :key="`${selectedCategory}-${searchQuery}-${searchPage}`" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <SessionCard v-for="session in searchResults" :key="session.id" :session="session" />
          </div>
        </Transition>

        <!-- Pagination Hasil Pencarian Client-Side -->
        <div v-if="totalPages > 1" class="mt-12 flex justify-center">
          <Paginator
            :rows="9"
            :total-records="totalFiltered"
            :first="(searchPage - 1) * 9"
            class="!bg-transparent !p-0"
            @page="(e) => changeSearchPage(e.page + 1)"
          >
            <template #container="{ prevPageCallback, nextPageCallback }">
              <nav class="flex items-center justify-center gap-2" aria-label="Navigasi Halaman Pencarian">
                <Button
                  type="button"
                  label="Sebelumnya"
                  variant="outlined"
                  severity="secondary"
                  size="small"
                  :disabled="searchPage <= 1"
                  class="!text-sm !font-medium !text-gray-700 !bg-white hover:!bg-gray-50 !border-gray-300 cursor-pointer"
                  @click="prevPageCallback"
                />

                <span class="px-4 py-2 text-sm text-gray-700 font-medium">
                  Halaman {{ searchPage }} dari {{ totalPages }}
                </span>

                <Button
                  type="button"
                  label="Selanjutnya"
                  variant="outlined"
                  severity="secondary"
                  size="small"
                  :disabled="searchPage >= totalPages"
                  class="!text-sm !font-medium !text-gray-700 !bg-white hover:!bg-gray-50 !border-gray-300 cursor-pointer"
                  @click="nextPageCallback"
                />
              </nav>
            </template>
          </Paginator>
        </div>
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
        <Button
          type="button"
          label="Coba Lagi"
          severity="danger"
          size="small"
          class="mt-4 cursor-pointer"
          @click="() => refresh()"
        />
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
          to="/sessions"
          class="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-500"
        >
          Kembali ke Halaman Pertama
        </NuxtLink>
      </div>

      <!-- Content grid -->
      <div v-else>
        <Transition name="fade-container" mode="out-in">
          <div :key="`archive-page-${currentPage}`" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <SessionCard v-for="session in sessions" :key="session.id" :session="session" />
          </div>
        </Transition>

        <!-- Pagination Normal -->
        <div v-if="pagination.totalPages > 1" class="mt-12 flex justify-center">
          <Paginator
            :rows="pagination.limit"
            :total-records="pagination.total"
            :first="(currentPage - 1) * pagination.limit"
            class="!bg-transparent !p-0"
            @page="(e) => changePage(e.page + 1)"
          >
            <template #container="{ prevPageCallback, nextPageCallback }">
              <nav class="flex items-center justify-center gap-2" aria-label="Navigasi Halaman">
                <Button
                  type="button"
                  label="Sebelumnya"
                  variant="outlined"
                  severity="secondary"
                  size="small"
                  :disabled="currentPage <= 1"
                  class="!text-sm !font-medium !text-gray-700 !bg-white hover:!bg-gray-50 !border-gray-300 cursor-pointer"
                  @click="prevPageCallback"
                />

                <span class="px-4 py-2 text-sm text-gray-700 font-medium">
                  Halaman {{ currentPage }} dari {{ pagination.totalPages }}
                </span>

                <Button
                  type="button"
                  label="Selanjutnya"
                  variant="outlined"
                  severity="secondary"
                  size="small"
                  :disabled="currentPage >= pagination.totalPages"
                  class="!text-sm !font-medium !text-gray-700 !bg-white hover:!bg-gray-50 !border-gray-300 cursor-pointer"
                  @click="nextPageCallback"
                />
              </nav>
            </template>
          </Paginator>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Sembunyikan tombol cancel bawaan browser agar tidak duplikat dengan icon silang kustom */
:deep(.search-input-field)::-webkit-search-cancel-button,
:deep(.search-input-field)::-webkit-search-decoration,
:deep(.search-input-field)::-webkit-search-results-button,
:deep(.search-input-field)::-webkit-search-results-decoration {
  -webkit-appearance: none;
  appearance: none;
  display: none;
}

.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.25s ease-out;
}

.fade-slide-enter-from,
.fade-slide-leave-to {
  opacity: 0;
  transform: translateX(-8px);
}

.fade-container-enter-active,
.fade-container-leave-active {
  transition: opacity 0.2s ease-in-out;
}

.fade-container-enter-from,
.fade-container-leave-to {
  opacity: 0;
}
</style>
