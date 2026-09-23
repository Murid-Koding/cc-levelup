import type { CategorySummary, SearchIndexItem, SessionSummary } from '~~/shared/types/session'

export function useSearchViewModel() {
  const route = useRoute()
  const router = useRouter()

  function getQueryParam(val: unknown): string {
    if (Array.isArray(val)) return typeof val[0] === 'string' ? val[0] : ''
    return typeof val === 'string' ? val : ''
  }

  const searchQuery = ref(getQueryParam(route.query.q))
  const selectedCategory = ref(getQueryParam(route.query.kategori))
  const searchPage = ref(1)
  const pageSize = 9

  watch(
    () => route.query.q,
    (val) => {
      searchQuery.value = getQueryParam(val)
      searchPage.value = 1
    }
  )

  watch(
    () => route.query.kategori,
    (val) => {
      selectedCategory.value = getQueryParam(val)
      searchPage.value = 1
    }
  )

  const {
    data: indexData,
    status: indexStatus,
    error: indexError,
    refresh: refreshIndex
  } = useFetch<SearchIndexItem[]>('/api/search-index', {
    lazy: true
  })

  const {
    data: categoriesData,
    status: categoriesStatus,
    error: categoriesError,
    refresh: refreshCategories
  } = useFetch<CategorySummary[]>('/api/categories', {
    lazy: true
  })

  const categories = computed(() => categoriesData.value ?? [])
  const isIndexLoading = computed(() => indexStatus.value === 'pending')
  const isCategoriesLoading = computed(() => categoriesStatus.value === 'pending')
  const isIndexError = computed(() => indexStatus.value === 'error')
  const isCategoriesError = computed(() => categoriesStatus.value === 'error')

  const filteredItems = computed<SessionSummary[]>(() => {
    const items = indexData.value ?? []
    const query = searchQuery.value.trim().toLowerCase()
    const category = selectedCategory.value.trim().toLowerCase()

    return items
      .filter((item) => {
        if (category && !item.kategoris.some((k) => k.slug.toLowerCase() === category)) {
          return false
        }

        if (query) {
          const matchJudul = item.judul.toLowerCase().includes(query)
          const matchPembicara = item.pembicara.nama.toLowerCase().includes(query)
          const matchKategori = item.kategoris.some((k) => k.nama.toLowerCase().includes(query))
          const matchSnippet = item.ringkasanSnippet.toLowerCase().includes(query)
          const matchDeskripsi = item.deskripsi.toLowerCase().includes(query)

          return matchJudul || matchPembicara || matchKategori || matchSnippet || matchDeskripsi
        }

        return true
      })
      .map((item) => ({
        id: item.id,
        slug: item.slug,
        judul: item.judul,
        tanggal: item.tanggal,
        deskripsi: item.deskripsi,
        youtubeVideoId: item.youtubeVideoId,
        linkMateri: null,
        pembicara: item.pembicara,
        kategoris: item.kategoris
      }))
  })

  const totalFiltered = computed(() => filteredItems.value.length)
  const totalPages = computed(() => Math.ceil(totalFiltered.value / pageSize) || 1)

  const paginatedResults = computed<SessionSummary[]>(() => {
    const start = (searchPage.value - 1) * pageSize
    return filteredItems.value.slice(start, start + pageSize)
  })

  const isFiltering = computed(() => {
    return Boolean(searchQuery.value.trim() || selectedCategory.value)
  })

  function setSearchQuery(val: string) {
    searchQuery.value = val
    searchPage.value = 1
    updateQueryParams()
  }

  function setCategory(catSlug: string) {
    selectedCategory.value = catSlug === selectedCategory.value ? '' : catSlug
    searchPage.value = 1
    updateQueryParams()
  }

  function clearFilters() {
    searchQuery.value = ''
    selectedCategory.value = ''
    searchPage.value = 1
    updateQueryParams()
  }

  function changeSearchPage(page: number) {
    if (page >= 1 && page <= totalPages.value) {
      searchPage.value = page
    }
  }

  function updateQueryParams() {
    const query: Record<string, string | undefined> = {
      ...route.query,
      q: searchQuery.value.trim() || undefined,
      kategori: selectedCategory.value || undefined,
      page: undefined
    }

    router.replace({
      path: route.path,
      query
    })
  }

  function retryAll() {
    if (isIndexError.value) refreshIndex()
    if (isCategoriesError.value) refreshCategories()
  }

  return {
    searchQuery,
    selectedCategory,
    categories,
    searchResults: paginatedResults,
    totalFiltered,
    searchPage,
    totalPages,
    isFiltering,
    isIndexLoading,
    isCategoriesLoading,
    isIndexError,
    isCategoriesError,
    indexError,
    categoriesError,
    setSearchQuery,
    setCategory,
    clearFilters,
    changeSearchPage,
    retryAll
  }
}
