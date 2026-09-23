export interface SessionSummary {
  id: number
  slug: string
  judul: string
  tanggal: string
  deskripsi: string
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

export interface SessionDetail extends SessionSummary {
  ringkasan: string | null
  relatedSessions: SessionSummary[]
}

export interface SessionPagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface SessionListResponse {
  sessions: SessionSummary[]
  pagination: SessionPagination
}

export interface CategorySummary {
  id: number
  nama: string
  slug: string
}

export interface CategoryDetailResponse {
  kategori: CategorySummary
  sessions: SessionSummary[]
  pagination: SessionPagination
}

export interface SearchIndexCategory {
  id: number
  nama: string
  slug: string
}

export interface SearchIndexItem {
  id: number
  slug: string
  judul: string
  pembicara: {
    id: number
    nama: string
    slug: string
  }
  kategoris: SearchIndexCategory[]
  ringkasanSnippet: string
  tanggal: string
  deskripsi: string
  youtubeVideoId: string
}
