import type { SessionListResponse } from '~~/shared/types/session'

export function useSessionArchiveViewModel() {
  const route = useRoute()
  const router = useRouter()

  const currentPage = computed(() => {
    const raw = route.query.page
    const pageStr = Array.isArray(raw) ? raw[0] : raw
    if (!pageStr) return 1
    if (!/^\d+$/.test(pageStr)) return 1
    const val = parseInt(pageStr, 10)
    return val >= 1 && val <= 10000 ? val : 1
  })

  const limit = ref(9)

  const { data, status, error, refresh } = useFetch<SessionListResponse>(
    () => `/api/sessions?page=${currentPage.value}&limit=${limit.value}`,
    {
      watch: [currentPage]
    }
  )

  const sessions = computed(() => data.value?.sessions ?? [])
  const pagination = computed(
    () =>
      data.value?.pagination ?? {
        page: currentPage.value,
        limit: limit.value,
        total: 0,
        totalPages: 0
      }
  )

  const isLoading = computed(() => status.value === 'pending')
  const isError = computed(() => status.value === 'error')
  const isEmpty = computed(() => !isLoading.value && !isError.value && pagination.value.total === 0)
  const isOutOfRange = computed(
    () =>
      !isLoading.value &&
      !isError.value &&
      pagination.value.total > 0 &&
      currentPage.value > pagination.value.totalPages
  )

  function changePage(newPage: number) {
    if (!Number.isInteger(newPage) || newPage < 1) return
    if (pagination.value.totalPages > 0 && newPage > pagination.value.totalPages) return
    if (newPage === currentPage.value) return

    router.push({
      path: route.path,
      query: {
        ...route.query,
        page: newPage === 1 ? undefined : String(newPage)
      }
    })
  }

  return {
    sessions,
    pagination,
    currentPage,
    isLoading,
    isError,
    isEmpty,
    isOutOfRange,
    error,
    refresh,
    changePage
  }
}
