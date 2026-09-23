<script setup lang="ts">
import { getCanonicalUrl } from '~~/shared/utils/seo'

useHead({
  title: 'Tentang Komunitas — CC Level Up!',
  link: [{ rel: 'canonical', href: getCanonicalUrl('/tentang') }],
  meta: [
    {
      name: 'description',
      content:
        'CC Level Up! adalah inisiatif berbagi pengetahuan berkala seputar teknologi, bisnis, desain, dan pengembangan diri.'
    },
    { property: 'og:title', content: 'Tentang Komunitas — CC Level Up!' },
    {
      property: 'og:description',
      content:
        'Inisiatif berbagi pengetahuan berkala komunitas untuk saling mendukung dan belajar bersama.'
    },
    { property: 'og:url', content: getCanonicalUrl('/tentang') }
  ]
})
</script>

<template>
  <div class="max-w-3xl mx-auto px-4 py-8 md:py-16">
    <header class="mb-10 text-center">
      <h1 class="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">
        Tentang CC Level Up!
      </h1>
      <p class="mt-3 text-lg text-gray-600">
        Inisiatif komunitas untuk saling berbagi wawasan, praktik terbaik, dan pengalaman.
      </p>
    </header>

    <div class="space-y-10 text-gray-700 leading-relaxed">
      <section class="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-3">
        <h2 class="text-xl font-semibold text-gray-900">Misi Komunitas</h2>
        <p>
          CC Level Up! lahir dari semangat belajar bersama. Melalui sesi berkala, kami
          mendokumentasikan rekaman sharing session dari pembicara komunitas agar dapat diakses oleh
          siapa saja secara gratis dan terstruktur.
        </p>
      </section>

      <section class="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-3">
        <h2 class="text-xl font-semibold text-gray-900">Pembicara & Partisipasi</h2>
        <p>
          Setiap anggota komunitas dipersilakan untuk berbagi topik seputar teknologi, produk,
          maupun pengembangan diri. Koordinasi dan pendaftaran sesi dikelola secara terbuka oleh tim
          pengurus komunitas.
        </p>
      </section>

      <section class="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-3">
        <h2 class="text-xl font-semibold text-gray-900">Kebijakan Hak Cipta & Penarikan Konten</h2>
        <p>
          Setiap materi dan rekaman yang dipublikasikan telah mendapatkan izin pembicara. Hak cipta
          materi presentasi tetap sepenuhnya milik pembicara masing-masing.
        </p>
        <p>
          Sesuai kebijakan komunitas, pembicara dapat meminta konten sesinya dialihkan menjadi
          status draft (tidak lagi dapat diakses publik) kapan saja dengan menghubungi pengelola
          arsip komunitas.
        </p>
      </section>
    </div>
  </div>
</template>
