import { adminSessionSchema, type AdminSessionInput } from '~~/shared/schemas/admin'
import type { CategorySummary } from '~~/shared/types/session'

export interface SpeakerItem {
  id: number
  nama: string
  slug: string
  bio: string | null
}

interface ExistingSessionPayload {
  id: number
  slug: string
  judul: string
  pembicaraId: number
  tanggal: string
  deskripsi: string
  ringkasan: string
  youtubeVideoId: string
  linkMateri: string | null
  status: 'draft' | 'published'
  sessionKategoris?: Array<{ kategoriId: number }>
}

export function useAdminSessionFormViewModel(sessionId?: number) {
  const router = useRouter()

  const form = reactive<AdminSessionInput>({
    judul: '',
    slug: '',
    pembicaraId: 0,
    tanggal: new Date().toISOString().split('T')[0] ?? '',
    deskripsi: '',
    ringkasan: '',
    youtubeVideoId: '',
    linkMateri: '',
    status: 'draft',
    kategoriIds: []
  })

  const isSubmitting = ref(false)
  const errorMessage = ref<string | null>(null)
  const validationErrors = ref<Record<string, string>>({})

  const { data: speakers } = useFetch<SpeakerItem[]>('/api/admin/speakers')
  const { data: categories } = useFetch<CategorySummary[]>('/api/categories')

  if (sessionId) {
    const { data: existingSession } = useFetch<ExistingSessionPayload>(
      `/api/admin/sessions/${sessionId}`
    )
    watch(
      existingSession,
      (val) => {
        if (val) {
          form.judul = val.judul
          form.slug = val.slug
          form.pembicaraId = val.pembicaraId
          form.tanggal = val.tanggal
          form.deskripsi = val.deskripsi
          form.ringkasan = val.ringkasan || ''
          form.youtubeVideoId = val.youtubeVideoId
          form.linkMateri = val.linkMateri || ''
          form.status = val.status
          form.kategoriIds = val.sessionKategoris
            ? val.sessionKategoris.map((sk) => sk.kategoriId)
            : []
        }
      },
      { immediate: true }
    )
  }

  async function submit() {
    errorMessage.value = null
    validationErrors.value = {}

    const parsed = adminSessionSchema.safeParse(form)
    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors
      for (const [key, msgs] of Object.entries(fieldErrors)) {
        if (msgs?.[0]) {
          validationErrors.value[key] = msgs[0]
        }
      }
      return false
    }

    isSubmitting.value = true
    try {
      if (sessionId) {
        await $fetch(`/api/admin/sessions/${sessionId}`, {
          method: 'PUT',
          body: parsed.data
        })
      } else {
        await $fetch('/api/admin/sessions', {
          method: 'POST',
          body: parsed.data
        })
      }
      await router.push('/admin/sessions')
      return true
    } catch (err: unknown) {
      const fetchErr = err as { data?: { statusMessage?: string }; message?: string }
      errorMessage.value =
        fetchErr?.data?.statusMessage || fetchErr?.message || 'Gagal menyimpan sesi'
      return false
    } finally {
      isSubmitting.value = false
    }
  }

  return {
    form,
    speakers,
    categories,
    isSubmitting,
    errorMessage,
    validationErrors,
    submit
  }
}
