import { useSessionAnalytics } from '~~/app/features/sessions/composables/useSessionAnalytics'
import type { SessionDetail } from '~~/shared/types/session'

export function useSessionDetailViewModel() {
  const route = useRoute()
  const analytics = useSessionAnalytics()

  const slug = computed(() => {
    const raw = route.params.slug
    return Array.isArray(raw) ? raw[0] : (raw as string)
  })

  // Synchronous lifecycle hooks registration
  let isMounted = false
  let trackedSessionId: number | null = null

  function checkAndTrackPageView(targetSession: SessionDetail | null) {
    if (!isMounted || !targetSession?.id) return
    if (trackedSessionId === targetSession.id) return

    trackedSessionId = targetSession.id
    analytics.trackPageView(targetSession.id)
  }

  onMounted(() => {
    isMounted = true
    if (session.value) {
      checkAndTrackPageView(session.value)
    }
  })

  onBeforeUnmount(() => {
    isMounted = false
  })

  const { data, status, error, refresh } = useFetch<SessionDetail>(
    () => `/api/sessions/${slug.value}`,
    {
      watch: [slug]
    }
  )

  const session = computed(() => data.value ?? null)
  const isLoading = computed(() => status.value === 'pending')
  const isError = computed(() => status.value === 'error')
  const isNotFound = computed(() => error.value?.statusCode === 404)

  watch(
    session,
    (newVal) => {
      checkAndTrackPageView(newVal)
    },
    { immediate: false }
  )

  if (import.meta.server) {
    const event = useRequestEvent()
    watch(
      error,
      (err) => {
        if (err?.statusCode === 404 && event) {
          setResponseStatus(event, 404)
        }
      },
      { immediate: true, flush: 'sync' }
    )
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
    if (session.value?.id) {
      analytics.trackVideoPlay(session.value.id)
    }
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
