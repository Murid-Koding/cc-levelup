export function useAdminSettingsViewModel() {
  const lumaEmbedUrl = ref('')
  const isSaving = ref(false)
  const successMessage = ref<string | null>(null)
  const errorMessage = ref<string | null>(null)

  const {
    data: settingsList,
    status,
    refresh
  } = useFetch<Array<{ key: string; value: string }>>('/api/admin/settings')

  watch(
    settingsList,
    (items) => {
      const found = items?.find((s) => s.key === 'luma_embed_url')
      if (found) {
        lumaEmbedUrl.value = found.value
      }
    },
    { immediate: true }
  )

  async function saveLumaSetting() {
    isSaving.value = true
    successMessage.value = null
    errorMessage.value = null

    try {
      await $fetch('/api/admin/settings', {
        method: 'POST',
        body: {
          key: 'luma_embed_url',
          value: lumaEmbedUrl.value
        }
      })
      successMessage.value = 'Pengaturan berhasil disimpan'
      await refresh()
    } catch (err: unknown) {
      const fetchErr = err as { data?: { statusMessage?: string }; message?: string }
      errorMessage.value =
        fetchErr?.data?.statusMessage || fetchErr?.message || 'Gagal menyimpan pengaturan'
    } finally {
      isSaving.value = false
    }
  }

  return {
    lumaEmbedUrl,
    isLoading: computed(() => status.value === 'pending'),
    isSaving,
    successMessage,
    errorMessage,
    saveLumaSetting
  }
}
