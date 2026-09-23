<script setup lang="ts">
import { useAdminSessionsViewModel } from '~~/app/features/admin/sessions/viewmodels/useAdminSessionsViewModel'

const {
  sessions,
  isLoading,
  isError,
  error,
  isDeleting,
  isExporting,
  deleteError,
  deleteSession,
  exportData
} = useAdminSessionsViewModel()
</script>

<template>
  <div class="max-w-6xl mx-auto px-4 py-8">
    <div class="flex items-center justify-between mb-8">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Manajemen Sesi</h1>
        <p class="text-sm text-gray-600">Kelola arsip materi dan sharing session komunitas</p>
      </div>
      <div class="flex gap-3">
        <button
          type="button"
          class="px-4 py-2 border border-gray-300 rounded text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          :disabled="isExporting"
          @click="exportData"
        >
          {{ isExporting ? 'Mengekspor...' : 'Ekspor Arsip (JSON)' }}
        </button>
        <NuxtLink
          to="/admin/settings"
          class="px-4 py-2 border border-gray-300 rounded text-sm text-gray-700 hover:bg-gray-50"
        >
          Pengaturan Luma
        </NuxtLink>
        <NuxtLink
          to="/admin/sessions/new"
          class="px-4 py-2 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700"
        >
          + Tambah Sesi
        </NuxtLink>
      </div>
    </div>

    <div v-if="deleteError" class="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded">
      {{ deleteError }}
    </div>

    <div v-if="isLoading" class="text-center py-12 text-gray-500">Memuat daftar sesi...</div>

    <div v-else-if="isError" class="p-4 text-sm text-red-700 bg-red-100 rounded">
      {{ error?.message || 'Gagal memuat sesi' }}
    </div>

    <div v-else-if="sessions && sessions.length === 0" class="text-center py-12 text-gray-500">
      Belum ada sesi yang terdaftar.
    </div>

    <div v-else class="overflow-x-auto bg-white border border-gray-200 rounded-lg shadow-sm">
      <table class="w-full text-left text-sm text-gray-600">
        <thead class="bg-gray-50 text-gray-700 uppercase font-semibold text-xs border-b">
          <tr>
            <th class="px-6 py-3">Judul</th>
            <th class="px-6 py-3">Pembicara</th>
            <th class="px-6 py-3">Tanggal</th>
            <th class="px-6 py-3">Status</th>
            <th class="px-6 py-3 text-right">Aksi</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200">
          <tr v-for="item in sessions" :key="item.id" class="hover:bg-gray-50">
            <td class="px-6 py-4 font-medium text-gray-900">
              {{ item.judul }}
            </td>
            <td class="px-6 py-4">
              {{ item.pembicara.nama }}
            </td>
            <td class="px-6 py-4">
              {{ item.tanggal }}
            </td>
            <td class="px-6 py-4">
              <span
                class="px-2 py-1 rounded text-xs font-semibold"
                :class="
                  item.status === 'published'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-yellow-100 text-yellow-800'
                "
              >
                {{ item.status }}
              </span>
            </td>
            <td class="px-6 py-4 text-right space-x-2">
              <NuxtLink :to="`/admin/sessions/${item.id}`" class="text-blue-600 hover:underline">
                Edit
              </NuxtLink>
              <button
                type="button"
                class="text-red-600 hover:underline disabled:opacity-50"
                :disabled="isDeleting"
                @click="deleteSession(item.id)"
              >
                Hapus
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
