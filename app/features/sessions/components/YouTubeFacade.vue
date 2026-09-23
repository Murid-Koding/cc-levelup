<script setup lang="ts">
const props = defineProps<{
  videoId: string
  title: string
}>()

const emit = defineEmits<{
  (e: 'play'): void
}>()

const isPlaying = ref(false)
const imageFailed = ref(false)
const iframeRef = ref<HTMLIFrameElement | null>(null)

// Reset state when video changes
watch(
  () => props.videoId,
  () => {
    isPlaying.value = false
    imageFailed.value = false
  }
)

const sanitizedVideoId = computed(() => {
  return /^[a-zA-Z0-9_-]{11}$/.test(props.videoId)
    ? props.videoId
    : encodeURIComponent(props.videoId)
})

const thumbnailUrl = computed(() => {
  return `https://img.youtube.com/vi/${sanitizedVideoId.value}/hqdefault.jpg`
})

const iframeSrc = computed(() => {
  return `https://www.youtube-nocookie.com/embed/${sanitizedVideoId.value}?autoplay=1&rel=0`
})

function onImageError() {
  imageFailed.value = true
}

async function startPlayback() {
  isPlaying.value = true
  emit('play')
  await nextTick()
  iframeRef.value?.focus()
}
</script>

<template>
  <div class="relative w-full aspect-video bg-black rounded-xl overflow-hidden shadow-lg">
    <!-- Active Iframe on User Click -->
    <iframe
      v-if="isPlaying"
      ref="iframeRef"
      :src="iframeSrc"
      :title="`Video player: ${title}`"
      tabindex="0"
      class="w-full h-full border-0 focus:outline-none"
      allow="
        accelerometer;
        autoplay;
        clipboard-write;
        encrypted-media;
        gyroscope;
        picture-in-picture;
        web-share;
      "
      allowfullscreen
    />

    <!-- YouTube Facade (Poster + Play Button) -->
    <button
      v-else
      type="button"
      :aria-label="`Putar rekaman video: ${title}`"
      class="group relative w-full h-full flex items-center justify-center cursor-pointer border-0 bg-transparent p-0 text-left focus:outline-none focus:ring-4 focus:ring-emerald-500"
      @click="startPlayback"
      @keydown.enter.prevent="startPlayback"
      @keydown.space.prevent="startPlayback"
    >
      <img
        v-if="!imageFailed"
        :src="thumbnailUrl"
        :alt="`Thumbnail video: ${title}`"
        class="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
        loading="lazy"
        @error="onImageError"
      />
      <div
        v-else
        class="w-full h-full flex flex-col items-center justify-center bg-gray-900 text-gray-400 p-4 text-center"
      >
        <svg
          class="w-16 h-16 mb-2 text-gray-600"
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
        <span class="text-sm">Pratinjau gambar video tidak tersedia</span>
      </div>

      <!-- Play Button Overlay -->
      <div
        class="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition-colors"
      >
        <div
          class="w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center rounded-full bg-red-600/90 text-white shadow-xl group-hover:bg-red-600 group-hover:scale-110 transition-all duration-200"
        >
          <svg class="w-8 h-8 sm:w-10 sm:h-10 fill-current translate-x-0.5" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" />
          </svg>
        </div>
      </div>
    </button>
  </div>
</template>
