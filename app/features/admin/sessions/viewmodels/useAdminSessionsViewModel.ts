export interface AdminSessionItem {
  id: number
  slug: string
  judul: string
  tanggal: string
  status: 'draft' | 'published'
  deskripsi: string
  ringkasan: string
  youtubeVideoId: string
  linkMateri: string | null
  pembicara: {
    id: number
    nama: string
    slug: string
  }
  kategoris: Array<{
    id: number
    nama: string
    slug: string
  }>
}

export function useAdminSessionsViewModel() {
  const {
    data: sessions,
    status,
    error,
    refresh
  } = useFetch<AdminSessionItem[]>('/api/admin/sessions')

  const isDeleting = ref(false)
  const isExporting = ref(false)
  const deleteError = ref<string | null>(null)

  async function deleteSession(id: number) {
    if (!confirm('Apakah yakin ingin menghapus sesi ini?')) {
      return
    }

    isDeleting.value = true
    deleteError.value = null

    try {
      await $fetch(`/api/admin/sessions/${id}`, {
        method: 'DELETE'
      })
      await refresh()
    } catch (err: unknown) {
      deleteError.value = (err as Error)?.message || 'Gagal menghapus sesi'
    } finally {
      isDeleting.value = false
    }
  }

  async function exportData() {
    isExporting.value = true
    try {
      const data = await $fetch('/api/admin/export')
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: 'application/json'
      })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `cc-levelup-export-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (err: unknown) {
      alert((err as Error)?.message || 'Gagal mengekspor data arsip')
    } finally {
      isExporting.value = false
    }
  }

  return {
    sessions,
    isLoading: computed(() => status.value === 'pending'),
    isError: computed(() => status.value === 'error'),
    error,
    isDeleting,
    isExporting,
    deleteError,
    refresh,
    deleteSession,
    exportData
  }
}
