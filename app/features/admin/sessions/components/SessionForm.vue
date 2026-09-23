<script setup lang="ts">
import type { SpeakerItem } from '~~/app/features/admin/sessions/viewmodels/useAdminSessionFormViewModel'
import type { AdminSessionInput } from '~~/shared/schemas/admin'
import type { CategorySummary } from '~~/shared/types/session'
import { slugify } from '~~/shared/utils/slug'

const props = defineProps<{
  speakers?: SpeakerItem[] | null
  categories?: CategorySummary[] | null
  isSubmitting: boolean
  errorMessage: string | null
  validationErrors: Record<string, string>
  submitLabel: string
  isEdit?: boolean
}>()

const form = defineModel<AdminSessionInput>('form', { required: true })

const emit = defineEmits<{
  (e: 'submit'): void
}>()

const autoSlugEnabled = ref(!props.isEdit)

function onTitleInput() {
  if (autoSlugEnabled.value) {
    form.value.slug = slugify(form.value.judul)
  }
}

function onSlugManualEdit() {
  autoSlugEnabled.value = false
}

function syncSlugFromTitle() {
  autoSlugEnabled.value = true
  form.value.slug = slugify(form.value.judul)
}
</script>

<template>
  <form
    class="space-y-6 bg-white p-6 border border-gray-200 rounded-lg shadow-sm"
    @submit.prevent="emit('submit')"
  >
    <div v-if="errorMessage" class="p-4 text-sm text-red-700 bg-red-100 rounded">
      {{ errorMessage }}
    </div>

    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1">Judul Sesi *</label>
      <input
        v-model="form.judul"
        type="text"
        class="w-full px-3 py-2 border rounded-md"
        :class="validationErrors.judul ? 'border-red-500' : 'border-gray-300'"
        placeholder="Misal: Deep Dive Vue 3 & Nuxt 4"
        @input="onTitleInput"
      />
      <p v-if="validationErrors.judul" class="text-xs text-red-500 mt-1">
        {{ validationErrors.judul }}
      </p>
    </div>

    <div>
      <div class="flex items-center justify-between mb-1">
        <label class="block text-sm font-medium text-gray-700">Slug URL *</label>
        <button
          v-if="!autoSlugEnabled"
          type="button"
          class="text-xs text-blue-600 hover:underline"
          @click="syncSlugFromTitle"
        >
          Sinkronkan dari judul
        </button>
        <button
          v-else
          type="button"
          class="text-xs text-gray-500 hover:underline"
          @click="autoSlugEnabled = false"
        >
          Nonaktifkan auto-slug
        </button>
      </div>
      <input
        v-model="form.slug"
        type="text"
        class="w-full px-3 py-2 border rounded-md"
        :class="validationErrors.slug ? 'border-red-500' : 'border-gray-300'"
        placeholder="deep-dive-vue-3-nuxt-4"
        @input="onSlugManualEdit"
      />
      <p v-if="validationErrors.slug" class="text-xs text-red-500 mt-1">
        {{ validationErrors.slug }}
      </p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Pembicara *</label>
        <select
          v-model.number="form.pembicaraId"
          class="w-full px-3 py-2 border rounded-md"
          :class="validationErrors.pembicaraId ? 'border-red-500' : 'border-gray-300'"
        >
          <option :value="0" disabled>Pilih Pembicara</option>
          <option v-for="spk in speakers" :key="spk.id" :value="spk.id">
            {{ spk.nama }}
          </option>
        </select>
        <p v-if="validationErrors.pembicaraId" class="text-xs text-red-500 mt-1">
          {{ validationErrors.pembicaraId }}
        </p>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Tanggal Pelaksanaan *</label>
        <input
          v-model="form.tanggal"
          type="date"
          class="w-full px-3 py-2 border rounded-md"
          :class="validationErrors.tanggal ? 'border-red-500' : 'border-gray-300'"
        />
        <p v-if="validationErrors.tanggal" class="text-xs text-red-500 mt-1">
          {{ validationErrors.tanggal }}
        </p>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">YouTube Video ID *</label>
        <input
          v-model="form.youtubeVideoId"
          type="text"
          class="w-full px-3 py-2 border rounded-md"
          :class="validationErrors.youtubeVideoId ? 'border-red-500' : 'border-gray-300'"
          placeholder="11 karakter ID (cth: dQw4w9WgXcQ)"
        />
        <p v-if="validationErrors.youtubeVideoId" class="text-xs text-red-500 mt-1">
          {{ validationErrors.youtubeVideoId }}
        </p>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">
          Link Materi (Google Drive/Docs)
        </label>
        <input
          v-model="form.linkMateri"
          type="url"
          class="w-full px-3 py-2 border rounded-md"
          :class="validationErrors.linkMateri ? 'border-red-500' : 'border-gray-300'"
          placeholder="https://drive.google.com/..."
        />
        <p v-if="validationErrors.linkMateri" class="text-xs text-red-500 mt-1">
          {{ validationErrors.linkMateri }}
        </p>
      </div>
    </div>

    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1">Status Publikasi *</label>
      <select v-model="form.status" class="w-full px-3 py-2 border border-gray-300 rounded-md">
        <option value="draft">Draft (Belum Publik)</option>
        <option value="published">Published (Tampil di Publik)</option>
      </select>
    </div>

    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
      <div class="flex flex-wrap gap-2 mt-2">
        <label
          v-for="cat in categories"
          :key="cat.id"
          class="inline-flex items-center space-x-2 text-sm bg-gray-50 border border-gray-200 px-3 py-1.5 rounded cursor-pointer hover:bg-gray-100"
        >
          <input
            v-model="form.kategoriIds"
            type="checkbox"
            :value="cat.id"
            class="rounded text-blue-600 focus:ring-blue-500"
          />
          <span>{{ cat.nama }}</span>
        </label>
      </div>
    </div>

    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1">Deskripsi Sesi *</label>
      <textarea
        v-model="form.deskripsi"
        rows="4"
        class="w-full px-3 py-2 border rounded-md"
        :class="validationErrors.deskripsi ? 'border-red-500' : 'border-gray-300'"
        placeholder="Jelaskan topik yang dibahas dalam sesi ini..."
      />
      <p v-if="validationErrors.deskripsi" class="text-xs text-red-500 mt-1">
        {{ validationErrors.deskripsi }}
      </p>
    </div>

    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1">Ringkasan / Transkrip</label>
      <textarea
        v-model="form.ringkasan"
        rows="4"
        class="w-full px-3 py-2 border border-gray-300 rounded-md"
        placeholder="Poin-poin penting, rangkuman, atau transkrip untuk SEO..."
      />
    </div>

    <div class="flex justify-end gap-3 pt-4 border-t border-gray-200">
      <NuxtLink
        to="/admin/sessions"
        class="px-4 py-2 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50"
      >
        Batal
      </NuxtLink>
      <button
        type="submit"
        class="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
        :disabled="isSubmitting"
      >
        {{ isSubmitting ? 'Menyimpan...' : submitLabel }}
      </button>
    </div>
  </form>
</template>
