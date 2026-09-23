import { describe, expect, it } from 'vitest'
import { adminSessionSchema, adminLumaSettingSchema } from './admin'

describe('adminSessionSchema', () => {
  it('validates correct session payload', () => {
    const valid = {
      judul: 'Session Keren',
      slug: 'session-keren',
      pembicaraId: 1,
      tanggal: '2026-09-23',
      deskripsi: 'Deskripsi panjang',
      ringkasan: 'Rangkuman materi',
      youtubeVideoId: 'dQw4w9WgXcQ',
      linkMateri: 'https://drive.google.com/test',
      status: 'published' as const,
      kategoriIds: [1, 2]
    }

    const result = adminSessionSchema.safeParse(valid)
    expect(result.success).toBe(true)
  })

  it('rejects non-Google Drive links for linkMateri', () => {
    const payload = {
      judul: 'Session Keren',
      slug: 'session-keren',
      pembicaraId: 1,
      tanggal: '2026-09-23',
      deskripsi: 'Deskripsi panjang',
      youtubeVideoId: 'dQw4w9WgXcQ',
      linkMateri: 'https://dropbox.com/test'
    }

    const result = adminSessionSchema.safeParse(payload)
    expect(result.success).toBe(false)
  })

  it('accepts docs.google.com and empty linkMateri', () => {
    const withDocs = {
      judul: 'Session Keren',
      slug: 'session-keren',
      pembicaraId: 1,
      tanggal: '2026-09-23',
      deskripsi: 'Deskripsi panjang',
      youtubeVideoId: 'dQw4w9WgXcQ',
      linkMateri: 'https://docs.google.com/presentation/d/123/edit'
    }
    expect(adminSessionSchema.safeParse(withDocs).success).toBe(true)

    const withEmpty = {
      ...withDocs,
      linkMateri: ''
    }
    expect(adminSessionSchema.safeParse(withEmpty).success).toBe(true)
  })

  it('rejects invalid youtube ID or invalid slug', () => {
    const invalid = {
      judul: 'Test',
      slug: 'Slug Spasi',
      pembicaraId: 1,
      tanggal: '2026-09-23',
      deskripsi: 'Deskripsi',
      youtubeVideoId: 'pendek'
    }

    const result = adminSessionSchema.safeParse(invalid)
    expect(result.success).toBe(false)
  })
})

describe('adminLumaSettingSchema', () => {
  it('validates empty string or URL', () => {
    expect(adminLumaSettingSchema.safeParse({ value: '' }).success).toBe(true)
    expect(adminLumaSettingSchema.safeParse({ value: 'https://lu.ma/event-123' }).success).toBe(
      true
    )
    expect(adminLumaSettingSchema.safeParse({ value: 'bukan-url' }).success).toBe(false)
  })
})
