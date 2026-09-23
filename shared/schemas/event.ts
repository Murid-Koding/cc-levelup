import { z } from 'zod'

export const eventTypeEnum = z.enum(['page_view', 'video_play'])

export const createEventSchema = z.object({
  sessionId: z.number().int().positive('sessionId harus integer positif'),
  eventType: eventTypeEnum,
  referrer: z.string().max(500, 'Referrer maksimal 500 karakter').nullable().optional()
})

export type CreateEventInput = z.infer<typeof createEventSchema>
