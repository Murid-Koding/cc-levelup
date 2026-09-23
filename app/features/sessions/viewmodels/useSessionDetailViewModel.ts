import type { SessionDetail } from '~~/shared/types/session'

export async function useSessionDetailViewModel() {
  const route = useRoute()
  const slug = computed(() => {
    const raw = route.params.slug
    return Array.isArray(raw) ? raw[0] : (raw as string)
  })

  const { data, status, error, refresh } = await useFetch<SessionDetail>(
    () => `/api/sessions/${slug.value}`,
    {
      watch: [slug]
    }
  )

  const session = computed(() => data.value ?? null)
  const isLoading = computed(() => status.value === 'pending')
  const isError = computed(() => status.value === 'error')
  const isNotFound = computed(() => error.value?.statusCode === 404)

  // Nuxt SSR response code alignment
  if (import.meta.server && error.value?.statusCode === 404) {
    const event = useRequestEvent()
    if (event) {
      setResponseStatus(event, 404)
    }
  }

  const MONTH_NAMES = [
    'Januari',
    'Februari',
    'Maret',
    'April',
    'Mei',
    'Juni',
    'Juli',
    'Agustus',
    'September',
    'Oktober',
    'November',
    'Desember'
  ]

  const formattedDate = computed(() => {
    if (!session.value?.tanggal) return ''
    const parts = session.value.tanggal.split('-')
    if (parts.length !== 3) return session.value.tanggal
    const year = parts[0]
    const monthIdx = Number(parts[1]) - 1
    const day = String(Number(parts[2]))
    const monthName = MONTH_NAMES[monthIdx] || parts[1]
    return `${day} ${monthName} ${year}`
  })

  function onVideoPlay() {
    // Sprint 6 akan menghubungkan ini ke POST /api/events (video_play)
  }

  return {
    slug,
    session,
    formattedDate,
    isLoading,
    isError,
    isNotFound,
    error,
    refresh,
    onVideoPlay
  }
}
