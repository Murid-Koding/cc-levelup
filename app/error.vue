<script setup lang="ts">
import type { NuxtError } from '#app'

const props = defineProps<{
  error: NuxtError
}>()

const is404 = computed(() => props.error?.statusCode === 404)

useHead(() => ({
  title: is404.value
    ? 'Halaman Tidak Ditemukan — CC Level Up!'
    : 'Terjadi Kesalahan — CC Level Up!',
  meta: [{ name: 'robots', content: 'noindex, nofollow' }]
}))

function handleError() {
  clearError({ redirect: '/sesi' })
}
</script>

<template>
  <div class="min-h-[70vh] flex flex-col items-center justify-center px-4 py-16 text-center">
    <div class="max-w-md space-y-6">
      <div
        class="inline-flex items-center justify-center w-16 h-16 rounded-full text-2xl font-bold"
        :class="is404 ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'"
      >
        {{ error?.statusCode || 500 }}
      </div>

      <h1 class="text-2xl sm:text-3xl font-bold text-gray-900">
        {{ is404 ? 'Halaman Tidak Ditemukan' : 'Terjadi Kesalahan Sistem' }}
      </h1>

      <p class="text-gray-600 text-sm sm:text-base leading-relaxed">
        {{
          is404
            ? 'Halaman atau materi sharing session yang Anda cari tidak tersedia atau tautan telah berpindah.'
            : 'Terjadi kendala pada server saat memproses permintaan Anda. Silakan coba kembali beberapa saat lagi.'
        }}
      </p>

      <div class="flex items-center justify-center gap-4">
        <NuxtLink
          to="/sesi"
          class="inline-flex items-center px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
          @click.prevent="handleError"
        >
          &larr; Kembali ke Arsip Sesi
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
