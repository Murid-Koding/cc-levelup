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
