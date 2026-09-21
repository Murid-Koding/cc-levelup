<template>
  <div class="min-h-screen flex flex-col">
    <header class="sticky top-0 z-50 bg-white/90 border-b border-gray-200 backdrop-blur">
      <div class="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        <NuxtLink to="/" class="text-xl font-bold text-gray-900"> CC Level Up! </NuxtLink>
        <nav class="flex items-center gap-6 text-sm text-gray-600">
          <NuxtLink to="/sesi">Sesi</NuxtLink>
          <NuxtLink to="/tentang">Tentang</NuxtLink>
        </nav>
      </div>
    </header>

    <main class="flex-1">
      <slot />
    </main>

    <footer class="border-t border-gray-200">
      <div class="max-w-6xl mx-auto px-4 py-6 text-sm text-gray-500">
        &copy; {{ new Date().getFullYear() }} CC Level Up! &mdash; Komunitas sharing session.
      </div>
    </footer>
  </div>
</template>
