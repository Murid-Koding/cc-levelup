<script setup lang="ts">
import { useAdminSettingsViewModel } from '~~/app/features/admin/settings/viewmodels/useAdminSettingsViewModel'

const { lumaEmbedUrl, isLoading, isSaving, successMessage, errorMessage, saveLumaSetting } =
  useAdminSettingsViewModel()
</script>

<template>
  <div class="max-w-2xl mx-auto px-4 py-8">
    <div class="mb-6 flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Pengaturan Acara (Luma)</h1>
        <p class="text-sm text-gray-600">
          Atur embed event Luma untuk section sesi yang akan datang
        </p>
      </div>
      <NuxtLink to="/admin/sessions" class="text-sm text-gray-600 hover:underline">
        &larr; Kelola Sesi
      </NuxtLink>
    </div>

    <div v-if="successMessage" class="p-4 mb-6 text-sm text-green-700 bg-green-100 rounded">
      {{ successMessage }}
    </div>

    <div v-if="errorMessage" class="p-4 mb-6 text-sm text-red-700 bg-red-100 rounded">
      {{ errorMessage }}
    </div>

    <div v-if="isLoading" class="text-center py-8 text-gray-500">Memuat pengaturan...</div>

    <form
      v-else
      class="space-y-6 bg-white p-6 border border-gray-200 rounded-lg shadow-sm"
      @submit.prevent="saveLumaSetting"
    >
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">URL Embed Luma</label>
        <input
          v-model="lumaEmbedUrl"
          type="url"
          class="w-full px-3 py-2 border border-gray-300 rounded-md"
          placeholder="https://lu.ma/embed/event/evt-..."
        />
        <p class="text-xs text-gray-500 mt-1">
          Kosongkan jika tidak ada sharing session yang sedang dibuka / terjadwal.
        </p>
      </div>

      <div class="flex justify-end pt-4 border-t border-gray-200">
        <button
          type="submit"
          class="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
          :disabled="isSaving"
        >
          {{ isSaving ? 'Menyimpan...' : 'Simpan Pengaturan' }}
        </button>
      </div>
    </form>
  </div>
</template>
