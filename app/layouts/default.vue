<template>
  <div class="min-h-screen flex flex-col">
    <!-- Accessibility skip link for screen readers and keyboard users -->
    <a
      href="#main-content"
      class="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:bg-emerald-600 focus:text-white focus:rounded-md shadow"
    >
      Lewati ke konten utama
    </a>

    <header class="sticky top-0 z-40 bg-white/90 border-b border-gray-200 backdrop-blur">
      <div class="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        <NuxtLink
          to="/"
          class="text-xl font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 rounded"
        >
          CC Level Up!
        </NuxtLink>
        <nav class="flex items-center gap-6 text-sm text-gray-600">
          <NuxtLink
            to="/sesi"
            class="hover:text-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 rounded"
          >
            Sesi
          </NuxtLink>
          <NuxtLink
            to="/tentang"
            class="hover:text-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 rounded"
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
