<script setup lang="ts">
import type { SessionSummary } from '~~/shared/types/session'

const props = defineProps<{
  session: SessionSummary
}>()

const imageFailed = ref(false)

const MONTH_NAMES = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'Mei',
  'Jun',
  'Jul',
  'Agu',
  'Sep',
  'Okt',
  'Nov',
  'Des'
]

const formattedDate = computed(() => {
  if (!props.session.tanggal) return ''
  const parts = props.session.tanggal.split('-')
  if (parts.length !== 3) return props.session.tanggal
  const year = parts[0]
  const monthIdx = Number(parts[1]) - 1
  const day = String(Number(parts[2]))
  const monthName = MONTH_NAMES[monthIdx] || parts[1]
  return `${day} ${monthName} ${year}`
})

const thumbnailUrl = computed(() => {
  return `https://img.youtube.com/vi/${props.session.youtubeVideoId}/hqdefault.jpg`
})

function onImageError() {
  imageFailed.value = true
}
</script>

<template>
  <article
    class="flex flex-col h-full bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
  >
    <NuxtLink
      :to="`/sesi/${session.slug}`"
      :aria-label="`Tonton rekaman sesi: ${session.judul}`"
      class="block relative aspect-video bg-gray-100 overflow-hidden group focus:outline-none focus:ring-2 focus:ring-emerald-500"
    >
      <img
        v-if="!imageFailed"
        :src="thumbnailUrl"
        :alt="`Thumbnail video: ${session.judul}`"
        class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        loading="lazy"
        @error="onImageError"
      />
      <div
        v-else
        class="w-full h-full flex flex-col items-center justify-center bg-gray-100 text-gray-400 p-4 text-center"
      >
        <svg
          class="w-10 h-10 mb-1 text-gray-300"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="1.5"
            d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
          />
        </svg>
        <span class="text-xs text-gray-500">Pratinjau video tidak tersedia</span>
      </div>
    </NuxtLink>

    <div class="flex flex-col flex-1 p-5">
      <div class="flex items-center gap-2 flex-wrap mb-2">
        <span
          v-for="cat in session.kategoris"
          :key="cat.id"
          class="inline-block text-xs font-medium px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700"
        >
          {{ cat.nama }}
        </span>
      </div>

      <h2 class="text-lg font-semibold text-gray-900 line-clamp-2 mb-2">
        <NuxtLink
          :to="`/sesi/${session.slug}`"
          class="hover:text-emerald-600 transition-colors focus:outline-none focus:ring-1 focus:ring-emerald-500 rounded"
        >
          {{ session.judul }}
        </NuxtLink>
      </h2>

      <p class="text-sm text-gray-600 line-clamp-3 mb-4 flex-1">
        {{ session.deskripsi }}
      </p>

      <div
        class="pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500"
      >
        <span class="font-medium text-gray-700">{{ session.pembicara.nama }}</span>
        <time :datetime="session.tanggal">{{ formattedDate }}</time>
      </div>
    </div>
  </article>
</template>
