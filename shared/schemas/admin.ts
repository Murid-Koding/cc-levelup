import { z } from 'zod'

export const sessionStatusEnum = z.enum(['draft', 'published'])

export const adminSessionSchema = z.object({
  judul: z.string().min(1, 'Judul wajib diisi').max(200, 'Judul maksimal 200 karakter'),
  slug: z
    .string()
    .min(1, 'Slug wajib diisi')
    .max(200, 'Slug maksimal 200 karakter')
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      'Format slug tidak valid (hanya huruf kecil, angka, dan strip)'
    ),
  pembicaraId: z.number().int().positive('Pembicara wajib dipilih'),
  tanggal: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format tanggal harus YYYY-MM-DD'),
  deskripsi: z.string().min(1, 'Deskripsi wajib diisi'),
  ringkasan: z.string().default(''),
  youtubeVideoId: z
    .string()
    .min(1, 'YouTube Video ID wajib diisi')
    .regex(/^[a-zA-Z0-9_-]{11}$/, 'ID Video YouTube harus 11 karakter'),
  linkMateri: z
    .string()
    .url('Link materi harus URL yang valid')
    .refine((url) => {
      try {
        const parsed = new URL(url)
        return ['drive.google.com', 'docs.google.com'].includes(parsed.hostname.toLowerCase())
      } catch {
        return false
      }
    }, 'Link materi harus mengarah ke Google Drive atau Google Docs')
    .or(z.literal(''))
    .nullable()
    .optional(),
  status: sessionStatusEnum.default('draft'),
  kategoriIds: z.array(z.number().int().positive()).default([])
})

export type AdminSessionInput = z.infer<typeof adminSessionSchema>

export const adminSettingSchema = z.object({
  key: z.string().min(1, 'Key wajib diisi'),
  value: z.string()
})

export type AdminSettingInput = z.infer<typeof adminSettingSchema>

export const adminLumaSettingSchema = z.object({
  value: z.string().url('URL embed Luma harus berupa URL yang valid').or(z.literal(''))
})
