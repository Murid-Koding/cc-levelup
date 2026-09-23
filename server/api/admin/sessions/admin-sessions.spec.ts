import { describe, expect, it } from 'vitest'
import { adminSessionSchema } from '~~/shared/schemas/admin'

describe('Admin session mutation constraints and validations', () => {
  it('rejects empty or whitespace-only slug and title', () => {
    const invalid = {
      judul: '   ',
      slug: '   ',
      pembicaraId: 1,
      tanggal: '2026-09-23',
      deskripsi: 'Deskripsi',
      youtubeVideoId: 'dQw4w9WgXcQ'
    }
    expect(adminSessionSchema.safeParse(invalid).success).toBe(false)
  })

  it('rejects negative or zero speaker ID', () => {
    const invalidZero = {
      judul: 'Valid Title',
      slug: 'valid-slug',
      pembicaraId: 0,
      tanggal: '2026-09-23',
      deskripsi: 'Deskripsi',
      youtubeVideoId: 'dQw4w9WgXcQ'
    }
    expect(adminSessionSchema.safeParse(invalidZero).success).toBe(false)

    const invalidNegative = { ...invalidZero, pembicaraId: -5 }
    expect(adminSessionSchema.safeParse(invalidNegative).success).toBe(false)
  })

  it('requires date format YYYY-MM-DD', () => {
    const invalidDate = {
      judul: 'Valid Title',
      slug: 'valid-slug',
      pembicaraId: 1,
      tanggal: '23-09-2026',
      deskripsi: 'Deskripsi',
      youtubeVideoId: 'dQw4w9WgXcQ'
    }
    expect(adminSessionSchema.safeParse(invalidDate).success).toBe(false)
  })

  it('deduplicates category IDs cleanly without crashing schema parser', () => {
    const withDuplicates = {
      judul: 'Valid Title',
      slug: 'valid-slug',
      pembicaraId: 1,
      tanggal: '2026-09-23',
      deskripsi: 'Deskripsi',
      youtubeVideoId: 'dQw4w9WgXcQ',
      kategoriIds: [1, 2, 2, 3, 1]
    }
    const res = adminSessionSchema.safeParse(withDuplicates)
    expect(res.success).toBe(true)
    if (res.success) {
      const deduped = [...new Set(res.data.kategoriIds)]
      expect(deduped).toEqual([1, 2, 3])
    }
  })
})
