<script setup lang="ts">
import AppLogo from '~/components/shared/AppLogo.vue'

const route = useRoute()
const isHome = computed(() => route.path === '/')
const isScrolled = ref(false)

const onScroll = () => {
  if (typeof window !== 'undefined') {
    isScrolled.value = window.scrollY > 20
  }
}

onMounted(() => {
  onScroll()
  window.addEventListener('scroll', onScroll, { passive: true })
})

onUnmounted(() => {
  window.removeEventListener('scroll', onScroll)
})
</script>

<template>
  <div class="min-h-screen flex flex-col">
    <!-- Accessibility skip link for screen readers and keyboard users -->
    <a
      href="#main-content"
      class="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:bg-emerald-600 focus:text-white focus:rounded-md shadow"
    >
      Lewati ke konten utama
    </a>

    <header
      :class="[
        'z-40 bg-white/90 border-b border-gray-200 backdrop-blur transition-all duration-300',
        isHome
          ? [
              'fixed top-0 inset-x-0 focus-within:translate-y-0 focus-within:opacity-100 focus-within:pointer-events-auto',
              isScrolled
                ? 'translate-y-0 opacity-100 shadow-sm'
                : '-translate-y-full opacity-0 pointer-events-none'
            ]
          : 'sticky top-0'
      ]"
    >
      <div class="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        <NuxtLink
          to="/"
          aria-label="CC Level Up! — Beranda"
          class="flex items-center text-gray-900 hover:text-emerald-600 focus:outline-none focus:ring-emerald-500 rounded transition-colors"
        >
           <AppLogo class="h-8 w-auto text-current" />
           <span class="sr-only">CC Level Up!</span>
        </NuxtLink>
        <nav class="flex items-center gap-6 text-sm text-gray-600">
          <NuxtLink
            to="/sessions"
            class="hover:text-emerald-700 text-current text-base focus:outline-none focus:ring-emerald-500 rounded no-underline"
          >
            Sesi
          </NuxtLink>
          <NuxtLink
            to="/about"
            class="hover:text-emerald-700 text-current text-base no-underline focus:outline-none focus:ring-emerald-500 rounded"
          >
            Tentang
          </NuxtLink>
        </nav>
      </div>
    </header>

    <main id="main-content" class="flex-1 focus:outline-none">
      <slot />
    </main>

    <footer class="border-t border-gray-200">
      <div class="max-w-6xl mx-auto px-4 py-6 text-sm text-gray-500">
        &copy; {{ new Date().getFullYear() }} CC Level Up! &mdash; Komunitas sharing session.
      </div>
    </footer>
  </div>
</template>
