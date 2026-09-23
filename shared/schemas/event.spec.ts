import { describe, expect, it } from 'vitest'
import { createEventSchema } from './event'

describe('createEventSchema', () => {
  it('validates page_view event', () => {
    const res = createEventSchema.safeParse({
      sessionId: 10,
      eventType: 'page_view',
      referrer: 'https://google.com'
    })
    expect(res.success).toBe(true)
  })

  it('validates video_play event without referrer', () => {
    const res = createEventSchema.safeParse({
      sessionId: 5,
      eventType: 'video_play'
    })
    expect(res.success).toBe(true)
  })

  it('rejects unsupported eventType', () => {
    const res = createEventSchema.safeParse({
      sessionId: 1,
      eventType: 'download'
    })
    expect(res.success).toBe(false)
  })

  it('rejects negative or zero sessionId', () => {
    expect(createEventSchema.safeParse({ sessionId: 0, eventType: 'page_view' }).success).toBe(
      false
    )
    expect(createEventSchema.safeParse({ sessionId: -1, eventType: 'page_view' }).success).toBe(
      false
    )
  })
})
